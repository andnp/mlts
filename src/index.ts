import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';

import { GreyCifar10 } from 'data/tensorflow/GreyCifar10';
import { Deterding } from 'data/tensorflow/Deterding';
import { TwoStageDictionaryLearning, TwoStageDictionaryLearningMetaParametersSchema } from 'algorithms/TwoStageDictionaryLearning';
import { getClassificationError } from 'analysis/classification';
import { registerAlgorithm, registerDataset, Experiment } from 'experiments/Experiment';

const iterations = 4000;

registerAlgorithm('twostage', TwoStageDictionaryLearning, TwoStageDictionaryLearningMetaParametersSchema);
registerDataset('cifar', GreyCifar10);
registerDataset('deterding', Deterding);

async function execute() {
    if (!process.argv[2]) throw new Error('Expected experiment description JSON for first argument');
    if (!process.argv[3]) throw new Error('Expected index number for second argument');

    const experiment = await Experiment.fromJson(process.argv[2], parseInt(process.argv[3]));

    const dataset = experiment.dataset;
    const algorithm = experiment.algorithm;

    // TwoStageDictionaryLearning expects the data to be in [features, samples] format instead of [samples, features]
    if (algorithm instanceof TwoStageDictionaryLearning) dataset.transpose();

    const [ X, Y ] = dataset.train;
    const [ T, TY ] = dataset.test;

    const samples = X.shape[1];
    const features = X.shape[0];
    const classes = Y.shape[0];
    const t_samples = T.shape[1];

    console.log('Samples:', samples, 'Features:', features, 'Classes:', classes); // tslint:disable-line no-console

    await algorithm.train(X, Y, {
        iterations,
    });

    const TY_hat = await algorithm.predict(T, { iterations });
    const Y_hat = await algorithm.predict(X, { iterations });

    const trainError = getClassificationError(Y_hat.transpose(), Y.transpose());
    const testError = getClassificationError(TY_hat.transpose(), TY.transpose());
    console.log('test:', testError.get(), 'train:', trainError.get());
}

execute()
    .then(() => process.exit(0))
    .catch(e => console.log('uncaught error', e)); // tslint:disable-line no-console
