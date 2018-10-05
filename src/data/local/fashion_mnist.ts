import * as path from 'path';
import * as fs from 'fs';

import * as downloader from '../../utils/downloader';
import { Data } from '../../data/local/Data';
import { Matrix } from '../../utils/matrix';
import { BufferType } from 'utilities-ts/src/buffers';

const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/fashion_mnist.tar.gz';

export function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}

export async function load(location = '.tmp') {
    await download(location);

    const root = path.join(location, 'fashion_mnist');

    const features = 784;
    const targets = 1;
    const trainSamples = 40000;
    const testSamples = 20000;

    const x_buf = new Uint8Array(features * trainSamples);
    const t_buf = new Uint8Array(features * testSamples);
    const y_buf = new Int32Array(targets * trainSamples);
    const ty_buf = new Int32Array(targets * testSamples);

    const dataX = await loadData(x_buf, path.join(root, 'train-images-idx3-ubyte'));
    const dataY = await loadLabels(y_buf, path.join(root, 'train-labels-idx1-ubyte'));
    const dataT = await loadData(t_buf, path.join(root, 't10k-images-idx3-ubyte'));
    const dataTY = await loadLabels(ty_buf, path.join(root, 't10k-labels-idx1-ubyte'));

    return new Data(
        new Matrix(trainSamples, features, dataX),
        new Matrix(trainSamples, targets, dataY),
        new Matrix(testSamples, features, dataT),
        new Matrix(testSamples, targets, dataTY),
    );
}

const loadData = <B extends BufferType>(data: B, file: string) => loadBits(data, file, 16);
const loadLabels = <B extends BufferType>(data: B, file: string) => loadBits(data, file, 8);

function loadBits<B extends BufferType>(data: B, file: string, headerOffset: number) {
    const stream = fs.createReadStream(file);
    let ver = 0;
    let idx = 0;
    stream.on('readable', () => {
        const buf = stream.read();
        if (!buf) return;

        let start = 0;
        // on first data, get header info
        if (!ver) {
            ver = buf.readInt32BE(0);
            start = headerOffset;
        }
        for (let i = start; i < buf.length; i++) {
            data[idx++] = buf.readUInt8(i);
        }
    });

    return new Promise<B>((resolve, reject) => {
        stream.on('end', () => resolve(data));
    });
}
