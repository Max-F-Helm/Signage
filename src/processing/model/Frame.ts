import type Author from "./Author";

export enum FrameType {
    Addendum,
    Vote
}

export default interface Frame {
    frameType: FrameType,
    prevFrameHash: Uint8Array,
    timestamp: number,
    author: Author
}
