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
const utilities_ts_1 = require("utilities-ts");
const src_1 = require("../src");
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
        const hashDirectories = (yield utilities_ts_1.files.readdir(rootPath)).map(n => path.join(rootPath, n));
        const uncollectedResults = yield Promise.all(hashDirectories.filter(dir => utilities_ts_1.files.fileExists(path.join(dir, 'results.json'))));
        yield Promise.all(uncollectedResults.map((res) => __awaiter(this, void 0, void 0, function* () {
            const descriptionsOrUndefined = yield Promise.all(resultFileNames.map((resultFile) => __awaiter(this, void 0, void 0, function* () {
                const resultFiles = yield utilities_ts_1.files.glob(path.join(res, '*', resultFile));
                if (resultFiles.length === 0)
                    return;
                const contents = yield Promise.all(resultFiles.map(file => utilities_ts_1.files.readFile(file)));
                const results = contents.map(c => parseFloat(c.toString()));
                const resMatrix = src_1.Matrix.fromData([results]);
                return {
                    description: tsplot.describeRows(resMatrix)[0],
                    name: resultFile,
                };
            })));
            const descriptions = filterUndefined(descriptionsOrUndefined);
            const paramsFiles = yield utilities_ts_1.files.glob(path.join(res, '*', 'params.json'));
            const experimentFiles = yield utilities_ts_1.files.glob(path.join(res, '*', 'experiment.json'));
            const params = yield utilities_ts_1.files.readJson(paramsFiles[0], v.any());
            const experiment = yield utilities_ts_1.files.readJson(experimentFiles[0], v.any());
            const description = utilities_ts_1.objects.discriminatedObject('name', descriptions);
            const result = Object.assign({}, description, { metaParameters: params, algorithm: experiment.algorithm, dataset: experiment.dataset, optimization: experiment.optimization });
            yield utilities_ts_1.files.writeJson(path.join(res, 'results.json'), result);
        })));
    });
}
execute();
//# sourceMappingURL=collectResults.js.map