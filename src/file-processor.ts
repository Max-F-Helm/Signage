import BufferReader from "./buffer-reader";
import "./exceptions";
import {IllegalArgumentException, FileContentsException} from "./exceptions";
import Bill from "./bill";
import {Buffer} from "buffer";

const FILE_SPEC_VERSION = 1;

export class FileProcessor {

    private readonly encryptFile: boolean;

    constructor(encryptFile: boolean) {
        this.encryptFile = encryptFile;
    }

    async loadFile(data: BufferReader, key: Uint8Array | null) {
        if(this.encryptFile){
            if(key === null)
                throw new IllegalArgumentException("key must be provided if encryptFile is enabled");
            data = await this.decryptData(data, key);
        }

        this.readAndCheckFileVersion(data);
    }

    private async decryptData(data: BufferReader, key: Uint8Array): Promise<BufferReader> {
        const dataPos = data.position();
        let dataArr = data.readToUnit8Array();
        dataArr = await Bill.decrypt(dataArr, key);
        let decryptedReader = new BufferReader(new Buffer(dataArr));
        decryptedReader.setPositionAbs(dataPos);
        return decryptedReader;
    }

    private readAndCheckFileVersion(data: BufferReader){
        const ver = data.readUInt8();
        if(ver != FILE_SPEC_VERSION)
            throw new FileContentsException("file has unsupported version");
    }
}
