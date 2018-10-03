"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const downloader = require("../../utils/downloader");
const csv_1 = require("../../utils/csv");
const promise_1 = require("../../utils/promise");
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
function load(location = '.tmp') {
    return __awaiter(this, void 0, void 0, function* () {
        yield download(location);
        const trainSamples = 528;
        const testSamples = 462;
        const features = 10;
        const classes = 11;
        const x_buf = new Float32Array(trainSamples * features);
        const y_buf = new Float32Array(trainSamples * classes);
        const t_buf = new Float32Array(testSamples * features);
        const ty_buf = new Float32Array(testSamples * classes);
        const data = yield promise_1.allValues({
            X: csv_1.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_X.csv'), buffer: x_buf }),
            Y: csv_1.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_Y.csv'), buffer: y_buf }),
            T: csv_1.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_T.csv'), buffer: t_buf }),
            TY: csv_1.loadCsvToBuffer({ path: path.join(location, 'deterding/deterding_TY.csv'), buffer: ty_buf }),
        });
        return new Data_1.Data(new matrix_1.Matrix(trainSamples, features, data.X), new matrix_1.Matrix(trainSamples, classes, data.Y), new matrix_1.Matrix(testSamples, features, data.T), new matrix_1.Matrix(testSamples, classes, data.TY));
    });
}
exports.load = load;
//# sourceMappingURL=deterding.js.map