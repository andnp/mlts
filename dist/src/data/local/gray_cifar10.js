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
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/gs_cifar10.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
function load(location = '.tmp') {
    return __awaiter(this, void 0, void 0, function* () {
        yield download(location);
        const x_buf = new Uint8Array(1024 * 60000);
        const y_buf = new Int32Array(1 * 60000);
        const dataX = yield csv_1.loadCsvToBuffer({
            path: path.join(location, 'cifar/cifar_X.csv'),
            buffer: x_buf,
        });
        const dataY = yield csv_1.loadCsvToBuffer({
            path: path.join(location, 'cifar/cifar_Y.csv'),
            buffer: y_buf,
        });
        const x = dataX.slice(0, 1024 * 50000);
        const y = dataY.slice(0, 50000);
        const t = dataX.slice(1024 * 50000, 1024 * 60000);
        const ty = dataY.slice(50000, 60000);
        return new Data_1.Data(new matrix_1.Matrix(50000, 1024, x), new matrix_1.Matrix(50000, 1, y), new matrix_1.Matrix(10000, 1024, t), new matrix_1.Matrix(10000, 1, ty));
    });
}
exports.load = load;
//# sourceMappingURL=gray_cifar10.js.map