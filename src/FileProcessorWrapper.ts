import type {ErrorCallback, Proposal} from "@/processing/file-processor";
import {FileProcessor} from "@/processing/file-processor";
import type {Identity} from "@/processing/identity-processor";
import {IllegalStateException} from "@/processing/exceptions";
import type Author from "@/processing/model/Author";
import BufferReader from "@/processing/buffer-reader";
import type {Buffer} from "buffer";
import {ref} from "vue";

export type Listener = () => void;

export default class FileProcessorWrapper {

    static readonly INSTANCE = new FileProcessorWrapper();

    private fileProcessor: FileProcessor | null = null;
    private identity: Identity | null = null;
    private readonly listeners: Listener[] = [];
    private readonly errListeners: ErrorCallback[] = [];
    private readonly toBeLoadedPatches: Buffer[] = [];

    /**
     * the name of the Proposal with which it is stored in BrowserStorage
     * or <code>null</code> if it is not stored
     */
    readonly storageName = ref<string | null>(null);

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

    addToBeLoadedPatch(data: Buffer) {
        this.toBeLoadedPatches.push(data);
    }

    getToBeLoadedPatches(): Buffer[] {
        return this.toBeLoadedPatches;
    }

    clearToBeLoadedPatches() {
        this.toBeLoadedPatches.splice(0);
    }

    setIdentity(identity: Identity) {
        this.identity = identity;
    }

    getIdentity(): Identity | null {
        return this.identity;
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

    async createFile(authors: Author[]) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        await this.fileProcessor.createFile(authors);
        this.onUpdated();
    }

    async loadFile(data: BufferReader) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        await this.fileProcessor.loadFile(data);
        await this.importPendingPatches();

        this.onUpdated();
    }

    async saveFile(): Promise<Buffer> {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor.saveFile();
    }

    async addAddendum(title: string, mime: string, content: Buffer) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        await this.fileProcessor.addAddendum(title, mime, content);
        this.onUpdated();
    }

    async addVote(vote: boolean) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        await this.fileProcessor.addVote(vote);
        this.onUpdated();
    }

    async importPatchSet(data: BufferReader) {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        await this.fileProcessor.importPatchSet(data);
        this.onUpdated();
    }

    async exportChanges(): Promise<Buffer> {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor.exportChanges();
    }

    clearChanges() {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        this.fileProcessor.clearChanges();
    }

    getChangesCount(): number {
        if(this.fileProcessor === null)
            throw new IllegalStateException("not initialized");

        return this.fileProcessor.getChangesCount();
    }

    private async importPendingPatches() {
        for(const patch of this.toBeLoadedPatches) {
            await this.fileProcessor!.importPatchSet(new BufferReader(patch));
        }
    }

    private onErr(msg: string) {
        this.errListeners.forEach(l => l(msg));
    }

    private onUpdated() {
        this.listeners.forEach(l => l());
    }
}
