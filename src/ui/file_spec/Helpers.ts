import type {Buffer} from "buffer";

export interface NewAddendumData {
    title: string,
    mime: string,
    content: Buffer
}
