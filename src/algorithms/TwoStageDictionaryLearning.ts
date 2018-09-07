import * as path from 'path';
import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { DeepPartial } from 'simplytyped';

import { writeJson, readJson } from 'utils/files';
import { Algorithm } from 'algorithms/Algorithm';
import { OptimizationParameters } from 'optimization/Optimizer';
import { MatrixFactorization, MatrixFactorizationMetaParametersSchema } from 'algorithms/MatrixFactorization';
import { LogisticRegression, LogisticRegressionMetaParameterSchema } from 'algorithms/LogisticRegression';
import { LinearRegression } from 'algorithms/LinearRegression';
import { SupervisedDictionaryLearningDatasetDescription, SupervisedDictionaryLearningDatasetDescriptionSchema } from 'data/DatasetDescription';

export const TwoStageDictionaryLearningMetaParametersSchema = v.object({
    stage1: v.partial(MatrixFactorizationMetaParametersSchema),
    stage2: v.partial(LogisticRegressionMetaParameterSchema),
    hidden: v.number(),
});

export type TwoStageDictionaryLearningMetaParameters = v.ValidType<typeof TwoStageDictionaryLearningMetaParametersSchema>;

const ActiveStageSchema = v.string(['stage1', 'stage2', 'complete']);
const SaveSchema = v.object({
    state: v.object({
        activeStage: ActiveStageSchema,
    }),
    datasetDescription: SupervisedDictionaryLearningDatasetDescriptionSchema,
    metaParameters: TwoStageDictionaryLearningMetaParametersSchema,
});

type ActiveStage = v.ValidType<typeof ActiveStageSchema>;

export class TwoStageDictionaryLearning extends Algorithm {
    protected readonly name = TwoStageDictionaryLearning.name;
    private stage1: MatrixFactorization;
    private stage2: LogisticRegression;

    protected state = { activeStage: 'stage1' as ActiveStage };

    protected opts: TwoStageDictionaryLearningMetaParameters;

    constructor(
        protected datasetDescription: SupervisedDictionaryLearningDatasetDescription,
        opts?: DeepPartial<TwoStageDictionaryLearningMetaParameters>,
        protected saveLocation?: string,
    ) {
        super();
        this.opts = _.merge({
            stage1: {},
            stage2: {},
            hidden: 2,
        }, opts);

        this.stage1 = new MatrixFactorization(datasetDescription, { ...this.opts.stage1, hidden: this.opts.hidden });
        // The logistic regression stage maps from HiddenRepresentation to classes.
        // So use number of hidden features here instead of number of dataset features.
        this.stage2 = new LogisticRegression({ features: this.opts.hidden, classes: this.datasetDescription.classes }, this.opts.stage2);
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
        const s2_loss = this.stage2.loss(X, Y);
        return s1_loss.add(s2_loss);
    }

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaults(opts);

        // start making backup files
        this.startBackup(this.saveLocation);
        if (this.state.activeStage === 'stage1') {
            await this.stage1.train(X, Y, { ...o, trainDictionary: true });
            this.state.activeStage = 'stage2';
        }
        if (this.state.activeStage === 'stage2') {
            await this.stage2.train(this.stage1.H, Y, o);
            this.state.activeStage = 'complete';
        }
        this.stopBackup();
    }

    async predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaults(opts);

        const stage3 = new LinearRegression({ features: T.shape[0], samples: T.shape[1] }, { hidden: this.opts.hidden });

        await stage3.train(T, tf.zeros([0, 0]), {...o, trainDictionary: false});
        const Y_hat = this.stage2.predict(stage3.H);
        return Y_hat;
    }

    protected async _saveState(location: string) {
        const saveTasks = [
            this.stage1.saveState(location),
            this.stage2.saveState(location),
        ];

        return Promise.all(saveTasks);
    }

    static async fromSavedState(location: string): Promise<TwoStageDictionaryLearning> {
        const subfolder = await this.findSavedState(location);
        const saveData = await readJson(path.join(subfolder, 'state.json'), SaveSchema);
        const alg = new TwoStageDictionaryLearning(saveData.datasetDescription, saveData.metaParameters);

        const [ stage1, stage2 ] = await Promise.all([
            MatrixFactorization.fromSavedState(subfolder),
            LogisticRegression.fromSavedState(subfolder),
        ]);

        alg.stage1 = stage1;
        alg.stage2 = stage2;
        alg.state.activeStage = saveData.state.activeStage;

        return alg;
    }
}
