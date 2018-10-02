"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rl = require("readline");
const print = (data) => {
    if (data.type === 'print') {
        rl.clearLine(process.stdout, 0);
        rl.cursorTo(process.stdout, 0);
        process.stdout.write(data.data.toString());
    }
    else if (data.type === 'flush') {
        process.send({ flushed: true });
    }
};
process.on('message', print);
//# sourceMappingURL=childPrinter.js.map