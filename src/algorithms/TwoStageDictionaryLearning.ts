import * as path from 'path';
import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { DeepPartial } from 'simplytyped';

import { writeJson, readJson } from 'utils/files';
import { Algorithm } from 'algorithms/Algorithm';
import { OptimizationParameters } from 'optimization/Optimizer';
import { MatrixFactorization, MatrixFactorizationMetaParameters } from 'algorithms/MatrixFactorization';
import { LogisticRegression } from 'algorithms/LogisticRegression';
import { LinearRegression } from 'algorithms/LinearRegression';

interface TwoStageDictionaryLearningOptions {
    stage1: Partial<MatrixFactorizationMetaParameters>;
}

const ActiveStageSchema = v.string(['stage1', 'stage2', 'complete']);
const SaveSchema = v.object({
    activeStage: ActiveStageSchema,
    features: v.number(),
    classes: v.number(),
    hidden: v.number(),
    samples: v.number(),
});

type ActiveStage = v.ValidType<typeof ActiveStageSchema>;
type SaveData = v.ValidType<typeof SaveSchema>;

export class TwoStageDictionaryLearning extends Algorithm {
    protected readonly name = TwoStageDictionaryLearning.name;
    private stage1: MatrixFactorization;
    private stage2: LogisticRegression;

    private activeStage: ActiveStage = 'stage1';

    protected opts: TwoStageDictionaryLearningOptions;

    constructor(
        protected features: number,
        protected classes: number,
        protected hidden: number,
        protected samples: number,
        opts?: DeepPartial<TwoStageDictionaryLearningOptions>,
    ) {
        super();
        this.opts = _.merge({
            stage1: {}
        }, opts);

        this.stage1 = new MatrixFactorization(this.features, this.hidden, this.samples, this.opts.stage1);
        this.stage2 = new LogisticRegression(this.classes, this.hidden, this.samples);
    }

    private getDefaults(opts?: Partial<OptimizationParameters>): OptimizationParameters {
        return _.merge({
            type: 'adadelta',
            learningRate: 2.0,
            iterations: 10,
        }, opts);
    }

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const s1_loss = this.stage1.loss(X);
        const s2_loss = this.stage2.loss(Y);
        return s1_loss.add(s2_loss);
    }

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaults(opts);

        // start making backup files
        this.startBackup();
        if (this.activeStage === 'stage1') {
            await this.stage1.train(X, { ...o, trainDictionary: true });
            this.stage2.setH(this.stage1.H);
            this.activeStage = 'stage2';
        }
        if (this.activeStage === 'stage2') {
            await this.stage2.train(Y, o);
            this.activeStage = 'complete';
        }
        this.stopBackup();
    }

    async predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaults(opts);

        const stage3 = new LinearRegression(T.shape[0], this.hidden, T.shape[1]);

        await stage3.train(T, {...o, trainDictionary: false});
        const Y_hat = this.stage2.predict(stage3.H);
        return Y_hat;
    }

    protected async _saveState(location: string) {
        const state: SaveData = {
            activeStage: this.activeStage,
            features: this.features,
            classes: this.classes,
            hidden: this.hidden,
            samples: this.samples,
        };

        const saveTasks = [
            this.stage1.saveState(location),
            this.stage2.saveState(location),
        ];

        // write the state to a json file
        await writeJson(path.join(location, 'state.json'), state);

        return Promise.all(saveTasks);
    }

    static async fromSavedState(location: string): Promise<TwoStageDictionaryLearning> {
        const subfolder = await this.findSavedState(location, this.name);
        const saveData = await readJson(path.join(subfolder, 'state.json'), SaveSchema);
        const alg = new TwoStageDictionaryLearning(
            saveData.features,
            saveData.classes,
            saveData.hidden,
            saveData.samples,
        );

        const [ stage1, stage2 ] = await Promise.all([
            MatrixFactorization.fromSavedState(subfolder),
            LogisticRegression.fromSavedState(subfolder),
        ]);

        alg.stage1 = stage1;
        alg.stage2 = stage2;
        alg.activeStage = saveData.activeStage;

        return alg;
    }
}
