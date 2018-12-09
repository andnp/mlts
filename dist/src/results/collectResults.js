"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const v = require("validtyped");
const path = require("path");
const tsplot = require("tsplot");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const matrix_1 = require("../utils/matrix");
const observable_1 = require("../utils/observable");
async function collectResults(rootPath, resultFileNames) {
    const hashDirectories = await observable_1.Observable.fromArray(await utilities_ts_1.files.readdir(rootPath))
        .map(n => path.join(rootPath, n))
        .collect();
    const uncollectedResults = await observable_1.Observable.fromArray(hashDirectories)
        .filter(dir => utilities_ts_1.files.fileExists(path.join(dir, 'results.json')).then(b => !b))
        .collect();
    const newResultsObservable = observable_1.Observable.fromArray(uncollectedResults)
        .map(async (hashDir) => {
        const descriptionsOrUndefined = await utilities_ts_1.promise.map(resultFileNames, resultFile => describeResultFiles(hashDir, resultFile));
        const descriptions = utilities_ts_1.arrays.filterUndefined(descriptionsOrUndefined);
        const paramsFiles = await utilities_ts_1.files.glob(path.join(hashDir, '*', 'params.json'));
        const experimentFiles = await utilities_ts_1.files.glob(path.join(hashDir, '*', 'experiment.json'));
        const params = await utilities_ts_1.files.readJson(paramsFiles[0], v.any());
        const experiment = await utilities_ts_1.files.readJson(experimentFiles[0], v.any());
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
    const results = await observable_1.Observable.fromArray(oldResultsHashes)
        .map(hashDir => utilities_ts_1.files.readJson(path.join(hashDir, 'results.json'), v.any()))
        .concat(newResultsObservable)
        .collect();
    return results;
}
exports.collectResults = collectResults;
async function describeResultFiles(resultFilePaths, resultFileName) {
    const resultFiles = await utilities_ts_1.files.glob(path.join(resultFilePaths, '*', resultFileName));
    if (resultFiles.length === 0)
        return;
    const results = await observable_1.Observable.fromArray(resultFiles)
        .map(file => utilities_ts_1.files.readFile(file))
        .map(c => parseFloat(c.toString()))
        .collect();
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