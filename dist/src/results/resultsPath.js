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
const utilities_ts_1 = require("utilities-ts");
const metaParameters_1 = require("../experiments/metaParameters");
const ExperimentSchema_1 = require("../experiments/ExperimentSchema");
const fileSystem_1 = require("../experiments/fileSystem");
function findResultsPath(rootPath, experimentPath, run) {
    return __awaiter(this, void 0, void 0, function* () {
        const ExperimentSchema = ExperimentSchema_1.getExperimentSchema();
        const experiment = yield utilities_ts_1.files.readJson(experimentPath, ExperimentSchema);
        const metaParameters = metaParameters_1.getParameterPermutation(experiment.metaParameters, run);
        const path = fileSystem_1.getResultsPath(experiment, metaParameters, run);
        const resultsPath = path.split('/').slice(0, -1).join('/');
        return utilities_ts_1.files.filePath(`${rootPath}/${resultsPath}/results.json`);
    });
}
exports.findResultsPath = findResultsPath;
//# sourceMappingURL=resultsPath.js.map