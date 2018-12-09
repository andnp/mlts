"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delay = (time) => new Promise(resolve => setTimeout(resolve, time));
async function repeat(times, f) {
    const ret = [];
    for (let i = 0; i < times; ++i) {
        const r = await delay(1).then(f);
        ret.push(r);
    }
    return ret;
}
exports.repeat = repeat;
//# sourceMappingURL=tasks.js.map