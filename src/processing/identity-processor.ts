import type BufferReader from "@/processing/buffer-reader";
import BufferWriter from "@/processing/buffer-writer";
import type {Keypair, KeypairWithPrivate} from "@/processing/bill";
import Bill from "@/processing/bill";
import deepEqual from "@/deep-equals";
import type Author from "@/processing/model/Author";
import {hashFrame, signFrame} from "@/processing/utils";
import {FileContentsException, IllegalArgumentException} from "@/processing/exceptions";

export interface Identity {
    name: string,
    mail: string,
    keypair: Keypair
}

export interface IdentityWithPrivate extends Identity {
    keypair: KeypairWithPrivate
}

export function identityHasPrivateKeys(identity: Identity, msg: string): asserts identity is IdentityWithPrivate {
    if(identity.keypair.signPrivateKey == null || identity.keypair.cryptPrivateKey == null)
        throw new IllegalArgumentException(msg);
}

export default class IdentityProcessor {

    //region Identity
    static async createIdentity(name: string, mail: string, keypair: Keypair | null): Promise<Identity> {
        if(keypair === null)
            keypair = await Bill.gen_ecc_keypair();
        else if(keypair.signPrivateKey == null || keypair.cryptPrivateKey == null)
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
        const signPublicKey = data.readUint8Array(Bill.ECC_SIGN_PUBLIC_KEY_BYTES);
        const signPrivateKey: Uint8Array = data.readUint8Array(Bill.ECC_SIGN_PRIVATE_KEY_BYTES);
        const cryptPublicKey = data.readUint8Array(Bill.ECC_CRYPT_PUBLIC_KEY_BYTES);
        const cryptPrivateKey: Uint8Array = data.readUint8Array(Bill.ECC_CRYPT_PRIVATE_KEY_BYTES);

        return {
            name: name,
            mail: mail,
            keypair: {
                signPrivateKey: signPrivateKey,
                signPublicKey: signPublicKey,
                cryptPublicKey: cryptPublicKey,
                cryptPrivateKey: cryptPrivateKey
            }
        };
    }

    static async saveIdentity(data: BufferWriter, identity: Identity) {
        identityHasPrivateKeys(identity, "Identity must have a private key");

        data.writeStringUtf8(identity.name);
        data.writeStringUtf8(identity.mail);
        data.writeUint8Array(identity.keypair.signPublicKey);
        data.writeUint8Array(identity.keypair.signPrivateKey);
        data.writeUint8Array(identity.keypair.cryptPublicKey);
        data.writeUint8Array(identity.keypair.cryptPrivateKey);
    }
    //endregion

    //region Author
    static async loadAuthor(data: BufferReader): Promise<Author> {
        const oldPos = data.position();
        const name = data.readStringUtf8();
        const mail = data.readStringUtf8();
        const signPublicKey = data.readUint8Array(Bill.ECC_SIGN_PUBLIC_KEY_BYTES);
        const cryptPublicKey = data.readUint8Array(Bill.ECC_CRYPT_PUBLIC_KEY_BYTES);
        const signCount = data.readUInt32BE();

        const hash = await hashFrame(data, oldPos);

        const signature = data.readUint8Array(Bill.SIGNATURE_BYTES);

        const kp: Keypair = {
            signPublicKey: signPublicKey,
            signPrivateKey: null,
            cryptPublicKey: cryptPublicKey,
            cryptPrivateKey: null
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
        data.writeUint8Array(author.keypair.signPublicKey);
        data.writeUint8Array(author.keypair.cryptPublicKey);
        data.writeUInt32BE(author.signCount);
        data.writeUint8Array(author.signature);
    }

    static async signAndSaveAuthor(data: BufferWriter, author: Author) {
        if(author.keypair.signPrivateKey == null || author.keypair.cryptPrivateKey == null)
            throw new IllegalArgumentException("identity has no private key");

        const oldPos = data.position();

        data.writeStringUtf8(author.name);
        data.writeStringUtf8(author.mail);
        data.writeUint8Array(author.keypair.signPublicKey);
        data.writeUint8Array(author.keypair.cryptPublicKey);
        data.writeUInt32BE(author.signCount);

        author.signature = await signFrame(author, data, oldPos);

        data.writeUint8Array(author.signature);
    }

    static equals(a: Identity, b: Identity) {
        return a.name === b.name
            && a.mail === b.mail
            && deepEqual(a.keypair.signPublicKey, b.keypair.signPublicKey)
            && deepEqual(a.keypair.cryptPublicKey, b.keypair.cryptPublicKey);
    }

    static async toAuthor(identity: Identity): Promise<Author> {
        const hashBuffer = new BufferWriter();
        hashBuffer.writeStringUtf8(identity.name);
        hashBuffer.writeStringUtf8(identity.mail);
        hashBuffer.writeUint8Array(identity.keypair.signPublicKey);
        hashBuffer.writeUint8Array(identity.keypair.cryptPublicKey);
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
    //endregion
}
