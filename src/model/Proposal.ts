import Author from "./Author";
import Frame from "./Frame";

export default interface Proposal{
    version: number,
    genesisVal: Uint8Array,
    authors: Author[],
    frames: Frame[]
}
