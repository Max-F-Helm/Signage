import BufferReader from "./buffer-reader";
import "./exceptions";
import {IllegalArgumentException, FileContentsException} from "./exceptions";
import Bill, {Keypair} from "./bill";
import {Buffer} from "buffer";
import Frame from "./model/Frame";
import Author from "./model/Author";
import BufferWriter from "./buffer-writer";

const FILE_SPEC_VERSION = 1;
const FRAME_TYPE_ADDENDUM = 1;
const FRAME_TYPE_VOTE = 2;

export type ErrorCallback = (msg: string) => void;

export class FileProcessor {

    private readonly encryptFile: boolean;
    private readonly errorCallback: ErrorCallback
    private data: BufferReader;
    private frames: Frame[];
    private genesisValue: BigInt;

    constructor(encryptFile: boolean, errorCallback: ErrorCallback) {
        this.encryptFile = encryptFile;
        this.errorCallback = errorCallback;
    }

    async loadFile(data: BufferReader, key: Uint8Array | null) {
        if(this.encryptFile){
            if(key === null)
                throw new IllegalArgumentException("key must be provided if encryptFile is enabled");
            this.data = await this.decryptData(data, key);
        }else {
            this.data = data;
        }

        this.readAndCheckFileVersion();
    }

    private async decryptData(data: BufferReader, key: Uint8Array): Promise<BufferReader> {
        const dataPos = data.position();
        let dataArr = data.readToUnit8Array();
        dataArr = await Bill.decrypt(dataArr, key);
        let decryptedReader = new BufferReader(new Buffer(dataArr));
        decryptedReader.setPositionAbs(dataPos);
        return decryptedReader;
    }

    private readAndCheckFileVersion(){
        const ver = this.data.readUInt8();
        if(ver != FILE_SPEC_VERSION)
            throw new FileContentsException("file has unsupported version");
    }

    private async loadAuthors(): Promise<Author[]> {
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
        const name = this.data.readStringUtf8();
        const mail = this.data.readStringUtf8();
        const publicKey = this.data.readUnit8Array(Bill.ECC_PUBLIC_KEY_BYTES);
        const signCount = this.data.readUInt32BE();
        const signature = this.data.readUnit8Array(Bill.ECC_SIGNATURE_BYTES);

        // generate hash for comparison
        const buffer = new BufferWriter();
        buffer.writeStringUtf8(name);
        buffer.writeStringUtf8(mail);
        buffer.writeBuffer(Buffer.from(publicKey), Bill.ECC_PUBLIC_KEY_BYTES);
        buffer.writeUInt32BE(signCount);
        const hash = await Bill.hash(buffer.take());

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
            publicKey: kp,
            signCount: signCount
        };
    }
}
