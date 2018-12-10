import * as seedRandom from 'seedrandom';
import * as _ from 'lodash';

let seed: string | undefined;
export function random() {
    if (!seed) setSeed('some random string');
    return Math.random();
}

export function randomInteger(min?: number, max?: number) {
    min = min || 0;
    max = max || Number.MAX_SAFE_INTEGER;
    return Math.floor(random() * (max - min + 1)) + min;
}

export function setSeed(s: string) {
    if (seed !== undefined) throw new Error('Tried to change the random seed after it was already set');
    seed = s;
    seedRandom(s, { global: true });
}

export function getSeed() {
    if (!seed) setSeed('some random string');
    if (seed === undefined) throw new Error('Tried to get a seed before it was already set');
    let n = 0;
    for(let i = 0; i < seed.length; ++i) {
        const chr = seed.charCodeAt(i);
        n = ((n << 5) - n) + chr; // tslint:disable-line no-bitwise
        n |= 0; // tslint:disable-line no-bitwise
    }
    return n;
}

let i = 0;
export function getIncrementingSeed() {
    const s = getSeed();
    return s + i++;
}

export function randomIndices(n: number) {
    return shuffle(_.times(n, i => i));
}

export function shuffle<T>(n: T[]) {
    const lodash = _.runInContext();
    return lodash.shuffle(n);
}
