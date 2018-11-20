import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { RegularizerParametersSchema, regularizeLayer } from '../regularizers/regularizers';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const LinearRegressionMetaParameterSchema = v.object({
    regularizer: RegularizerParametersSchema,
    initialParameters: v.object({
        mean: v.number(),
        stddev: v.number(),
    }),
}, { optional: [ 'initialParameters' ]});

export type LinearRegressionMetaParameters = v.ValidType<typeof LinearRegressionMetaParameterSchema>;

export class LinearRegression extends Algorithm {
    protected readonly name = LinearRegression.name;
    protected readonly opts: LinearRegressionMetaParameters;

    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<LinearRegressionMetaParameters>,
        saveLocation = 'savedModels',
    ) {
        super(datasetDescription, saveLocation);
        this.opts = _.merge({
            regularizer: { type: 'l1', weight: 0 },
            initialParameters: { mean: 0, variance: 1 },
        }, opts);
    }

    protected async _build() {
        this.registerModel('model', () => {
            const model = tf.sequential();
            model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
            model.add(tf.layers.dense({
                units: this.datasetDescription.classes,
                kernelInitializer: tf.initializers.randomNormal({ ...this.opts.initialParameters }),
                activation: 'linear',
                kernelRegularizer: regularizeLayer(this.opts.regularizer),
                name: 'W',
            }));
            return model;
        });
    }

    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        const optimizer = this.registerOptimizer('optimizer', () => new Optimizer(o));

        this.getModel().compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        const history = await optimizer.fit(this.getModel(), X, Y, {
            batchSize: o.batchSize || X.shape[0],
            epochs: o.iterations,
            shuffle: true,
        });

        this.clearOptimizer('optimizer');

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const Y_hat = this.getModel().predict(X) as tf.Tensor2D;
        return tf.losses.meanSquaredError(Y, Y_hat);
    }

    protected async _predict(X: tf.Tensor2D) {
        return this.getModel().predict(X) as tf.Tensor2D;
    }

    static async fromSavedState(location: string) {
        return new LinearRegression({} as SupervisedDatasetDescription).loadFromDisk(location);
    }

    get W() { return this.getModel().getLayer('W').getWeights()[0] as tf.Tensor2D; }
    set W(w: tf.Tensor2D) { this.getModel().getLayer('W').setWeights([w, this.getModel().getLayer('W').getWeights()[1]]); }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
