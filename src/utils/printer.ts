import { fork } from 'child_process';
import * as path from 'path';
import * as _ from 'lodash';

import { onExit } from './onExit';

const childFile = path.join(__dirname, 'childPrinter.js');
const cp = fork(childFile);
onExit(() => cp.kill());

const print = (data: Printable) => {
    cp.send({ type: 'print', data });
};

const flush = () => {
    const p = hasFlushed();
    cp.send({ type: 'flush' });
    return p;
};
const hasFlushed = () => new Promise((resolve, reject) => {
    cp.once('message', d => d.flushed ? resolve() : reject());
});

export interface Printable { toString(): string; }
export type Printer = (data: Printable) => void;
export function printProgress<R>(f: (printer: Printer) => R) {
    const res = f(print);
    console.log(''); // tslint:disable-line no-console
    return res;
}

export async function printProgressAsync<R>(f: (printer: Printer) => Promise<R>) {
    const res = await f(print);
    await flush();
    console.log(''); // tslint:disable-line no-console
    return res;
}
