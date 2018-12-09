"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const metaParameters_1 = require("../experiments/metaParameters");
const ExperimentSchema_1 = require("../experiments/ExperimentSchema");
const fileSystem_1 = require("../experiments/fileSystem");
async function findResultsPath(rootPath, experimentPath, run) {
    const ExperimentSchema = ExperimentSchema_1.getExperimentSchema();
    const experiment = await utilities_ts_1.files.readJson(experimentPath, ExperimentSchema);
    const metaParameters = metaParameters_1.getParameterPermutation(experiment.metaParameters, run);
    const path = fileSystem_1.getResultsPath(experiment, metaParameters, run);
    const resultsPath = path.split('/').slice(0, -1).join('/');
    return utilities_ts_1.files.filePath(`${rootPath}/${resultsPath}/results.json`);
}
exports.findResultsPath = findResultsPath;
//# sourceMappingURL=resultsPath.js.map