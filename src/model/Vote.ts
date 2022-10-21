import Frame from "./Frame";

export default interface Vote extends Frame{
    targetAddendumHash: BigInt,
    vote: boolean
}
