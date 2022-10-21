// @ts-ignore
import libsodium from "libsodium-wrappers";

// for this use-case hardcoded values should be fine
const KDF_SALT = new Uint8Array([11, 91, 88, 93, 18, 54, 53, 96, 39, 37, 73, 3, 93, 55, 69, 21]);
const CIPHER_NONCE = new Uint8Array([99, 77, 64, 37, 14, 67, 40, 69, 42, 62, 94, 87, 9, 17, 12, 65, 55, 95, 78, 27, 2, 32, 82, 28]);

export interface Keypair {
    publicKey: Uint8Array,
    privateKey: Uint8Array | null
}

export default class Bill {

    static async wait_for_init(): Promise<null> {
        await libsodium.ready;
        return null;
    }

    static async gen_ecc_keypair(): Promise<Keypair> {
        const keypair = libsodium.crypto_sign_keypair();
        return {
            publicKey: keypair.publicKey,
            privateKey: keypair.privateKey
        };
    }

    static async sign_data(data: Uint8Array, keypair: Keypair): Promise<Uint8Array> {
        return libsodium.crypto_sign_detached(data, keypair.privateKey);
    }

    static async verify_data(data: Uint8Array, signature: Uint8Array, keypair: Keypair): Promise<boolean> {
        return libsodium.crypto_sign_verify_detached(signature, data, keypair.publicKey);
    }

    static async hash(data: Uint8Array): Promise<Uint8Array> {
        return libsodium.crypto_generichash(32, data);
    }

    static async digest_pwd(pwd: string): Promise<Uint8Array> {
        const keyLength = libsodium.crypto_secretbox_KEYBYTES;
        const iterations = libsodium.crypto_pwhash_OPSLIMIT_MODERATE;
        const memLimit = libsodium.crypto_pwhash_MEMLIMIT_MIN;
        const pwdData = libsodium.from_string(pwd);
        return libsodium.crypto_pwhash(keyLength, pwdData, KDF_SALT, iterations, memLimit, libsodium.crypto_pwhash_ALG_ARGON2ID13);
    }

    static async encrypt(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
        return libsodium.crypto_secretbox_easy(data, CIPHER_NONCE, key);
    }

    static async decrypt(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
        return libsodium.crypto_secretbox_open_easy(data, CIPHER_NONCE, key);
    }
}
