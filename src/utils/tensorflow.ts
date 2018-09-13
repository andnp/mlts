import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import { AnyFunc } from 'simplytyped';
import { Data } from 'data/local/Data';
import { Matrix } from 'utils/matrix';
import { writeCsv, loadCsvToBuffer } from 'utils/csv';
import { BaseCallback } from '@tensorflow/tfjs-layers/dist/base_callbacks';
import { Printer } from './printer';
import { UnresolvedLogs } from '@tensorflow/tfjs-layers/dist/logs';

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
    return tf.variable(tf.randomNormal(shape));
}

export class LoggerCallback extends BaseCallback {
    constructor(private print: Printer) {
        super();
    }
    async onEpochEnd(epoch: number, logs?: UnresolvedLogs) {
        if (logs) {
            const lossTensor = logs.loss as tf.Tensor<tf.Rank.R0>;
            this.print(`${epoch}: ${lossTensor.get()}`);
        }
    }
}
