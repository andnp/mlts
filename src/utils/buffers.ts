export type BufferArray = Uint8Array | Int32Array | Float32Array;

export function toArray(b: BufferArray): number[] {
    const arr: number[] = [];
    for (const v of b) arr.push(v);
    return arr;
}
