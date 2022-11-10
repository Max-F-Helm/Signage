// @ts-ignore
import dateFormat from "dateformat";
import {Buffer} from "buffer";

export function findParent(element: HTMLElement, withClass: string): HTMLElement | null {
    let parent = element.parentElement;
    while (parent != null) {
        if (parent.classList.contains(withClass))
            return parent;
        parent = parent.parentElement;
    }

    return null;
}

export function fold<I, O>(arr: I[], initialValue: O, cb: (result: O, item: I) => O): O {
    let result = initialValue;
    arr.forEach(item => {
        result = cb(result, item);
    });
    return result;
}

export function download(data: Uint8Array, filename: string) {
    const blob = new Blob([data], {type: 'application/octet-stream'});
    const url = URL.createObjectURL(blob);

    let anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
}

export function formatDateTime(time: number): string {
    const date = new Date(time);
    return dateFormat(date, "hh:MM dd/mm/yyyy");
}

export async function loadFile(file: File): Promise<Buffer> {
    const reader = new FileReader();
    const filePromise = new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = (e) => {
            resolve(e.target!.result as ArrayBuffer);
        }
        reader.onerror = (e) => {
            reject(e.target!.error);
        }
    });
    reader.readAsArrayBuffer(file);
    return Buffer.from(await filePromise);
}
