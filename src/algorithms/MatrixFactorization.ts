import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { Optimizer, OptimizationParameters } from 'optimization/Optimizer';
import { autoDispose } from 'utils/tensorflow';
import { readJson } from 'utils/files';
import { RegularizerParametersSchema, regularize } from 'regularizers/regularizers';
import { MatrixFactorizationDatasetDescription, MatrixFactorizationDatasetDescriptionSchema } from 'data/DatasetDescription';

export interface MatrixFactorizationTrainOptions {
    trainDictionary: boolean;
}

export const MatrixFactorizationMetaParametersSchema = v.object({
    regularizerD: RegularizerParametersSchema,
    regularizerH: RegularizerParametersSchema,
    hidden: v.number(),
});
export type MatrixFactorizationMetaParameters = v.ValidType<typeof MatrixFactorizationMetaParametersSchema>;

export class MatrixFactorization extends Algorithm {
    protected readonly name = MatrixFactorization.name;

    protected opts: MatrixFactorizationMetaParameters;
    private optimizer: Optimizer | undefined;

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

        this.params.D = tf.variable(tf.randomNormal<tf.Rank.R2>([this.datasetDescription.features, this.opts.hidden]));
        this.params.H = tf.variable(tf.randomNormal<tf.Rank.R2>([this.opts.hidden, this.datasetDescription.samples]));
    }

    loss = autoDispose((X: tf.Tensor2D) => {
        const X_hat = tf.matMul(this.D, this.H);
        const mse = tf.losses.meanSquaredError(X, X_hat);
        const regD = regularize(this.opts.regularizerD, this.D);
        const regH = regularize(this.opts.regularizerH, this.H);
        const loss: tf.Tensor<tf.Rank.R0> = mse.add(regD).add(regH);
        return loss;
    });

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, o: OptimizationParameters & MatrixFactorizationTrainOptions) {
        this.optimizer = this.optimizer || new Optimizer(o);

        const varList = o.trainDictionary
            ? [ this.D, this.H ]
            : [ this.H ];

        await this.optimizer.minimize(_.partial(this.loss, X), varList);

        // we've finished optimizing, so we can release our optimizer
        this.optimizer = undefined;
    }

    async predict(): Promise<tf.Tensor2D> { throw new Error('Predict not implemented for MatrixFactorization'); }


    async _saveState(location: string): Promise<void> {
        if (this.optimizer) await this.optimizer.saveState(path.join(location, 'optimizer'));
    }

    static async fromSavedState(location: string) {
        const subfolder = await this.findSavedState(location);
        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);
        const layer = new MatrixFactorization(state.datasetDescription, state.metaParameters);
        await layer.loadTensorsFromDisk(subfolder);

        try {
            layer.optimizer = await Optimizer.fromSavedState(path.join(subfolder, 'optimizer'));
        } catch (e) { /* do nothing */ }

        return layer;
    }

    get D() { return this.params.D; }
    get H() { return this.params.H; }
}

const SaveDataSchema = v.object({
    datasetDescription: MatrixFactorizationDatasetDescriptionSchema,
    metaParameters: MatrixFactorizationMetaParametersSchema,
});
