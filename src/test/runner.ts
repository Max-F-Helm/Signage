import fileProcessorTest from "@/test/FileProcessor.test";
import identityProcessorTest from "@/test/IdentityProcessor.test";

const tests = [
    ...fileProcessorTest,
    ...identityProcessorTest
];

export default function runTests() {
    (async () => {
        for(const test of tests)
            await test();
        console.info("\nfin");
    })();
}
