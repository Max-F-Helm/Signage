import type Author from "./Author";

export enum FrameType {
    Invalid,
    Addendum,
    Vote
}

export default interface Frame {
    frameType: FrameType,
    prevFrameHash: Uint8Array,
    timestamp: number,
    author: Author,
    hash: Uint8Array
}
