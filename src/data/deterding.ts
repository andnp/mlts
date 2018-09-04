import * as path from 'path';

import * as downloader from 'utils/downloader';
import { loadCsv } from 'utils/csv';
import { allValues } from 'utils/promise';
import { Data } from 'data/Data';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const data = await allValues({
        X: loadCsv(path.join(location, 'deterding/deterding_X.csv')),
        Y: loadCsv(path.join(location, 'deterding/deterding_Y.csv')),
        T: loadCsv(path.join(location, 'deterding/deterding_T.csv')),
        TY: loadCsv(path.join(location, 'deterding/deterding_TY.csv')),
    });

    return new Data(data.X, data.Y, data.T, data.TY);
}
