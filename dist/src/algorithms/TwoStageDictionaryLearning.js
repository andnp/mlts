"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const v = require("validtyped");
const Algorithm_1 = require("./Algorithm");
const MatrixFactorization_1 = require("./MatrixFactorization");
const LogisticRegression_1 = require("./LogisticRegression");
const LinearRegression_1 = require("./LinearRegression");
class TwoStageDictionaryLearning extends Algorithm_1.SupervisedAlgorithm {
    constructor(datasetDescription, opts) {
        super(datasetDescription);
        this.datasetDescription = datasetDescription;
        this.name = TwoStageDictionaryLearning.name;
        this.opts = _.merge({
            stage1: {},
            stage2: {},
            hidden: 2,
        }, opts);
        this.stage1 = new MatrixFactorization_1.MatrixFactorization(datasetDescription, { ...this.opts.stage1, hidden: this.opts.hidden });
        // The logistic regression stage maps from HiddenRepresentation to classes.
        // So use number of hidden features here instead of number of dataset features.
        this.stage2 = new LogisticRegression_1.LogisticRegression({ features: this.opts.hidden, classes: this.datasetDescription.classes }, this.opts.stage2);
    }
    getDefaults(opts) {
        return _.merge({
            type: 'adadelta',
            learningRate: 2.0,
            iterations: 10,
        }, opts);
    }
    // --------
    // Training
    // --------
    loss(X, Y) {
        const s1_loss = this.stage1.loss(X);
        const s2_loss = this.stage2.loss(X.transpose(), Y.transpose());
        return s1_loss.add(s2_loss);
    }
    async _train(X, Y, opts) {
        const o = this.getDefaults(opts);
        await this.stage1.train(X, o);
        const history = await this.stage2.train(this.stage1.H, Y, { ...o, iterations: o.iterations });
        return history;
    }
    async _predict(T, opts) {
        const o = this.getDefaults(opts);
        const H = opts && opts.useOriginalH
            ? this.stage1.H
            : await this.getRepresentation(T, o);
        const Y_hat = await this.stage2.predict(H);
        return Y_hat;
    }
    // ------------------------
    // Representation Algorithm
    // ------------------------
    async getRepresentation(X, opts) {
        // a new representation can be calculated as a linear regression optimization over H.
        // X = argmin_H (X - DH) so the "inputs" to the linear regressor are "D" and the targets are "X"
        const stage3 = new LinearRegression_1.LinearRegression({ features: this.opts.hidden, classes: X.shape[0] }, { regularizer: this.opts.stage1.regularizerH });
        await stage3.train(this.stage1.D.transpose(), X.transpose(), opts);
        const H = stage3.W.transpose();
        return H;
    }
}
exports.TwoStageDictionaryLearning = TwoStageDictionaryLearning;
exports.TwoStageDictionaryLearningMetaParametersSchema = v.object({
    stage1: v.partial(MatrixFactorization_1.MatrixFactorizationMetaParametersSchema),
    stage2: v.partial(LogisticRegression_1.LogisticRegressionMetaParameterSchema),
    hidden: v.number(),
});
//# sourceMappingURL=TwoStageDictionaryLearning.js.map