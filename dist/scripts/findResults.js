"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const v = require("validtyped");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const src_1 = require("../src");
const resultFiles = ['test.csv', 'train.csv'];
async function execute() {
    const res = await src_1.results.collectResults('results', resultFiles);
    console.log(`Found <${res.length}> total results`);
    const { e: expPath, i: index } = src_1.commandLine.parseArgs();
    if (!expPath)
        throw new Error("Expected to be called with -e parameter");
    if (!index)
        throw new Error("expected to be called with -i parameter");
    const exp = await utilities_ts_1.files.readJson(expPath, v.any());
    const params = exp.metaParameters;
    const sweep = src_1.getParameterPermutation(params, parseInt(index));
    console.log(sweep);
    const algorithm = exp.algorithm;
    const dataset = exp.dataset;
    const flattened = src_1.flattenToArray(sweep);
    const filters = flattened.map(paramPair => {
        const [path, [value]] = paramPair;
        const lens = _.flow(src_1.results.parameterLens, src_1.results.lens(path));
        return _.partial(src_1.results.where, lens, value);
    });
    const filter = _.flow(src_1.results.createAlgorithmDatasetFilter(algorithm, dataset), ...filters);
    const filtered = filter(res);
    console.log(JSON.stringify(filtered, undefined, 2));
}
execute().then(() => process.exit());
//# sourceMappingURL=findResults.js.map