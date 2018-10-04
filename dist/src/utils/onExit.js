"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
const toDispose = [];
let exitHandled = false;
const exitHandler = () => {
    if (exitHandled)
        return;
    exitHandled = true;
    toDispose.forEach(utilities_ts_1.fp.invoke);
    process.exit();
};
process.on('exit', exitHandler);
process.on('unhandledRejection', e => {
    console.log(e);
    exitHandler();
});
process.on('uncaughtException', e => {
    console.log(e);
    exitHandler();
});
// process.on('SIGINT', exitHandler);
// process.on('SIGUSR1', exitHandler);
// process.on('SIGUSR2', exitHandler);
function onExit(f) {
    toDispose.push(f);
}
exports.onExit = onExit;
//# sourceMappingURL=onExit.js.map