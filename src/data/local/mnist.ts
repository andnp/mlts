import * as path from 'path';

import * as downloader from 'utils/downloader';
import { loadCsvToBuffer } from 'utils/csv';
import { Data } from 'data/local/Data';
import { Matrix } from 'utils/matrix';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/mnist.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const features = 784;
    const targets = 1;
    const trainSamples = 40000;
    const testSamples = 20000;

    const x_buf = new Uint8Array(features * (trainSamples + testSamples));
    const y_buf = new Int32Array(targets * (trainSamples + testSamples));

    const dataX = await loadCsvToBuffer({
        path: path.join(location, 'mnist/mnist_x.csv'),
        buffer: x_buf,
    });

    const dataY = await loadCsvToBuffer({
        path: path.join(location, 'mnist/mnist_y.csv'),
        buffer: y_buf,
    });

    const x = dataX.slice(0, features * trainSamples);
    const y = dataY.slice(0, targets * trainSamples);
    const t = dataX.slice(features * trainSamples, (features * trainSamples) + (features * testSamples));
    const ty = dataY.slice(targets * trainSamples, (targets * trainSamples) + (targets * testSamples));

    return new Data(
        new Matrix(trainSamples, features, x),
        new Matrix(trainSamples, targets, y),
        new Matrix(testSamples, features, t),
        new Matrix(testSamples, targets, ty),
    );
}
