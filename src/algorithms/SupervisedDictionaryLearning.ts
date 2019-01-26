import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import * as Optimizer from '../optimization/Optimizer';
import { autoDispose, randomInitVariable } from '../utils/tensorflow';
import { regularize, RegularizerParametersSchema } from '../regularizers/regularizers';
import { SupervisedDictionaryLearningDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { History } from '../analysis';

export const SupervisedDictionaryLearningMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
    hidden: v.number(),
});

export type SupervisedDictionaryLearningMetaParameters = v.ValidType<typeof SupervisedDictionaryLearningMetaParameterSchema>;

export class SupervisedDictionaryLearning extends SupervisedAlgorithm {
    readonly name = SupervisedDictionaryLearning.name;
    protected readonly opts: SupervisedDictionaryLearningMetaParameters;

    readonly w = randomInitVariable([this.datasetDescription.classes, this.opts.hidden]);
    readonly h = randomInitVariable([this.opts.hidden, this.datasetDescription.samples]);
    readonly d = randomInitVariable([this.datasetDescription.features, this.opts.hidden]);

    constructor (
        protected datasetDescription: SupervisedDictionaryLearningDatasetDescription,
        opts?: Partial<SupervisedDictionaryLearningMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            hidden: 2,
        }, opts);
    }

    loss = autoDispose((X: tf.Tensor2D, Y: tf.Tensor2D) => {
        const Y_hat = tf.sigmoid(tf.matMul(this.W, this.H));
        const X_hat = tf.matMul(this.D, this.H);
        const y_loss: tf.Tensor<tf.Rank.R0> = tf.losses.sigmoidCrossEntropy(Y.transpose(), Y_hat);
        const x_loss: tf.Tensor<tf.Rank.R0> = tf.losses.meanSquaredError(X.transpose(), X_hat);
        const reg = regularize(this.opts.regularizer, this.W);
        return y_loss.add(x_loss).add(reg);
    });

    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: OptimizationParameters) {
        const o = this.getDefaultOptimizerParameters(opts);

        const loss = await Optimizer.minimize(_.partial(this.loss, X, Y), o, [ this.W, this.D, this.H ]);

        return new History(this.name, this.opts, loss);
    }

    protected async _predict(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizerParameters(opts);

        const H_test = (X.shape[0] === this.datasetDescription.samples)
            ? this.H
            : randomInitVariable([this.opts.hidden, X.shape[0]]);

        await Optimizer.minimize(() => {
            const X_hat = tf.matMul(this.D, H_test);
            return tf.losses.meanSquaredError(X.transpose(), X_hat);
        }, o, [ H_test ]);

        return tf.tidy(() => {
            return tf.sigmoid(tf.matMul(this.W, H_test)).transpose();
        });
    }

    getDefaultOptimizerParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 1000,
            type: 'adadelta',
            learningRate: 1.0,
        }, o);
    }

    get W() { return this.w; }
    get H() { return this.h; }
    get D() { return this.d; }
}
