"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable no-console
const v = require("validtyped");
const path = require("path");
const tsplot = require("tsplot");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const matrix_1 = require("../utils/matrix");
function collectResults(rootPath, resultFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashDirectories = (yield utilities_ts_1.files.readdir(rootPath)).map(n => path.join(rootPath, n));
        const uncollectedResults = yield Promise.all(hashDirectories.filter(dir => utilities_ts_1.files.fileExists(path.join(dir, 'results.json'))));
        const newResults = yield utilities_ts_1.promise.map(uncollectedResults, (hashDir) => __awaiter(this, void 0, void 0, function* () {
            const descriptionsOrUndefined = yield utilities_ts_1.promise.map(resultFileNames, resultFile => describeResultFiles(hashDir, resultFile));
            const descriptions = utilities_ts_1.arrays.filterUndefined(descriptionsOrUndefined);
            const paramsFiles = yield utilities_ts_1.files.glob(path.join(hashDir, '*', 'params.json'));
            const experimentFiles = yield utilities_ts_1.files.glob(path.join(hashDir, '*', 'experiment.json'));
            const params = yield utilities_ts_1.files.readJson(paramsFiles[0], v.any());
            const experiment = yield utilities_ts_1.files.readJson(experimentFiles[0], v.any());
            const description = utilities_ts_1.objects.discriminatedObject('name', descriptions);
            const resultPath = path.join(hashDir, 'results.json');
            const result = Object.assign({}, description, { path: resultPath, metaParameters: params, algorithm: experiment.algorithm, dataset: experiment.dataset, optimization: experiment.optimization });
            yield utilities_ts_1.files.writeJson(resultPath, result);
            return result;
        }));
        const oldResultsHashes = _.difference(hashDirectories, uncollectedResults);
        const oldResults = yield utilities_ts_1.promise.map(oldResultsHashes, hashDir => utilities_ts_1.files.readJson(path.join(hashDir, 'results.json'), v.any()));
        const results = newResults.concat(oldResults);
        return results;
    });
}
exports.collectResults = collectResults;
function describeResultFiles(resultFilePaths, resultFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultFiles = yield utilities_ts_1.files.glob(path.join(resultFilePaths, '*', resultFileName));
        if (resultFiles.length === 0)
            return;
        const contents = yield utilities_ts_1.promise.map(resultFiles, file => utilities_ts_1.files.readFile(file));
        const results = contents.map(c => parseFloat(c.toString()));
        // create an 1*n matrix so that we can use description utility methods
        const resMatrix = matrix_1.Matrix.fromData([results]);
        return {
            // describeRows will get mean/stderr over columns for each row
            // since we only have one row, grab only that description
            description: tsplot.describeRows(resMatrix)[0],
            name: resultFileName,
        };
    });
}
//# sourceMappingURL=collectResults.js.map