"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prop = (key) => (obj) => obj[key];
exports.invokeProp = (key) => (obj) => obj[key]();
exports.tapEffect = (f, effect) => {
    return ((...args) => {
        const out = f(...args);
        effect();
        return out;
    });
};
exports.invoke = (f) => f();
exports.giveBack = (d) => () => d;
//# sourceMappingURL=fp.js.map