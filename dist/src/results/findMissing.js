"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const experiments_1 = require("../experiments");
const printer_1 = require("../utils/printer");
function findMissing(base_path, path, runs) {
    return printer_1.printProgress(print => {
        return utilities_ts_1.Observable.fromPromises([utilities_ts_1.files.readJson(path, experiments_1.getExperimentSchema())])
            .map(raw_exp => ({ exp: raw_exp, count: experiments_1.getNumberOfRuns(raw_exp.metaParameters) * runs }))
            .flatMap(d => utilities_ts_1.arrays.range(d.count).map(i => ({ i, ...d })))
            // make sure process doesn't run out of memory servicing too many missing files
            .bottleneck(256)
            .filter(async (data) => {
            const res_path = experiments_1.ExperimentDescription.getResultsPath(data.exp, data.i);
            const full_path = `${base_path}/${res_path}/test.csv`;
            const found = await utilities_ts_1.files.fileExists(full_path);
            print(`Searching for missing results: ${((data.i / data.count) * 100).toPrecision(3)}%`);
            return !found;
        })
            .map(data => data.i);
    });
}
exports.findMissing = findMissing;
//# sourceMappingURL=findMissing.js.map