import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';

import { GreyCifar10 } from 'data/tensorflow/GreyCifar10';
import { Deterding } from 'data/tensorflow/Deterding';
import { TwoStageDictionaryLearning } from 'algorithms/TwoStageDictionaryLearning';
import { getClassificationError } from 'analysis/classification';
import { fileExists } from 'utils/files';

const iterations = 20000;

const saveLocation = 'savedModels';

async function execute() {
    const dataset = await Deterding.load();

    // TwoStageDictionaryLearning expects the data to be in [features, samples] format instead of [samples, features]
    dataset.transpose();

    const [ X, Y ] = dataset.train;
    const [ T, TY ] = dataset.test;

    const samples = X.shape[1];
    const features = X.shape[0];
    const classes = Y.shape[0];
    const t_samples = T.shape[1];
    const hidden = 6;

    console.log('Samples:', samples, 'Features:', features, 'Classes:', classes); // tslint:disable-line no-console

    const exists = await fileExists(saveLocation);

    const tsdl = exists
        ? await TwoStageDictionaryLearning.fromSavedState(saveLocation)
        : new TwoStageDictionaryLearning(features, classes, hidden, samples, {
            stage1: {
                regD: 0.01,
            }
        });

    await tsdl.train(X, Y, {
        iterations,
    });

    const TY_hat = await tsdl.predict(T, { iterations });
    const Y_hat = await tsdl.predict(X, { iterations });

    const trainError = getClassificationError(Y_hat.transpose(), Y.transpose());
    const testError = getClassificationError(TY_hat.transpose(), TY.transpose());
    console.log('test:', testError.get(), 'train:', trainError.get());
}

execute()
    .then(() => process.exit(0))
    .catch(e => console.log('uncaught error', e)); // tslint:disable-line no-console
