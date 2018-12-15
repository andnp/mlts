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
const axios_1 = require("axios");
const inly = require("inly");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const util_1 = require("util");
const printer_1 = require("./printer");
const mkdir = util_1.promisify(mkdirp);
const fileExists = util_1.promisify(fs.exists);
function download(url, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = path.basename(url);
        const downloadDest = path.join(folder, file);
        const exists = yield fileExists(downloadDest);
        if (exists)
            return;
        return printer_1.printProgressAsync((printer) => __awaiter(this, void 0, void 0, function* () {
            printer(`creating file path: ${folder}`);
            yield mkdir(folder);
            printer(`retrieving ${url}`);
            const res = yield axios_1.default.get(url, { responseType: 'stream' });
            const stream = res.data.pipe(fs.createWriteStream(downloadDest));
            yield new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });
            printer(`unzipping: 0%`);
            yield new Promise((resolve, reject) => {
                const decoder = inly(downloadDest, folder);
                decoder.on('progress', (p) => printer(`unzipping: ${p}%`));
                decoder.on('end', resolve);
                decoder.on('error', reject);
            });
        }));
    });
}
exports.download = download;
//# sourceMappingURL=downloader.js.map