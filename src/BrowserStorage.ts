import {get as dbGet, set as dbSet, del as dbDel, keys as dbKeys, createStore} from "idb-keyval";
import type {UseStore} from "idb-keyval";
import type {Identity} from "@/processing/identity-processor";
import type Author from "@/processing/model/Author";
import Bill from "@/processing/bill";
import {Buffer} from "buffer";
import IdentityProcessor from "@/processing/identity-processor";
import BufferReader from "@/processing/buffer-reader";
import BufferWriter from "@/processing/buffer-writer";

const DATA_DB_NAME = "Signage::Storage";

export interface EntryMeta {
    encrypted: boolean
}

export default class BrowserStorage {

    static readonly INSTANCE: BrowserStorage = new BrowserStorage();

    private readonly identityStorage: UseStore
    private readonly identityMetaStorage: UseStore
    private readonly authorStorage: UseStore
    private readonly authorMetaStorage: UseStore
    private readonly proposalStorage: UseStore
    private readonly proposalMetaStorage: UseStore

    private constructor() {
        this.identityStorage = createStore(`${DATA_DB_NAME}::IDENTITY::DATA`, "storage");
        this.identityMetaStorage = createStore(`${DATA_DB_NAME}::IDENTITY::META`, "storage");
        this.authorStorage = createStore(`${DATA_DB_NAME}::AUTHOR::DATA`, "storage");
        this.authorMetaStorage = createStore(`${DATA_DB_NAME}::AUTHOR::META`, "storage");
        this.proposalStorage = createStore(`${DATA_DB_NAME}::PROPOSAL::DATA`, "storage");
        this.proposalMetaStorage = createStore(`${DATA_DB_NAME}::PROPOSAL::META`, "storage");
    }

    //region identities
    async availableIdentities(): Promise<Record<string, EntryMeta>> {
        const ret: Record<string, EntryMeta> = {};
        const keys = await dbKeys<string>(this.identityStorage);
        for(const key of keys) {
            ret[key] = (await dbGet<EntryMeta>(key, this.identityMetaStorage))!;
        }
        return ret;
    }

    async loadIdentity(name: string, cipherKey: Uint8Array | null): Promise<Identity> {
        let data = await dbGet<Uint8Array>(name, this.identityStorage);
        if(data === undefined)
            throw new Error(`entry not found (db: data::identity, key: ${name})`);

        if(cipherKey !== null) {
            data = await Bill.decrypt(data, cipherKey);
        }

        return await IdentityProcessor.loadIdentity(new BufferReader(Buffer.from(data)));
    }

    async saveIdentity(identity: Identity, cipherKey: Uint8Array | null) {
        const writer = new BufferWriter();
        await IdentityProcessor.saveIdentity(writer, identity);
        let data = writer.take().valueOf();

        if(cipherKey !== null) {
            data = await Bill.encrypt(data, cipherKey);
        }

        const meta: EntryMeta = {
            encrypted: cipherKey !== null
        };

        const key = `${identity.name} (${identity.mail})`;
        await dbSet(key, data, this.identityStorage);
        await dbSet(key, meta, this.identityMetaStorage);
    }

    async removeIdentity(name: string) {
        await dbDel(name, this.identityStorage);
        await dbDel(name, this.identityMetaStorage);
    }
    //endregion

    //region authors
    async availableAuthors(): Promise<Record<string, EntryMeta>> {
        const ret: Record<string, EntryMeta> = {};
        const keys = await dbKeys<string>(this.authorStorage);
        for(const key of keys) {
            ret[key] = (await dbGet<EntryMeta>(key, this.authorMetaStorage))!;
        }
        return ret;
    }

    async loadAuthor(name: string, cipherKey: Uint8Array | null): Promise<Author> {
        let data = await dbGet<Uint8Array>(name, this.authorStorage);
        if(data === undefined)
            throw new Error(`entry not found (db: data::author, key: ${name})`);

        if(cipherKey !== null) {
            data = await Bill.decrypt(data, cipherKey);
        }

        return await IdentityProcessor.loadAuthor(new BufferReader(Buffer.from(data)));
    }

    async saveAuthor(author: Author, cipherKey: Uint8Array | null) {
        const writer = new BufferWriter();
        await IdentityProcessor.saveAuthor(writer, author);
        let data = writer.take().valueOf();

        if(cipherKey !== null) {
            data = await Bill.encrypt(data, cipherKey);
        }

        const meta: EntryMeta = {
            encrypted: cipherKey !== null
        };

        const key = `${author.name} (${author.mail})`;
        await dbSet(key, data, this.authorStorage);
        await dbSet(key, meta, this.authorMetaStorage);
    }

    async removeAuthor(name: string) {
        await dbDel(name, this.authorStorage);
        await dbDel(name, this.authorMetaStorage);
    }
    //endregion

    //region proposals
    async availableProposals(): Promise<Record<string, EntryMeta>> {
        const ret: Record<string, EntryMeta> = {};
        const keys = await dbKeys<string>(this.proposalStorage);
        for(const key of keys) {
            ret[key] = (await dbGet<EntryMeta>(key, this.proposalMetaStorage))!;
        }
        return ret;
    }

    async loadProposal(name: string, cipherKey: Uint8Array | null): Promise<Uint8Array> {
        let data = await dbGet<Uint8Array>(name, this.proposalStorage);
        if(data === undefined)
            throw new Error(`entry not found (db: data::proposal, key: ${name})`);

        if(cipherKey !== null) {
            data = await Bill.decrypt(data, cipherKey);
        }

        return data;
    }

    async saveProposal(name: string, data: Uint8Array, cipherKey: Uint8Array | null) {
        if(cipherKey !== null) {
            data = await Bill.encrypt(data, cipherKey);
        }

        const meta: EntryMeta = {
            encrypted: cipherKey !== null
        };

        await dbSet(name, data, this.proposalStorage);
        await dbSet(name, meta, this.proposalMetaStorage);
    }

    async removeProposal(name: string) {
        await dbDel(name, this.proposalStorage);
        await dbDel(name, this.proposalMetaStorage);
    }
    //endregion
}
