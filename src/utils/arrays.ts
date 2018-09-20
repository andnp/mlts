export const middleItem = <T>(arr: T[]): T => {
    if (arr.length % 2 === 0) throw new Error('Expected an odd number of items');
    const idx = Math.floor(arr.length / 2);
    return arr[idx];
};

export const getFirst = <T>(arr: T | T[]): T => {
    if (!Array.isArray(arr)) return arr;
    if (arr.length < 1) throw new Error('Expected a non-empty array');
    return arr[0];
};
