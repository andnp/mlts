import '@tensorflow/tfjs-node';

import { TwoStageDictionaryLearning } from 'algorithms/TwoStageDictionaryLearning';
import { loadCsv } from 'utils/csv';

const iterations = 1000;

async function execute() {
    const X_dat = await loadCsv('../ml_data/deterding_X.csv');
    const Y_dat = await loadCsv('../ml_data/deterding_Y.csv');
    const T_dat = await loadCsv('../ml_data/deterding_T.csv');

    const samples = X_dat.cols;
    const features = X_dat.rows;
    const classes = Y_dat.rows;
    const t_samples = T_dat.cols;
    const hidden = 2;

    console.log('Samples:', samples, 'Features:', features, 'Classes:', classes); // tslint:disable-line no-console

    const tsdl = new TwoStageDictionaryLearning(features, classes, hidden, samples);
    tsdl.train(X_dat, Y_dat, {
        iterations,
    });

    const Y_hat = await tsdl.predict(T_dat, { iterations });
    console.log(Y_hat); // tslint:disable-line no-console
}

execute();
