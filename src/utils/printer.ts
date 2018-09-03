import { fork } from 'child_process';
import * as path from 'path';
import { onExit } from 'utils/onExit';

const childFile = path.join(__dirname, 'childPrinter.js');
const cp = fork(childFile);
onExit(() => cp.kill());

const print = (data: Printable) => {
    cp.send(data);
};
export interface Printable { toString(): string; }
export function printProgress<R>(f: (printer: (data: Printable) => void) => R) {
    const res = f(print);
    console.log(''); // tslint:disable-line no-console
    return res;
}

export async function printProgressAsync<R>(f: (printer: (data: Printable) => void) => Promise<R>) {
    const res = await f(print);
    console.log(''); // tslint:disable-line no-console
    return res;
}
