import * as _ from 'lodash';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { RawMatrix, Matrix } from 'utils/matrix';
import { Writable } from 'stream';

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

    _read() {

    }
}

interface CSVParserOptions {
    skipFirst: boolean;
}

class CSVParser {
    protected o: CSVParserOptions;
    private skippedFirst = false;

    constructor(
        opts?: Partial<CSVParserOptions>,
    ) {
        this.o = _.merge({
            skipFirst: false,
        }, opts);
    }

    listen = (data: string) => {

    }
}

export function testLoad(path: string) {
    return new Promise((resolve) => fs.createReadStream(path)
        .pipe(new LineCollector())
        .on('data', d => {
            const data = d.split(',').map('')
        })
        .on('finish', resolve));
}

type Buffer = Uint8Array | Uint16Array;
interface LoadCsvParams<B extends Buffer> {
    path: string;
    buffers: B[];
    arrayToBuffer: (x: number[]) => B;
}
export function loadCsvToBuffer<B extends Buffer>(params: LoadCsvParams<B>): Promise<B[]> {
    const { path, buffers, arrayToBuffer } = params;

    const stream = csv.fromPath(path);
    return new Promise<B[]>((resolve, reject) => {
        stream.on('error', reject);
        stream.on('end', () => resolve(buffers));

        stream.on('data', d => {
            buffers.push(arrayToBuffer(d));
        });
    });
}

export function loadCsv(path: string): Promise<Matrix> {
    const rawData: RawMatrix = [];

    return new Promise<Matrix>((resolve, reject) => {
        csv.fromPath(path)
            .on('data', d => rawData.push(d))
            .on('end', () => resolve(new Matrix(rawData)))
            .on('error', reject);
    });
}

export function writeCsv(path: string, m: Matrix) {
    const stream = csv.writeToPath(path, m.raw);
    return new Promise<void>((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}
