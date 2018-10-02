"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = require("path");
const onExit_1 = require("./onExit");
const childFile = path.join(__dirname, 'childPrinter.js');
const cp = child_process_1.fork(childFile);
onExit_1.onExit(() => cp.kill());
const print = (data) => {
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
function printProgress(f) {
    const res = f(print);
    console.log(''); // tslint:disable-line no-console
    return res;
}
exports.printProgress = printProgress;
function printProgressAsync(f) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield f(print);
        yield flush();
        console.log(''); // tslint:disable-line no-console
        return res;
    });
}
exports.printProgressAsync = printProgressAsync;
//# sourceMappingURL=printer.js.map