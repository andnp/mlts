"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const experiments_1 = require("../experiments");
const printer_1 = require("../utils/printer");
function findMissing(base_path, path, runs) {
    return printer_1.printProgress(print => {
        let exp;
        return utilities_ts_1.Observable.fromPromises([utilities_ts_1.files.readJson(path, experiments_1.getExperimentSchema())])
            .subscribe(raw_exp => exp = raw_exp)
            .flatMap(() => utilities_ts_1.arrays.range(experiments_1.getNumberOfRuns(exp.metaParameters) * runs))
            // make sure process doesn't run out of memory servicing too many missing files
            .bottleneck(256)
            .filter(async (i) => {
            const res_path = experiments_1.ExperimentDescription.getResultsPath(exp, i);
            const full_path = `${base_path}/${res_path}/test.csv`;
            const found = await utilities_ts_1.files.fileExists(full_path);
            const count = experiments_1.getNumberOfRuns(exp.metaParameters) * runs;
            print(`Searching for missing results: ${((i / count) * 100).toPrecision(3)}%`);
            return !found;
        });
    });
}
exports.findMissing = findMissing;
//# sourceMappingURL=findMissing.js.map