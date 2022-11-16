import type BufferWriter from "@/processing/buffer-writer";
import BufferReader from "@/processing/buffer-reader";
import Bill from "@/processing/bill";
import deepEqual from "@/deep-equals";
import type {Identity} from "@/processing/identity-processor";

/**
 * finds duplicates in the given array by using deepEqual
 * @param arr the array to search
 * @returns an array if indexes of the duplicates (excluding the first occurrence)
 */
export function findDuplicates<T>(arr: T[]): number[] {
    const ret: number[] = [];

    for(let i = 0; i < arr.length; i++) {
        for(let j = i + 1; j < arr.length; j++) {
            if(deepEqual(arr[i], arr[j])) {
                ret.push(j);
            }
        }
    }

    return ret;
}

export function isArrUnique<T>(arr: T[]): boolean {
    return findDuplicates(arr).length === 0;
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
