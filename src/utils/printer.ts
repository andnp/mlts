import * as rl from 'readline';

interface Printable { toString(): string; }
export function printProgress(f: (printer: (data: Printable) => void) => void) {
    const print = (data: Printable) => {
        rl.clearLine(process.stdout, 0);
        rl.cursorTo(process.stdout, 0);
        process.stdout.write(`${data}`);
    };
    f(print);
    console.log(''); // tslint:disable-line no-console
}
