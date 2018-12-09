"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const src_1 = require("../src");
const resultFileNames = ['originalH.txt', 'test.txt', 'train.txt'];
async function execute() {
    if (process.argv.length !== 3) {
        console.log('Please call again using: ');
        console.log('npm run file scripts/collectResults.ts {resultsDir}');
        process.exit(0);
    }
    const rootPath = process.argv[2];
    await src_1.results.collectResults(rootPath, resultFileNames);
}
execute();
//# sourceMappingURL=collectResults.js.map