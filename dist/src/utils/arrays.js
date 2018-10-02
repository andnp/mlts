"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleItem = (arr) => {
    if (arr.length % 2 === 0)
        throw new Error('Expected an odd number of items');
    const idx = Math.floor(arr.length / 2);
    return arr[idx];
};
exports.getFirst = (arr) => {
    if (!Array.isArray(arr))
        return arr;
    if (arr.length < 1)
        throw new Error('Expected a non-empty array');
    return arr[0];
};
exports.getLast = (arr) => {
    if (!Array.isArray(arr))
        return arr;
    if (arr.length < 1)
        throw new Error('Expected a non-empty array');
    return arr[arr.length - 1];
};
//# sourceMappingURL=arrays.js.map