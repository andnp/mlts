import * as tf from '@tensorflow/tfjs';
import { Dataset, Data } from 'data/local/Data';
import { tuple } from 'utils/tsUtil';
import * as tfUtil from 'utils/tensorflow';

export class TensorflowDataset implements Dataset<tf.Tensor2D> {
    constructor(
        protected _x: tf.Tensor2D,
        protected _y: tf.Tensor2D,
        protected _t: tf.Tensor2D,
        protected _ty: tf.Tensor2D,
    ) {}

    transpose = tfUtil.autoDispose(() => {
        this._x = this._x.transpose();
        this._y = this._y.transpose();
        this._t = this._t.transpose();
        this._ty = this._ty.transpose();

        return this;
    });

    oneHot = tfUtil.autoDispose((depth: number) => {
        if (this._y.shape[1] !== 1) throw new Error('Expected Y to have only one column');
        if (this._ty.shape[1] !== 1) throw new Error('Expected TY to have only one column');

        this._y = tf.oneHot(this._y.asType('int32').as1D(), depth);
        this._ty = tf.oneHot(this._ty.asType('int32').as1D(), depth);

        return this;
    });

    get train() {
        return tuple(this._x, this._y);
    }

    get test() {
        return tuple(this._t, this._ty);
    }

    static fromDataset(dataset: Data): TensorflowDataset {
        return new TensorflowDataset(
            tfUtil.matrixToTensor(dataset.train[0]),
            tfUtil.matrixToTensor(dataset.train[1]),
            tfUtil.matrixToTensor(dataset.test[0]),
            tfUtil.matrixToTensor(dataset.test[1]),
        );
    }
}
