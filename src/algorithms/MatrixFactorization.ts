import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { Optimizer, OptimizationParameters } from 'optimization/Optimizer';
import { LoggerCallback } from 'utils/tensorflow';
import { readJson } from 'utils/files';
import { RegularizerParametersSchema, regularizeLayer } from 'regularizers/regularizers';
import { MatrixFactorizationDatasetDescription, MatrixFactorizationDatasetDescriptionSchema } from 'data/DatasetDescription';
import { LayerConfig } from '@tensorflow/tfjs-layers/dist/engine/topology';
import { printProgressAsync } from 'utils/printer';
import { History } from 'analysis/History';

class DictLayer extends tf.layers.Layer {
    static className = DictLayer.name;
    name = DictLayer.name;
    private D: tf.LayerVariable;
    private H: tf.LayerVariable;

    constructor (
        private config: LayerConfig & MatrixFactorizationMetaParameters & { datasetDescription: MatrixFactorizationDatasetDescription },
    ) {
        super(config);

        this.D = this.addWeight('D', [this.config.hidden, this.config.datasetDescription.features], 'float32', tf.initializers.glorotNormal({}), regularizeLayer(this.config.regularizerD));
        this.H = this.addWeight('H', [this.config.datasetDescription.samples, this.config.hidden], 'float32', tf.initializers.glorotNormal({}), regularizeLayer(this.config.regularizerH));
    }

    build() {
        this.built = true;
        this.trainableWeights = [this.D, this.H];
    }

    computeOutputShape(shape: number[]) {
        return [this.config.datasetDescription.samples, this.config.datasetDescription.features];
    }

    call(inputs: tf.Tensor) {
        return tf.tidy(() => tf.matMul(this.H.read() as tf.Tensor2D, this.D.read() as tf.Tensor2D));
    }

    getClassName() {
        return DictLayer.name;
    }

    getConfig() {
        return this.config as {};
    }

    trainable = true;
}
tf.serialization.registerClass(DictLayer);


export class MatrixFactorization extends Algorithm {
    protected readonly name = MatrixFactorization.name;

    protected opts: MatrixFactorizationMetaParameters;
    private optimizer: Optimizer | undefined;
    protected model: tf.Model;

    private getDefaults(opts?: Partial<MatrixFactorizationMetaParameters>): MatrixFactorizationMetaParameters {
        return _.merge({
            regularizerD: {
                type: 'l1',
                weight: 0,
            },
            regularizerH: {
                type: 'l1',
                weight: 0,
            },
            hidden: 2,
        }, opts);
    }

    constructor (
        protected datasetDescription: MatrixFactorizationDatasetDescription,
        opts?: Partial<MatrixFactorizationMetaParameters>,
    ) {
        super();
        this.opts = this.getDefaults(opts);

        const model = this.model = tf.sequential();

        model.add(tf.layers.inputLayer({ inputShape: [this.datasetDescription.features] }));
        model.add(new DictLayer({ ...this.opts, datasetDescription }));
    }

    loss(X: tf.Tensor2D) {
        const X_hat = this.model.predict(X) as tf.Tensor;
        return tf.losses.meanSquaredError(X, X_hat);
    }

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters) {
        this.optimizer = this.optimizer || new Optimizer(o);

        this.model.compile({
            optimizer: this.optimizer.getTfOptimizer(),
            loss: 'meanSquaredError',
        });

        const history = await printProgressAsync(async (printer) => {
            return this.model.fit(X, X, {
                batchSize: X.shape[0],
                epochs: o.iterations,
                shuffle: false,
                yieldEvery: 'epoch',
                callbacks: [new LoggerCallback(printer)],
            });
        });

        // we've finished optimizing, so we can release our optimizer
        this.optimizer = undefined;

        return History.fromTensorflowHistory(this.name, this.opts, history);
    }

    async predict(): Promise<tf.Tensor2D> { throw new Error('Predict not implemented for MatrixFactorization'); }


    async _saveState(location: string): Promise<void> {
        if (this.optimizer) await this.optimizer.saveState(path.join(location, 'optimizer'));
    }

    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);
        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);
        const layer = new MatrixFactorization(state.datasetDescription, state.metaParameters);
        layer.model = await tf.loadModel('file://' + path.join(subfolder, 'model/model.json'));

        try {
            layer.optimizer = await Optimizer.fromSavedState(path.join(subfolder, 'optimizer'));
        } catch (e) { /* do nothing */ }

        return layer;
    }

    get D() { return this.model.getLayer(DictLayer.name).getWeights()[0] as tf.Tensor2D; }
    get H() { return this.model.getLayer(DictLayer.name).getWeights()[1] as tf.Tensor2D; }
    setD(tensor: tf.Tensor2D) {
        this.model.getLayer(DictLayer.name).setWeights([tensor, this.H]);
    }
}

export const MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: RegularizerParametersSchema,
    regularizerH: RegularizerParametersSchema,
    hidden: v.number(),
});
export type MatrixFactorizationMetaParameters = v.ValidType<typeof MatrixFactorizationMetaParametersSchema>;

const SaveDataSchema = v.object({
    datasetDescription: MatrixFactorizationDatasetDescriptionSchema,
    metaParameters: MatrixFactorizationMetaParametersSchema,
});
