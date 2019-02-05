"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const v = require("validtyped");
const path = require("path");
const tsplot = require("tsplot");
const utilities_ts_1 = require("utilities-ts");
function collectResults(rootPath, resultFileNames) {
    const [collectedResults, uncollectedResults] = utilities_ts_1.Observable.fromPromises([findHashDirectoryDepth(rootPath)])
        .map(hashDepth => path.join(rootPath, '/*'.repeat(hashDepth)))
        .flatMap(hashPath => utilities_ts_1.files.globObservable(hashPath))
        .partition(dir => utilities_ts_1.files.fileExists(path.join(dir, 'results.json')));
    const newResultsObservable = uncollectedResults
        // to remain scalable to many results files, we must limit the number we process simultaneously
        // this slows down processing a little, but prevents out-of-memory errors
        .bottleneck(6)
        .map(async (hashDir) => {
        const descriptions = await utilities_ts_1.Observable.fromArray(resultFileNames)
            .map(resultFile => describeResultFiles(hashDir, resultFile))
            .filterUndefined()
            .collect();
        const params = await utilities_ts_1.files.globObservable(path.join(hashDir, '*', 'params.json'))
            .concat(utilities_ts_1.files.globObservable(path.join(hashDir, 'params.json')))
            .take(1)
            .map(loc => utilities_ts_1.files.readJson(loc, v.any()))
            .collect()
            .then(utilities_ts_1.arrays.getFirst);
        const experiment = await utilities_ts_1.files.globObservable(path.join(hashDir, '*', 'experiment.json'))
            .concat(utilities_ts_1.files.globObservable(path.join(hashDir, 'experiment.json')))
            .take(1)
            .map(loc => utilities_ts_1.files.readJson(loc, v.any()))
            .collect()
            .then(utilities_ts_1.arrays.getFirst);
        const description = utilities_ts_1.objects.discriminatedObject('name', descriptions);
        const resultPath = path.join(hashDir, 'results.json');
        const result = {
            ...description,
            path: resultPath,
            hashPath: hashDir,
            metaParameters: params,
            algorithm: experiment.algorithm,
            dataset: experiment.dataset,
            optimization: experiment.optimization,
        };
        await utilities_ts_1.files.writeJson(resultPath, result);
        return result;
    });
    return collectedResults
        .map(hashDir => utilities_ts_1.files.readJson(path.join(hashDir, 'results.json'), v.any()))
        .concat(newResultsObservable);
}
exports.collectResults = collectResults;
// finds the depth for the hash directories.
// non-trivial now that path can take arbitrary shape
async function findHashDirectoryDepth(root) {
    const helper = async (rootPath) => {
        const subDirs = await utilities_ts_1.files.readdir(rootPath);
        if (subDirs.length === 0)
            return 0;
        const subDir = subDirs[0];
        if (isNumerical(subDir))
            return 1;
        const depth = await helper(path.join(rootPath, subDir));
        return depth + 1;
    };
    // use a helper to find the "numerical" paths
    // these are the run numbers, and should come just after the hash path
    // subtract 1 from the run number depth to retrieve the hash depth
    const depth = await helper(root);
    return depth - 1;
}
const isNumerical = (x) => `${parseInt(x)}` === x;
async function describeResultFiles(resultFilePaths, resultFileName) {
    const results = await utilities_ts_1.files.globObservable(path.join(resultFilePaths, '*', resultFileName))
        .map(file => utilities_ts_1.files.readFile(file))
        .map(c => parseFloat(c.toString()))
        .collect();
    if (results.length === 0)
        return;
    // create an 1*n matrix so that we can use description utility methods
    const resMatrix = utilities_ts_1.Matrix.fromData([results]);
    return {
        // describeRows will get mean/stderr over columns for each row
        // since we only have one row, grab only that description
        description: tsplot.describeRows(resMatrix)[0],
        name: resultFileName,
    };
}
//# sourceMappingURL=collectResults.js.map