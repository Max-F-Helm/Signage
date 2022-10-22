import Frame from "./Frame";

export default interface Vote extends Frame{
    targetAddendumHash: Uint8Array,
    vote: boolean
}
