export function discriminatedObject<N extends string, T extends Record<N, string>>(name: N, arr: T[]) {
    return arr.reduce((coll, obj) => {
        coll[obj[name]] = obj;
        return coll;
    }, {} as Record<string, T>);
}
