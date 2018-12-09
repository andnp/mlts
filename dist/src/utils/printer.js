"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = require("path");
const onExit_1 = require("./onExit");
const isTestOrProd = global.__TEST__ || process.env.env === 'PROD';
const childFile = path.join(__dirname, 'childPrinter.js');
const cp = !isTestOrProd && child_process_1.fork(childFile);
onExit_1.onExit(() => cp && cp.kill());
const print = (data) => {
    if (!cp)
        return;
    cp.send({ type: 'print', data });
};
const flush = () => {
    if (!cp)
        return;
    const p = hasFlushed();
    cp.send({ type: 'flush' });
    return p;
};
const hasFlushed = () => new Promise((resolve, reject) => {
    if (!cp)
        return resolve();
    cp.once('message', d => d.flushed ? resolve() : reject());
});
function printProgress(f) {
    const res = f(print);
    console.log(''); // tslint:disable-line no-console
    return res;
}
exports.printProgress = printProgress;
async function printProgressAsync(f) {
    const res = await f(print);
    await flush();
    console.log(''); // tslint:disable-line no-console
    return res;
}
exports.printProgressAsync = printProgressAsync;
//# sourceMappingURL=printer.js.map