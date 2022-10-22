import type BufferReader from "@/processing/buffer-reader";
import type BufferWriter from "@/processing/buffer-writer";
import type {Keypair} from "@/processing/bill";
import Bill from "@/processing/bill";
import deepEqual from "fast-deep-equal";
import {IllegalArgumentException} from "@/processing/exceptions";

export interface Identity {
    name: string,
    mail: string,
    keypair: Keypair
}

export default class IdentityProcessor {

    static async createIdentity(name: string, mail: string, keypair: Keypair | null): Promise<Identity> {
        if(keypair === null)
            keypair = await Bill.gen_ecc_keypair();

        return {
            name: name,
            mail: mail,
            keypair: keypair
        };
    }

    static async loadIdentity(data: BufferReader): Promise<Identity> {
        return {
            name: data.readStringUtf8(),
            mail: data.readStringUtf8(),
            keypair: {
                publicKey: data.readUint8Array(Bill.ECC_PUBLIC_KEY_BYTES),
                privateKey: data.readUint8Array(Bill.ECC_PRIVATE_KEY_BYTES)
            }
        };
    }

    static async saveIdentity(data: BufferWriter, identity: Identity) {
        if(identity.keypair.privateKey === null)
            throw new IllegalArgumentException("identity must have private key");

        data.writeStringUtf8(identity.name);
        data.writeStringUtf8(identity.mail);
        data.writeUint8Array(identity.keypair.publicKey);
        data.writeUint8Array(identity.keypair.privateKey);
    }

    static equals(a: Identity, b: Identity) {
        return a.name === b.name
            && a.mail === b.mail
            && deepEqual(a.keypair.publicKey, b.keypair.publicKey);
    }
}
