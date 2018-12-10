import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { LayerMetaParametersSchema, constructTFNetwork } from '../algorithms/utils/layers';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const ANNMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
    loss: v.string(['binaryCrossentropy', 'meanSquaredError']),
}, { optional: ['loss'] });

export type ANNMetaParameters = v.ValidType<typeof ANNMetaParameterSchema>;

export class ANN extends SupervisedAlgorithm {
    protected readonly name = ANN.name;
    protected readonly opts: ANNMetaParameters;
    readonly model: tf.Model;

    // ----------------
    // Model Definition
    // ----------------
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<ANNMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            loss: 'binaryCrossentropy',
        }, opts);

        const inputs = tf.layers.input({ shape: [this.datasetDescription.features ] });

        const network = constructTFNetwork(this.opts.layers, inputs);

        const outputType =
            this.opts.loss === 'binaryCrossentropy' ? 'sigmoid' :
            this.opts.loss === 'meanSquaredError' ? 'linear' :
            'sigmoid';

        const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: outputType, name: 'out_y' }).apply(_.last(network)!) as tf.SymbolicTensor;

        this.model = tf.model({
            inputs: [inputs],
            outputs: [outputs_y],
        });
    }

    summary() {
        this.model.summary(72);
    }

    // --------
    // Training
    // --------
    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        const optimizer = new Optimizer(o);

        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: this.opts.loss!,
        });

        return optimizer.fit(this.model, X, Y, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const Y_hat = this.model.predict(X) as tf.Tensor2D;
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat);
    }

    protected async _predict(X: tf.Tensor2D) {
        const Y_hat = this.model.predictOnBatch(X) as tf.Tensor2D;
        return Y_hat;
    }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'rmsprop',
            learningRate: 0.001,
        }, o);
    }

    // -----------------
    // Utility Functions
    // -----------------
    static async fromANN(ann: ANN, opts?: Partial<FromANNOptions>) {
        const o = _.merge({
            keepWeights: false,
            newOutputSize: ann.datasetDescription.classes,
            retrain: true,
        }, opts);

        const description = { ...ann.datasetDescription, classes: o.newOutputSize };

        const ann2 = new ANN(description, ann.opts);

        if (!o.keepWeights) return ann2;

        const oldModel = ann.model;
        const newModel = ann2.model;
        const layers = oldModel.layers;

        const length = o.newOutputSize !== ann.datasetDescription.classes
            ? layers.length - 1
            : layers.length;

        for (let i = 0; i < length; ++i) {
            const layer = newModel.getLayer(undefined, i);
            layer.setWeights(layers[i].getWeights());
            layer.trainable = o.retrain;
        }

        return ann2;
    }
}

interface FromANNOptions {
    keepWeights: boolean;
    newOutputSize: number;
    retrain: boolean;
}
