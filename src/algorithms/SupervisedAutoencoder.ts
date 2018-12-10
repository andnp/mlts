import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { arrays } from 'utilities-ts';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { LayerMetaParametersSchema, constructTFNetwork } from '../algorithms/utils/layers';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const SupervisedAutoencoderMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
});

export type SupervisedAutoencoderMetaParameters = v.ValidType<typeof SupervisedAutoencoderMetaParameterSchema>;

export class SupervisedAutoencoder extends SupervisedAlgorithm implements RepresentationAlgorithm {
    protected readonly name = SupervisedAutoencoder.name;
    protected readonly opts: SupervisedAutoencoderMetaParameters;
    readonly model: tf.Model;

    protected representationLayer: tf.SymbolicTensor | undefined;
    protected inputs: tf.SymbolicTensor | undefined;

    // ----------------
    // Model Definition
    // ----------------
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<SupervisedAutoencoderMetaParameters>,
    ) {
        super(datasetDescription);
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }]
        }, opts);

        const inputs = tf.layers.input({ shape: [this.datasetDescription.features ] });

        const representationLayerDescription = arrays.middleItem(this.opts.layers);
        representationLayerDescription.name = 'representationLayer';

        const network = constructTFNetwork(this.opts.layers, inputs);
        const representationLayer = arrays.middleItem(network);

        const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid', name: 'out_y' }).apply(representationLayer) as tf.SymbolicTensor;
        const outputs_x = tf.layers.dense({ units: this.datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network)!) as tf.SymbolicTensor;

        const model = tf.model({
            inputs: [inputs],
            outputs: [outputs_y, outputs_x],
        });

        this.model = model;

        this.representationLayer = model.getLayer('representationLayer').output as tf.SymbolicTensor;
        this.inputs = model.input as tf.SymbolicTensor;
    }

    // --------
    // Training
    // --------
    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        const optimizer = new Optimizer(o);

        this.model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: ['binaryCrossentropy', 'meanSquaredError'],
            metrics: { out_y: 'accuracy' },
        });

        return optimizer.fit(this.model, X, [Y, X], {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const [Y_hat, X_hat] = this.model.predict(X) as tf.Tensor2D[];
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat).add(tf.losses.meanSquaredError(X, X_hat));
    }

    async getRepresentation(X: tf.Tensor2D) {
        const model = tf.model({
            inputs: [this.inputs!],
            outputs: [this.representationLayer!],
        });

        model.layers.forEach((layer, i) => layer.setWeights(this.model.getLayer(undefined, i).getWeights()));

        const H = model.predictOnBatch(X) as tf.Tensor2D;
        return H;
    }

    reconstructionLoss(X: tf.Tensor2D) {
        const fake_y = tf.zeros([X.shape[0], this.datasetDescription.classes]);
        const [, x_loss] = this.model.evaluate(X, [fake_y, X]) as tf.Scalar[];
        return x_loss.get();
    }

    protected async _predict(X: tf.Tensor2D) {
        const Y_hat = this.model.predictOnBatch(X)  as tf.Tensor2D[];
        return Y_hat[0];
    }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}
