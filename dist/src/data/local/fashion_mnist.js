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
const fs = require("fs");
const downloader = require("../../utils/downloader");
const Data_1 = require("../../data/local/Data");
const matrix_1 = require("../../utils/matrix");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/fashion_mnist.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
function load(location = '.tmp') {
    return __awaiter(this, void 0, void 0, function* () {
        yield download(location);
        const root = path.join(location, 'fashion_mnist');
        const features = 784;
        const targets = 1;
        const trainSamples = 40000;
        const testSamples = 20000;
        const x_buf = new Uint8Array(features * trainSamples);
        const t_buf = new Uint8Array(features * testSamples);
        const y_buf = new Int32Array(targets * trainSamples);
        const ty_buf = new Int32Array(targets * testSamples);
        const dataX = yield loadData(x_buf, path.join(root, 'train-images-idx3-ubyte'));
        const dataY = yield loadLabels(y_buf, path.join(root, 'train-labels-idx1-ubyte'));
        const dataT = yield loadData(t_buf, path.join(root, 't10k-images-idx3-ubyte'));
        const dataTY = yield loadLabels(ty_buf, path.join(root, 't10k-labels-idx1-ubyte'));
        return new Data_1.Data(new matrix_1.Matrix(trainSamples, features, dataX), new matrix_1.Matrix(trainSamples, targets, dataY), new matrix_1.Matrix(testSamples, features, dataT), new matrix_1.Matrix(testSamples, targets, dataTY));
    });
}
exports.load = load;
const loadData = (data, file) => loadBits(data, file, 16);
const loadLabels = (data, file) => loadBits(data, file, 8);
function loadBits(data, file, headerOffset) {
    const stream = fs.createReadStream(file);
    let ver = 0;
    let idx = 0;
    stream.on('readable', () => {
        const buf = stream.read();
        if (!buf)
            return;
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
    return new Promise((resolve, reject) => {
        stream.on('end', () => resolve(data));
    });
}
//# sourceMappingURL=fashion_mnist.js.map