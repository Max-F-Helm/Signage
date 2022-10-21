import {Keypair} from "../bill";

export default interface Author {
    name: string,
    mail: string,
    publicKey: Keypair,
    signCount: number
}
