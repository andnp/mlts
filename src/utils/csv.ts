import * as _ from 'lodash';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { Buffer, Matrix } from 'utils/matrix';
import { Writable } from 'stream';
import { createFolder } from 'utils/files';

class LineCollector extends Writable {
    private buf = '';
    _write(chunk: Buffer, encoding: string, done: () => void) {
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

interface CSVParserOptions {
    skipFirst: boolean;
}

class CSVParser<B extends Buffer> {
    protected o: CSVParserOptions;
    private skippedFirst = false;
    private i = 0;

    constructor(
        private buffer: B,
        opts?: Partial<CSVParserOptions>,
    ) {
        this.o = _.merge({
            skipFirst: false,
        }, opts);
    }

    listen = (line: string) => {
        if (this.o.skipFirst && !this.skippedFirst) {
            this.skippedFirst = true;
            return;
        }

        const arr = line.split(',').map(x => parseFloat(x));
        arr.forEach(d => this.buffer[this.i++] = d);
    }
}

interface LoadCsvParams<B extends Buffer> {
    path: string;
    buffer: B;
}
export function loadCsvToBuffer<B extends Buffer>(params: LoadCsvParams<B>): Promise<B> {
    const { path, buffer } = params;

    const parser = new CSVParser(buffer);

    const stream = fs.createReadStream(path)
        .pipe(new LineCollector());

    return new Promise<B>((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', () => resolve(buffer));
        stream.on('data', parser.listen);
    });
}

interface Indexed2D {
    rows: number;
    cols: number;
    get: (i: number, j: number) => number;
}
export async function writeCsv(path: string, m: Indexed2D) {
    await createFolder(path);
    const stream = fs.createWriteStream(path);

    for (let i = 0; i < m.rows; ++i) {
        let line = '';
        for (let j = 0; j < m.cols; ++j) {
            line += m.get(i, j);

            // no trailing commas
            if (j !== m.cols - 1) line += ',';
        }
        // trailing spaces are okay
        stream.write(line + '\n');
    }

    stream.end();
}
