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
const utilities_ts_1 = require("utilities-ts");
const metaParameters_1 = require("experiments/metaParameters");
const ExperimentSchema_1 = require("experiments/ExperimentSchema");
const fileSystem_1 = require("experiments/fileSystem");
function execute() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.argv.length !== 5) {
            console.log('Please call again using: ');
            console.log('npm run file scripts/findResultsPath.ts {resultsBaseDir} {experimentFile} {index}');
            process.exit(0);
        }
        const ExperimentSchema = ExperimentSchema_1.getExperimentSchema();
        const run = parseInt(process.argv[4]);
        const experiment = yield utilities_ts_1.files.readJson(process.argv[3], ExperimentSchema);
        const metaParameters = metaParameters_1.getParameterPermutation(experiment.metaParameters, run);
        const rootPath = process.argv[2];
        const path = fileSystem_1.getResultsPath(experiment, metaParameters, run);
        const resultsPath = path.split('/').slice(0, -1).join('/');
        console.log(utilities_ts_1.files.filePath(`${rootPath}/${resultsPath}/results.json`));
    });
}
execute();
//# sourceMappingURL=findResultsPath.js.map