"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = require("utils/fp");
const toDispose = [];
process.on('beforeExit', () => {
    toDispose.forEach(fp_1.invoke);
});
function onExit(f) {
    toDispose.push(f);
}
exports.onExit = onExit;
//# sourceMappingURL=onExit.js.map