"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const experiments_1 = require("../experiments");
const printer_1 = require("../utils/printer");
const fileSystem_1 = require("experiments/fileSystem");
function findMissing(base_path, path, runs) {
    return printer_1.printProgress(print => {
        let exp;
        let count;
        return utilities_ts_1.Observable.fromPromises([utilities_ts_1.files.readJson(path, experiments_1.getExperimentSchema())])
            .subscribe(raw_exp => exp = raw_exp)
            .subscribe(raw_exp => count = experiments_1.getNumberOfRuns(raw_exp.metaParameters) * runs)
            .flatMap(() => utilities_ts_1.arrays.range(experiments_1.getNumberOfRuns(exp.metaParameters) * runs))
            // make sure process doesn't run out of memory servicing too many missing files
            .bottleneck(16)
            .filter(async (i) => {
            const metaParameters = experiments_1.getParameterPermutation(exp.metaParameters, i);
            const res_path = fileSystem_1.interpolateResultsPath({
                ...fileSystem_1.experimentJsonToContext(exp),
                metaParameters,
                run: i % (count / runs),
            });
            const full_path = `${base_path}/${res_path}/test.csv`;
            const found = await utilities_ts_1.files.fileExists(full_path);
            print(`Searching for missing results: ${((i / count) * 100).toPrecision(3)}%`);
            return !found;
        });
    });
}
exports.findMissing = findMissing;
//# sourceMappingURL=findMissing.js.map