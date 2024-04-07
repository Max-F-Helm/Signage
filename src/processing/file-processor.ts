import {Buffer} from "buffer";
import deepEqual from "@/deep-equals";
import BufferReader from "./buffer-reader";
import BufferWriter from "./buffer-writer";
import {AssertionError, FileContentsException, IllegalArgumentException, IllegalStateException} from "./exceptions";
import Bill from "./bill";
import type Frame from "./model/Frame";
import {FrameType} from "./model/Frame";
import type Author from "./model/Author";
import type Addendum from "./model/Addendum";
import type Vote from "./model/Vote";
import type {Identity} from "@/processing/identity-processor";
import IdentityProcessor, {identityHasPrivateKeys} from "@/processing/identity-processor";
import {hashFrame, isArrUnique} from "@/processing/utils";

const FILE_SPEC_VERSION = 2;

const FRAME_TYPE_ADDENDUM = 1;
const FRAME_TYPE_VOTE = 2;
const TIMESTAMP_BYTES = 56 / 8;
const PROPOSAL_KEY_BYTES = (256 / 8);
let ENC_PROPOSAL_KEY_BYTES: number;

interface GenesisDummyFrame extends Frame {}

export type ErrorCallback = (msg: string) => void;

export interface Proposal {
    authors: Author[],
    frames: Frame[]
}

export class FileProcessor {

    private readonly errorCallback: ErrorCallback;
    private readonly identity: Identity;

    private author: Author | null = null;
    private authorCount: number = 0;
    private proposalKey: Uint8Array | null = null;
    private authors: Author[] | undefined;
    private frames: Frame[] | undefined;
    private genesisValue: Uint8Array | undefined;

    private readonly addedFrames: Frame[] = [];

    constructor(identity: Identity, errorCallback: ErrorCallback) {
        ENC_PROPOSAL_KEY_BYTES = PROPOSAL_KEY_BYTES + Bill.CRYPT_ASYM_EXTRA_BYTES;// init here as it requires a loaded Bill

        identityHasPrivateKeys(identity, "Identity for FileProcessor must have a private_key");

        this.identity = identity;
        this.errorCallback = errorCallback;
    }

    isLoaded(): boolean {
        return this.authors !== undefined && this.frames !== undefined;
    }

    getProposal(): Proposal {
        if(this.authors === undefined || this.frames === undefined)
            throw new IllegalStateException("no file is loaded");

        return {
            authors: this.authors,
            frames: this.frames
        };
    }

    //region create file
    async createFile(authors: Author[]) {
        const author = authors.find(a => IdentityProcessor.equals(a, this.identity));
        if(author === undefined)
            throw new IllegalArgumentException("set identity must be part of authors");

        this.proposalKey = await Bill.random_bytes(PROPOSAL_KEY_BYTES);
        this.authors = authors;
        this.frames = [];
        this.genesisValue = await Bill.random_bytes(Bill.HASH_BYTES);
        this.author = author;
    }
    //endregion

    //region load file
    async loadFile(data: BufferReader) {
        this.resetState();

        this.readAndCheckFileVersion(data);
        const proposalData = await this.decryptProposal(data);

        this.authors = await this.loadAuthors(proposalData);
        if(this.author === null)
            throw new AssertionError("was able to decrypt the proposal even if Identity is not in author-list; how is that possible");

        this.genesisValue = proposalData.readUint8Array(Bill.HASH_BYTES);

        const loadedFrames = await this.loadFrames(proposalData);
        const genesisFrame: GenesisDummyFrame = {
            frameType: FrameType.Invalid,
            // @ts-ignore
            prevFrameHash: null,
            // @ts-ignore
            author: null,
            timestamp: Number.MIN_SAFE_INTEGER + 1,
            hash: this.genesisValue
        };
        loadedFrames.push(genesisFrame);
        this.checkChainIntegrity(loadedFrames);

        if(loadedFrames[0] !== genesisFrame)
            throw new Error("assertion failed");
        loadedFrames.splice(0, 1);
        this.frames = loadedFrames;
    }

    private resetState() {
        this.author = null;
        this.authorCount = 0;
        this.proposalKey = null;
        this.authors = undefined;
        this.frames = undefined;
        this.genesisValue = undefined;
    }

    private readAndCheckFileVersion(data: BufferReader) {
        const ver = data.readUInt8();
        if(ver != FILE_SPEC_VERSION)
            throw new FileContentsException("file has unsupported version");
    }

    private async decryptProposal(data: BufferReader): Promise<BufferReader> {
        this.authorCount = data.readUInt16BE();
        if(this.authorCount < 0)
            throw new FileContentsException("invalid NumberOfAuthors");

        let i = 0;
        for(; i < this.authorCount; i++) {
            const encKey = data.readUint8Array(ENC_PROPOSAL_KEY_BYTES);
            try {
                this.proposalKey = await Bill.decryptAsym(encKey, this.identity.keypair);
                i++;
                break;
            } catch(ignored){}
        }
        if(this.proposalKey === null)
            throw new FileContentsException("this Identity cannot decrypt this file");

        data.setPosRel((this.authorCount - i) * ENC_PROPOSAL_KEY_BYTES);// skip over unread keys
        const proposalDataEnc = data.readRest();

        try {
            const proposalData = await Bill.decrypt(proposalDataEnc, this.proposalKey);
            return new BufferReader(Buffer.from(proposalData));
        } catch(e) {
            throw new FileContentsException("unable to decrypt proposal", e as Error);
        }
    }

    private async loadAuthors(data: BufferReader): Promise<Author[]> {
        const authors: Author[] = [];

        for(let i = 0; i < this.authorCount; i++){
            try {
                const author = await IdentityProcessor.loadAuthor(data);

                if(this.author === null && IdentityProcessor.equals(author, this.identity)) {
                    author.keypair.signPrivateKey = this.identity.keypair.signPrivateKey;
                    author.keypair.cryptPrivateKey = this.identity.keypair.cryptPrivateKey;
                    this.author = author;
                }

                authors.push(author);
            } catch(e) {
                this.errorCallback(`invalid author (${e}); dropping`);
            }
        }

        return authors;
    }

    private async loadFrames(data: BufferReader): Promise<Frame[]> {
        const frames: Frame[] = [];

        while(!data.isAtEnd()) {
            let frame: Frame | null = null;
            const type = data.readUInt8();
            switch (type){
                case FRAME_TYPE_ADDENDUM:
                    frame = await this.loadAddendumFrame(data);
                    break;
                case FRAME_TYPE_VOTE:
                    frame = await this.loadVoteFrame(data);
                    break;
                default:
                    throw new FileContentsException("invalid frame-type");
            }

            if(frame !== null)
                frames.push(frame);
        }

        return frames;
    }

    private async loadAddendumFrame(data: BufferReader): Promise<Addendum | null> {
        const oldPos = data.position();
        const prevFrameHash = data.readUint8Array(Bill.HASH_BYTES);
        const timestamp = data.readIntBE(TIMESTAMP_BYTES);
        const authorRef = data.readUInt16BE();
        const title = data.readStringUtf8();
        const mime = data.readStringUtf8();
        const dataLength = data.readUInt32BE();
        const addendumData = data.readUint8Array(dataLength);

        const actualHash = await hashFrame(data, oldPos);

        const hash = data.readUint8Array(Bill.HASH_BYTES);
        if(!deepEqual(actualHash, hash)) {
            this.errorCallback("a frame has an invalid hash; dropping");
            return null;
        }

        const author = this.authors![authorRef];
        if(author === undefined) {
            this.errorCallback("addendum references non-existing author; dropping");
            return null;
        }

        return {
            frameType: FrameType.Addendum,
            prevFrameHash: prevFrameHash,
            timestamp: timestamp,
            author: author,
            title: title,
            type: mime,
            data: addendumData,
            hash: hash
        };
    }

    private async loadVoteFrame(data: BufferReader): Promise<Vote | null> {
        const oldPos = data.position();
        const prevFrameHash = data.readUint8Array(Bill.HASH_BYTES);
        const timestamp = data.readIntBE(TIMESTAMP_BYTES);
        const authorRef = data.readUInt16BE();
        const targetAddendumHash = data.readUint8Array(Bill.HASH_BYTES);
        const vote = data.readUInt8() === 1;

        const actualHash = await hashFrame(data, oldPos);

        const hash = data.readUint8Array(Bill.HASH_BYTES);
        if(!deepEqual(actualHash, hash)) {
            this.errorCallback("a frame has an invalid hash; dropping");
            return null;
        }

        const author = this.authors![authorRef];
        if(author === undefined) {
            this.errorCallback("addendum references non-existing author; dropping");
            return null;
        }

        const signature = data.readUint8Array(Bill.SIGNATURE_BYTES);
        const signatureValid = await Bill.verify_data(hash, signature, author.keypair);

        if(!signatureValid) {
            this.errorCallback("a frame has an invalid signature; dropping");
            return null;
        }

        return {
            frameType: FrameType.Vote,
            prevFrameHash: prevFrameHash,
            timestamp: timestamp,
            author: author,
            targetAddendumHash: targetAddendumHash,
            vote: vote,
            signature: signature,
            hash: hash
        };
    }

    //region integrity checks
    private checkChainIntegrity(frames: Frame[]) {
        this.sortFrames(frames);

        if(!this.checkIsChainLinear(frames))
            this.errorCallback("chain is not linear");
        if(!this.checkTimestampsAscending(frames))
            this.errorCallback("chain timestamps are not ascending");
        if(!this.checkClockInFuture(frames))
            this.errorCallback("chain ends in the future");
        if(!this.checkVoteTargetsExist(frames))
            this.errorCallback("some votes has invalid targets");
        if(!this.checkAllAddendiVoted(frames))
            this.errorCallback("not all addendi were voted");
        if(!this.checkNoDoubleVotes(frames))
            this.errorCallback("chain contains multiple votes for one addendum from one author");
        if(!this.checkAuthorSignCount(frames))
            this.errorCallback("author sign-count does not match");
        if(!this.checkFramesAfterConsent(frames))
            this.errorCallback("proposal was modified after a consent had been established");
    }

    private sortFrames(frames: Frame[]) {
        frames.sort((a, b) => {
            if(a.prevFrameHash === null)
                return -1;
            if(b.prevFrameHash === null)
                return 1;
           if(deepEqual(a.hash, b.prevFrameHash))
               return -1;
           if(deepEqual(b.hash, a.prevFrameHash))
               return 1;
           return 0;
        });
    }

    private checkIsChainLinear(chain: Frame[]): boolean {
        for(const f of chain)
            if(deepEqual(f.hash, f.prevFrameHash))
                return false;

        const parents = chain.map(f => f.hash);
        if(!isArrUnique(parents))
            return false;

        for(const f of chain){
            const idx = parents.findIndex(hash => deepEqual(hash, f.prevFrameHash));
            if(idx !== -1)
                parents.splice(idx, 1);
        }

        return parents.length == 1;
    }

    private checkTimestampsAscending(chain: Frame[]): boolean {
        let lastTimestamp = Number.MIN_SAFE_INTEGER;
        for(const f of chain) {
            if(f.timestamp >= lastTimestamp)
                lastTimestamp = f.timestamp;
            else
                return false;
        }
        return true;
    }

    private checkClockInFuture(chain: Frame[]): boolean {
        const lastTimestamp = chain[chain.length - 1].timestamp;
        const currentTime = Date.now();
        return currentTime > lastTimestamp;
    }

    private checkVoteTargetsExist(chain: Frame[]): boolean {
        const addendumHashes = chain.filter(f => f.frameType === FrameType.Addendum).map(f => f.hash);
        for(const v of chain.filter(f => f.frameType === FrameType.Vote)) {
            const vote = v as Vote;
            if(!addendumHashes.some(hash => deepEqual(hash, vote.targetAddendumHash))) {
                return false;
            }
        }
        return true;
    }

    private checkAllAddendiVoted(chain: Frame[]): boolean {
        const addendumHashes = chain.filter(f => f.frameType === FrameType.Addendum).map(f => f.hash);
        const voteTargets = chain
            .filter(f => f.frameType === FrameType.Vote)
            .map(f => (f as Vote).targetAddendumHash);

        for(const addendum of addendumHashes)
            if(!voteTargets.some(hash => deepEqual(hash, addendum)))
                return false;
        return true;
    }

    private checkNoDoubleVotes(chain: Frame[]): boolean {
        const votes = chain.filter(f => f.frameType === FrameType.Vote).map(f => f as Vote);
        for(let i = 0; i < votes.length; i++) {
            const v1 = votes[i]
            for(let j = i + 1; j < votes.length; j++) {
                const v2 = votes[j];
                if(deepEqual(v1.targetAddendumHash, v2.targetAddendumHash)
                    && deepEqual(v1.author.keypair.signPublicKey, v2.author.keypair.signPublicKey)
                    && deepEqual(v1.author.keypair.cryptPublicKey, v2.author.keypair.cryptPublicKey))
                    return false;
            }
        }
        return true;
    }

    private checkAuthorSignCount(chain: Frame[]): boolean {
        const signCounts = new Map<Author, number>();

        for(const author of this.authors!)
            signCounts.set(author, 0);

        for(const v of chain.filter(f => f.frameType === FrameType.Vote)) {
            const vote = v as Vote;
            signCounts.set(vote.author, signCounts.get(vote.author)! + 1);
        }

        for(const author of this.authors!)
            if(signCounts.get(author)! !== author.signCount)
                return false;
        return true;
    }

    //TODO test
    private checkFramesAfterConsent(chain: Frame[]): boolean {
        let addendumAcceptVotes = 0;
        for(let i = 0; i < chain.length; i++) {
            const frame = chain[i];
            if(frame.frameType === FrameType.Vote){
                const vote = frame as Vote;
                if(vote.vote){
                    addendumAcceptVotes++;

                    if(addendumAcceptVotes === this.authors!.length) {
                        return i === chain.length - 1;
                    }
                }
            } else if(frame.frameType === FrameType.Addendum) {
                addendumAcceptVotes = 0;
            }
        }
        return true;
    }
    //endregion
    //endregion

    //region save file
    async saveFile(): Promise<Buffer> {
        if(this.identity === null)
            throw new IllegalStateException("no identity was set");
        if(this.authors === undefined || this.proposalKey === null)
            throw new IllegalStateException("no file is loaded");

        const data = new BufferWriter();

        data.writeUInt8(FILE_SPEC_VERSION);

        await this.saveProposalKey(data);

        const proposalData = new BufferWriter();
        await this.writeAuthors(proposalData);
        proposalData.writeUint8Array(this.genesisValue!);
        await this.writeFrames(proposalData, this.frames!);

        const proposalDataEnc = await Bill.encrypt(proposalData.take(), this.proposalKey);
        data.writeUint8Array(proposalDataEnc);

        return data.take();
    }

    private async saveProposalKey(data: BufferWriter) {
        const authors = this.authors!;
        const key = this.proposalKey!;

        data.writeUInt16BE(authors.length);

        for(let author of authors) {
            const keyEnc = await Bill.encryptAsym(key, author.keypair);
            data.writeUint8Array(keyEnc);
        }
    }

    private async writeAuthors(data: BufferWriter) {
        const authors = this.authors!;

        for(const author of authors) {
            if(author === this.author) {
                await IdentityProcessor.signAndSaveAuthor(data, author);
            } else {
                await IdentityProcessor.saveAuthor(data, author);
            }
        }
    }

    private async writeFrames(data: BufferWriter, frames: Frame[]) {
        for(const frame of frames) {
            switch (frame.frameType) {
                case FrameType.Addendum:
                    data.writeUInt8(FRAME_TYPE_ADDENDUM);
                    await this.writeAddendumFrame(data, frame as Addendum);
                    break;
                case FrameType.Vote:
                    data.writeUInt8(FRAME_TYPE_VOTE);
                    await this.writeVoteFrame(data, frame as Vote);
                    break;
            }
        }
    }

    private async writeAddendumFrame(data: BufferWriter, frame: Addendum) {
        if(frame.data.byteLength > 2**32)
            throw new FileContentsException("data of addendum must be <= 2^32 bytes");

        data.writeUint8Array(frame.prevFrameHash);
        data.writeUIntBE(frame.timestamp, TIMESTAMP_BYTES);
        data.writeUInt16BE(this.findAuthorIdx(frame.author));
        data.writeStringUtf8(frame.title);
        data.writeStringUtf8(frame.type);
        data.writeUInt32BE(frame.data.byteLength);
        data.writeUint8Array(frame.data);
        data.writeUint8Array(frame.hash);
    }

    private async writeVoteFrame(data: BufferWriter, frame: Vote) {
        data.writeUint8Array(frame.prevFrameHash);
        data.writeUIntBE(frame.timestamp, TIMESTAMP_BYTES);
        data.writeUInt16BE(this.findAuthorIdx(frame.author));
        data.writeUint8Array(frame.targetAddendumHash);
        data.writeInt8(frame.vote ? 1 : 0);
        data.writeUint8Array(frame.hash);
        data.writeUint8Array(frame.signature);
    }
    //endregion

    //region modify
    async addAddendum(title: string, mime: string, content: Buffer) {
        if(this.identity === null)
            throw new IllegalStateException("no identity was set");
        if(this.frames === undefined)
            throw new IllegalStateException("no file is loaded");

        let prevFrameHash: Uint8Array;
        if(this.frames.length > 0) {
            prevFrameHash = this.frames[this.frames.length - 1].hash;
        } else {
            prevFrameHash = this.genesisValue!;
        }

        const timestamp = Date.now();
        const authorRef = this.findAuthorIdx(this.author!);
        const contentLength = content.byteLength;

        const hashBuffer = new BufferWriter();
        hashBuffer.writeUint8Array(prevFrameHash);
        hashBuffer.writeIntBE(timestamp, TIMESTAMP_BYTES);
        hashBuffer.writeUInt16BE(authorRef);
        hashBuffer.writeStringUtf8(title);
        hashBuffer.writeStringUtf8(mime);
        hashBuffer.writeUInt32BE(contentLength);
        hashBuffer.writeUint8Array(content);
        const hash = await hashFrame(hashBuffer, 0);

        const frame: Addendum = {
            frameType: FrameType.Addendum,
            prevFrameHash: prevFrameHash,
            timestamp: timestamp,
            author: this.author!,
            title: title,
            type: mime,
            data: content,
            hash: hash
        };

        this.frames.push(frame);
        this.addedFrames.push(frame);

        // add mandatory vote
        await this.addVote(true);
    }

    async addVote(vote: boolean) {
        if(this.identity === null)
            throw new IllegalStateException("no identity was set");
        if(this.frames === undefined)
            throw new IllegalStateException("no file is loaded");
        if(this.frames.length === 0)
            throw new IllegalStateException("no addendum exist");

        const prevFrameHash: Uint8Array = this.frames[this.frames.length - 1].hash;
        const timestamp = Date.now();
        const authorRef = this.findAuthorIdx(this.author!);

        let lastAddendumHash: Uint8Array | null = null;
        for(let i = this.frames.length - 1; i >= 0; i--) {
            const f = this.frames[i];
            if(f.frameType === FrameType.Addendum) {
                lastAddendumHash = f.hash;
                break;
            }
        }
        if(lastAddendumHash === null)
            throw new IllegalStateException("no addendum exist");

        if(this.checkAlreadyVoted(lastAddendumHash))
            throw new IllegalStateException("already voted");

        const hashBuffer = new BufferWriter();
        hashBuffer.writeUint8Array(prevFrameHash);
        hashBuffer.writeIntBE(timestamp, TIMESTAMP_BYTES);
        hashBuffer.writeUInt16BE(authorRef);
        hashBuffer.writeUint8Array(lastAddendumHash);
        hashBuffer.writeInt8(vote ? 1 : 0);

        const hash = await hashFrame(hashBuffer, 0);
        const signature = await Bill.sign_data(hash, this.author!.keypair);

        const frame: Vote = {
            frameType: FrameType.Vote,
            prevFrameHash: prevFrameHash,
            timestamp: timestamp,
            author: this.author!,
            targetAddendumHash: lastAddendumHash,
            vote: vote,
            hash: hash,
            signature: signature
        };

        this.author!.signCount++;

        this.frames.push(frame);
        this.addedFrames.push(frame);
    }

    private checkAlreadyVoted(lastAddendumHash: Uint8Array): boolean {
        return this.frames!
            .filter(f => f.frameType === FrameType.Vote)
            .map(f => f as Vote)
            .filter(v => deepEqual(v.targetAddendumHash, lastAddendumHash))
            .some(v => deepEqual(v.author, this.author!));
    }
    //endregion

    //region patches
    async importPatchSet(data: BufferReader) {
        if(this.frames === undefined || this.proposalKey === null)
            throw new IllegalStateException("no file is loaded");

        const dataEnc = data.readRest();
        const dataDec = await Bill.decrypt(dataEnc, this.proposalKey);
        const dataReader = new BufferReader(new Buffer(dataDec));

        await this.importAuthor(dataReader);
        await this.importFrames(dataReader);
    }

    private async importAuthor(data: BufferReader) {
        let loadedAuthor: Author;
        try {
            loadedAuthor = await IdentityProcessor.loadAuthor(data);
        } catch(e) {
            this.errorCallback(`invalid author (${e}); dropping`);
            return;
        }

        const authorIdx = this.findAuthorIdx(loadedAuthor);
        if(authorIdx === -1)
            throw new FileContentsException("author of PatchSet is not an author of this Proposal");

        const orgAuthor = this.authors![authorIdx];
        if(orgAuthor === this.author) {
            loadedAuthor.keypair.signPrivateKey = this.author.keypair.signPrivateKey;
            loadedAuthor.keypair.cryptPrivateKey = this.author.keypair.cryptPrivateKey;
            this.author = loadedAuthor;
        }
        this.frames!.forEach(f => {
            if(f.author === orgAuthor)
                f.author = loadedAuthor;
        });
        this.authors![authorIdx] = loadedAuthor;
    }

    private async importFrames(data: BufferReader) {
        const loadedFrames = await this.loadFrames(data);
        const newChain = [...this.frames!, ...loadedFrames];
        this.checkChainIntegrity(newChain);
        this.frames = newChain;
    }

    async exportChanges(): Promise<Buffer> {
        if(this.frames === undefined || this.proposalKey === null)
            throw new IllegalStateException("no file is loaded");
        if(this.author === null)
            throw new IllegalStateException("no identity was set");

        const data = new BufferWriter();

        await IdentityProcessor.signAndSaveAuthor(data, this.author);
        await this.writeFrames(data, this.addedFrames);

        const dataDec = data.take();
        const dataEnc = await Bill.encrypt(dataDec, this.proposalKey);
        return new Buffer(dataEnc);
    }

    getChangesCount(): number {
        return this.addedFrames.length;
    }

    clearChanges() {
        this.addedFrames.splice(0);
    }
    //endregion

    //region helpers
    private findAuthorIdx(author: Author): number {
        return this.authors!.findIndex(a => deepEqual(a.keypair.signPublicKey, author.keypair.signPublicKey));
    }
    //endregion
}
