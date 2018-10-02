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
const _ = require("lodash");
const fs = require("fs");
const stream_1 = require("stream");
const files_1 = require("./files");
class LineCollector extends stream_1.Writable {
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
    _final(done) {
        this.emit('data', this.buf);
        done();
    }
}
class CSVParser {
    constructor(buffer, opts) {
        this.buffer = buffer;
        this.skippedFirst = false;
        this.i = 0;
        this.listen = (line) => {
            if (this.o.skipFirst && !this.skippedFirst) {
                this.skippedFirst = true;
                return;
            }
            const arr = line.split(',').map(x => parseFloat(x));
            arr.forEach(d => this.buffer[this.i++] = d);
        };
        this.o = _.merge({
            skipFirst: false,
        }, opts);
    }
}
function loadCsvToBuffer(params) {
    const { path, buffer } = params;
    const parser = new CSVParser(buffer);
    const stream = fs.createReadStream(path)
        .pipe(new LineCollector());
    return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', () => resolve(buffer));
        stream.on('data', parser.listen);
    });
}
exports.loadCsvToBuffer = loadCsvToBuffer;
function writeCsv(path, m) {
    return __awaiter(this, void 0, void 0, function* () {
        yield files_1.createFolder(path);
        const stream = fs.createWriteStream(path);
        for (let i = 0; i < m.rows; ++i) {
            let line = '';
            for (let j = 0; j < m.cols; ++j) {
                line += m.get(i, j);
                // no trailing commas
                if (j !== m.cols - 1)
                    line += ',';
            }
            // trailing spaces are okay
            stream.write(line + '\n');
        }
        return new Promise(resolve => stream.end(resolve));
    });
}
exports.writeCsv = writeCsv;
function csvStringFromObject(obj) {
    const keys = Object.keys(obj).sort();
    return keys.reduce((str, key, i) => i === 0 ? `${obj[key]}` : `${str}, ${obj[key]}`, '');
}
exports.csvStringFromObject = csvStringFromObject;
//# sourceMappingURL=csv.js.map