"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
// tslint:disable no-console
const runs = 20;
const base_path = 'results/imageFilters';
async function execute() {
    const { e: expPath } = src_1.commandLine.parseArgs();
    if (!expPath)
        throw new Error("Expected to be called with -e parameter");
    const incomplete = await src_1.results.findMissing(base_path, expPath, runs);
    console.log(incomplete);
}
execute().then(() => process.exit());
//# sourceMappingURL=findMissing.js.map