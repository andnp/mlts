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
const path = require("path");
const _ = require("lodash");
const tf = require("@tensorflow/tfjs");
const v = require("validtyped");
const files_1 = require("../utils/files");
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
        this.stage1 = new MatrixFactorization_1.MatrixFactorization(datasetDescription, Object.assign({}, this.opts.stage1, { hidden: this.opts.hidden }));
        // The logistic regression stage maps from HiddenRepresentation to classes.
        // So use number of hidden features here instead of number of dataset features.
        this.stage2 = new LogisticRegression_1.LogisticRegression({ features: this.opts.hidden, classes: this.datasetDescription.classes }, this.opts.stage2);
    }
    _build() {
        return __awaiter(this, void 0, void 0, function* () { });
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
    _train(X, Y, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const o = this.getDefaults(opts);
            const jointHistory = new History_1.History(this.name, this.opts, []);
            if (this.state.activeStage === 'stage1') {
                const history = yield this.stage1.train(X, tf.zeros([0, 0]), o, { autosave: false });
                this.state.activeStage = 'stage2';
                jointHistory.loss = jointHistory.loss.concat(history.loss);
                yield tensorflow_1.writeTensorToCsv('twostage-originalH_deterding-train.csv', this.stage1.H.transpose());
            }
            if (this.state.activeStage === 'stage2') {
                const history = yield this.stage2.train(this.stage1.H, Y, Object.assign({}, o, { iterations: o.iterations }), { autosave: false });
                this.state.activeStage = 'complete';
                jointHistory.loss = jointHistory.loss.concat(history.loss);
            }
            return jointHistory;
        });
    }
    _predict(T, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const o = this.getDefaults(opts);
            const H = opts && opts.useOriginalH
                ? this.stage1.H
                : yield this.getRepresentation(T, o);
            const Y_hat = yield this.stage2.predict(H);
            return Y_hat;
        });
    }
    // ------------------------
    // Representation Algorithm
    // ------------------------
    getRepresentation(X, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // a new representation can be calculated as a linear regression optimization over H.
            // X = argmin_H (X - DH) so the "inputs" to the linear regressor are "D" and the targets are "X"
            const stage3 = new LinearRegression_1.LinearRegression({ features: this.opts.hidden, classes: X.shape[0] }, { regularizer: this.opts.stage1.regularizerH });
            yield stage3.train(this.stage1.D.transpose(), X.transpose(), opts, { autosave: false });
            const H = stage3.W.transpose();
            return H;
        });
    }
    // ----------------
    // Saving / Loading
    // ----------------
    _saveState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const saveTasks = [
                this.stage1.saveState(location),
                this.stage2.saveState(location),
            ];
            return Promise.all(saveTasks);
        });
    }
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const subfolder = yield this.findSavedState(location, this.name);
            const saveData = yield files_1.readJson(path.join(subfolder, 'state.json'), SaveSchema);
            const alg = new TwoStageDictionaryLearning(saveData.datasetDescription, saveData.metaParameters, location);
            const [stage1, stage2] = yield Promise.all([
                MatrixFactorization_1.MatrixFactorization.fromSavedState(subfolder),
                LogisticRegression_1.LogisticRegression.fromSavedState(subfolder),
            ]);
            alg.stage1 = stage1;
            alg.stage2 = stage2;
            alg.state.activeStage = saveData.state.activeStage;
            return alg;
        });
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