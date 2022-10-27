import {FileProcessor} from "@/processing/file-processor";
import type {Proposal} from "@/processing/file-processor";
import type {ErrorCallback} from "@/processing/file-processor";
import type {Identity} from "@/processing/identity-processor";
import {IllegalStateException} from "@/processing/exceptions";
import type Author from "@/processing/model/Author";
import type BufferReader from "@/processing/buffer-reader";
import type {Buffer} from "buffer";

export type Listener = () => void;

export default class FileProcessorWrapper {

    static readonly INSTANCE = new FileProcessorWrapper();

    private fileProcessor: FileProcessor | null = null;
    private identity: Identity | null = null;
    private key: Uint8Array | null = null;
    private readonly listeners: Listener[] = [];
    private readonly errListeners: ErrorCallback[] = [];

    addListener(listener: Listener) {
        this.listeners.push(listener);
    }

    removeListener(listener: Listener) {
        const idx = this.listeners.indexOf(listener);
        if(idx !== -1)
            this.listeners.slice(idx, 1);
    }

    addErrListener(listener: ErrorCallback) {
        this.errListeners.push(listener);
    }

    removeErrListener(listener: ErrorCallback) {
        const idx = this.errListeners.indexOf(listener);
        if(idx !== -1)
            this.errListeners.slice(idx, 1);
    }

    setIdentity(identity: Identity) {
        this.identity = identity;
    }

    getIdentity(): Identity | null {
        return this.identity;
    }

    setKey(key: Uint8Array | null) {
        this.key = key;
    }

    getKey(): Uint8Array | null {
        return this.key;
    }

    init() {
        if(this.identity === null)
            throw new IllegalStateException("no identity was set");

        this.fileProcessor = new FileProcessor(this.identity, (msg) => this.onErr(msg));
        this.onUpdated();
    }

    isFileLoaded(): boolean {
        return this.fileProcessor !== null && this.fileProcessor.isLoaded();
    }

    getProposal(): Proposal {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor.getProposal();
    }

    createFile(authors: Author[]) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        (async () => {
            await this.fileProcessor!.createFile(authors);
        })().then(() => this.onUpdated());
    }

    loadFile(data: BufferReader) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        (async () => {
            await this.fileProcessor!.loadFile(data);
        })().then(() => this.onUpdated());
    }

    saveFile(): Promise<Buffer> {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor!.saveFile();
    }

    addAddendum(title: string, mime: string, content: Buffer) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        (async () => {
            await this.fileProcessor!.addAddendum(title, mime, content);
        })().then(() => this.onUpdated());
    }

    addVote(vote: boolean) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        (async () => {
            await this.fileProcessor!.addVote(vote);
        })().then(() => this.onUpdated());
    }

    importPatchSet(data: BufferReader) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        (async () => {
            await this.fileProcessor!.importPatchSet(data);
        })().then(() => this.onUpdated());
    }

    exportChanges(): Promise<Buffer> {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor.exportChanges();
    }

    exportFrames(count: number): Promise<Buffer> {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor.exportFrames(count);
    }

    private onErr(msg: string) {
        this.errListeners.forEach(l => l(msg));
    }

    private onUpdated() {
        this.listeners.forEach(l => l());
    }
}
