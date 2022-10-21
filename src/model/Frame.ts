import Author from "./Author";

export default interface Frame{
    prevFrameHash: BigInt,
    timestamp: BigInt,
    author: Author,
}
