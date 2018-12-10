"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seedRandom = require("seedrandom");
const _ = require("lodash");
let seed;
function random() {
    if (!seed)
        setSeed('some random string');
    return Math.random();
}
exports.random = random;
function randomInteger(min, max) {
    min = min || 0;
    max = max || Number.MAX_SAFE_INTEGER;
    return Math.floor(random() * (max - min + 1)) + min;
}
exports.randomInteger = randomInteger;
function setSeed(s) {
    if (seed !== undefined)
        throw new Error('Tried to change the random seed after it was already set');
    seed = s;
    seedRandom(s, { global: true });
}
exports.setSeed = setSeed;
function getSeed() {
    if (!seed)
        setSeed('some random string');
    if (seed === undefined)
        throw new Error('Tried to get a seed before it was already set');
    let n = 0;
    for (let i = 0; i < seed.length; ++i) {
        const chr = seed.charCodeAt(i);
        n = ((n << 5) - n) + chr; // tslint:disable-line no-bitwise
        n |= 0; // tslint:disable-line no-bitwise
    }
    return n;
}
exports.getSeed = getSeed;
let i = 0;
function getIncrementingSeed() {
    const s = getSeed();
    return s + i++;
}
exports.getIncrementingSeed = getIncrementingSeed;
function randomIndices(n) {
    return shuffle(_.times(n, i => i));
}
exports.randomIndices = randomIndices;
function shuffle(n) {
    const lodash = _.runInContext();
    return lodash.shuffle(n);
}
exports.shuffle = shuffle;
//# sourceMappingURL=random.js.map