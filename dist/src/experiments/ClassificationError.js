"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analysis_1 = require("../analysis");
const utilities_ts_1 = require("utilities-ts");
class ClassificationErrorExperiment {
    constructor(description) {
        this.description = description;
    }
    async run(root = 'results') {
        const alg = this.description.algorithm;
        const d = this.description.dataset;
        await alg.build();
        const [X, Y] = d.train;
        const history = await alg.train(X, Y, this.description.optimization);
        const [T, TY] = d.test;
        const Y_hat = await alg.predict(X, this.description.optimization);
        const TY_hat = await alg.predict(T, this.description.optimization);
        const trainError = analysis_1.getClassificationError(Y_hat, Y).get();
        const testError = analysis_1.getClassificationError(TY_hat, TY).get();
        const params = alg.getParameters();
        const resultsPath = utilities_ts_1.files.filePath(`${root}/${this.description.path}`);
        await utilities_ts_1.files.writeFile(utilities_ts_1.files.filePath(`${resultsPath}/test.csv`), testError);
        await utilities_ts_1.files.writeFile(utilities_ts_1.files.filePath(`${resultsPath}/train.csv`), trainError);
        await utilities_ts_1.files.writeJson(utilities_ts_1.files.filePath(`${resultsPath}/params.json`), params);
        await utilities_ts_1.files.writeJson(utilities_ts_1.files.filePath(`${resultsPath}/experiment.json`), this.description.definition);
        const loss = utilities_ts_1.Matrix.fromData([history.loss]);
        await utilities_ts_1.csv.writeCsv(utilities_ts_1.files.filePath(`${resultsPath}/loss.csv`), loss);
        console.log('Train:', trainError, 'Test:', testError); // tslint:disable-line no-console
    }
}
exports.ClassificationErrorExperiment = ClassificationErrorExperiment;
//# sourceMappingURL=ClassificationError.js.map