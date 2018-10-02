import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { LayerMetaParametersSchema, constructTFNetwork } from '../algorithms/utils/layers';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const ANNMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
    loss: v.string(['categoricalCrossentropy', 'meanSquaredError']),
}, { optional: ['loss'] });

export type ANNMetaParameters = v.ValidType<typeof ANNMetaParameterSchema>;

const MODEL = 'model';
export class ANN extends Algorithm {
    protected readonly name = ANN.name;
    protected readonly opts: ANNMetaParameters;

    // ----------------
    // Model Definition
    // ----------------
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<ANNMetaParameters>,
        saveLocation = 'savedModels',
    ) {
        super(datasetDescription, saveLocation);
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            loss: 'categoricalCrossentropy',
        }, opts);
    }

    protected async _build() {
        this.registerModel(MODEL, () => {
            const inputs = tf.layers.input({ shape: [this.datasetDescription.features ] });

            const network = constructTFNetwork(this.opts.layers, inputs);

            const outputType =
                this.opts.loss === 'categoricalCrossentropy' ? 'sigmoid' :
                this.opts.loss === 'meanSquaredError' ? 'linear' :
                'sigmoid';

            const outputs_y = tf.layers.dense({ units: this.datasetDescription.classes, activation: outputType, name: 'out_y' }).apply(_.last(network)!) as tf.SymbolicTensor;

            const model = tf.model({
                inputs: [inputs],
                outputs: [outputs_y],
            });

            return model;
        });
    }

    summary() {
        this.getModel().summary(72);
    }

    // --------
    // Training
    // --------
    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        const optimizer = this.registerOptimizer('opt', () => new Optimizer(o));
        const model = this.assertModel(MODEL);

        model.compile({
            optimizer: optimizer.getTfOptimizer(),
            loss: this.opts.loss!,
        });

        const history = await optimizer.fit(model, X, Y, {
            batchSize: o.batchSize,
            epochs: o.iterations,
            shuffle: true,
        });

        this.clearOptimizer('opt');

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const model = this.assertModel(MODEL);
        const Y_hat = model.predict(X) as tf.Tensor2D;
        return tf.losses.sigmoidCrossEntropy(Y, Y_hat);
    }

    protected async _predict(X: tf.Tensor2D) {
        const model = this.assertModel(MODEL);
        const Y_hat = model.predictOnBatch(X) as tf.Tensor2D;
        return Y_hat;
    }

    // ------
    // Saving
    // ------
    static async fromSavedState(location: string) {
        return new ANN({} as SupervisedDatasetDescription).loadFromDisk(location);
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
        await ann2.build();

        if (!o.keepWeights) return ann2;

        const oldModel = ann.getModel();
        const newModel = ann2.getModel();
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
