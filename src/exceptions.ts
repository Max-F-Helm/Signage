// some Java-like exceptions and more

export class IllegalArgumentException extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class FileContentsException extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class IllegalStateException extends Error {
    constructor(msg: string) {
        super(msg);
    }
}
