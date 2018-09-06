import * as tf from '@tensorflow/tfjs';
import * as path from 'path';
import * as _ from 'lodash';
import * as v from 'validtyped';

import { Algorithm } from "algorithms/Algorithm";
import { Optimizer, OptimizationParameters } from 'optimization/Optimizer';
import { autoDispose, writeTensorToCsv, loadTensorFromCsv } from 'utils/tensorflow';
import { giveBack } from 'utils/fp';
import { assertNever } from 'utils/tsUtil';
import { writeJson, readJson } from 'utils/files';

interface LogisticRegressionTrainOptions {
    trainDictionary: boolean;
}

interface LogisticRegressionOptions {
    regularizer: 'l1';
    regD: number;
}

export class LogisticRegression extends Algorithm {
    protected readonly name = LogisticRegression.name;
    private _W = tf.variable(tf.randomNormal<tf.Rank.R2>([this.classes, this.hidden]));
    private _H = tf.variable(tf.randomNormal<tf.Rank.R2>([this.hidden, this.samples]));

    constructor (
        private classes: number,
        private hidden: number,
        private samples: number,
    ) { super(); }

    loss = autoDispose((Y: tf.Tensor2D) => {
        const Y_hat = this.predict(this.H);
        const loss: tf.Tensor<tf.Rank.R0> = tf.losses.sigmoidCrossEntropy(Y, Y_hat);
        return loss;
    });

    async train(Y: tf.Tensor2D, o: OptimizationParameters) {
        const optimizer = new Optimizer(o);

        await optimizer.minimize(_.partial(this.loss, Y), [ this.W ]);
    }

    predict = autoDispose((H: tf.Tensor2D) => {
        return tf.sigmoid(tf.matMul(this.W, H));
    });

    private getTensorByName(name: 'W' | 'H') {
        if (name === 'W') return this.W;
        if (name === 'H') return this.H;
        assertNever(name);
        throw new Error(`Attempted to get invalid tensor <${name}>`);
    }

    async _saveState(location: string): Promise<string> {
        const toSave: Array<'W' | 'H'> = ['H', 'W'];
        const saveTasks = toSave.map(async (name) => {
            const tensor = this.getTensorByName(name);
            const filepath = path.join(location, `${name}.csv`);
            return writeTensorToCsv(filepath, tensor);
        });

        const state: SaveData = {
            classes: this.classes,
            hidden: this.hidden,
            samples: this.samples,
        };

        await writeJson(path.join(location, 'state.json'), state);

        return Promise.all(saveTasks).then(giveBack(location));
    }

    static async fromSavedState(location: string) {
        const toLoad: Array<'W' | 'H'> = ['H', 'W'];

        const subfolder = await this.findSavedState(location, this.name);

        const state = await readJson(path.join(subfolder, 'state.json'), SaveDataSchema);

        const layer = new LogisticRegression(state.classes, state.hidden, state.samples);
        const loadTasks = toLoad.map(async (name) => {
            const initTensor = layer.getTensorByName(name);
            const filepath = path.join(subfolder, `${name}.csv`);
            const tensor = await loadTensorFromCsv(filepath, initTensor.shape);
            initTensor.assign(tensor);
        });

        return Promise.all(loadTasks).then(giveBack(layer));
    }

    get W() { return this._W; }
    get H() { return this._H; }
    setW(W: tf.Variable) {
        this._W.assign(W.as2D(this.classes, this.hidden));
        return this;
    }
    setH(H: tf.Variable) {
        this._H.assign(H.as2D(this.hidden, this.samples));
        return this;
    }
}

const SaveDataSchema = v.object({
    classes: v.number(),
    hidden: v.number(),
    samples: v.number(),
});
type SaveData = v.ValidType<typeof SaveDataSchema>;
