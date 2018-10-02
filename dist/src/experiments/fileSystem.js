"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const hash = require("object-hash");
exports.getResultsPath = (experiment, metaParameters, run) => {
    return path.join(hash(Object.assign({}, experiment, { metaParameters })), `${run}`);
};
//# sourceMappingURL=fileSystem.js.map