import type BufferReader from "@/processing/buffer-reader";
import BufferWriter from "@/processing/buffer-writer";
import type {Keypair} from "@/processing/bill";
import Bill from "@/processing/bill";
import deepEqual from "fast-deep-equal";
import type Author from "@/processing/model/Author";
import {hashFrame, signFrame} from "@/processing/utils";
import {FileContentsException, IllegalArgumentException} from "@/processing/exceptions";

export interface Identity {
    name: string,
    mail: string,
    keypair: Keypair
}

export default class IdentityProcessor {

    static async createIdentity(name: string, mail: string, keypair: Keypair | null): Promise<Identity> {
        if(keypair === null)
            keypair = await Bill.gen_ecc_keypair();
        else if(keypair.privateKey === null)
            throw new IllegalArgumentException("keypair must have private key");

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
        let privateKey: Uint8Array = data.readUint8Array(Bill.ECC_PRIVATE_KEY_BYTES);

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
        if(identity.keypair.privateKey === null)
            throw new IllegalArgumentException("identity must have a private key");

        data.writeStringUtf8(identity.name);
        data.writeStringUtf8(identity.mail);
        data.writeUint8Array(identity.keypair.publicKey);
        data.writeUint8Array(identity.keypair.privateKey);
    }

    static async loadAuthor(data: BufferReader): Promise<Author> {
        const oldPos = data.position();
        const name = data.readStringUtf8();
        const mail = data.readStringUtf8();
        const publicKey = data.readUint8Array(Bill.ECC_PUBLIC_KEY_BYTES);
        const signCount = data.readUInt32BE();

        const hash = await hashFrame(data, oldPos);

        const signature = data.readUint8Array(Bill.ECC_SIGNATURE_BYTES);

        const kp: Keypair = {
            publicKey: publicKey,
            privateKey: null
        }
        const signatureValid = await Bill.verify_data(hash, signature, kp);

        if(!signatureValid)
            throw new FileContentsException(`signature for author ${name} is invalid`);

        return {
            name: name,
            mail: mail,
            keypair: kp,
            signCount: signCount,
            signature: signature
        };
    }

    static async saveAuthor(data: BufferWriter, author: Author) {
        data.writeStringUtf8(author.name);
        data.writeStringUtf8(author.mail);
        data.writeUint8Array(author.keypair.publicKey);
        data.writeUInt32BE(author.signCount);
        data.writeUint8Array(author.signature);
    }

    static async signAndSaveAuthor(data: BufferWriter, author: Author) {
        if(author.keypair.privateKey === null)
            throw new IllegalArgumentException("identity has no private key");

        const oldPos = data.position();

        data.writeStringUtf8(author.name);
        data.writeStringUtf8(author.mail);
        data.writeUint8Array(author.keypair.publicKey);
        data.writeUInt32BE(author.signCount);

        author.signature = await signFrame(author, data, oldPos);

        data.writeUint8Array(author.signature);
    }

    static equals(a: Identity, b: Identity) {
        return a.name === b.name
            && a.mail === b.mail
            && deepEqual(a.keypair.publicKey, b.keypair.publicKey);
    }

    static async toAuthor(identity: Identity): Promise<Author> {
        const hashBuffer = new BufferWriter();
        hashBuffer.writeStringUtf8(identity.name);
        hashBuffer.writeStringUtf8(identity.mail);
        hashBuffer.writeUint8Array(identity.keypair.publicKey);
        hashBuffer.writeUInt32BE(0);

        const signature = await signFrame(identity, hashBuffer, 0);

        return {
            name: identity.name,
            mail: identity.mail,
            keypair: identity.keypair,
            signCount: 0,
            signature: signature
        };
    }
}
