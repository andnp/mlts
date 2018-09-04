import * as path from 'path';

import * as downloader from 'utils/downloader';
import { loadCsvToBuffer } from 'utils/csv';
import { Data } from 'data/Data';
import { Matrix } from 'utils/matrix';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/cifar10.csv.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const buffers: Uint8Array[] = [];
    const arrayToBuffer = (x: number[]) => {
        if (x.length !== 1025) throw new Error(`Unexpected number of elements in row: <${x.length}>`);
        const b = new Uint8Array(1025);
        b.set(x);
        return b;
    }

    const data = await loadCsvToBuffer({
        path: path.join(location, 'cifar10.csv'),
        buffers,
        arrayToBuffer,
    });

    console.log('loaded')

    const DX: Uint8Array[] = [];
    const DY: Uint8Array[] = [];
    for (let i = 0; i < 60000; ++i) {
        DX.push(data[i].slice(1, 1025));
        DY.push(data[i].slice(0, 1));
    }

    const x = DX.slice(0, 50000) as any as number[][];
    const y = DY.slice(0, 50000) as any as number[][];
    const t = DX.slice(50000, 60000) as any as number[][];
    const ty = DY.slice(50000, 60000) as any as number[][];

    console.log(x.length, x[0].length, y.length, y[0].length, t.length, t[0].length, ty.length, ty[0].length);

    return new Data(new Matrix(x), new Matrix(y), new Matrix(t), new Matrix(ty));
}
