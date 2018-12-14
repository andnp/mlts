import * as path from 'path';

import * as downloader from '../../utils/downloader';
import { csv } from 'utilities-ts';
import { Data } from '../../data/local/Data';
import { Matrix } from '../../utils/matrix';
import * as idx from '../utils/idx';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/gs_cifar10.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const root = path.join(location, 'cifar');

    const [
        dataX,
        dataY,
    ] = await Promise.all([
        idx.loadBits(path.join(root, 'cifar_data.idx')),
        idx.loadBits(path.join(root, 'cifar_labels.idx')),
    ]);

    const x = dataX.data.slice(0, 1024 * 50000);
    const y = dataY.data.slice(0, 50000);
    const t = dataX.data.slice(1024 * 50000, 1024 * 60000);
    const ty = dataY.data.slice(50000, 60000);

    return new Data(
        new Matrix(50000, 1024, x),
        new Matrix(50000, 1, y),
        new Matrix(10000, 1024, t),
        new Matrix(10000, 1, ty),
    );
}
