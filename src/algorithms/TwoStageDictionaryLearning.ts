import * as path from 'path';
import * as _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import * as v from 'validtyped';
import { DeepPartial } from 'simplytyped';

import { readJson } from 'utils/files';
import { Algorithm } from 'algorithms/Algorithm';
import { OptimizationParameters } from 'optimization/Optimizer';
import { MatrixFactorization, MatrixFactorizationMetaParametersSchema } from 'algorithms/MatrixFactorization';
import { LogisticRegression, LogisticRegressionMetaParameterSchema } from 'algorithms/LogisticRegression';
import { SupervisedDictionaryLearningDatasetDescription, SupervisedDictionaryLearningDatasetDescriptionSchema } from 'data/DatasetDescription';
import { History } from 'analysis/History';
import { RepresentationAlgorithm } from 'algorithms/interfaces/RepresentationAlgorithm';
import { LinearRegression } from './LinearRegression';
import { writeTensorToCsv } from 'utils/tensorflow';

export class TwoStageDictionaryLearning extends Algorithm implements RepresentationAlgorithm {
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

    // --------
    // Training
    // --------

    loss(X: tf.Tensor2D, Y: tf.Tensor2D) {
        const s1_loss = this.stage1.loss(X);
        const s2_loss = this.stage2.loss(X.transpose(), Y.transpose());
        return s1_loss.add(s2_loss);
    }

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaults(opts);

        const jointHistory = new History(this.name, this.opts, []);
        // start making backup files
        this.startBackup(this.saveLocation);
        if (this.state.activeStage === 'stage1') {
            const history = await this.stage1.train(X, tf.zeros([0, 0]), o);
            this.state.activeStage = 'stage2';
            jointHistory.loss = jointHistory.loss.concat(history.loss);
            await writeTensorToCsv('twostage-originalH_susy-train.csv', this.stage1.H.transpose());
        }
        if (this.state.activeStage === 'stage2') {
            const history = await this.stage2.train(this.stage1.H, Y, o);
            this.state.activeStage = 'complete';
            jointHistory.loss = jointHistory.loss.concat(history.loss);
        }
        this.stopBackup();

        return jointHistory;
    }

    async predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        const o = this.getDefaults(opts);

        const H = await this.getRepresentation(T, o);

        const Y_hat = this.stage2.predict(H);
        return Y_hat;
    }

    // ------------------------
    // Representation Algorithm
    // ------------------------
    async getRepresentation(X: tf.Tensor2D, opts?: Partial<OptimizationParameters>) {
        // a new representation can be calculated as a linear regression optimization over H.
        // X = argmin_H (X - DH) so the "inputs" to the linear regressor are "D" and the targets are "X"
        const stage3 = new LinearRegression({ features: this.opts.hidden, classes: X.shape[0] });
        await stage3.train(this.stage1.D.transpose(), X.transpose(), opts);
        const H = stage3.W.transpose();
        return H;
    }

    // ----------------
    // Saving / Loading
    // ----------------
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
