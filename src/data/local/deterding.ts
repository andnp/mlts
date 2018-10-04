import * as path from 'path';

import * as downloader from '../../utils/downloader';
import { csv, promise } from 'utilities-ts';
import { Data } from '../../data/local/Data';
import { Matrix } from '../../utils/matrix';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const trainSamples = 528;
    const testSamples = 462;
    const features = 10;
    const classes = 11;

    const x_buf = new Float32Array(trainSamples * features);
    const y_buf = new Float32Array(trainSamples * classes);
    const t_buf = new Float32Array(testSamples * features);
    const ty_buf = new Float32Array(testSamples * classes);

    const data = await promise.allValues({
        X: csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_X.csv'), buffer: x_buf }),
        Y: csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_Y.csv'), buffer: y_buf }),
        T: csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_T.csv'), buffer: t_buf }),
        TY: csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_TY.csv'), buffer: ty_buf }),
    });

    return new Data(
        new Matrix(trainSamples, features, data.X),
        new Matrix(trainSamples, classes, data.Y),
        new Matrix(testSamples, features, data.T),
        new Matrix(testSamples, classes, data.TY),
    );
}
