import * as path from 'path';

import * as downloader from '../../utils/downloader';
import { Data } from '../../data/local/Data';
import { Matrix } from '../../utils/matrix';
import * as idx from '../utils/idx';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const root = path.join(location, 'deterding');

    const trainSamples = 528;
    const testSamples = 462;
    const features = 10;
    const classes = 11;

    const [
        dataX,
        dataY,
        dataT,
        dataTY,
    ] = await Promise.all([
        idx.loadBits(path.join(root, 'deterding_data.idx')),
        idx.loadBits(path.join(root, 'deterding_labels.idx')),
        idx.loadBits(path.join(root, 'deterding_test-data.idx')),
        idx.loadBits(path.join(root, 'deterding_test-labels.idx')),
    ]);

    return new Data(
        new Matrix(trainSamples, features, dataX.data),
        new Matrix(trainSamples, classes, dataY.data),
        new Matrix(testSamples, features, dataT.data),
        new Matrix(testSamples, classes, dataTY.data),
    );
}
