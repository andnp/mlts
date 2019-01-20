"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const downloader = require("../../utils/downloader");
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const idx = require("idx-data");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/gs_cifar10.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
async function load(location = '.tmp') {
    await download(location);
    const root = path.join(location, 'cifar');
    const [dataX, dataY,] = await Promise.all([
        idx.loadBits(path.join(root, 'cifar_data.idx')),
        idx.loadBits(path.join(root, 'cifar_labels.idx')),
    ]);
    const x = dataX.data.slice(0, 1024 * 50000);
    const y = dataY.data.slice(0, 50000);
    const t = dataX.data.slice(1024 * 50000, 1024 * 60000);
    const ty = dataY.data.slice(50000, 60000);
    return new Data_1.Data(new matrix_1.Matrix(50000, 1024, x), new matrix_1.Matrix(50000, 1, y), new matrix_1.Matrix(10000, 1024, t), new matrix_1.Matrix(10000, 1, ty));
}
exports.load = load;
//# sourceMappingURL=gray_cifar10.js.map