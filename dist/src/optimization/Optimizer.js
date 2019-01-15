"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const printer_1 = require("../utils/printer");
const tasks_1 = require("../utils/tasks");
const utilities_ts_2 = require("utilities-ts");
const tensorflow_1 = require("../utils/tensorflow");
const base_callbacks_1 = require("@tensorflow/tfjs-layers/dist/base_callbacks");
// ---------
// Optimizer
// ---------
function getDefaultParameters(opt) {
    const defaultParams = {
        iterations: 100,
        type: 'rmsprop',
        learningRate: 0.001,
    };
    return _.merge(defaultParams, opt);
}
exports.getDefaultParameters = getDefaultParameters;
function getDefaultOptions(opt) {
    const defaultOpt = {
        printProgress: true,
    };
    return _.merge(defaultOpt, opt);
}
exports.getDefaultOptions = getDefaultOptions;
function getTfOptimizer(opt) {
    const o = getDefaultParameters(opt);
    if (o.type === 'adadelta')
        return tf.train.adadelta(o.learningRate, o.rho, o.epsilon);
    if (o.type === 'adagrad')
        return tf.train.adagrad(o.learningRate);
    if (o.type === 'rmsprop')
        return tf.train.rmsprop(o.learningRate);
    throw utilities_ts_2.assertNever(o, 'Unexpected optimizer found');
}
exports.getTfOptimizer = getTfOptimizer;
async function minimize(lossFunc, params, vars, opt) {
    const p = getDefaultParameters(params);
    const o = getDefaultOptions(opt);
    const optimizer = getTfOptimizer(p);
    let completedIterations = 0;
    return printer_1.printProgressAsync(printer => {
        return tasks_1.repeat(p.iterations, () => {
            const lossTensor = optimizer.minimize(lossFunc, true, vars);
            const loss = lossTensor.get();
            lossTensor.dispose();
            if (o.printProgress)
                printer(`${completedIterations}: ${loss}`);
            completedIterations += 1;
            return loss;
        });
    });
}
exports.minimize = minimize;
async function fit(model, X, Y, params) {
    const history = await printer_1.printProgressAsync(async (printer) => {
        const callbacks = Array.isArray(params.callbacks) ? params.callbacks : [];
        return model.fit(X, Y, {
            batchSize: params.batchSize || utilities_ts_1.arrays.getFirst(X).shape[0],
            yieldEvery: 'epoch',
            ...params,
            callbacks: [new tensorflow_1.LoggerCallback(printer), ...callbacks],
            verbose: base_callbacks_1.ModelLoggingVerbosity.SILENT,
        });
    });
    return history;
}
exports.fit = fit;
//# sourceMappingURL=Optimizer.js.map