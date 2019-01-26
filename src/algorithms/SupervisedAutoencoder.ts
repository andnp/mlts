import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import * as Optimizer from '../optimization/Optimizer';
import { arrays } from 'utilities-ts';
import { SupervisedAlgorithm } from "../algorithms/Algorithm";
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { LayerMetaParametersSchema, constructTFNetwork } from '../algorithms/utils/layers';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const SupervisedAutoencoderMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
});

export type SupervisedAutoencoderMetaParameters = v.ValidType<typeof SupervisedAutoencoderMetaParameterSchema>;

export class SupervisedAutoencoder extends SupervisedAlgorithm implements RepresentationAlgorithm {
    readonly name = SupervisedAutoencoder.name;
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

        const inputs = tf.layers.input({ shape: [ this.datasetDescription.features ] });

        const representationLayerDescription = arrays.middleItem(this.opts.layers);
        representationLayerDescription.name = 'representationLayer';

        const network = constructTFNetwork(this.opts.layers, inputs);
        const representationLayer = arrays.middleItem(network);

        const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'softmax', name: 'out_y' }).apply(representationLayer) as tf.SymbolicTensor;
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
    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: OptimizationParameters) {
        const o = Optimizer.getDefaultParameters(opts);

        this.model.compile({
            optimizer: Optimizer.getTfOptimizer(o),
            loss: ['categoricalCrossentropy', 'meanSquaredError'],
            metrics: { out_y: 'accuracy' },
        });

        return Optimizer.fit(this.model, X, [Y, X], {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });
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

    protected async _predict(X: tf.Tensor2D) {
        const Y_hat = this.model.predictOnBatch(X)  as tf.Tensor2D[];
        return Y_hat[0];
    }
}
