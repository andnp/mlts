"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const downloader = require("../../utils/downloader");
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const idx = require("../utils/idx");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
async function load(location = '.tmp') {
    await download(location);
    const root = path.join(location, 'deterding');
    const trainSamples = 528;
    const testSamples = 462;
    const features = 10;
    const classes = 11;
    const [dataX, dataY, dataT, dataTY,] = await Promise.all([
        idx.loadBits(path.join(root, 'deterding_data.idx')),
        idx.loadBits(path.join(root, 'deterding_labels.idx')),
        idx.loadBits(path.join(root, 'deterding_test-data.idx')),
        idx.loadBits(path.join(root, 'deterding_test-labels.idx')),
    ]);
    return new Data_1.Data(new matrix_1.Matrix(trainSamples, features, dataX.data), new matrix_1.Matrix(trainSamples, classes, dataY.data), new matrix_1.Matrix(testSamples, features, dataT.data), new matrix_1.Matrix(testSamples, classes, dataTY.data));
}
exports.load = load;
//# sourceMappingURL=deterding.js.map