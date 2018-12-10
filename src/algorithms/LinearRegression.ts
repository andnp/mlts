import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { RegularizerParametersSchema, regularizeLayer } from '../regularizers/regularizers';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const LinearRegressionMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
    initialParameters: v.object({
        mean: v.number(),
        stddev: v.number(),
    }),
}, { optional: [ 'initialParameters', 'regularizer' ]});

export type LinearRegressionMetaParameters = v.ValidType<typeof LinearRegressionMetaParameterSchema>;

export class LinearRegression extends SupervisedAlgorithm {
    protected readonly name = LinearRegression.name;
    protected readonly opts: LinearRegressionMetaParameters;
    readonly model: tf.Model;

    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<LinearRegressionMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            initialParameters: { mean: 0, variance: 1 },
        }, opts);

        const model = tf.sequential();
        model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
        model.add(tf.layers.dense({
            units: this.datasetDescription.classes,
            kernelInitializer: tf.initializers.randomNormal({ ...this.opts.initialParameters }),
            activation: 'linear',
            kernelRegularizer: this.opts.regularizer && regularizeLayer(this.opts.regularizer),
            name: 'W',
        }));

        this.model = model;
    }

    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        const optimizer = new Optimizer(o);

        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        return optimizer.fit(this.model, X, Y, {
            batchSize: o.batchSize || X.shape[0],
            epochs: o.iterations,
            shuffle: true,
        });
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const Y_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.meanSquaredError(Y, Y_hat);
    }

    protected async _predict(X: tf.Tensor2D) {
        return this.model.predict(X) as tf.Tensor2D;
    }

    get W() { return this.model.getLayer('W').getWeights()[0] as tf.Tensor2D; }
    set W(w: tf.Tensor2D) { this.model.getLayer('W').setWeights([w, this.model.getLayer('W').getWeights()[1]]); }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
