import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';
import { tuple } from 'utilities-ts';
import { SupervisedDictionaryLearningDatasetDescription, TensorflowDataset } from 'data';
import { ExperimentDescription, ClassificationErrorExperiment } from "experiments";
import { SupervisedAlgorithm, ReconstructionAlgorithm, UnsupervisedAlgorithm } from "algorithms";
import { OptimizationParameters } from "optimization";
import { meanSquaredError } from 'analysis';

function getRandomClassificationData(description: SupervisedDictionaryLearningDatasetDescription, means: tf.Tensor, variance: number) {
    return tf.tidy(() => {
        const bins = _.times(description.classes, (c) => {
            const features = _.times(description.features, (f) => {
                const mean = means.get(c, f);
                return tf.randomNormal([description.samples], mean, 0.5).as2D(description.samples, 1);
            });

            const x = tf.concat2d(features, 1);
            const y = tf.tensor1d(_.times(description.samples, () => c), "int32");

            return tuple(x, y);
        });

        const Xs = bins.map(d => d[0]);
        const Ys = bins.map(d => d[1]);

        return tuple(tf.concat2d(Xs, 0), tf.oneHot(tf.concat1d(Ys), description.classes).asType('float32'));
    });
}

export function getFakeClassificationDataset(description: SupervisedDictionaryLearningDatasetDescription, difficulty?: 'easy' | 'medium' | 'hard') {
    const variance =
        difficulty === 'easy' ? .1 :
        difficulty === 'medium' ? 10 :
        difficulty === 'hard' ? 100 :
        /* default */ .1;

    const means = tf.randomUniform([description.classes, description.features], -5, 5);
    const [X, Y] = getRandomClassificationData(description, means, variance);
    const [T, TY] = getRandomClassificationData(description, means, variance);

    return new TensorflowDataset(X, Y, T, TY).scaleColumns();
}

interface ClassificationTestParameters {
    alg: SupervisedAlgorithm;
    dataset: TensorflowDataset;
    optimization: OptimizationParameters;
    error: number;
}
export const buildClassificationTest = (params: ClassificationTestParameters) => async () => {
    const { alg, dataset, optimization, error } = params;
    const expDescription = ExperimentDescription.fromManualSetup(alg, dataset, optimization);
    const exp = new ClassificationErrorExperiment(expDescription);

    let messages = 0;
    await exp.run().subscribe(msg => {
        if (msg.tag === 'test' || msg.tag === 'train') {
            expect(msg.data).toBeLessThan(error);
            messages++;
        }
    });

    expect(messages).toBe(2);
};

interface UnsupervisedReconstructionTestParameters {
    alg: UnsupervisedAlgorithm & ReconstructionAlgorithm;
    dataset: TensorflowDataset;
    optimization: OptimizationParameters;
    error: number;
}
export const buildUnsupervisedReconstructionTest = (params: UnsupervisedReconstructionTestParameters) => async () => {
    const { alg, dataset, optimization, error } = params;

    const [X] = dataset.train;
    const [T] = dataset.test;

    await alg.train(X, optimization);

    const X_hat = await alg.predict(X, optimization);
    const T_hat = await alg.predict(T, optimization);

    const train_error = meanSquaredError(X_hat, X).get();
    const test_error = meanSquaredError(T_hat, T).get();

    expect(train_error).toBeLessThan(error);
    expect(test_error).toBeLessThan(error);
};
