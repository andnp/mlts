"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = require("./fp");
const toDispose = [];
let exitHandled = false;
const exitHandler = () => {
    if (exitHandled)
        return;
    exitHandled = true;
    toDispose.forEach(fp_1.invoke);
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