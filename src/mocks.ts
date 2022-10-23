import type {Identity} from "@/processing/identity-processor";
import type Author from "@/processing/model/Author";
import IdentityProcessor from "@/processing/identity-processor";
import {Buffer} from "buffer";
import BufferReader from "@/processing/buffer-reader";

export interface Mocks {
    identity: Identity,
    author: Author
}

export const mocks = new Promise<Mocks>(async (resolve) => {
    const identity = await IdentityProcessor.loadIdentity(new BufferReader(Buffer.from("61006200f74206e3ea991e09bf9da9e6c877ef70331af0c0fa6734255d3a691ed608e5cb8bc02ead45017318431b26e82bc0d37dbc8eb28a4ab12bfbfa566233db210957f74206e3ea991e09bf9da9e6c877ef70331af0c0fa6734255d3a691ed608e5cb", "hex")));
    const author = await IdentityProcessor.toAuthor(identity);

    resolve({
       identity,
       author
    });
});
