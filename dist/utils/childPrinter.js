"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rl = require("readline");
const print = (data) => {
    rl.clearLine(process.stdout, 0);
    rl.cursorTo(process.stdout, 0);
    process.stdout.write(data.toString());
};
process.on('message', print);
//# sourceMappingURL=childPrinter.js.map