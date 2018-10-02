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
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const path = require("path");
const arrays = require("../utils/arrays");
const printer_1 = require("../utils/printer");
const tasks_1 = require("../utils/tasks");
const tsUtil_1 = require("../utils/tsUtil");
const files_1 = require("../utils/files");
const History_1 = require("../analysis/History");
const tensorflow_1 = require("../utils/tensorflow");
const OptimizerSchemas_1 = require("./OptimizerSchemas");
// ---------
// Optimizer
// ---------
class Optimizer {
    constructor(parameters, options) {
        this.parameters = parameters;
        // --------------
        // State Tracking
        // --------------
        this.completedIterations = 0;
        this.opts = _.merge({
            printProgress: true,
        }, options);
        this.parameters = _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.1,
        }, this.parameters);
        this.optimizer = this.constructOptimizer();
    }
    minimize(lossFunc, vars) {
        return __awaiter(this, void 0, void 0, function* () {
            const losses = yield printer_1.printProgressAsync(printer => {
                return tasks_1.repeat(this.parameters.iterations - this.completedIterations, () => {
                    const lossTensor = this.optimizer.minimize(lossFunc, true, vars);
                    const loss = lossTensor.get();
                    lossTensor.dispose();
                    if (this.opts.printProgress)
                        printer(`${this.completedIterations}: ${loss}`);
                    this.completedIterations++;
                    return loss;
                });
            });
            return new History_1.History('', {}, losses);
        });
    }
    constructOptimizer() {
        if (this.parameters.type === 'adadelta') {
            return tf.train.adadelta(this.parameters.learningRate);
        }
        if (this.parameters.type === 'adagrad') {
            return tf.train.adagrad(this.parameters.learningRate);
        }
        if (this.parameters.type === 'rmsprop') {
            return tf.train.rmsprop(this.parameters.learningRate);
        }
        tsUtil_1.assertNever(this.parameters);
        throw new Error('Unexpected line reached');
    }
    fit(model, X, Y, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshRate = 100;
            const history = yield printer_1.printProgressAsync((printer) => __awaiter(this, void 0, void 0, function* () {
                const epochs = params.epochs;
                let cumulativeHistory;
                // this all sucks.. I'd much rather _not_ do this, but there is currently a major
                // memory leak in tfjs that is causing catastrophic slow downs of models that need
                // to run over many epochs. By splitting up the epochs like this, I manage to get
                // around that memory leak. One day, I hope that this will be appropriately fixed
                for (let i = this.completedIterations; i < epochs; i += refreshRate) {
                    const remainingEpochs = epochs - i;
                    const epochsToRun = remainingEpochs > refreshRate ? refreshRate : remainingEpochs;
                    const h = yield model.fit(X, Y, Object.assign({ batchSize: params.batchSize || arrays.getFirst(X).shape[0], yieldEvery: 'epoch' }, params, { epochs: epochsToRun, callbacks: [new tensorflow_1.LoggerCallback(printer, i), new tensorflow_1.EpochCounter(() => this.completedIterations++)] }));
                    if (!cumulativeHistory)
                        cumulativeHistory = h;
                    else
                        cumulativeHistory.history.loss = cumulativeHistory.history.loss.concat(h.history.loss);
                }
                return cumulativeHistory;
            }));
            return history;
        });
    }
    // ------------------
    // Saving and Loading
    // ------------------
    saveState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = {
                iterations: this.completedIterations,
                parameters: this.parameters,
            };
            yield files_1.writeJson(path.join(location, 'state.json'), state);
        });
    }
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const saveData = yield files_1.readJson(path.join(location, 'state.json'), SaveDataSchema);
            const optimizer = new Optimizer(saveData.parameters);
            optimizer.completedIterations = saveData.iterations;
            return optimizer;
        });
    }
    getTfOptimizer() {
        return this.optimizer;
    }
}
exports.Optimizer = Optimizer;
const SaveDataSchema = v.object({
    iterations: v.number(),
    parameters: OptimizerSchemas_1.OptimizationParametersSchema,
});
//# sourceMappingURL=Optimizer.js.map