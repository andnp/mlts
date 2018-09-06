import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { Optimizer, OptimizationParameters } from 'optimization/Optimizer';
import { autoDispose, writeTensorToCsv, loadTensorFromCsv } from 'utils/tensorflow';
import { giveBack } from 'utils/fp';
import { assertNever, returnVoid } from 'utils/tsUtil';
import { writeJson, readJson } from 'utils/files';

export interface MatrixFactorizationTrainOptions {
    trainDictionary: boolean;
}

const MetaParametersSchema = v.object({
    regularizer: v.string(['l1']),
    regD: v.number(),
});
export type MatrixFactorizationMetaParameters = v.ValidType<typeof MetaParametersSchema>;

export class MatrixFactorization extends Algorithm {
    protected readonly name = MatrixFactorization.name;
    private _D = tf.variable(tf.randomNormal<tf.Rank.R2>([this.features, this.hidden]));
    private _H = tf.variable(tf.randomNormal<tf.Rank.R2>([this.hidden, this.samples]));

    private opts: MatrixFactorizationMetaParameters;
    private optimizer: Optimizer | undefined;

    private getDefaults(opts?: Partial<MatrixFactorizationMetaParameters>): MatrixFactorizationMetaParameters {
        return _.merge({
            regularizer: 'l1',
            regD: 0,
        }, opts);
    }

    constructor (
        private features: number,
        private hidden: number,
        private samples: number,
        opts?: Partial<MatrixFactorizationMetaParameters>,
    ) {
        super();
        this.opts = this.getDefaults(opts);
    }

    loss = autoDispose((X: tf.Tensor2D) => {
        const X_hat = tf.matMul(this.D, this.H);
        const mse = tf.losses.meanSquaredError(X, X_hat);
        const regD = tf.norm(this.D, 1).mul(tf.tensor(this.opts.regD));
        const loss: tf.Tensor<tf.Rank.R0> = mse.add(regD);
        return loss;
    });

    async train(X: tf.Tensor2D, o: OptimizationParameters & MatrixFactorizationTrainOptions) {
        this.optimizer = this.optimizer || new Optimizer(o);

        const varList = o.trainDictionary
            ? [ this.D, this.H ]
            : [ this.H ];

        await this.optimizer.minimize(_.partial(this.loss, X), varList);

        // we've finished optimizing, so we can release our optimizer
        this.optimizer = undefined;
    }

    private getTensorByName(name: 'D' | 'H') {
        if (name === 'D') return this.D;
        if (name === 'H') return this.H;
        assertNever(name);
        throw new Error(`Attempted to get invalid tensor <${name}>`);
    }

    async _saveState(location: string): Promise<void> {
        const toSave: Array<'D' | 'H'> = ['D', 'H'];
        const saveTasks = toSave.map((name) => {
            const tensor = this.getTensorByName(name);
            const filepath = path.join(location, `${name}.csv`);
            return writeTensorToCsv(filepath, tensor);
        });

        const state: SaveData = {
            features: this.features,
            hidden: this.hidden,
            samples: this.samples,
            metaParameters: this.opts,
        };

        await writeJson(path.join(location, 'state.json'), state);

        if (this.optimizer) await this.optimizer.saveState(path.join(location, 'optimizer'));

        return Promise.all(saveTasks).then(returnVoid);
    }

    static async fromSavedState(location: string) {
        const toLoad: Array<'D' | 'H'> = ['D', 'H'];

        const subfolder = await this.findSavedState(location, this.name);

        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);

        const layer = new MatrixFactorization(state.features, state.hidden, state.samples, state.metaParameters);
        const loadTasks = toLoad.map(async (name) => {
            const initTensor = layer.getTensorByName(name);
            const filepath = path.join(subfolder, `${name}.csv`);
            const tensor = await loadTensorFromCsv(filepath, initTensor.shape);
            initTensor.assign(tensor);
        });

        try {
            layer.optimizer = await Optimizer.fromSavedState(path.join(subfolder, 'optimizer'));
        } catch (e) { /* do nothing */ }

        return Promise.all(loadTasks).then(giveBack(layer));
    }

    get D() { return this._D; }
    get H() { return this._H; }
}

const SaveDataSchema = v.object({
    features: v.number(),
    hidden: v.number(),
    samples: v.number(),
    metaParameters: MetaParametersSchema,
});
type SaveData = v.ValidType<typeof SaveDataSchema>;
