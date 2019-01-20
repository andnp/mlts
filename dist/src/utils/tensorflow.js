"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const base_callbacks_1 = require("@tensorflow/tfjs-layers/dist/base_callbacks");
const random = require("./random");
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
const product = (arr) => arr.reduce((x, y) => x * y, 1);
exports.dataToTensor2d = (m) => tf.tensor2d(m.data, [m.shape[0], product(m.shape.slice(1))]);
exports.datasetToTFDataset = (dataset) => {
    return {
        train: dataset.train.map(exports.dataToTensor2d),
        test: dataset.test.map(exports.dataToTensor2d),
    };
};
async function writeTensorToCsv(location, tensor) {
    const buf = await tensor.data();
    return utilities_ts_1.csv.writeCsv(location, new utilities_ts_1.Matrix(getBufferConstructor(buf), { rows: tensor.shape[0], cols: tensor.shape[1] }, buf));
}
exports.writeTensorToCsv = writeTensorToCsv;
function getBufferConstructor(buffer) {
    if (buffer instanceof Float32Array)
        return Float32Array;
    if (buffer instanceof Int32Array)
        return Int32Array;
    if (buffer instanceof Uint8Array)
        return Uint8Array;
    return Float32Array;
}
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
    const init = tf.initializers.glorotNormal({ seed: random.getIncrementingSeed() });
    return tf.variable(init.apply(shape));
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