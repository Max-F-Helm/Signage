import type BufferReader from "@/processing/buffer-reader";
import type BufferWriter from "@/processing/buffer-writer";
import type {Keypair} from "@/processing/bill";
import Bill from "@/processing/bill";
import deepEqual from "fast-deep-equal";
import type Author from "@/processing/model/Author";
import {Buffer} from "buffer";

const INVALID_SIGNATURE = Buffer.alloc(Bill.ECC_SIGNATURE_BYTES, 0xFF);
const INVALID_PRIVATE_KEY = Buffer.alloc(Bill.ECC_PRIVATE_KEY_BYTES, 0xFF);

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
        const name = data.readStringUtf8();
        const mail = data.readStringUtf8();
        const publicKey = data.readUint8Array(Bill.ECC_PUBLIC_KEY_BYTES);
        let privateKey: Uint8Array | null = data.readUint8Array(Bill.ECC_PRIVATE_KEY_BYTES);

        if(deepEqual(privateKey, INVALID_PRIVATE_KEY))
            privateKey = null;

        return {
            name: name,
            mail: mail,
            keypair: {
                publicKey: publicKey,
                privateKey: privateKey
            }
        };
    }

    static async saveIdentity(data: BufferWriter, identity: Identity) {
        data.writeStringUtf8(identity.name);
        data.writeStringUtf8(identity.mail);
        data.writeUint8Array(identity.keypair.publicKey);

        if(identity.keypair.privateKey !== null)
            data.writeUint8Array(identity.keypair.privateKey);
        else
            data.writeUint8Array(INVALID_PRIVATE_KEY);
    }

    static equals(a: Identity, b: Identity) {
        return a.name === b.name
            && a.mail === b.mail
            && deepEqual(a.keypair.publicKey, b.keypair.publicKey);
    }

    static toAuthor(identity: Identity): Author {
        return {
            name: identity.name,
            mail: identity.mail,
            keypair: identity.keypair,
            signCount: 0,
            signature: INVALID_SIGNATURE
        };
    }
}
