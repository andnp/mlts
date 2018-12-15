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
const downloader = require("utils/downloader");
const csv_1 = require("utils/csv");
const Data_1 = require("data/Data");
const matrix_1 = require("utils/matrix");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/cifar10.csv.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
function load(location = '.tmp') {
    return __awaiter(this, void 0, void 0, function* () {
        yield download(location);
        const buffers = [];
        const arrayToBuffer = (x) => {
            if (x.length !== 1025)
                throw new Error(`Unexpected number of elements in row: <${x.length}>`);
            const b = new Uint8Array(1025);
            b.set(x);
            return b;
        };
        const data = yield csv_1.loadCsvToBuffer({
            path: path.join(location, 'cifar10.csv'),
            buffers,
            arrayToBuffer,
        });
        console.log('loaded');
        const DX = [];
        const DY = [];
        for (let i = 0; i < 60000; ++i) {
            DX.push(data[i].slice(1, 1025));
            DY.push(data[i].slice(0, 1));
        }
        const x = DX.slice(0, 50000);
        const y = DY.slice(0, 50000);
        const t = DX.slice(50000, 60000);
        const ty = DY.slice(50000, 60000);
        console.log(x.length, x[0].length, y.length, y[0].length, t.length, t[0].length, ty.length, ty[0].length);
        return new Data_1.Data(new matrix_1.Matrix(x), new matrix_1.Matrix(y), new matrix_1.Matrix(t), new matrix_1.Matrix(ty));
    });
}
exports.load = load;
//# sourceMappingURL=gray_cifar10.js.map