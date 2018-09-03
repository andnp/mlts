import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';

import { Matrix } from 'utils/matrix';
import { printProgress } from 'utils/printer';
import { DeepPartial } from 'simplytyped';

interface TrainOptions {
    learningRate: number;
    iterations: number;
}

interface TwoStageDictionaryLearningOptions {
    stage1: Partial<DictLayerOptions>;
}

export class TwoStageDictionaryLearning {
    private stage1: DictLayer;
    private stage2: WeightLayer;

    protected opts: TwoStageDictionaryLearningOptions;

    constructor(
        protected features: number,
        protected classes: number,
        protected hidden: number,
        protected samples: number,
        opts?: DeepPartial<TwoStageDictionaryLearningOptions>,
    ) {
        this.opts = _.merge({
            stage1: {}
        }, opts);

        this.stage1 = new DictLayer(this.features, this.hidden, this.samples, this.opts.stage1);
        this.stage2 = new WeightLayer(this.classes, this.hidden, this.samples);
    }

    private getDefaults(opts?: Partial<TrainOptions>) {
        return _.merge({
            learningRate: 2.0,
            iterations: 10,
        }, opts);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const s1_loss = this.stage1.loss(X);
        const s2_loss = this.stage2.loss(Y);
        return s1_loss.add(s2_loss);
    }

    train(X_dat: Matrix, Y_dat: Matrix, opts?: Partial<TrainOptions>) {
        const o = this.getDefaults(opts);

        const X = tf.tensor2d(X_dat.raw);
        const Y = tf.tensor2d(Y_dat.raw);

        this.stage1.train(X, { ...o, trainDictionary: true });
        this.stage2.setH(this.stage1.H);
        this.stage2.train(Y, o);
    }

    predict(T_dat: Matrix, opts?: Partial<TrainOptions>) {
        const o = this.getDefaults(opts);

        const stage3 = new DictLayer(T_dat.rows, this.hidden, T_dat.cols);

        const T = tf.tensor2d(T_dat.raw);
        stage3.train(T, {...o, trainDictionary: false});
        const Y_hat = this.stage2.predict(stage3.H).greater(tf.tensor(.5));
        return Y_hat.data().then(d => Matrix.fromArray(this.classes, T_dat.cols, d));
    }
}

interface DictLayerTrainOptions {
    trainDictionary: boolean;
}

interface DictLayerOptions {
    regularizer: 'l1';
    regD: number;
}

class DictLayer {
    private _D = tf.variable(tf.randomNormal<tf.Rank.R2>([this.features, this.hidden]));
    private _H = tf.variable(tf.randomNormal<tf.Rank.R2>([this.hidden, this.samples]));

    private opts: DictLayerOptions;

    private getDefaults(opts?: Partial<DictLayerOptions>): DictLayerOptions {
        return _.merge({
            regularizer: 'l1',
            regD: 0,
        }, opts);
    }

    constructor (
        private features: number,
        private hidden: number,
        private samples: number,
        opts?: Partial<DictLayerOptions>,
    ) {
        this.opts = this.getDefaults(opts);
    }

    loss = (X: tf.Tensor2D) => {
        const X_hat = tf.matMul(this.D, this.H);
        const mse = tf.losses.meanSquaredError(X, X_hat);
        const regD = tf.norm(this.D, 1).mul(tf.tensor(this.opts.regD));
        const loss: tf.Tensor<tf.Rank.R0> = mse.add(regD);
        return loss;
    }

    train(X: tf.Tensor2D, o: TrainOptions & DictLayerTrainOptions) {
        const optimizer = tf.train.adadelta(o.learningRate);

        const varList = o.trainDictionary
            ? [ this.D, this.H ]
            : [ this.H ];

        printProgress(printer => {
            for (let i = 0; i < o.iterations; ++i) {
                const lossTensor = optimizer.minimize(
                    _.partial(this.loss, X, o),
                    /* return cost */ true,
                    varList,
                );
                const loss = lossTensor!.get();
                if (i % 20 === 0) printer(loss);
            }
        });

    }

    get D() { return this._D; }
    get H() { return this._H; }
}

class WeightLayer {
    private _W = tf.variable(tf.randomNormal<tf.Rank.R2>([this.classes, this.hidden]));
    private _H = tf.variable(tf.randomNormal<tf.Rank.R2>([this.hidden, this.samples]));

    constructor (
        private classes: number,
        private hidden: number,
        private samples: number,
    ) {}

    loss = (Y: tf.Tensor2D) => {
        const Y_hat = this.predict(this.H);
        const loss: tf.Tensor<tf.Rank.R0> = tf.losses.sigmoidCrossEntropy(Y, Y_hat);
        return loss;
    }

    train(Y: tf.Tensor2D, o: TrainOptions) {
        const optimizer = tf.train.adadelta(o.learningRate);

        printProgress(printer => {
            for (let i = 0; i < o.iterations; ++i) {
                const lossTensor = optimizer.minimize(
                    _.partial(this.loss, Y),
                    /* return cost */ true,
                    /* var list */ [ this.W ],
                );
                const loss = lossTensor!.get();
                printer(loss);
            }
        });

    }

    predict(H: tf.Tensor2D) {
        return tf.sigmoid(tf.matMul(this.W, this.H));
    }

    get W() { return this._W; }
    get H() { return this._H; }
    setW(W: tf.Variable) {
        this._W.assign(W.as2D(this.classes, this.hidden));
        return this;
    }
    setH(H: tf.Variable) {
        this._H.assign(H.as2D(this.hidden, this.samples));
        return this;
    }
}
