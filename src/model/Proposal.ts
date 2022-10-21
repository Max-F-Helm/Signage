import Author from "./Author";
import Frame from "./Frame";

export default interface Proposal{
    version: number,
    genesisVal: BigInt,
    authors: Author[],
    frames: Frame[]
}
