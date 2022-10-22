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

function extractTestLocation(trace: string): string {
    const marker = ".test.ts";
    const mIdx = trace.indexOf(marker);
    const sIdx = trace.lastIndexOf("/", mIdx);
    return trace.substring(sIdx + 1, mIdx + marker.length);
}
