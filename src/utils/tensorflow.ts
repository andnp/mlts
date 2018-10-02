import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import { AnyFunc } from 'simplytyped';
import { BaseCallback } from '@tensorflow/tfjs-layers/dist/base_callbacks';
import { UnresolvedLogs } from '@tensorflow/tfjs-layers/dist/logs';

import * as random from './random';
import { Data } from '../data/local/Data';
import { Matrix } from './matrix';
import { writeCsv, loadCsvToBuffer } from './csv';
import { Printer } from './printer';

export function autoDispose<F extends AnyFunc>(f: F): F {
    const g = (...args: any[]) => {
        return tf.tidy(() => {
            return f(...args);
        });
    };

    return g as F;
}

export const matrixToTensor = (m: Matrix) => tf.tensor2d(m.raw, [ m.rows, m.cols ]);

export const datasetToTFDataset = (dataset: Data) => {
    return {
        train: dataset.train.map(matrixToTensor),
        test: dataset.test.map(matrixToTensor),
    };
};

export async function writeTensorToCsv(location: string, tensor: tf.Tensor2D) {
    const buf = await tensor.data();
    return writeCsv(location, new Matrix(tensor.shape[0], tensor.shape[1], buf));
}

type BufferConstructor = Float32ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor;
export async function loadTensorFromCsv(location: string, shape: [number, number] , Buffer: BufferConstructor = Float32Array) {
    const buffer = new Buffer(shape[0] * shape[1]);
    const data = await loadCsvToBuffer({
        buffer,
        path: location,
    });

    return tf.tensor2d(data, shape);
}

export function randomInitVariable(shape: [number, number]): tf.Variable<tf.Rank.R2> {
    return tf.variable(tf.randomNormal(shape, 0, 1, 'float32', random.getIncrementingSeed()));
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

            const avgTimePerBatch = Math.round((Date.now() - this.trainingBegan) / (batch + 1));
            const printStr = logValues.map(v => `${v.name.substr(-4)}: ${v.value.toPrecision(4)}`).join(' ');

            const epoch = this.epoch + this.startingEpoch;
            this.print(`${epoch}- ${printStr} atpb: ${avgTimePerBatch}`);
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
