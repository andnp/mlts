import * as rl from 'readline';
import { Printable } from 'utils/printer';

export type PrintMessage = {
    type: 'flush'
} | {
    type: 'print',
    data: Printable,
};

const print = (data: PrintMessage) => {
    if (data.type === 'print') {
        rl.clearLine(process.stdout, 0);
        rl.cursorTo(process.stdout, 0);
        process.stdout.write(data.data.toString());
    } else if (data.type === 'flush') {
        process.send!({ flushed: true });
    }
};

process.on('message', print);
