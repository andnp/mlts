import * as path from 'path';

import { csv } from 'utilities-ts';
import { Dataset, download as downloader } from 'mlts-experiment-data';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/susycomplete.tar.gz';

export function download(location = '.tmp') {
    return downloader(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const features = 18;
    const targets = 1;
    const trainSamples = 60000;
    const testSamples = 40000;

    const x_buf = new Float32Array(features * (trainSamples + testSamples));
    const y_buf = new Int32Array(targets * (trainSamples + testSamples));

    const dataX = await csv.loadCsvToBuffer({
        path: path.join(location, 'susycomplete/susycomplete_X.csv'),
        buffer: x_buf,
    });

    const dataY = await csv.loadCsvToBuffer({
        path: path.join(location, 'susycomplete/susycomplete_Y.csv'),
        buffer: y_buf,
    });

    const x = dataX.slice(0, features * trainSamples);
    const y = dataY.slice(0, targets * trainSamples);
    const t = dataX.slice(features * trainSamples, (features * trainSamples) + (features * testSamples));
    const ty = dataY.slice(targets * trainSamples, (targets * trainSamples) + (targets * testSamples));

    return new Dataset(
        { data: x, shape: [trainSamples, features], type: 'float32' },
        { data: y, shape: [trainSamples, targets], type: 'int32' },
        { data: t, shape: [testSamples, features], type: 'float32' },
        { data: ty, shape: [testSamples, targets], type: 'int32' },
    );
}
