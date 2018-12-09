"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const downloader = require("../../utils/downloader");
const utilities_ts_1 = require("utilities-ts");
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
async function load(location = '.tmp') {
    await download(location);
    const trainSamples = 528;
    const testSamples = 462;
    const features = 10;
    const classes = 11;
    const x_buf = new Float32Array(trainSamples * features);
    const y_buf = new Float32Array(trainSamples * classes);
    const t_buf = new Float32Array(testSamples * features);
    const ty_buf = new Float32Array(testSamples * classes);
    const data = await utilities_ts_1.promise.allValues({
        X: utilities_ts_1.csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_X.csv'), buffer: x_buf }),
        Y: utilities_ts_1.csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_Y.csv'), buffer: y_buf }),
        T: utilities_ts_1.csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_T.csv'), buffer: t_buf }),
        TY: utilities_ts_1.csv.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_TY.csv'), buffer: ty_buf }),
    });
    return new Data_1.Data(new matrix_1.Matrix(trainSamples, features, data.X), new matrix_1.Matrix(trainSamples, classes, data.Y), new matrix_1.Matrix(testSamples, features, data.T), new matrix_1.Matrix(testSamples, classes, data.TY));
}
exports.load = load;
//# sourceMappingURL=deterding.js.map