"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const downloader = require("../../utils/downloader");
const utilities_ts_1 = require("utilities-ts");
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/susycomplete.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
async function load(location = '.tmp') {
    await download(location);
    const features = 18;
    const targets = 1;
    const trainSamples = 60000;
    const testSamples = 40000;
    const x_buf = new Float32Array(features * (trainSamples + testSamples));
    const y_buf = new Int32Array(targets * (trainSamples + testSamples));
    const dataX = await utilities_ts_1.csv.loadCsvToBuffer({
        path: path.join(location, 'susycomplete/susycomplete_X.csv'),
        buffer: x_buf,
    });
    const dataY = await utilities_ts_1.csv.loadCsvToBuffer({
        path: path.join(location, 'susycomplete/susycomplete_Y.csv'),
        buffer: y_buf,
    });
    const x = dataX.slice(0, features * trainSamples);
    const y = dataY.slice(0, targets * trainSamples);
    const t = dataX.slice(features * trainSamples, (features * trainSamples) + (features * testSamples));
    const ty = dataY.slice(targets * trainSamples, (targets * trainSamples) + (targets * testSamples));
    return new Data_1.Data(new matrix_1.Matrix(trainSamples, features, x), new matrix_1.Matrix(trainSamples, targets, y), new matrix_1.Matrix(testSamples, features, t), new matrix_1.Matrix(testSamples, targets, ty));
}
exports.load = load;
//# sourceMappingURL=susy_complete.js.map