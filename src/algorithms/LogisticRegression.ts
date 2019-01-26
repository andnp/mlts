import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import * as Optimizer from '../optimization/Optimizer';
import { RegularizerParametersSchema, regularizeLayer } from '../regularizers/regularizers';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const LogisticRegressionMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
}, { optional: ['regularizer'] });

export type LogisticRegressionMetaParameters = v.ValidType<typeof LogisticRegressionMetaParameterSchema>;

export class LogisticRegression extends SupervisedAlgorithm {
    readonly name = LogisticRegression.name;
    protected readonly opts: LogisticRegressionMetaParameters;
    protected model: tf.Model;

    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<LogisticRegressionMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
        }, opts);

        const model = tf.sequential();
        model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
        model.add(tf.layers.dense({
            units: this.datasetDescription.classes,
            activation: 'sigmoid',
            kernelRegularizer: this.opts.regularizer && regularizeLayer(this.opts.regularizer),
            name: 'W',
        }));
        this.model = model;
    }

    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);

        this.model.compile({
            optimizer: Optimizer.getTfOptimizer(o),
            loss: 'binaryCrossentropy',
        });

        return Optimizer.fit(this.model, X, Y, {
            batchSize: o.batchSize || X.shape[0],
            epochs: o.iterations,
            shuffle: true,
        });
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const Y_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat);
    }

    protected async _predict(X: tf.Tensor2D) {
        return this.model.predict(X) as tf.Tensor2D;
    }

    get W() { return this.model.getLayer('W').getWeights()[0]; }
    setW(W: tf.Tensor2D) {
        this.model.getLayer('W').setWeights([W]);
        return this;
    }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
