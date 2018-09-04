import * as seedRandom from 'seed-random';

let seededRandom: (() => number) | undefined;
export function random() {
    if (seededRandom) return seededRandom();
    return Math.random();
}

export function setSeed(s: string) {
    if (seededRandom !== undefined) throw new Error('Tried to change the random seed after it was already set');
    seededRandom = seedRandom(s);
}
