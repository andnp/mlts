import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { autoDispose, randomInitVariable } from '../utils/tensorflow';
import { regularize, RegularizerParametersSchema } from '../regularizers/regularizers';
import { SupervisedDictionaryLearningDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const SupervisedDictionaryLearningMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
    hidden: v.number(),
});

export type SupervisedDictionaryLearningMetaParameters = v.ValidType<typeof SupervisedDictionaryLearningMetaParameterSchema>;

export class SupervisedDictionaryLearning extends Algorithm {
    protected readonly name = SupervisedDictionaryLearning.name;
    protected readonly opts: SupervisedDictionaryLearningMetaParameters;

    constructor (
        protected datasetDescription: SupervisedDictionaryLearningDatasetDescription,
        opts?: Partial<SupervisedDictionaryLearningMetaParameters>,
        saveLocation = 'savedModels',
    ) {
        super(datasetDescription, saveLocation);
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            hidden: 2,
        }, opts);
    }

    async _build() {
        this.registerParameter('W', () => randomInitVariable([this.datasetDescription.classes, this.opts.hidden]));
        this.registerParameter('H', () => randomInitVariable([this.opts.hidden, this.datasetDescription.samples]));
        this.registerParameter('D', () => randomInitVariable([this.datasetDescription.features, this.opts.hidden]));
    }

    loss = autoDispose((X: tf.Tensor2D, Y: tf.Tensor2D) => {
        const Y_hat = tf.sigmoid(tf.matMul(this.W, this.H));
        const X_hat = tf.matMul(this.D, this.H);
        const y_loss: tf.Tensor<tf.Rank.R0> = tf.losses.sigmoidCrossEntropy(Y.transpose(), Y_hat);
        const x_loss: tf.Tensor<tf.Rank.R0> = tf.losses.meanSquaredError(X.transpose(), X_hat);
        const reg = regularize(this.opts.regularizer, this.W);
        return y_loss.add(x_loss).add(reg);
    });

    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters) {
        const optimizer = this.registerOptimizer('opt', () => new Optimizer(this.getDefaultOptimizerParameters(o)));

        const { W, D, H } = this.assertParametersExist(['W', 'H', 'D']);
        return optimizer.minimize(_.partial(this.loss, X, Y), [ W, D, H ]);
    }

    protected async _predict(X: tf.Tensor2D, o?: Partial<OptimizationParameters>) {
        const optimizer = new Optimizer(this.getDefaultOptimizerParameters(o));

        const H_test = (X.shape[0] === this.datasetDescription.samples)
            ? this.H
            : randomInitVariable([this.opts.hidden, X.shape[0]]);

        await optimizer.minimize(() => {
            const X_hat = tf.matMul(this.D, H_test);
            return tf.losses.meanSquaredError(X.transpose(), X_hat);
        }, [ H_test ]);

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

    static async fromSavedState(location: string) {
        return new SupervisedDictionaryLearning({} as SupervisedDictionaryLearningDatasetDescription).loadFromDisk(location);
    }

    get W() { return this.assertParametersExist(['W']).W; }
    get H() { return this.assertParametersExist(['H']).H; }
    get D() { return this.assertParametersExist(['D']).D; }
}
