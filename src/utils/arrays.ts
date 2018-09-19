export const middleItem = <T>(arr: T[]): T => {
    if (arr.length % 2 === 0) throw new Error('Expected an odd number of items');
    const idx = Math.floor(arr.length / 2);
    return arr[idx];
};
