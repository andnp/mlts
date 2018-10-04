import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { arrays } from 'utilities-ts';
import { Algorithm } from "../algorithms/Algorithm";
import { Optimizer } from '../optimization/Optimizer';
import { SupervisedDatasetDescription } from '../data/DatasetDescription';
import { History } from '../analysis/History';
import { constructTFNetwork, LayerMetaParametersSchema } from '../algorithms/utils/layers';
import { RepresentationAlgorithm } from '../algorithms/interfaces/RepresentationAlgorithm';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

export const TwoStageAutoencoderMetaParameterSchema = v.object({
    layers: v.array(LayerMetaParametersSchema),
    retrainRepresentation: v.boolean(),
});

export type TwoStageAutoencoderMetaParameters = v.ValidType<typeof TwoStageAutoencoderMetaParameterSchema>;

const PREDICTION_MODEL = 'predictionModel';
const MODEL = 'model';
export class TwoStageAutoencoder extends Algorithm implements RepresentationAlgorithm {
    protected readonly name = TwoStageAutoencoder.name;
    protected readonly opts: TwoStageAutoencoderMetaParameters;
    protected state: TwoStageAutoencoderState = { activeStage: 'stage1' };

    protected representationLayer: tf.SymbolicTensor | undefined;
    protected inputs: tf.SymbolicTensor | undefined;

    // ----------------
    // Model Definition
    // ----------------
    constructor (
        protected datasetDescription: SupervisedDatasetDescription,
        opts?: Partial<TwoStageAutoencoderMetaParameters>,
        saveLocation = 'savedModels',
    ) {
        super(datasetDescription, saveLocation);
        this.opts = _.merge({
            layers: [{ units: 25, regularizer: { type: 'l1', weight: 0 }, activation: 'sigmoid', type: 'dense' }],
            retrainRepresentation: false,
        }, opts);
    }

    protected async _build() {
        // ---------------------
        // Create learning model
        // ---------------------
        const model = this.registerModel(MODEL, () => {
            arrays.middleItem(this.opts.layers).name = 'representationLayer';

            const inputs = tf.layers.input({ shape: [this.datasetDescription.features] });
            const network = constructTFNetwork(this.opts.layers, inputs);
            const outputs_x = tf.layers.dense({ units: this.datasetDescription.features, activation: 'linear', name: 'out_x' }).apply(_.last(network)!) as tf.SymbolicTensor;

            return tf.model({
                inputs: [inputs],
                outputs: [outputs_x],
            });
        });

        this.representationLayer = model.getLayer('representationLayer').output as tf.SymbolicTensor;
        this.inputs = model.input as tf.SymbolicTensor;

        // -----------------------
        // Create prediction model
        // -----------------------
        const predictionModel = this.registerModel(PREDICTION_MODEL, () => {
            const predictionLayer = tf.layers.dense({ units: this.datasetDescription.classes, activation: 'sigmoid' });
            const predictionOutputs = predictionLayer.apply(this.representationLayer!) as tf.SymbolicTensor;
            return tf.model({
                inputs: [this.inputs!],
                outputs: [predictionOutputs]
            });
        });

        console.log('Representation Model::'); // tslint:disable-line no-console
        model.summary(72);
        console.log('Prediction Model::'); // tslint:disable-line no-console
        predictionModel.summary(72);
    }

    // --------
    // Training
    // --------
    protected async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaultOptimizationParameters(opts);
        const model = this.assertModel(MODEL);

        let history: tf.History | undefined;

        // -------
        // Stage 1
        // -------
        if (this.state.activeStage === 'stage1') {
            const optimizer = this.registerOptimizer('opt', () => new Optimizer(o));

            model.compile({
                optimizer: optimizer.getTfOptimizer(),
                loss: 'meanSquaredError',
            });

            history = await optimizer.fit(model, X, X, {
                batchSize: o.batchSize,
                epochs: o.iterations,
                shuffle: true,
            });

            this.clearOptimizer('opt');
            this.state.activeStage = 'stage2';
        }
        // -------
        // Stage 2
        // -------
        if (this.state.activeStage === 'stage2') {
            const optimizer = this.registerOptimizer('opt', () => new Optimizer(o));
            const predictionModel = this.assertModel(PREDICTION_MODEL);

            // transfer weights from learning model to prediction model
            predictionModel.layers.forEach((layer, i) => {
                if (i === predictionModel.layers.length - 1) return;
                layer.setWeights(model.getLayer(undefined, i).getWeights());
                layer.trainable = this.opts.retrainRepresentation;
            });

            predictionModel.compile({
                optimizer: optimizer.getTfOptimizer(),
                loss: 'binaryCrossentropy',
            });

            history = await optimizer.fit(predictionModel, X, Y, {
                batchSize: o.batchSize,
                epochs: o.iterations,
                shuffle: true,
            });

            this.clearOptimizer('opt');
            this.state.activeStage = 'complete';
        }

        return history
            ? History.fromTensorflowHistory(this.name, this.opts, history)
            : History.initializeEmpty(this.name, this.opts);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const model = this.assertModel(MODEL);
        const X_hat = model.predict(X) as tf.Tensor2D;
        return tf.losses.meanSquaredError(X, X_hat);
    }

    async getRepresentation(X: tf.Tensor2D) {
        const model = this.assertModel(MODEL);

        const representationModel = tf.model({
            inputs: [this.inputs!],
            outputs: [this.representationLayer!],
        });

        // transfer weights from learned model to representation model
        representationModel.layers.forEach((layer, i) => layer.setWeights(model.getLayer(undefined, i).getWeights()));

        return representationModel.predictOnBatch(X) as tf.Tensor2D;
    }

    reconstructionLoss(X: tf.Tensor2D) {
        const model = this.assertModel(MODEL);
        const x_loss = model.evaluate(X, X) as tf.Scalar;
        return x_loss.get();
    }

    protected async _predict(X: tf.Tensor2D) {
        const model = this.assertModel(PREDICTION_MODEL);
        return model.predictOnBatch(X) as tf.Tensor2D;
    }

    // ------
    // Saving
    // ------
    static async fromSavedState(location: string) {
        return new TwoStageAutoencoder({} as SupervisedDatasetDescription).loadFromDisk(location);
    }

    private getDefaultOptimizationParameters(o?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            iterations: 100,
            type: 'adadelta',
            learningRate: 0.5,
        }, o);
    }
}

interface TwoStageAutoencoderState {
    activeStage: 'stage1' | 'stage2' | 'complete';
}
