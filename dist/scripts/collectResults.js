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
const files = require("../src/utils/files");
const objects_1 = require("../src/utils/objects");
const filterUndefined = (x) => x.filter(d => d !== undefined);
const resultFileNames = ['originalH.txt', 'test.txt', 'train.txt'];
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.argv.length !== 3) {
            console.log('Please call again using: ');
            console.log('npm run file scripts/collectResults.ts {resultsDir}');
            process.exit(0);
        }
        const rootPath = process.argv[2];
        const hashDirectories = (yield files.readdir(rootPath)).map(n => path.join(rootPath, n));
        const uncollectedResults = yield Promise.all(hashDirectories.filter(dir => files.fileExists(path.join(dir, 'results.json'))));
        yield Promise.all(uncollectedResults.map((res) => __awaiter(this, void 0, void 0, function* () {
            const descriptionsOrUndefined = yield Promise.all(resultFileNames.map((resultFile) => __awaiter(this, void 0, void 0, function* () {
                const resultFiles = yield files.glob(path.join(res, '*', resultFile));
                if (resultFiles.length === 0)
                    return;
                const contents = yield Promise.all(resultFiles.map(file => files.readFile(file)));
                const results = contents.map(c => parseFloat(c.toString()));
                const resMatrix = tsplot.Matrix.fromData([results]);
                return {
                    description: tsplot.describeRows(resMatrix)[0],
                    name: resultFile,
                };
            })));
            const descriptions = filterUndefined(descriptionsOrUndefined);
            const paramsFiles = yield files.glob(path.join(res, '*', 'params.json'));
            const experimentFiles = yield files.glob(path.join(res, '*', 'experiment.json'));
            const params = yield files.readJson(paramsFiles[0], v.any());
            const experiment = yield files.readJson(experimentFiles[0], v.any());
            const description = objects_1.discriminatedObject('name', descriptions);
            const result = Object.assign({}, description, { metaParameters: params, algorithm: experiment.algorithm, dataset: experiment.dataset, optimization: experiment.optimization });
            yield files.writeJson(path.join(res, 'results.json'), result);
        })));
    });
}
execute();
//# sourceMappingURL=collectResults.js.map