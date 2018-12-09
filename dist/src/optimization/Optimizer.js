"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const v = require("validtyped");
const path = require("path");
const utilities_ts_1 = require("utilities-ts");
const printer_1 = require("../utils/printer");
const tasks_1 = require("../utils/tasks");
const utilities_ts_2 = require("utilities-ts");
const History_1 = require("../analysis/History");
const tensorflow_1 = require("../utils/tensorflow");
const OptimizerSchemas_1 = require("./OptimizerSchemas");
const base_callbacks_1 = require("@tensorflow/tfjs-layers/dist/base_callbacks");
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
    async minimize(lossFunc, vars) {
        const losses = await printer_1.printProgressAsync(printer => {
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
        utilities_ts_2.assertNever(this.parameters);
        throw new Error('Unexpected line reached');
    }
    async fit(model, X, Y, params) {
        const history = await printer_1.printProgressAsync(async (printer) => {
            const epochs = params.epochs - this.completedIterations;
            return model.fit(X, Y, {
                batchSize: params.batchSize || utilities_ts_1.arrays.getFirst(X).shape[0],
                yieldEvery: 'epoch',
                ...params,
                epochs,
                callbacks: [new tensorflow_1.LoggerCallback(printer, this.completedIterations), new tensorflow_1.EpochCounter(() => this.completedIterations++)],
                verbose: base_callbacks_1.ModelLoggingVerbosity.SILENT,
            });
        });
        return history;
    }
    // ------------------
    // Saving and Loading
    // ------------------
    reset() {
        this.completedIterations = 0;
    }
    async saveState(location) {
        const state = {
            iterations: this.completedIterations,
            parameters: this.parameters,
        };
        await utilities_ts_2.files.writeJson(path.join(location, 'state.json'), state);
    }
    static async fromSavedState(location) {
        const saveData = await utilities_ts_2.files.readJson(path.join(location, 'state.json'), SaveDataSchema);
        const optimizer = new Optimizer(saveData.parameters);
        optimizer.completedIterations = saveData.iterations;
        return optimizer;
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