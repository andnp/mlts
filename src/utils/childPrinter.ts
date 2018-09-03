import * as rl from 'readline';
import { Printable } from 'utils/printer';

const print = (data: Printable) => {
    rl.clearLine(process.stdout, 0);
    rl.cursorTo(process.stdout, 0);
    process.stdout.write(data.toString());
};

process.on('message', print);
