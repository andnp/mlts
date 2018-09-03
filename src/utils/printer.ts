import * as rl from 'readline';

const print = (data: Printable) => {
    rl.clearLine(process.stdout, 0);
    rl.cursorTo(process.stdout, 0);
    process.stdout.write(`${data}`);
};
interface Printable { toString(): string; }
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
