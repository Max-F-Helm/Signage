import {Keypair} from "../bill";

export default interface Author {
    name: string,
    mail: string,
    keypair: Keypair,
    signCount: number,
    signature: Uint8Array
}
