import {describe} from "@/test/framework";
import should from "should";
import IdentityProcessor from "@/processing/identity-processor";
import {FileProcessor} from "@/processing/file-processor";
import type Author from "@/processing/model/Author";
import {Buffer} from "buffer";
import BufferReader from "@/processing/buffer-reader";
import deepEqual from "@/deep-equals";

export default [
    describe("FileProcessor::full_test_nocrypt", async () => {
        const errorCallback = (msg: string) => {
            should(false).true("error was reported: " + msg);
        };

        const authors = await generateAuthors();
        authors.forEach(a => a.keypair.privateKey = null);// remove private key because they would normally not be loaded

        const identity = await IdentityProcessor.createIdentity("a", "b", null);
        const processor = new FileProcessor(identity, false, errorCallback);
        authors.push(await IdentityProcessor.toAuthor(identity));

        const addendumContent = Buffer.alloc(8, 5);
        const addendumTitle = "_title_";
        const addendumMime = "application/pdf";

        await processor.createFile(authors);

        await processor.addAddendum(addendumTitle, addendumMime, addendumContent);
        const proposalA = processor.getProposal();
        const saved = await processor.saveFile(null);

        await processor.loadFile(new BufferReader(saved), null);
        const proposalB = processor.getProposal();

        should(deepEqual(proposalA, proposalB)).true("loaded not equal saved");
    })
];

async function generateAuthors() {
    const authors = [] as Author[];
    for(let i = 0; i < 4; i++)
        authors.push(await IdentityProcessor.toAuthor(await IdentityProcessor.createIdentity("n" + i, "m" + i, null)));
    return authors;
}
