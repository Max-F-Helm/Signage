import fileProcessorTest from "@/test/FileProcessor.test";
import identityProcessorTest from "@/test/IdentityProcessor.test";

const tests = [
    ...fileProcessorTest,
    ...identityProcessorTest
];

export default function runTests() {
    new Promise(() => {
        tests.forEach(async (t) => {
            await t();
        });
    }).then();
}
