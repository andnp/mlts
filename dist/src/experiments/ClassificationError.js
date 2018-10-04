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
const analysis_1 = require("analysis");
const utilities_ts_1 = require("utilities-ts");
class ClassificationErrorExperiment {
    constructor(description) {
        this.description = description;
    }
    run(root = 'results') {
        return __awaiter(this, void 0, void 0, function* () {
            const alg = this.description.algorithm;
            const d = this.description.dataset;
            yield alg.build();
            const [X, Y] = d.train;
            yield alg.train(X, Y, this.description.optimization);
            const [T, TY] = d.test;
            const Y_hat = yield alg.predict(X, this.description.optimization);
            const TY_hat = yield alg.predict(T, this.description.optimization);
            const trainError = analysis_1.getClassificationError(Y_hat, Y).get();
            const testError = analysis_1.getClassificationError(TY_hat, TY).get();
            const params = alg.getParameters();
            const resultsPath = utilities_ts_1.files.filePath(`${root}/${this.description.path}`);
            yield utilities_ts_1.files.writeFile(utilities_ts_1.files.filePath(`${resultsPath}/test.csv`), testError);
            yield utilities_ts_1.files.writeFile(utilities_ts_1.files.filePath(`${resultsPath}/train.csv`), trainError);
            yield utilities_ts_1.files.writeJson(utilities_ts_1.files.filePath(`${resultsPath}/params.json`), params);
            yield utilities_ts_1.files.writeJson(utilities_ts_1.files.filePath(`${resultsPath}/experiment.json`), this.description.definition);
        });
    }
}
exports.ClassificationErrorExperiment = ClassificationErrorExperiment;
//# sourceMappingURL=ClassificationError.js.map