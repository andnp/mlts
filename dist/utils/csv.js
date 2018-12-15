"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fs = require("fs");
const csv = require("fast-csv");
const matrix_1 = require("utils/matrix");
const stream_1 = require("stream");
class LineCollector extends stream_1.Duplex {
    constructor() {
        super(...arguments);
        this.buf = '';
    }
    _write(chunk, encoding, done) {
        const data = chunk.toString();
        const s = data.split('\n');
        this.buf += s[0];
        if (s.length > 1) {
            this.emit('data', this.buf);
            this.buf = '';
            s.slice(1, -1)
                .forEach(p => this.emit('data', p));
            this.buf += _.last(s);
        }
        done();
    }
}
class CSVParser extends stream_1.Duplex {
    _write(chunk, encoding, done) {
        console.log(chunk.toString().split('\n').length);
        done();
    }
}
function testLoad(path) {
    return new Promise((resolve) => fs.createReadStream(path)
        .pipe(new LineCollector())
        .pipe(new CSVParser())
        .on('data', d => console.log('lines', d.split('\n').length))
        .on('finish', resolve));
}
exports.testLoad = testLoad;
function loadCsvToBuffer(params) {
    const { path, buffers, arrayToBuffer } = params;
    const stream = csv.fromPath(path);
    return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('end', () => resolve(buffers));
        stream.on('data', d => {
            buffers.push(arrayToBuffer(d));
        });
    });
}
exports.loadCsvToBuffer = loadCsvToBuffer;
function loadCsv(path) {
    const rawData = [];
    return new Promise((resolve, reject) => {
        csv.fromPath(path)
            .on('data', d => rawData.push(d))
            .on('end', () => resolve(new matrix_1.Matrix(rawData)))
            .on('error', reject);
    });
}
exports.loadCsv = loadCsv;
function writeCsv(path, m) {
    const stream = csv.writeToPath(path, m.raw);
    return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}
exports.writeCsv = writeCsv;
//# sourceMappingURL=csv.js.map