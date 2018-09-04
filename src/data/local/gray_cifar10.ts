import * as path from 'path';

import * as downloader from 'utils/downloader';
import { loadCsvToBuffer } from 'utils/csv';
import { Data } from './Data';
import { Matrix } from 'utils/matrix';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/gs_cifar10.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const x_buf = new Uint8Array(1024 * 60000);
    const y_buf = new Int32Array(1 * 60000);

    const dataX = await loadCsvToBuffer({
        path: path.join(location, 'cifar/cifar_X.csv'),
        buffer: x_buf,
    });

    const dataY = await loadCsvToBuffer({
        path: path.join(location, 'cifar/cifar_Y.csv'),
        buffer: y_buf,
    });

    console.log('loaded');

    const x = dataX.slice(0, 1024 * 50000);
    const y = dataY.slice(0, 50000);
    const t = dataX.slice(1024 * 50000, 1024 * 60000);
    const ty = dataY.slice(50000, 60000);

    return new Data(
        new Matrix(50000, 1024, x),
        new Matrix(50000, 1, y),
        new Matrix(10000, 1024, t),
        new Matrix(10000, 1, ty),
    );
}
