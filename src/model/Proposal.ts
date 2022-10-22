import type Author from "./Author";
import type Frame from "./Frame";

export default interface Proposal{
    version: number,
    genesisVal: Uint8Array,
    authors: Author[],
    frames: Frame[]
}
