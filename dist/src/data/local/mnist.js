"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const downloader = require("../../utils/downloader");
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const idx = require("idx-data");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/mnist.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
async function load(location = '.tmp') {
    await download(location);
    const root = path.join(location, 'mnist');
    const features = 784;
    const targets = 1;
    const trainSamples = 60000;
    const testSamples = 10000;
    const [dataX, dataY, dataT, dataTY,] = await Promise.all([
        idx.loadBits(path.join(root, 'train-images-idx3-ubyte')),
        idx.loadBits(path.join(root, 'train-labels-idx1-ubyte')),
        idx.loadBits(path.join(root, 't10k-images-idx3-ubyte')),
        idx.loadBits(path.join(root, 't10k-labels-idx1-ubyte')),
    ]);
    return new Data_1.Data(new matrix_1.Matrix(trainSamples, features, dataX.data), new matrix_1.Matrix(trainSamples, targets, dataY.data), new matrix_1.Matrix(testSamples, features, dataT.data), new matrix_1.Matrix(testSamples, targets, dataTY.data));
}
exports.load = load;
//# sourceMappingURL=mnist.js.map