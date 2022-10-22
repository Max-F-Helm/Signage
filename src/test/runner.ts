import fileProcessorTest from "@/test/FileProcessor.test";
import identityProcessorTest from "@/test/IdentityProcessor.test";

export default function runTests() {
    [
        ...fileProcessorTest,
        ...identityProcessorTest
    ].forEach(t => {
       t();
    });
}
