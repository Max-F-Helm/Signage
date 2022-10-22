import type BufferWriter from "@/processing/buffer-writer";
import BufferReader from "@/processing/buffer-reader";
import Bill from "@/processing/bill";
import deepEqual from "fast-deep-equal";
import type {Identity} from "@/processing/identity-processor";

export function isUint8ArrayArrUnique(arr: Uint8Array[]): boolean {
    for(let i = 0; i < arr.length; i++) {
        for(let j = i + 1; j < arr.length; j++) {
            if(deepEqual(arr[i], arr[j])) {
                return false;
            }
        }
    }
    return true;
}

export async function hashFrame(data: BufferWriter | BufferReader, frameStart: number, frameEnd: number = -1): Promise<Uint8Array> {
    if(frameEnd === -1)
        frameEnd = data.position();

    const reader = new BufferReader(data.getBuffer());
    const frameLength = frameEnd - frameStart;
    reader.setPositionAbs(frameStart);
    const frameData = reader.readUint8Array(frameLength);

    return await Bill.hash(frameData);
}

export async function signFrame(identity: Identity, data: BufferWriter, frameStart: number, frameEnd: number = -1): Promise<Uint8Array> {
    const hash = await hashFrame(data, frameStart, frameEnd);
    return await Bill.sign_data(hash, identity.keypair);
}
