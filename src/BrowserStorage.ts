import {get as dbGet, set as dbSet, del as dbDel, keys as dbKeys, createStore} from "idb-keyval";
import type {UseStore} from "idb-keyval";
import type {Identity} from "@/processing/identity-processor";
import type Author from "@/processing/model/Author";
import Bill from "@/processing/bill";
import {Buffer} from "buffer";
import IdentityProcessor from "@/processing/identity-processor";
import BufferReader from "@/processing/buffer-reader";
import BufferWriter from "@/processing/buffer-writer";
import type FileProcessorWrapper from "@/FileProcessorWrapper";
import {IllegalArgumentException} from "@/processing/exceptions";

const DATA_DB_NAME = "Signage::Storage";

export interface EntryMeta {
    encryptionKey: Uint8Array | null
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

    async loadIdentity(name: string, encryptionKey: Uint8Array): Promise<Identity> {
        let data = await dbGet<Uint8Array>(name, this.identityStorage);
        if(data === undefined)
            throw new Error(`entry not found (db: data::identity, key: ${name})`);

        data = await Bill.decrypt(data, encryptionKey);

        return await IdentityProcessor.loadIdentity(new BufferReader(Buffer.from(data)));
    }

    async saveIdentity(identity: Identity, encryptionKey: Uint8Array, storeEncryptionKey: boolean) {
        const writer = new BufferWriter();
        await IdentityProcessor.saveIdentity(writer, identity);
        let data = writer.take().valueOf();
        data = await Bill.encrypt(data, encryptionKey);

        const meta: EntryMeta = {
            encryptionKey: storeEncryptionKey ? encryptionKey : null
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

    async loadAuthor(name: string): Promise<Author> {
        const data = await dbGet<Uint8Array>(name, this.authorStorage);
        if(data === undefined)
            throw new Error(`entry not found (db: data::author, key: ${name})`);

        return await IdentityProcessor.loadAuthor(new BufferReader(Buffer.from(data)));
    }

    async saveAuthor(author: Author) {
        const writer = new BufferWriter();
        await IdentityProcessor.saveAuthor(writer, author);
        const data = writer.take().valueOf();

        const meta: EntryMeta = {
            encryptionKey: null
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
    async availableProposals(): Promise<string[]> {
        return await dbKeys<string>(this.proposalStorage);
    }

    async loadProposal(name: string, dest: FileProcessorWrapper) {
        const data = await dbGet<Uint8Array>(name, this.proposalStorage);
        if(data === undefined)
            throw new Error(`entry not found (db: data::proposal, key: ${name})`);

        await dest.loadFile(new BufferReader(Buffer.from(data)));
        dest.storageName.value = name;
    }

    async saveProposal(src: FileProcessorWrapper) {
        if(!src.isFileLoaded())
            throw new IllegalArgumentException("no file is loaded");

        const name = src.storageName.value;
        if(name === null)
            throw new IllegalArgumentException("no name is set");

        const data: Uint8Array = await src.saveFile();

        const meta: EntryMeta = {
            encryptionKey: null
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
