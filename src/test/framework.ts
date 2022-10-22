export function describe(desc: string, exec: () => void): () => void {
    return () => {
        console.info("\nrunning test " + desc);
        try {
            exec();
            console.info("test successful");
        } catch (e) {
            console.error(`test failed\n
message: ${e.message}
operator: ${e.operator}
expected: ${e.expected}
actual: ${e.actual}
file: ${extractTestLocation(e.stack)}
            `.trim());
        }
    }
}

function extractTestLocation(trace: string): string {
    const marker = ".test.ts";
    const mIdx = trace.indexOf(marker);
    const sIdx = trace.lastIndexOf("/", mIdx);
    return trace.substring(sIdx + 1, mIdx + marker.length);
}
