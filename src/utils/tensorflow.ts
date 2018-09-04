import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import { AnyFunc } from 'simplytyped';
import { Data } from 'data/local/Data';
import { Matrix } from 'utils/matrix';

export function autoDispose<F extends AnyFunc>(f: F): F {
    const g = (...args: any[]) => {
        return tf.tidy(() => {
            return f(...args);
        });
    };

    return g as F;
}

export const oneHotDataset = autoDispose((dataset: Data) => {
    const [X, Y] = dataset.train;
    const [T, TY] = dataset.test;

    const transformedY = new Matrix(Y.rows, 1, tf.oneHot(Y.raw, 10).dataSync());
    const transformedTY = new Matrix(TY.rows, 1, tf.oneHot(TY.raw, 10).dataSync());

    return new Data(X, transformedY, T, transformedTY);
});

export const transposeDataset = autoDispose((dataset: Data) => {
    const data = dataset.train.concat(dataset.test);

    const transposed = data.map(d => tf.tensor2d(d.raw, [d.rows, d.cols]).transpose());

    return {
        train: [ transposed[0], transposed[1] ],
        test:  [ transposed[2], transposed[3] ],
    };
});

export const matrixToTensor = (m: Matrix) => tf.tensor2d(m.raw, [ m.rows, m.cols ]);

export const datasetToTFDataset = (dataset: Data) => {
    return {
        train: dataset.train.map(matrixToTensor),
        test: dataset.test.map(matrixToTensor),
    };
};
