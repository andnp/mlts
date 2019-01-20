import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import { Dataset } from 'mlts-experiment-data';
import { AnyFunc } from 'simplytyped';
import { BaseCallback } from '@tensorflow/tfjs-layers/dist/base_callbacks';
import { UnresolvedLogs } from '@tensorflow/tfjs-layers/dist/logs';

import * as random from './random';
import { csv, Matrix } from 'utilities-ts';
import { Printer } from './printer';
import { DataTensor } from 'mlts-experiment-data/dist/src/Data';
import { BufferType } from 'utilities-ts/src/buffers';

export function autoDispose<F extends AnyFunc>(f: F): F {
    const g = (...args: any[]) => {
        return tf.tidy(() => {
            return f(...args);
        });
    };

    return g as F;
}

const product = (arr: number[]) => arr.reduce((x, y) => x * y, 1);
export const dataToTensor2d = (m: DataTensor) => tf.tensor2d(m.data, [m.shape[0], product(m.shape.slice(1))]);

export const datasetToTFDataset = (dataset: Dataset) => {
    return {
        train: dataset.train.map(dataToTensor2d),
        test: dataset.test.map(dataToTensor2d),
    };
};

export async function writeTensorToCsv(location: string, tensor: tf.Tensor2D) {
    const buf = await tensor.data();
    return csv.writeCsv(location, new Matrix(getBufferConstructor(buf), { rows: tensor.shape[0], cols: tensor.shape[1] },  buf));
}

function getBufferConstructor<B extends BufferType>(buffer?: B): BufferConstructor {
    if (buffer instanceof Float32Array) return Float32Array;
    if (buffer instanceof Int32Array) return Int32Array;
    if (buffer instanceof Uint8Array) return Uint8Array;

    return Float32Array;
}


type BufferConstructor = Float32ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor;
export async function loadTensorFromCsv(location: string, shape: [number, number] , Buffer: BufferConstructor = Float32Array) {
    const buffer = new Buffer(shape[0] * shape[1]);
    const data = await csv.loadCsvToBuffer({
        buffer,
        path: location,
    });

    return tf.tensor2d(data, shape);
}

export function randomInitVariable(shape: [number, number]): tf.Variable<tf.Rank.R2> {
    const init = tf.initializers.glorotNormal({ seed: random.getIncrementingSeed() });
    return tf.variable(init.apply(shape)) as tf.Variable<tf.Rank.R2>;
}

export function randomSamples(X: tf.Tensor2D, numSamples: number) {
    const [rows] = X.shape;
    const sample = random.randomIndices(rows);

    const samples = [] as tf.Tensor2D[];
    for (let i = 0; i < numSamples; ++i) {
        const s = sample[i];
        samples.push(X.slice(s, 1));
    }

    return tf.concat2d(samples, 0);
}

export class LoggerCallback extends BaseCallback {
    private epoch: number = 0;
    private batch: number = 0;
    private trainingBegan: number = 0;
    constructor(private print: Printer, private startingEpoch = 0) {
        super();
    }
    async onBatchEnd(batch: number, logs?: UnresolvedLogs) {
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
        if (!this.trainingBegan) this.trainingBegan = Date.now();
    }

    async onEpochEnd() {
        this.epoch++;
    }
}

export class EpochCounter extends BaseCallback {
    constructor (private callback: () => void) {
        super();
    }
    async onEpochEnd() {
        this.callback();
    }
}
