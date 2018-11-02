import { fork } from 'child_process';
import * as path from 'path';
import * as _ from 'lodash';

import { onExit } from './onExit';

const isTestOrProd: boolean = (global as any).__TEST__ || (global as any).__PROD__;

const childFile = path.join(__dirname, 'childPrinter.js');
const cp = !isTestOrProd && fork(childFile);
onExit(() => cp && cp.kill());

const print = (data: Printable) => {
    if (!cp) return;
    cp.send({ type: 'print', data });
};

const flush = () => {
    if (!cp) return;
    const p = hasFlushed();
    cp.send({ type: 'flush' });
    return p;
};
const hasFlushed = () => new Promise((resolve, reject) => {
    if (!cp) return resolve();
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
