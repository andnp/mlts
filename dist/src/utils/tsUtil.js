"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tuple(t1, t2) {
    return [t1, t2];
}
exports.tuple = tuple;
function assertNever(t, msg = 'Unexpected `assertNever` branch reached') {
    throw new Error(msg);
}
exports.assertNever = assertNever;
/**
 * A noop function that enhances readability through clear expression of intent
 */
function returnVoid() { }
exports.returnVoid = returnVoid;
//# sourceMappingURL=tsUtil.js.map