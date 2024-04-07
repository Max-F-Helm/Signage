import libsodium from "libsodium-wrappers";
import {IllegalArgumentException} from "@/processing/exceptions";

// for this use-case hardcoded values should be fine
const KDF_SALT = new Uint8Array([11, 91, 88, 93, 18, 54, 53, 96, 39, 37, 73, 3, 93, 55, 69, 21]);
const CIPHER_NONCE = new Uint8Array([99, 77, 64, 37, 14, 67, 40, 69, 42, 62, 94, 87, 9, 17, 12, 65, 55, 95, 78, 27, 2, 32, 82, 28]);

export interface Keypair {
    signPublicKey: Uint8Array,
    signPrivateKey: Uint8Array | null,
    cryptPublicKey: Uint8Array,
    cryptPrivateKey: Uint8Array | null
}

export interface KeypairWithPrivate extends Keypair {
    signPrivateKey: Uint8Array,
    cryptPrivateKey: Uint8Array
}

export default class Bill {

    // do not modify
    static ECC_SIGN_PUBLIC_KEY_BYTES: number;
    static ECC_SIGN_PRIVATE_KEY_BYTES: number;
    static ECC_CRYPT_PUBLIC_KEY_BYTES: number;
    static ECC_CRYPT_PRIVATE_KEY_BYTES: number;
    static SIGNATURE_BYTES: number;
    static CRYPT_ASYM_EXTRA_BYTES: number;
    static HASH_BYTES: number;

    static async wait_for_init(): Promise<null> {
        await libsodium.ready;

        Bill.ECC_SIGN_PUBLIC_KEY_BYTES = libsodium.crypto_sign_PUBLICKEYBYTES;
        Bill.ECC_SIGN_PRIVATE_KEY_BYTES = libsodium.crypto_sign_SECRETKEYBYTES;
        Bill.ECC_CRYPT_PUBLIC_KEY_BYTES = libsodium.crypto_box_PUBLICKEYBYTES;
        Bill.ECC_CRYPT_PRIVATE_KEY_BYTES = libsodium.crypto_box_SECRETKEYBYTES;
        Bill.SIGNATURE_BYTES = libsodium.crypto_sign_BYTES;
        Bill.CRYPT_ASYM_EXTRA_BYTES = libsodium.crypto_box_SEALBYTES;
        Bill.HASH_BYTES = 256 / 8;

        return null;
    }

    static async gen_ecc_keypair(): Promise<Keypair> {
        const signKeypair = libsodium.crypto_sign_keypair();
        const cryptKeypair = libsodium.crypto_box_keypair();

        return {
            signPublicKey: signKeypair.publicKey,
            signPrivateKey: signKeypair.privateKey,
            cryptPublicKey: cryptKeypair.publicKey,
            cryptPrivateKey: cryptKeypair.privateKey
        };
    }

    static async sign_data(data: Uint8Array, keypair: Keypair): Promise<Uint8Array> {
        if(keypair.signPrivateKey === null)
            throw new IllegalArgumentException("private_key must not be null");

        return libsodium.crypto_sign_detached(data, keypair.signPrivateKey);
    }

    static async verify_data(data: Uint8Array, signature: Uint8Array, keypair: Keypair): Promise<boolean> {
        return libsodium.crypto_sign_verify_detached(signature, data, keypair.signPublicKey);
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

    static async encryptAsym(data: Uint8Array, receiverKeypair: Keypair): Promise<Uint8Array> {
        return libsodium.crypto_box_seal(data, receiverKeypair.cryptPublicKey);
    }

    static async decryptAsym(data: Uint8Array, receiverKeypair: Keypair): Promise<Uint8Array> {
        if(receiverKeypair.cryptPrivateKey === null)
            throw new IllegalArgumentException("private_key must not be null");

        return libsodium.crypto_box_seal_open(data, receiverKeypair.cryptPublicKey, receiverKeypair.cryptPrivateKey);
    }

    static async random_bytes(length: number): Promise<Uint8Array> {
        return libsodium.randombytes_buf(length);
    }
}
