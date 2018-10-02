import * as tf from '@tensorflow/tfjs';
import { Dataset, Data } from '../local/Data';
import { tuple } from '../../utils/tsUtil';
import * as tfUtil from '../../utils/tensorflow';
import { Transformation } from '../../transformations/Transformation';

// TODO: consider that not all datasets will necessarily have in-sample and out-sample data
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

        this._y = tf.oneHot(this._y.asType('int32').as1D(), depth).asType('float32');
        this._ty = tf.oneHot(this._ty.asType('int32').as1D(), depth).asType('float32');

        return this;
    });

    scaleColumns = tfUtil.autoDispose(() => {
        const joint = tf.concat([this._x, this._t]);
        const max = tf.max(joint, 0);
        const min = tf.min(joint, 0);

        const minMaxScale = (x: tf.Tensor2D) => tf.div(tf.sub(x, min), tf.sub(max, min)) as tf.Tensor2D;

        this._x = minMaxScale(this._x);
        this._t = minMaxScale(this._t);

        return this;
    });

    scaleByConstant = tfUtil.autoDispose((constant: number) => {
        this._x = this._x.asType('float32').div(tf.scalar(constant, 'float32'));
        this._t = this._t.asType('float32').div(tf.scalar(constant, 'float32'));
        return this;
    });

    async applyTransformation(transform: Transformation) {
        const newData = await transform.applyTransformation(this);

        this._x = newData._x;
        this._y = newData._y;
        this._t = newData._t;
        this._ty = newData._ty;

        return this;
    }

    get train() {
        return tuple(this._x, this._y);
    }

    get test() {
        return tuple(this._t, this._ty);
    }

    get features() { return this._x.shape[1]; }
    get samples() { return this._x.shape[0]; }
    get classes() { return this._y.shape[1]; }
    get testSamples() { return this._t.shape[0]; }

    static fromDataset(dataset: Data): TensorflowDataset {
        return new TensorflowDataset(
            tfUtil.matrixToTensor(dataset.train[0]),
            tfUtil.matrixToTensor(dataset.train[1]),
            tfUtil.matrixToTensor(dataset.test[0]),
            tfUtil.matrixToTensor(dataset.test[1]),
        );
    }

    static async load(): Promise<TensorflowDataset> {
        throw new Error('Should implement the static "load" method for all datasets extending TensorflowDataset');
    }
}
