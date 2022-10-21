import {Buffer} from "buffer";

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

    readUIntLE(byteLength: number): number {
        const ret = this.buffer.readUIntLE(this.pos, byteLength);
        this.pos += byteLength;
        return ret;
    }
    readUIntBE(byteLength: number): number {
        const ret = this.buffer.readUIntBE(this.pos, byteLength);
        this.pos += byteLength;
        return ret;
    }
    readIntLE(byteLength: number): number {
        const ret = this.buffer.readIntLE(this.pos, byteLength);
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
    readUInt16LE(): number {
        let ret = this.buffer.readUInt16LE(this.pos);
        this.pos += 2;
        return ret;
    }
    readUInt16BE(): number {
        let ret = this.buffer.readUInt16BE(this.pos);
        this.pos += 2;
        return ret;
    }
    readUInt32LE(): number {
        let ret = this.buffer.readUInt32LE(this.pos);
        this.pos += 4;
        return ret;
    }
    readUInt32BE(): number {
        let ret = this.buffer.readUInt32BE(this.pos);
        this.pos += 4;
        return ret;
    }
    readBigUInt64LE(): BigInt {
        let ret = this.buffer.readBigUInt64LE(this.pos);
        this.pos += 8;
        return ret;
    }
    readBigUInt64BE(): BigInt {
        let ret = this.buffer.readBigUInt64BE(this.pos);
        this.pos += 8;
        return ret;
    }
    readInt8(): number {
        let ret = this.buffer.readInt8(this.pos);
        this.pos += 1;
        return ret;
    }
    readInt16LE(): number {
        let ret = this.buffer.readInt16LE(this.pos);
        this.pos += 2;
        return ret;
    }
    readInt16BE(): number {
        let ret = this.buffer.readInt16BE(this.pos);
        this.pos += 2;
        return ret;
    }
    readInt32LE(): number {
        let ret = this.buffer.readInt32LE(this.pos);
        this.pos += 4;
        return ret;
    }
    readInt32BE(): number {
        let ret = this.buffer.readInt32BE(this.pos);
        this.pos += 4;
        return ret;
    }
    readBigInt64LE(): BigInt {
        let ret = this.buffer.readBigInt64LE(this.pos);
        this.pos += 8;
        return ret;
    }
    readBigInt64BE(): BigInt {
        let ret = this.buffer.readBigInt64BE(this.pos);
        this.pos += 8;
        return ret;
    }
    readFloatLE(): number {
        let ret = this.buffer.readFloatLE(this.pos);
        this.pos += 4;
        return ret;
    }
    readFloatBE(): number {
        let ret = this.buffer.readFloatBE(this.pos);
        this.pos += 4;
        return ret;
    }
    readDoubleLE(): number {
        let ret = this.buffer.readDoubleLE(this.pos);
        this.pos += 8;
        return ret;
    }
    readDoubleBE(): number {
        let ret = this.buffer.readDoubleBE(this.pos);
        this.pos += 8;
        return ret;
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
}
