import {describe, shouldThrow} from "@/test/framework";
import should from "should";
import IdentityProcessor from "@/processing/identity-processor";
import {FileProcessor} from "@/processing/file-processor";
import type Author from "@/processing/model/Author";
import {Buffer} from "buffer";
import BufferReader from "@/processing/buffer-reader";
import deepEqual from "@/deep-equals";
import Bill from "@/processing/bill";

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
    }),
    describe("FileProcessor::full_test_nocrypt_fail", async () => {
        let errReported = false;
        const errorCallback = (msg: string) => {
            errReported = true;
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
        const saved = await processor.saveFile(null);

        // corrupt data
        saved[102]++;

        let ranThrough = false;
        try {
            await processor.loadFile(new BufferReader(saved), null);
            ranThrough = true;
        } catch (e) {}

        should(errReported || !ranThrough).true("corruption not detected");
    }),
    describe("FileProcessor::full_test_crypt", async () => {
        const key = await Bill.digest_pwd("loiujk");

        const errorCallback = (msg: string) => {
            should(false).true("error was reported: " + msg);
        };

        const authors = await generateAuthors();
        authors.forEach(a => a.keypair.privateKey = null);// remove private key because they would normally not be loaded

        const identity = await IdentityProcessor.createIdentity("a", "b", null);
        const processor = new FileProcessor(identity, true, errorCallback);
        authors.push(await IdentityProcessor.toAuthor(identity));

        const addendumContent = Buffer.alloc(8, 5);
        const addendumTitle = "_title_";
        const addendumMime = "application/pdf";

        await processor.createFile(authors);

        await processor.addAddendum(addendumTitle, addendumMime, addendumContent);
        const proposalA = processor.getProposal();
        const saved = await processor.saveFile(key);

        await processor.loadFile(new BufferReader(saved), key);
        const proposalB = processor.getProposal();

        should(deepEqual(proposalA, proposalB)).true("loaded not equal saved");

        await shouldThrow("decryption should have failed (wrong key)", async () => {
            const wrongKey = await Bill.digest_pwd("loiujk__");
            await processor.loadFile(new BufferReader(saved), wrongKey);
        });

        await shouldThrow("decryption should have failed (no key)", async () => {
            const processor2 = new FileProcessor(identity, false, errorCallback);
            await processor2.loadFile(new BufferReader(saved), null);
        });
    }),

    describe("FileProcessor::no_double_votes", async () => {
        const errorCallback = (msg: string) => {
            should(false).true("error was reported: " + msg);
        };

        const identity = await IdentityProcessor.createIdentity("a", "b", null);
        const authors = [await IdentityProcessor.toAuthor(identity)];

        const processor = new FileProcessor(identity, false, errorCallback);
        authors.push(authors[0]);

        const addendumContent = Buffer.alloc(8, 5);
        const addendumTitle = "_title_";
        const addendumMime = "application/pdf";

        await processor.createFile(authors);

        await processor.addAddendum(addendumTitle, addendumMime, addendumContent);

        await shouldThrow("double-vote should be forbidden", async () => {
            await processor.addVote(true);
        });
    }),

    describe("FileProcessor::patch", async () => {
        //region init
        const errorCallback = (msg: string) => {
            should(false).true("error was reported: " + msg);
        };

        const identity = await IdentityProcessor.createIdentity("a", "b", null);
        const authors = [await IdentityProcessor.toAuthor(identity)];

        const processor = new FileProcessor(identity, false, errorCallback);

        await processor.createFile(authors);
        //endregion

        //region add content 1
        const addendumContent = Buffer.alloc(8, 5);
        const addendumTitle = "_title_";
        const addendumMime = "application/pdf";

        await processor.addAddendum(addendumTitle, addendumMime, addendumContent);
        //endregion

        //region save 1
        const save1 = await processor.saveFile(null);
        processor.clearChanges();
        //endregion

        //region add content 2
        await processor.addAddendum(addendumTitle + "-2", addendumMime, addendumContent);
        //endregion

        //region save patch and save 2
        const save2 = await processor.saveFile(null);
        const patch = await processor.exportChanges();
        //endregion

        //region load and compare
        await processor.loadFile(new BufferReader(save1), null);
        await processor.importPatchSet(new BufferReader(patch));
        const actual = processor.getProposal();

        await processor.loadFile(new BufferReader(save2), null);
        const expected = processor.getProposal();

        should(deepEqual(actual, expected)).true("contents did not match");
        //endregion
    })
];

async function generateAuthors() {
    const authors = [] as Author[];
    for(let i = 0; i < 4; i++)
        authors.push(await IdentityProcessor.toAuthor(await IdentityProcessor.createIdentity("n" + i, "m" + i, null)));
    return authors;
}
