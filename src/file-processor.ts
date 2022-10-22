import BufferReader from "./buffer-reader";
import "./exceptions";
import {FileContentsException, IllegalArgumentException, IlligalStateException} from "./exceptions";
import Bill, {Keypair} from "./bill";
import {Buffer} from "buffer";
import Frame, {FrameType} from "./model/Frame";
import Author from "./model/Author";
import deepEqual from "fast-deep-equal";
import Addendum from "./model/Addendum";
import Vote from "./model/Vote";
import BufferWriter from "./buffer-writer";

const FILE_SPEC_VERSION = 1;
const FRAME_TYPE_ADDENDUM = 1;
const FRAME_TYPE_VOTE = 2;
const TIMESTAMP_BYTES = 56 / 8;

interface FrameWithHash {
    frame: Frame,
    hash: Uint8Array
}

interface GenesisDummyFrame extends Frame {}

export type ErrorCallback = (msg: string) => void;

export class FileProcessor {

    private readonly encryptFile: boolean;
    private readonly errorCallback: ErrorCallback;
    private author: Author | null = null;
    private data: BufferReader | undefined;

    private authors: Author[] | undefined;
    private frames: Frame[] | undefined;
    private genesisValue: Uint8Array | undefined;

    constructor(encryptFile: boolean, errorCallback: ErrorCallback) {
        this.encryptFile = encryptFile;
        this.errorCallback = errorCallback;
    }

    setAuthor(author: Author) {
        this.author = author;
    }

    getAuthors(): Author[] {
        if(this.authors === undefined)
            throw new IlligalStateException("no file is loaded");
        return this.authors;
    }

    getFrames(): Frame[] {
        if(this.frames === undefined)
            throw new IlligalStateException("no file is loaded");
        return this.frames;
    }

    //region load file
    async loadFile(data: BufferReader, key: Uint8Array | null) {
        if(this.encryptFile){
            if(key === null)
                throw new IllegalArgumentException("key must be provided if encryptFile is enabled");
            this.data = await this.decryptData(data, key);
        }else {
            this.data = data;
        }

        this.readAndCheckFileVersion();
        this.authors = await this.loadAuthors();
        this.checkLocalAuthorExists();

        this.genesisValue = this.data.readUint8Array(Bill.HASH_BYTES);

        const loadedFrames = await this.loadFrames();
        const genesisFrame = {frame: {} as GenesisDummyFrame, hash: this.genesisValue};
        loadedFrames.push(genesisFrame);
        this.checkChainIntegrity(loadedFrames);

        loadedFrames.splice(loadedFrames.indexOf(genesisFrame), 1);
        this.frames = loadedFrames.map(f => f.frame);

        this.data = undefined;
    }

    private async decryptData(data: BufferReader, key: Uint8Array): Promise<BufferReader> {
        const dataPos = data.position();
        let dataArr = data.readToUnit8Array();
        dataArr = await Bill.decrypt(dataArr, key);
        let decryptedReader = new BufferReader(new Buffer(dataArr));
        decryptedReader.setPositionAbs(dataPos);
        return decryptedReader;
    }

    private readAndCheckFileVersion() {
        if(this.data === undefined)
            throw new Error();

        const ver = this.data.readUInt8();
        if(ver != FILE_SPEC_VERSION)
            throw new FileContentsException("file has unsupported version");
    }

    private async loadAuthors(): Promise<Author[]> {
        if(this.data === undefined)
            throw new Error();

        const authorCount = this.data.readUInt16BE();
        const authors = [] as Author[];

        for(let i = 0; i < authorCount; i++){
            const author = await this.loadAuthor();
            if(author != null)
                authors.push(author);
        }

        return authors;
    }

    private async loadAuthor(): Promise<Author | null> {
        if(this.data === undefined)
            throw new Error();

        const oldPos = this.data.position();
        const name = this.data.readStringUtf8();
        const mail = this.data.readStringUtf8();
        const publicKey = this.data.readUint8Array(Bill.ECC_PUBLIC_KEY_BYTES);
        const signCount = this.data.readUInt32BE();

        const readLength = this.data.position() - oldPos;
        this.data.setPositionAbs(oldPos);
        const toHash = this.data.readUint8Array(readLength);
        const hash = await Bill.hash(toHash);

        const signature = this.data.readUint8Array(Bill.ECC_SIGNATURE_BYTES);

        const kp: Keypair = {
            publicKey: publicKey,
            privateKey: null
        }
        const signatureValid = await Bill.verify_data(hash, signature, kp);

        if(!signatureValid) {
            this.errorCallback(`signature for author ${name} is invalid`);
        }

        return {
            name: name,
            mail: mail,
            keypair: kp,
            signCount: signCount,
            signature: signature
        };
    }

    private checkLocalAuthorExists() {
        if(this.author !== null) {
            const author = this.author;
            if(!this.authors!.some(a => {
                a.name === author.name
                && a.mail === author.mail
                && deepEqual(a.keypair.publicKey, author.keypair.publicKey)
            })) {
                this.errorCallback("local author is not in the list of authors");
            }
        }
    }

    private async loadFrames(): Promise<FrameWithHash[]> {
        if(this.data === undefined)
            throw new Error();

        const frames = [] as FrameWithHash[];
        while(!this.data.isAtEnd()) {
            let frame: FrameWithHash | null = null;
            const type = this.data.readUInt8();
            switch (type){
                case FRAME_TYPE_ADDENDUM:
                    frame = await this.loadAddendumFrame();
                    break;
                case FRAME_TYPE_VOTE:
                    frame = await this.loadVoteFrame();
                    break;
                default:
                    throw new FileContentsException("invalid frame-type");
            }
            if(frame !== null)
                frames.push(frame);
        }
        return frames;
    }

    private async loadAddendumFrame(): Promise<FrameWithHash | null> {
        if(this.data === undefined)
            throw new Error();

        const oldPos = this.data.position();
        const prevFrameHash = this.data.readUint8Array(Bill.HASH_BYTES);
        const timestamp = this.data.readIntBE(TIMESTAMP_BYTES);
        const authorRef = this.data.readUInt16BE();
        const mime = this.data.readStringUtf8();
        const dataLength = this.data.readUInt32BE();
        const data = this.data.readUint8Array(dataLength);

        const actualHash = await this.hashFrame(this.data, oldPos);

        const hash = this.data.readUint8Array(Bill.HASH_BYTES);
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
            frame: {
                frameType: FrameType.Addendum,
                prevFrameHash: prevFrameHash,
                timestamp: timestamp,
                author: author,
                type: mime,
                data: data
            } as Addendum,
            hash: hash
        };
    }

    private async loadVoteFrame(): Promise<FrameWithHash | null> {
        if(this.data === undefined)
            throw new Error();

        const oldPos = this.data.position();
        const prevFrameHash = this.data.readUint8Array(Bill.HASH_BYTES);
        const timestamp = this.data.readIntBE(TIMESTAMP_BYTES);
        const authorRef = this.data.readUInt16BE();
        const targetAddendumHash = this.data.readUint8Array(Bill.HASH_BYTES);
        const vote = this.data.readUInt8() === 1;

        const actualHash = await this.hashFrame(this.data, oldPos);

        const hash = this.data.readUint8Array(Bill.HASH_BYTES);
        if(!deepEqual(actualHash, hash)) {
            this.errorCallback("a frame has an invalid hash; dropping");
            return null;
        }

        const author = this.authors![authorRef];
        if(author === undefined) {
            this.errorCallback("addendum references non-existing author; dropping");
            return null;
        }

        const signature = this.data.readUint8Array(Bill.ECC_SIGNATURE_BYTES);
        const signatureValid = await Bill.verify_data(hash, signature, author.keypair);

        if(!signatureValid) {
            this.errorCallback("a frame has an invalid signature; dropping");
            return null;
        }

        return {
            frame: {
                frameType: FrameType.Vote,
                prevFrameHash: prevFrameHash,
                timestamp: timestamp,
                author: author,
                targetAddendumHash: targetAddendumHash,
                vote: vote,
                signature: signature
            } as Vote,
            hash: hash
        };
    }

    //region integrity checks
    private checkChainIntegrity(frames: FrameWithHash[]) {
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
        if(!this.checkAuthorSignCount(frames))
            this.errorCallback("author sign-count does not match");
    }

    private sortFrames(frames: FrameWithHash[]) {
        frames.sort((a, b) => {
           if(deepEqual(a.hash, b.frame.prevFrameHash))
               return -1;
           if(deepEqual(b.hash, a.frame.prevFrameHash))
               return 1;
           return 0;
        });
    }

    private checkIsChainLinear(chain: FrameWithHash[]): boolean {
        const parents = chain.map(f => f.hash);
        if(!isUint8ArrayArrUnique(parents))
            return false;

        for(const f of chain)
            parents.splice(parents.findIndex(hash => deepEqual(hash, f.frame.prevFrameHash)), 1);
        return parents.length == 1;
    }

    private checkTimestampsAscending(chain: FrameWithHash[]): boolean {
        let lastTimestamp = Number.MIN_SAFE_INTEGER;
        for(const f of chain) {
            if(f.frame.timestamp > lastTimestamp)
                lastTimestamp = f.frame.timestamp;
            else
                return false;
        }
        return true;
    }

    private checkClockInFuture(chain: FrameWithHash[]): boolean {
        const lastTimestamp = chain[chain.length - 1].frame.timestamp;
        const currentTime = Date.now();
        return currentTime > lastTimestamp;
    }

    private checkVoteTargetsExist(chain: FrameWithHash[]): boolean {
        const addendumHashes = chain.filter(f => f.frame.frameType === FrameType.Addendum).map(f => f.hash);
        for(const v of chain.filter(f => f.frame.frameType === FrameType.Vote)) {
            const vote = v.frame as Vote;
            if(!addendumHashes.some(hash => deepEqual(hash, vote.targetAddendumHash))) {
                return false;
            }
        }
        return true;
    }

    private checkAllAddendiVoted(chain: FrameWithHash[]): boolean {
        const addendumHashes = chain.filter(f => f.frame.frameType === FrameType.Addendum).map(f => f.hash);
        const voteTargets = chain
            .filter(f => f.frame.frameType === FrameType.Vote)
            .map(f => (f.frame as Vote).targetAddendumHash);

        for(const addendum of addendumHashes)
            if(!voteTargets.some(hash => deepEqual(hash, addendum)))
                return false;
        return true;
    }

    private checkAuthorSignCount(chain: FrameWithHash[]): boolean {
        const signCounts = new Map<Author, number>();

        for(const author of this.authors!)
            signCounts.set(author, 0);

        for(const v of chain.filter(f => f.frame.frameType === FrameType.Vote)) {
            const vote = v.frame as Vote;
            signCounts.set(vote.author, signCounts.get(vote.author)! + 1);
        }

        for(const author of this.authors!)
            if(signCounts.get(author)! !== author.signCount)
                return false;
        return true;
    }
    //endregion
    //endregion

    //region save file
    async saveFile(key: Uint8Array | null): Promise<Buffer> {
        if(this.author === null)
            throw new IlligalStateException("no author was set");
        if(this.authors === undefined)
            throw new IlligalStateException("no file is loaded");

        const data = new BufferWriter();

        data.writeUInt8(FILE_SPEC_VERSION);
        await this.writeAuthors(data);
        data.writeUint8Array(this.genesisValue!);
        await this.writeAuthors(data);
        await this.writeFrames(data);

        const dataFinal = data.take();
        if(this.encryptFile){
            if(key === null)
                throw new IllegalArgumentException("key must be provided if encryptFile is enabled");
            return Buffer.from(await Bill.encrypt(dataFinal, key));
        }else {
            return dataFinal;
        }
    }

    private async writeAuthors(data: BufferWriter) {
        const authors = this.authors!;
        data.writeUInt16BE(authors.length);

        for(const author of authors)
            await this.writeAuthor(data, author);
    }

    private async writeAuthor(data: BufferWriter, author: Author) {
        const oldPos = data.position();

        data.writeStringUtf8(author.name);
        data.writeStringUtf8(author.mail);
        data.writeUint8Array(author.keypair.publicKey);
        data.writeUInt32BE(author.signCount);

        if(deepEqual(author, this.author)) {
            author.signature = await this.sign(data, oldPos);
        }

        data.writeUint8Array(author.signature);
    }

    private async writeFrames(data: BufferWriter) {
        for(const frame of this.frames!) {
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

        const oldPos = data.position();

        data.writeUint8Array(frame.prevFrameHash);
        data.writeUIntBE(frame.timestamp, TIMESTAMP_BYTES);
        data.writeUInt16BE(this.authors!.indexOf(frame.author));
        data.writeStringUtf8(frame.type);
        data.writeUInt32BE(frame.data.byteLength);
        data.writeUint8Array(frame.data);

        data.writeUint8Array(await this.hashFrame(data, oldPos));
    }

    private async writeVoteFrame(data: BufferWriter, frame: Vote) {
        const oldPos = data.position();

        data.writeUint8Array(frame.prevFrameHash);
        data.writeUIntBE(frame.timestamp, TIMESTAMP_BYTES);
        data.writeUInt16BE(this.authors!.indexOf(frame.author));
        data.writeUint8Array(frame.targetAddendumHash);
        data.writeInt8(frame.vote ? 1 : 0);

        data.writeUint8Array(await this.hashFrame(data, oldPos));
        data.writeUint8Array(await this.sign(data, oldPos, data.position() - Bill.HASH_BYTES));
    }
    //endregion

    //region utils
    private async hashFrame(data: BufferWriter | BufferReader, frameStart: number, frameEnd: number = -1): Promise<Uint8Array> {
        if(frameEnd === -1)
            frameEnd = data.position();

        const reader = new BufferReader(data.getBuffer());
        const frameLength = frameEnd - frameStart;
        reader.setPositionAbs(frameStart);
        const frameData = reader.readUint8Array(frameLength);

        return await Bill.hash(frameData);
    }

    private async sign(data: BufferWriter, frameStart: number, frameEnd: number = -1): Promise<Uint8Array> {
        const hash = await this.hashFrame(data, frameStart, frameEnd);
        return await Bill.sign_data(hash, this.author!.keypair);
    }
    //region utils
}

//region utils
function isUint8ArrayArrUnique(arr: Uint8Array[]): boolean {
    for(let i = 0; i < arr.length; i++) {
        for(let j = i + 1; j < arr.length; j++) {
            if(deepEqual(arr[i], arr[j])) {
                return false;
            }
        }
    }
    return true;
}
//endregion
