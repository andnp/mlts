import { arrays, tuple } from 'utilities-ts';
import { Dataset } from 'mlts-experiment-data';
import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import * as tfUtil from '../../utils/tensorflow';
import * as random from '../../utils/random';
import { Transformation } from '../../transformations/Transformation';

// TODO: consider that not all datasets will necessarily have in-sample and out-sample data
export class TensorflowDataset {
    private limitedSamples: number;
    private shouldStratify = false;

    constructor(
        protected _x: tf.Tensor2D,
        protected _y: tf.Tensor2D,
        protected _t: tf.Tensor2D,
        protected _ty: tf.Tensor2D,
    ) {
        this.limitedSamples = this._x.shape[0];
    }

    transpose = tfUtil.autoDispose(() => {
        return new TensorflowDataset(
            this._x.transpose(),
            this._y.transpose(),
            this._t.transpose(),
            this._ty.transpose(),
        );
    });

    oneHot = tfUtil.autoDispose((depth: number) => {
        if (this._y.shape[1] !== 1) throw new Error('Expected Y to have only one column');
        if (this._ty.shape[1] !== 1) throw new Error('Expected TY to have only one column');

        return new TensorflowDataset(
            this._x,
            tf.oneHot(this._y.asType('int32').as1D(), depth).asType('float32'),
            this._t,
            tf.oneHot(this._ty.asType('int32').as1D(), depth).asType('float32'),
        );
    });

    scaleColumns = tfUtil.autoDispose(() => {
        const joint = tf.concat([this._x, this._t]);
        const max = tf.max(joint, 0);
        const min = tf.min(joint, 0);

        const minMaxScale = (x: tf.Tensor2D) => tf.div(tf.sub(x, min), tf.sub(max, min)) as tf.Tensor2D;

        return new TensorflowDataset(
            minMaxScale(this._x),
            this._y,
            minMaxScale(this._t),
            this._ty,
        );
    });

    scaleByConstant = tfUtil.autoDispose((constant: number) => {
        return new TensorflowDataset(
            this._x.asType('float32').div(tf.scalar(constant, 'float32')),
            this._y,
            this._t.asType('float32').div(tf.scalar(constant, 'float32')),
            this._ty,
        );
    });

    async applyTransformation(transform: Transformation) {
        return transform.applyTransformation(this);
    }

    limitSamples(samples: number) {
        this.limitedSamples = samples;
        return this;
    }

    stratify() {
        this.shouldStratify = true;
        return this;
    }

    shuffle() {
        const indices = random.randomIndices(this._x.shape[0]);

        const x_split = [] as tf.Tensor2D[];
        const y_split = [] as tf.Tensor2D[];

        for (const i of indices) {
            x_split.push(this._x.slice(i, 1));
            y_split.push(this._y.slice(i, 1));
        }

        return new TensorflowDataset(
            tf.concat2d(x_split, 0),
            tf.concat2d(y_split, 0),
            this._t,
            this._ty,
        );
    }

    crossValidate(folds: number, index: number) {
        const bins = binSizes(this._x.shape[0], folds);

        const [X, Y] = this.shouldStratify
            ? this.roundRobin()
            : [this._x, this._y];

        const x = X.split(bins);
        const y = Y.split(bins);

        return new TensorflowDataset(
            tf.concat2d(arrays.leaveOut(x, index), 0),
            tf.concat2d(arrays.leaveOut(y, index), 0),
            x[index],
            y[index],
        );
    }

    get train() {
        const [X, Y] = this.shouldStratify
            ? this.roundRobin()
            : [this._x, this._y];
        const x = tf.tidy(() => X.slice(0, this.limitedSamples));
        const y = tf.tidy(() => Y.slice(0, this.limitedSamples));
        return tuple(x, y);
    }

    get test() {
        return tuple(this._t, this._ty);
    }

    get features() { return this._x.shape[1]; }
    get samples() { return this.limitedSamples; }
    get classes() { return this._y.shape[1]; }
    get testSamples() { return this._t.shape[0]; }

    description() {
        return {
            samples: this.samples,
            features: this.features,
            classes: this.classes,
            testSamples: this.testSamples,
        };
    }

    static fromDataset(dataset: Dataset): TensorflowDataset {
        return new TensorflowDataset(
            tfUtil.dataToTensor2d(dataset.train[0]),
            tfUtil.dataToTensor2d(dataset.train[1]),
            tfUtil.dataToTensor2d(dataset.test[0]),
            tfUtil.dataToTensor2d(dataset.test[1]),
        );
    }

    static async load(): Promise<TensorflowDataset> {
        throw new Error('Should implement the static "load" method for all datasets extending TensorflowDataset');
    }

    private roundRobin = tfUtil.autoDispose(() => {
        const classBins: Array<Array<[tf.Tensor2D, tf.Tensor2D]>> = _.times(this.classes, () => []);

        const samples = this._x.shape[0];
        for (let i = 0; i < samples; ++i) {
            const x = this._x.slice(i, 1);
            const y = this._y.slice(i, 1);

            const c = tf.argMax(y, 1).get(0);

            classBins[c].push([x, y]);
        }

        const X = [] as tf.Tensor2D[];
        const Y = [] as tf.Tensor2D[];
        for (let i = 0; i < samples; ++i) {
            let c = i % this.classes;

            if (classBins[c].length === 0) {
                for (let j = 1; j < this.classes; ++j) {
                    const cp = (c + j) % this.classes;
                    if (classBins[cp].length === 0) continue;

                    c = cp;
                    break;
                }
            }

            const [x, y] = classBins[c].pop()!;

            X.push(x);
            Y.push(y);
        }

        return tuple(
            tf.concat2d(X, 0),
            tf.concat2d(Y, 0),
        );
    });
}

function binSizes(t: number, k: number) {
    let a = 0;
    return _.times(k, i => {
        if (i === k - 1) return t - a;

        const s = Math.floor(t / k);
        a += s;
        return s;
    });
}
