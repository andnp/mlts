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
const experiments_1 = require("../experiments");
function findMissing(base_path, path, runs) {
    return __awaiter(this, void 0, void 0, function* () {
        const paths = yield utilities_ts_1.files.glob(`${base_path}/**/test.csv`);
        const raw_exp = yield utilities_ts_1.files.readJson(path, experiments_1.getExperimentSchema());
        const count = experiments_1.getNumberOfRuns(raw_exp.metaParameters);
        const incomplete = [];
        for (let i = 0; i < count * runs; ++i) {
            const res_path = experiments_1.ExperimentDescription.getResultsPath(raw_exp, i);
            const full_path = `${base_path}/${res_path}`;
            const found = paths.find(p => p.startsWith(full_path));
            if (!found)
                incomplete.push(i);
        }
        return incomplete;
    });
}
exports.findMissing = findMissing;
//# sourceMappingURL=findMissing.js.map