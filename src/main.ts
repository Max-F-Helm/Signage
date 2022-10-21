import {decrypt, digest_pwd, encrypt, gen_ecc_keypair, hash, Keypair, sign_data, verify_data} from "./bill";
// @ts-ignore
import libsodium from "libsodium-wrappers";

let ecc_keypair: Keypair;

export function main(){
    document.getElementById("btn_genKeypair")!.onclick = genKeypair;
    document.getElementById("btn_run")!.onclick = run;

    console.info("ready");
}

function genKeypair() {
    const runner = async () => {
        ecc_keypair = await gen_ecc_keypair();
        return [
            libsodium.to_base64(ecc_keypair.publicKey),
            libsodium.to_base64(ecc_keypair.privateKey)
        ]
    };
    runner().then((strings: string[]) => {
        document.getElementById("keypair")!.innerText = `
            ==== PUBLIC KEY ====
            ${strings[0]}
            ====            ====
            
            ==== PRIVATE KEY ====
            ${strings[1]}
            ====             ====
        `;
    })
    .catch((e) => {
        console.error(e);
        document.getElementById("msg")!.innerText = "gen_ecc_keypair failed";
    });
}

function run() {
    const text = (document.getElementById("data")! as HTMLInputElement).value;
    const pwd = (document.getElementById("password")! as HTMLInputElement).value;

    const runner = async () => {
        const signature = await sign_text(text);

        const enc = await enc_text(text, pwd);
        const dec = await dec_text(enc, pwd);

        return await verify_text(dec, signature);
    }

    runner().then(result => {
        document.getElementById("msg")!.innerText = `success: ${result}`;
    }).catch(err => {
        console.error(err);
        document.getElementById("msg")!.innerText = `failure: ${err}`;
    });
}

async function sign_text(text: string): Promise<Uint8Array> {
    await libsodium.ready;

    const bytes = libsodium.from_string(text);
    const hashed = await hash(bytes);

    return sign_data(hashed, ecc_keypair);
}

async function verify_text(text: string, signature: Uint8Array): Promise<boolean> {
    await libsodium.ready;

    const bytes = libsodium.from_string(text);
    const hashed = await hash(bytes);

    return verify_data(hashed, signature, ecc_keypair);
}

async function enc_text(text: string, pwd: string): Promise<Uint8Array> {
    await libsodium.ready;

    const bytes = libsodium.from_string(text);
    const key = await digest_pwd(pwd);

    return await encrypt(bytes, key);
}

async function dec_text(data: Uint8Array, pwd: string): Promise<string> {
    await libsodium.ready;

    const key = await digest_pwd(pwd);
    const decrypted = await decrypt(data, key);
    return libsodium.to_string(decrypted);
}

/*
// https://stackoverflow.com/a/66046176/8288367
async function bufferToBase64(data: Uint8Array): Promise<string> {
    const base64url: string = await new Promise((r) => {
        const reader = new FileReader();
        // @ts-ignore
        reader.onload = () => r(reader.result);
        reader.readAsDataURL(new Blob([data]));
    });
    return base64url.split(",", 2)[1]
}
*/

main();
