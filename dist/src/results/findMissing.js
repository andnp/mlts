"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const experiments_1 = require("../experiments");
const printer_1 = require("../utils/printer");
async function findMissing(base_path, path, runs) {
    const paths = await utilities_ts_1.files.glob(`${base_path}/**/test.csv`);
    const raw_exp = await utilities_ts_1.files.readJson(path, experiments_1.getExperimentSchema());
    const count = experiments_1.getNumberOfRuns(raw_exp.metaParameters) * runs;
    const incomplete = [];
    printer_1.printProgress(print => {
        for (let i = 0; i < count; ++i) {
            const res_path = experiments_1.ExperimentDescription.getResultsPath(raw_exp, i);
            const full_path = `${base_path}/${res_path}`;
            const found = paths.find(p => p.startsWith(full_path));
            if (!found)
                incomplete.push(i);
            print(`Searching for missing results: ${((i / count) * 100).toPrecision(3)}%`);
        }
    });
    return incomplete;
}
exports.findMissing = findMissing;
//# sourceMappingURL=findMissing.js.map