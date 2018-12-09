"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const base_callbacks_1 = require("@tensorflow/tfjs-layers/dist/base_callbacks");
const random = require("./random");
const matrix_1 = require("./matrix");
const utilities_ts_1 = require("utilities-ts");
function autoDispose(f) {
    const g = (...args) => {
        return tf.tidy(() => {
            return f(...args);
        });
    };
    return g;
}
exports.autoDispose = autoDispose;
exports.matrixToTensor = (m) => tf.tensor2d(m.raw, [m.rows, m.cols]);
exports.datasetToTFDataset = (dataset) => {
    return {
        train: dataset.train.map(exports.matrixToTensor),
        test: dataset.test.map(exports.matrixToTensor),
    };
};
async function writeTensorToCsv(location, tensor) {
    const buf = await tensor.data();
    return utilities_ts_1.csv.writeCsv(location, new matrix_1.Matrix(tensor.shape[0], tensor.shape[1], buf));
}
exports.writeTensorToCsv = writeTensorToCsv;
async function loadTensorFromCsv(location, shape, Buffer = Float32Array) {
    const buffer = new Buffer(shape[0] * shape[1]);
    const data = await utilities_ts_1.csv.loadCsvToBuffer({
        buffer,
        path: location,
    });
    return tf.tensor2d(data, shape);
}
exports.loadTensorFromCsv = loadTensorFromCsv;
function randomInitVariable(shape) {
    return tf.variable(tf.randomNormal(shape, 0, 1, 'float32', random.getIncrementingSeed()));
}
exports.randomInitVariable = randomInitVariable;
function randomSamples(X, numSamples) {
    const [rows] = X.shape;
    const sample = random.randomIndices(rows);
    const samples = [];
    for (let i = 0; i < numSamples; ++i) {
        const s = sample[i];
        samples.push(X.slice(s, 1));
    }
    return tf.concat2d(samples, 0);
}
exports.randomSamples = randomSamples;
class LoggerCallback extends base_callbacks_1.BaseCallback {
    constructor(print, startingEpoch = 0) {
        super();
        this.print = print;
        this.startingEpoch = startingEpoch;
        this.epoch = 0;
        this.batch = 0;
        this.trainingBegan = 0;
    }
    async onBatchEnd(batch, logs) {
        if (logs) {
            const keys = Object.keys(logs);
            const logValues = keys.filter(k => k !== 'batch' && k !== 'size').map(key => {
                const log = logs[key];
                const value = log instanceof tf.Tensor
                    ? log.get()
                    : log;
                return { name: key, value };
            });
            const avgTimePerBatch = Math.round((Date.now() - this.trainingBegan) / (this.batch + 1));
            const printStr = logValues.map(v => `${v.name.substr(-4)}: ${v.value.toPrecision(4)}`).join(' ');
            const epoch = this.epoch + this.startingEpoch;
            this.print(`${epoch}- ${printStr} atpb: ${avgTimePerBatch}`);
            this.batch++;
        }
    }
    async onEpochBegin() {
        if (!this.trainingBegan)
            this.trainingBegan = Date.now();
    }
    async onEpochEnd() {
        this.epoch++;
    }
}
exports.LoggerCallback = LoggerCallback;
class EpochCounter extends base_callbacks_1.BaseCallback {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    async onEpochEnd() {
        this.callback();
    }
}
exports.EpochCounter = EpochCounter;
//# sourceMappingURL=tensorflow.js.map