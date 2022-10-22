import {Buffer} from "buffer";
import {IllegalArgumentException} from "./exceptions";

export default class BufferReader {

    private readonly buffer: Buffer
    private pos: number

    constructor(src: Buffer, pos: number = 0) {
        this.buffer = src;
        this.pos = pos;
    }

    isAtEnd(): boolean {
        return this.pos >= this.buffer.length;
    }

    position(): number {
        return this.pos;
    }

    setPositionAbs(pos: number) {
        this.pos = pos;
    }

    setPosRel(offset: number) {
        this.pos += offset;
    }

    /**
     * return the internal buffer
     */
    getBuffer(): Buffer {
        return this.buffer;
    }

    readUIntBE(byteLength: number): number {
        const ret = this.buffer.readUIntBE(this.pos, byteLength);
        this.pos += byteLength;
        return ret;
    }
    readIntBE(byteLength: number): number {
        const ret = this.buffer.readIntBE(this.pos, byteLength);
        this.pos += byteLength;
        return ret;
    }
    readUInt8(): number {
        let ret = this.buffer.readUInt8(this.pos);
        this.pos += 1;
        return ret;
    }
    readUInt16BE(): number {
        let ret = this.buffer.readUInt16BE(this.pos);
        this.pos += 2;
        return ret;
    }
    readUInt32BE(): number {
        let ret = this.buffer.readUInt32BE(this.pos);
        this.pos += 4;
        return ret;
    }
    readInt8(): number {
        let ret = this.buffer.readInt8(this.pos);
        this.pos += 1;
        return ret;
    }
    readInt16BE(): number {
        let ret = this.buffer.readInt16BE(this.pos);
        this.pos += 2;
        return ret;
    }
    readInt32BE(): number {
        let ret = this.buffer.readInt32BE(this.pos);
        this.pos += 4;
        return ret;
    }
    readFloatBE(): number {
        let ret = this.buffer.readFloatBE(this.pos);
        this.pos += 4;
        return ret;
    }
    readDoubleBE(): number {
        let ret = this.buffer.readDoubleBE(this.pos);
        this.pos += 8;
        return ret;
    }

    readUBigIntBE(bytes: number): bigint {
        if(this.pos + bytes > this.buffer.length)
            throw new IllegalArgumentException("read would result out-of-range");

        let result = 0n;
        for(let i = 0; i < bytes; i++) {
            const byte = BigInt(this.readUInt8());
            result <<= 8n;
            result |= byte;
        }

        return result;
    }

    /**
     * creates an Uint8Array as a view of the source
     * @param keepPos if false the pos will be moved to the end else it will not be modified
     */
    readToUnit8Array(keepPos: boolean = false): Uint8Array {
        let ret = new Uint8Array(this.buffer.buffer, this.pos, this.buffer.length - this.pos);
        if(!keepPos)
            this.pos = this.buffer.length;
        return ret;
    }

    /**
     * creates an Uint8Array as a view of the source
     * @param length number of bytes to read
     */
    readUint8Array(length: number): Uint8Array {
        let ret = new Uint8Array(this.buffer.buffer, this.pos, length);
        this.pos += length;
        return ret;
    }

    readStringUtf8(): string {
        const start = this.pos;
        let length = 0;

        // search 0-terminator
        while(this.readUInt8() !== 0)
            length++;

        return this.buffer.toString("utf8", start, start + length);
    }
}
