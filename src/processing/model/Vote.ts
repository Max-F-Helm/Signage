import type Frame from "./Frame";

export default interface Vote extends Frame{
    targetAddendumHash: Uint8Array,
    vote: boolean,
    signature: Uint8Array
}
