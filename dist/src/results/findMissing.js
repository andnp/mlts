"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const experiments_1 = require("../experiments");
const printer_1 = require("../utils/printer");
async function findMissing(base_path, path, runs) {
    const raw_exp = await utilities_ts_1.files.readJson(path, experiments_1.getExperimentSchema());
    const count = experiments_1.getNumberOfRuns(raw_exp.metaParameters) * runs;
    return printer_1.printProgress(print => {
        return utilities_ts_1.Observable.fromArray(utilities_ts_1.arrays.range(count))
            .filter(async (i) => {
            const res_path = experiments_1.ExperimentDescription.getResultsPath(raw_exp, i);
            const full_path = `${base_path}/${res_path}/test.csv`;
            const found = utilities_ts_1.files.fileExists(full_path);
            print(`Searching for missing results: ${((i / count) * 100).toPrecision(3)}%`);
            return !found;
        });
    });
}
exports.findMissing = findMissing;
//# sourceMappingURL=findMissing.js.map