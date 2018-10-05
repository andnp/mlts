"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseArgs() {
    const [, , ...argList] = process.argv;
    const args = {};
    for (let i = 0; i < argList.length; ++i) {
        const arg = argList[i];
        if (!isFlag(arg))
            throw new Error(`Expected to find flag argument. <${arg}>`);
        const nextArg = argList[i + 1];
        if (!nextArg || isFlag(nextArg)) {
            args[dropFlags(arg)] = 'true';
        }
        else {
            args[dropFlags(arg)] = nextArg;
            // we've already processed i + 1 now, so skip over it
            i += 1;
        }
    }
    return args;
}
exports.parseArgs = parseArgs;
function dropFlags(arg) {
    return arg.replace(/-+/, '');
}
function isFlag(arg) {
    return arg.substr(0, 1) === '-' || arg.substr(0, 2) === '--';
}
//# sourceMappingURL=commandLine.js.map