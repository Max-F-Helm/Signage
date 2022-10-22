import Author from "./Author";

export default interface Frame{
    prevFrameHash: Uint8Array,
    timestamp: number,
    author: Author,
}
