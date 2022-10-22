import should from "should";

export function describe(desc: string, exec: () => Promise<void>): () => Promise<void> {
    return async () => {
        console.info("\nrunning test " + desc);
        try {
            await exec();
            console.info("test successful");
        } catch (e) {
            if(e.hasOwnProperty("stack")){
                // assertion error
                console.error(`test failed (assertion failed)\n
message: ${e.message}
operator: ${e.operator}
expected: ${e.expected}
actual: ${e.actual}
file: ${extractTestLocation(e.stack)}
            `.trim());
            } else {
                // general exception
                console.error("test failed (threw exception)", e);
            }
        }
    }
}

export async function shouldThrow(msg: string, block: () => Promise<void>) {
    let ranThrough = false;
    try {
        await block();
        ranThrough = true;
    } catch (e) {}
    should(ranThrough).false(msg);
}

export async function shouldNotThrow(msg: string, block: () => Promise<void>) {
    let ranThrough = false;
    try {
        await block();
        ranThrough = true;
    } catch (e) {}
    should(ranThrough).true(msg);
}

function extractTestLocation(trace: string): string {
    const marker = ".test.ts";
    const mIdx = trace.indexOf(marker);
    const sIdx = trace.lastIndexOf("/", mIdx);
    return trace.substring(sIdx + 1, mIdx + marker.length);
}
