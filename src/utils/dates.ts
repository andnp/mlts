export function getMostRecent(times: Array<number | Date | string>) {
    const dates = times.map(t => new Date(t).getTime());
    const max = Math.max(...dates);
    return new Date(max);
}
