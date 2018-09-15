import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';
import * as path from 'path';

import { GreyCifar10 } from 'data/tensorflow/GreyCifar10';
import { Deterding } from 'data/tensorflow/Deterding';
import { SusyComplete } from 'data/tensorflow/SusyComplete';
import { TwoStageDictionaryLearning, TwoStageDictionaryLearningMetaParametersSchema } from 'algorithms/TwoStageDictionaryLearning';
import { getClassificationError } from 'analysis/classification';
import { registerAlgorithm, registerDataset, Experiment } from 'experiments/Experiment';
import { SupervisedDictionaryLearning, SupervisedDictionaryLearningMetaParameterSchema } from 'algorithms/SupervisedDictionaryLearning';
import { LogisticRegression, LogisticRegressionMetaParameterSchema } from 'algorithms/LogisticRegression';
import { isRepresentationAlgorithm } from 'algorithms/interfaces/RepresentationAlgorithm';
import { writeTensorToCsv } from 'utils/tensorflow';
import { csvStringFromObject } from 'utils/csv';
import { writeFile, writeJson } from 'utils/files';

registerAlgorithm('twostage', TwoStageDictionaryLearning, TwoStageDictionaryLearningMetaParametersSchema);
registerAlgorithm('sdl', SupervisedDictionaryLearning, SupervisedDictionaryLearningMetaParameterSchema);
registerAlgorithm('logisticRegression', LogisticRegression, LogisticRegressionMetaParameterSchema);
registerDataset('cifar', GreyCifar10);
registerDataset('deterding', Deterding);
registerDataset('susy', SusyComplete);

async function execute() {
    if (!process.argv[2]) throw new Error('Expected experiment description JSON for first argument');
    if (!process.argv[3]) throw new Error('Expected index number for second argument');

    const experiment = await Experiment.fromJson(process.argv[2], parseInt(process.argv[3]));

    const dataset = experiment.dataset;
    const algorithm = experiment.algorithm;

    const [ X, Y ] = dataset.train;
    const [ T, TY ] = dataset.test;

    const samples = X.shape[0];
    const features = X.shape[1];
    const classes = Y.shape[1];
    const t_samples = T.shape[0];

    console.log('Samples:', samples, 'Features:', features, 'Classes:', classes); // tslint:disable-line no-console

    const optimizationParams = experiment.optimization;

    const history = await algorithm.train(X, Y, optimizationParams);

    const resultsPath = path.join('results', experiment.path);

    // if (isRepresentationAlgorithm(algorithm)) {
    //     const H = await algorithm.getRepresentation(X, optimizationParams);
    //     const Ht = await algorithm.getRepresentation(T, optimizationParams);
    //     await Promise.all([
    //         writeTensorToCsv('twostage-newH_deterding-train.csv', H.transpose()),
    //         writeTensorToCsv('twostage-H_deterding-test.csv', Ht.transpose()),
    //         writeTensorToCsv('deterding-trainLabels.csv', tf.argMax(Y.transpose()).as2D(1, samples)),
    //         writeTensorToCsv('deterding-testLabels.csv', tf.argMax(TY.transpose()).as2D(1, t_samples)),
    //     ]);
    // }


    const TY_hat = await algorithm.predict(T, optimizationParams);
    const Y_hat = await algorithm.predict(X, optimizationParams);

    const originalHOpts = { ...optimizationParams, useOriginalH: true };

    const originalH_Y_hat = await algorithm.predict(X, originalHOpts);

    const trainError = getClassificationError(Y_hat, Y);
    const originalHTrainError = getClassificationError(originalH_Y_hat, Y);
    const testError = getClassificationError(TY_hat, TY);

    const params = algorithm.getParameters();

    await writeFile(path.join(resultsPath, 'test.txt'), testError.get());
    await writeFile(path.join(resultsPath, 'train.txt'), trainError.get());
    await writeFile(path.join(resultsPath, 'originalH.txt'), originalHTrainError.get());
    await writeJson(path.join(resultsPath, 'params.json'), params);
    await writeJson(path.join(resultsPath, 'experiment.json'), experiment.description);

    const paramsCsvString = csvStringFromObject(algorithm.getParameters());
    console.log(paramsCsvString, 'originalH', originalHTrainError.get(), 'test:', testError.get(), 'train:', trainError.get());
}

execute()
    .then(() => process.exit(0))
    .catch(e => console.log('uncaught error', e)); // tslint:disable-line no-console
