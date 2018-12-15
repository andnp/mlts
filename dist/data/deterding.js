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
const promise_1 = require("utils/promise");
const Data_1 = require("data/Data");
const dataRemoteLocation = 'https://rawgit.com/andnp/ml_data/master/deterding.tar.gz';
function download(location = '.tmp') {
    return downloader.download(dataRemoteLocation, location);
}
exports.download = download;
function load(location = '.tmp') {
    return __awaiter(this, void 0, void 0, function* () {
        yield download(location);
        const data = yield promise_1.allValues({
            X: csv_1.loadCsv(path.join(location, 'deterding/deterding_X.csv')),
            Y: csv_1.loadCsv(path.join(location, 'deterding/deterding_Y.csv')),
            T: csv_1.loadCsv(path.join(location, 'deterding/deterding_T.csv')),
            TY: csv_1.loadCsv(path.join(location, 'deterding/deterding_TY.csv')),
        });
        return new Data_1.Data(data.X, data.Y, data.T, data.TY);
    });
}
exports.load = load;
//# sourceMappingURL=deterding.js.map