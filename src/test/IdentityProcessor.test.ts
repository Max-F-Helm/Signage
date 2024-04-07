import {describe, shouldThrow} from "@/test/framework";
import should from "should";
import IdentityProcessor from "@/processing/identity-processor";
import BufferWriter from "@/processing/buffer-writer";
import BufferReader from "@/processing/buffer-reader";
import Bill from "@/processing/bill";
import deepEqual from "@/deep-equals";

const name = "myIden";
const mail = "test@example.com";

export default [
    describe("IdentityProcessor::createIdentity", async () => {
        const identity = await IdentityProcessor.createIdentity(name, mail, null);

        should(identity.name).equal(name, "name");
        should(identity.mail).equal(mail, "mail");
        should(identity.keypair.signPrivateKey).not.be.null();
        should(identity.keypair.cryptPrivateKey).not.be.null();
    }),
    describe("IdentityProcessor::save_and_load", async () => {
        const identity = await IdentityProcessor.createIdentity(name, mail, null);

        const buffer = new BufferWriter();
        await IdentityProcessor.saveIdentity(buffer, identity);

        const loaded = await IdentityProcessor.loadIdentity(new BufferReader(buffer.take()));
        should(deepEqual(loaded, identity)).true("loaded not equal to saved");
    }),
    describe("IdentityProcessor::equals", async () => {
        const kp = await Bill.gen_ecc_keypair();
        const identity1 = await IdentityProcessor.createIdentity(name, mail, kp);
        const identity2 = await IdentityProcessor.createIdentity(name, mail, kp);

        should(IdentityProcessor.equals(identity1, identity2)).be.true("should be equal");
    }),
    describe("IdentityProcessor::equals_not", async () => {
        const kp = await Bill.gen_ecc_keypair();
        const identity1 = await IdentityProcessor.createIdentity(name, mail, kp);
        const identity2 = await IdentityProcessor.createIdentity(name + "_", mail, kp);

        should(IdentityProcessor.equals(identity1, identity2)).be.false("should not be equal");
    }),
    describe("IdentityProcessor::toAuthor", async () => {
        const identity = await IdentityProcessor.createIdentity(name, mail, null);
        const author = await IdentityProcessor.toAuthor(identity);

        should(IdentityProcessor.equals(identity, author)).be.true("identity and author should be same");
        should(author.signCount).be.equal(0, "signCount should be 0");
    }),
    describe("IdentityProcessor::save_load_author", async () => {
        const identity = await IdentityProcessor.createIdentity(name, mail, null);
        const author = await IdentityProcessor.toAuthor(identity);

        const buffer = new BufferWriter();
        await IdentityProcessor.saveAuthor(buffer, author);
        const loaded = await IdentityProcessor.loadAuthor(new BufferReader(buffer.take()));

        loaded.keypair.signPrivateKey = identity.keypair.signPrivateKey;
        loaded.keypair.cryptPrivateKey = identity.keypair.cryptPrivateKey;
        should(deepEqual(loaded, author)).true("loaded not equal to saved");
    }),
    describe("IdentityProcessor::save_load_author_fail", async () => {
        const identity = await IdentityProcessor.createIdentity(name, mail, null);
        const author = await IdentityProcessor.toAuthor(identity);

        const buffer = new BufferWriter();
        await IdentityProcessor.saveAuthor(buffer, author);

        // corrupt data
        const oldPos = buffer.position();
        buffer.setPositionAbs(2);
        buffer.writeInt8(2);
        buffer.setPositionAbs(oldPos);

        await shouldThrow("should have thrown an exception", async () => {
            await IdentityProcessor.loadAuthor(new BufferReader(buffer.take()));
        });
    })
];
