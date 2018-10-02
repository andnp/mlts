import { PlainObject } from 'simplytyped';
import { BufferArray } from './buffers';
interface LoadCsvParams<B extends BufferArray> {
    path: string;
    buffer: B;
}
export declare function loadCsvToBuffer<B extends BufferArray>(params: LoadCsvParams<B>): Promise<B>;
interface Indexed2D {
    rows: number;
    cols: number;
    get: (i: number, j: number) => number;
}
export declare function writeCsv(path: string, m: Indexed2D): Promise<void>;
export declare function csvStringFromObject(obj: PlainObject): string;
export {};
