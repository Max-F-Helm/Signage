// some Java-like exceptions and more

export class IllegalArgumentException extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class FileContentsException extends Error {
    constructor(msg: string, cause?: Error) {
        super(msg, { cause: cause });
    }
}

export class IllegalStateException extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class AssertionError extends Error {
    constructor(msg: string, cause?: Error) {
        super(msg, { cause: cause });
    }
}
