import {FileProcessor} from "@/processing/file-processor";
import type {ErrorCallback} from "@/processing/file-processor";
import type {Identity} from "@/processing/identity-processor";
import {IllegalStateException} from "@/processing/exceptions";
import type Author from "@/processing/model/Author";
import type BufferReader from "@/processing/buffer-reader";
import type {Buffer} from "buffer";

export type Listener = () => void;

export class FileProcessorWrapper {

    private fileProcessor: FileProcessor | null = null;
    private identity: Identity | null = null;
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

    init(encrypted: boolean) {
        if(this.identity === null)
            throw new IllegalStateException("no identity was set");

        this.fileProcessor = new FileProcessor(this.identity, encrypted, (msg) => this.onErr(msg));
        this.onUpdated();
    }

    createFile(authors: Author[]) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        (async () => {
            await this.fileProcessor!.createFile(authors);
        })().then(() => this.onUpdated());
    }

    loadFile(data: BufferReader, key: Uint8Array | null) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        (async () => {
            await this.fileProcessor!.loadFile(data, key);
        })().then(() => this.onUpdated());
    }

    saveFile(key: Uint8Array | null): Promise<Buffer> {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor!.saveFile(key);
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

export const fileProcessorWrapper = new FileProcessorWrapper();
