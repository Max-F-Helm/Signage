import {Buffer} from "buffer";

const INITIAL_CAPACITY = 512;
const GROW_FACTOR = 1.75;

export default class BufferWriter {

    private buffer: Buffer
    private pos: number

    constructor() {
        this.buffer = Buffer.alloc(INITIAL_CAPACITY, 0);
        this.pos = 0;
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
     * <br> Warning: every write can invalidate the buffer
     */
    getBuffer(): Buffer {
        return this.buffer;
    }

    /**
     * copies all written content to a new Buffer
     * (pos will not be changed)
     */
    take(): Buffer {
        const data = Buffer.allocUnsafe(this.pos);
        this.buffer.copy(data, 0, 0, this.pos);
        return data;
    }

    writeBuffer(src: Buffer, start: number = 0, length: number = -1): number {
        if(length === -1)
            length = src.length;

        this.ensureCapacity(length);

        return src.copy(this.buffer, this.pos, start, start + length);
    }

    writeUIntBE(value: number, byteLength: number): number {
        this.pos = this.buffer.writeUIntBE(value, this.pos, byteLength);
        return this.pos;
    }
    writeIntBE(value: number, byteLength: number): number {
        this.pos = this.buffer.writeIntBE(value, this.pos, byteLength);
        return this.pos;
    }
    writeUInt8(value: number): number {
        this.pos = this.buffer.writeUInt8(value, this.pos);
        return this.pos;
    }
    writeUInt16BE(value: number): number {
        this.pos = this.buffer.writeUInt16BE(value, this.pos);
        return this.pos;
    }
    writeUInt32BE(value: number): number {
        this.pos = this.buffer.writeUInt32BE(value, this.pos);
        return this.pos;
    }
    writeInt8(value: number): number {
        this.pos = this.buffer.writeInt8(value, this.pos);
        return this.pos;
    }
    writeInt16BE(value: number): number {
        this.pos = this.buffer.writeInt16BE(value, this.pos);
        return this.pos;
    }
    writeInt32BE(value: number): number {
        this.pos = this.buffer.writeInt32BE(value, this.pos);
        return this.pos;
    }
    writeFloatBE(value: number): number {
        this.pos = this.buffer.writeFloatBE(value, this.pos);
        return this.pos;
    }
    writeDoubleBE(value: number): number {
        this.pos = this.buffer.writeDoubleBE(value, this.pos);
        return this.pos;
    }

    writeUBigUIntBE(value: bigint, bytes: number): number {
        this.ensureCapacity(bytes);

        for(let i = 0; i < bytes; i++) {
            this.writeUInt8(Number(value & 0xFFn));
            value >>= 8n;
        }

        return this.pos;
    }

    writeUint8Array(value: Uint8Array) {
        const valueBuffer = Buffer.from(value);
        this.ensureCapacity(valueBuffer.length);
        valueBuffer.copy(this.buffer, this.pos, 0, valueBuffer.length);
        this.pos += valueBuffer.length;
    }

    writeStringUtf8(value: string) {
        this.ensureCapacity(value.length + 1);
        let written = this.buffer.write(value, this.pos, value.length, "utf8");
        this.pos += written;
        this.writeUInt8(0);// write 0-terminator
        return written + 1;
    }

    private ensureCapacity(size: number) {
        if(this.buffer.length < this.pos + size) {
            const newBuffer = Buffer.alloc(this.buffer.length * GROW_FACTOR, 0);
            this.buffer.copy(newBuffer, 0, 0, this.pos);
            this.buffer = newBuffer;
        }
    }
}
