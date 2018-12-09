"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const _ = require("lodash");
const tf = require("@tensorflow/tfjs");
const v = require("validtyped");
const utilities_ts_1 = require("utilities-ts");
const Algorithm_1 = require("./Algorithm");
const MatrixFactorization_1 = require("./MatrixFactorization");
const LogisticRegression_1 = require("./LogisticRegression");
const DatasetDescription_1 = require("../data/DatasetDescription");
const History_1 = require("../analysis/History");
const LinearRegression_1 = require("./LinearRegression");
const tensorflow_1 = require("../utils/tensorflow");
class TwoStageDictionaryLearning extends Algorithm_1.Algorithm {
    constructor(datasetDescription, opts, saveLocation = 'savedModels') {
        super(datasetDescription, saveLocation);
        this.datasetDescription = datasetDescription;
        this.name = TwoStageDictionaryLearning.name;
        this.state = { activeStage: 'stage1' };
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
    async _build() { }
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
        const jointHistory = new History_1.History(this.name, this.opts, []);
        if (this.state.activeStage === 'stage1') {
            const history = await this.stage1.train(X, tf.zeros([0, 0]), o, { autosave: false });
            this.state.activeStage = 'stage2';
            jointHistory.loss = jointHistory.loss.concat(history.loss);
            await tensorflow_1.writeTensorToCsv('twostage-originalH_deterding-train.csv', this.stage1.H.transpose());
        }
        if (this.state.activeStage === 'stage2') {
            const history = await this.stage2.train(this.stage1.H, Y, { ...o, iterations: o.iterations }, { autosave: false });
            this.state.activeStage = 'complete';
            jointHistory.loss = jointHistory.loss.concat(history.loss);
        }
        return jointHistory;
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
        await stage3.train(this.stage1.D.transpose(), X.transpose(), opts, { autosave: false });
        const H = stage3.W.transpose();
        return H;
    }
    // ----------------
    // Saving / Loading
    // ----------------
    async _saveState(location) {
        const saveTasks = [
            this.stage1.saveState(location),
            this.stage2.saveState(location),
        ];
        return Promise.all(saveTasks);
    }
    static async fromSavedState(location) {
        const subfolder = await this.findSavedState(location, this.name);
        const saveData = await utilities_ts_1.files.readJson(path.join(subfolder, 'state.json'), SaveSchema);
        const alg = new TwoStageDictionaryLearning(saveData.datasetDescription, saveData.metaParameters, location);
        const [stage1, stage2] = await Promise.all([
            MatrixFactorization_1.MatrixFactorization.fromSavedState(subfolder),
            LogisticRegression_1.LogisticRegression.fromSavedState(subfolder),
        ]);
        alg.stage1 = stage1;
        alg.stage2 = stage2;
        alg.state.activeStage = saveData.state.activeStage;
        return alg;
    }
}
exports.TwoStageDictionaryLearning = TwoStageDictionaryLearning;
exports.TwoStageDictionaryLearningMetaParametersSchema = v.object({
    stage1: v.partial(MatrixFactorization_1.MatrixFactorizationMetaParametersSchema),
    stage2: v.partial(LogisticRegression_1.LogisticRegressionMetaParameterSchema),
    hidden: v.number(),
});
const ActiveStageSchema = v.string(['stage1', 'stage2', 'complete']);
const SaveSchema = v.object({
    state: v.object({
        activeStage: ActiveStageSchema,
    }),
    datasetDescription: DatasetDescription_1.SupervisedDictionaryLearningDatasetDescriptionSchema,
    metaParameters: exports.TwoStageDictionaryLearningMetaParametersSchema,
});
//# sourceMappingURL=TwoStageDictionaryLearning.js.map