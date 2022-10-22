import fileProcessorTest from "@/test/FileProcessor.test";
import identityProcessorTest from "@/test/IdentityProcessor.test";

const tests = [
    ...fileProcessorTest,
    ...identityProcessorTest
];

export default function runTests() {
    new Promise(async () => {
        for(const test of tests)
            await test();
    }).then();
}
