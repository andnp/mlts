"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const v = require("validtyped");
const path = require("path");
const tsplot = require("tsplot");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const matrix_1 = require("../utils/matrix");
async function collectResults(rootPath, resultFileNames) {
    const hashDirectories = await utilities_ts_1.Observable.fromArray(await utilities_ts_1.files.readdir(rootPath))
        .map(n => path.join(rootPath, n))
        .collect();
    const uncollectedResults = await utilities_ts_1.Observable.fromArray(hashDirectories)
        .filter(dir => utilities_ts_1.files.fileExists(path.join(dir, 'results.json')).then(b => !b))
        .collect();
    const newResultsObservable = utilities_ts_1.Observable.fromArray(uncollectedResults)
        // to remain scalable to many results files, we must limit the number we process simultaneously
        // this slows down processing a little, but prevents out-of-memory errors
        .bottleneck(6)
        .map(async (hashDir) => {
        const descriptions = await utilities_ts_1.Observable.fromArray(resultFileNames)
            .map(resultFile => describeResultFiles(hashDir, resultFile))
            .filterUndefined()
            .collect();
        const params = await utilities_ts_1.files.globObservable(path.join(hashDir, '*', 'params.json'))
            .take(1)
            .map(loc => utilities_ts_1.files.readJson(loc, v.any()))
            .collect()
            .then(utilities_ts_1.arrays.getFirst);
        const experiment = await utilities_ts_1.files.globObservable(path.join(hashDir, '*', 'experiment.json'))
            .take(1)
            .map(loc => utilities_ts_1.files.readJson(loc, v.any()))
            .collect()
            .then(utilities_ts_1.arrays.getFirst);
        const description = utilities_ts_1.objects.discriminatedObject('name', descriptions);
        const resultPath = path.join(hashDir, 'results.json');
        const result = {
            ...description,
            path: resultPath,
            metaParameters: params,
            algorithm: experiment.algorithm,
            dataset: experiment.dataset,
            optimization: experiment.optimization,
        };
        await utilities_ts_1.files.writeJson(resultPath, result);
        return result;
    });
    const oldResultsHashes = _.difference(hashDirectories, uncollectedResults);
    const results = await utilities_ts_1.Observable.fromArray(oldResultsHashes)
        .map(hashDir => utilities_ts_1.files.readJson(path.join(hashDir, 'results.json'), v.any()))
        .concat(newResultsObservable)
        .collect();
    return results;
}
exports.collectResults = collectResults;
async function describeResultFiles(resultFilePaths, resultFileName) {
    const results = await utilities_ts_1.files.globObservable(path.join(resultFilePaths, '*', resultFileName))
        .map(file => utilities_ts_1.files.readFile(file))
        .map(c => parseFloat(c.toString()))
        .collect();
    if (results.length === 0)
        return;
    // create an 1*n matrix so that we can use description utility methods
    const resMatrix = matrix_1.Matrix.fromData([results]);
    return {
        // describeRows will get mean/stderr over columns for each row
        // since we only have one row, grab only that description
        description: tsplot.describeRows(resMatrix)[0],
        name: resultFileName,
    };
}
//# sourceMappingURL=collectResults.js.map