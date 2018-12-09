"use strict";
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
async function download(url, folder) {
    const file = path.basename(url);
    const downloadDest = path.join(folder, file);
    const exists = await fileExists(downloadDest);
    if (exists)
        return;
    return printer_1.printProgressAsync(async (printer) => {
        printer(`creating file path: ${folder}`);
        await mkdir(folder);
        printer(`retrieving ${url}`);
        const res = await axios_1.default.get(url, { responseType: 'stream' });
        const stream = res.data.pipe(fs.createWriteStream(downloadDest));
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        printer(`unzipping: 0%`);
        await new Promise((resolve, reject) => {
            const decoder = inly(downloadDest, folder);
            decoder.on('progress', (p) => printer(`unzipping: ${p}%`));
            decoder.on('end', resolve);
            decoder.on('error', reject);
        });
    });
}
exports.download = download;
//# sourceMappingURL=downloader.js.map