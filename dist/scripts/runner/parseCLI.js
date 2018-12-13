"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v = require("validtyped");
const src_1 = require("../../src");
const utilities_ts_1 = require("utilities-ts");
exports.parseCLI = async () => {
    // get experiment file paths from command-line
    const [, , executable, basePath, runs, ...experiments] = process.argv;
    if (experiments.length === 0) {
        console.log('Please call again with:');
        console.log('ts-node runner.ts [dist/src/executable.js] [path/to/results] [runs] [path/to/experiment1.json] [path/to/experiment2.json] [...]');
        process.exit(0);
    }
    const exps = [];
    for (const expPath of experiments) {
        const exp = await utilities_ts_1.files.readJson(expPath, v.any());
        const paramCount = src_1.getNumberOfRuns(exp.metaParameters);
        exps.push({
            executable,
            experimentPath: expPath,
            number_runs: parseInt(runs) * paramCount,
            repeats: parseInt(runs),
            basePath,
        });
    }
    return exps;
};
//# sourceMappingURL=parseCLI.js.map