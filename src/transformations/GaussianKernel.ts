import * as v from 'validtyped';
import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'utilities-ts';

import * as tfUtils from '../utils/tensorflow';
import { Transformation } from '../transformations/Transformation';
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';

export class GaussianKernelTransformation extends Transformation {
    constructor(private params: GaussianKernelParameters) {
        super();
    }
    async applyTransformation(data: TensorflowDataset) {
        const [X, Y] = data.train;
        const [T, TY] = data.test;

        const S = tfUtils.randomSamples(X, this.params.centers);

        const overlap = this.params.overlap || 1;

        const bandwidths = getBandwidths(S, overlap);

        const transformed_X = transformGaussian(X, S, bandwidths);
        const transformed_T = transformGaussian(T, S, bandwidths);

        return new TensorflowDataset(transformed_X, Y, transformed_T, TY);
    }

    async transformTensor(X: tf.Tensor2D) {
        const S = tfUtils.randomSamples(X, this.params.centers);

        const overlap = this.params.overlap || 1;

        const bandwidths = getBandwidths(S, overlap);

        return transformGaussian(X, S, bandwidths);
    }
}

function transformGaussian(X: tf.Tensor2D, C: tf.Tensor2D, bandwidths: tf.Tensor1D) {
    const centers = C.shape[0];
    const rows = X.shape[0];
    const m = new Matrix(Float32Array, { rows, cols: centers});
    for (let i = 0; i < X.shape[0]; ++i) {
        tf.tidy(() => {
            const row = X.slice(i, 1);
            const d = C.sub(row).norm(2, 1);
            const s = tf.mul(bandwidths.pow(tf.tensor(2)), 2.0);
            const n = tf.div(d, s);
            const e = tf.exp(n.neg());
            for (let j = 0; j < centers; ++j) {
                m.set(i, j, e.get(j));
            }
        });
    }
    return tf.tensor2d(m.raw, [m.rows, m.cols]);
}

function getBandwidths(X: tf.Tensor2D, overlap: number) {
    const [rows] = X.shape;

    const bandwidths = [] as number[];
    for (let i = 0; i < rows; ++i) {
        tf.tidy(() => {
            const row = X.slice(i, 1);
            const distances = X.sub(row).norm(2, 1);
            const { values } = distances.neg().topk(2, true);

            // the absolute closest row is itself.
            // so we get the next closest instead
            const closestValue = values.neg().get(1);
            bandwidths.push(closestValue * overlap);
        });
    }

    return tf.tensor1d(bandwidths);
}

export const GaussianKernelParametersSchema = v.object({
    type: v.string(['GaussianKernel']),
    centers: v.number(),
    overlap: v.number(),
}, { optional: ['overlap'] });

export type GaussianKernelParameters = v.ValidType<typeof GaussianKernelParametersSchema>;
