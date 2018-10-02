import { Milliseconds } from "./time";

export const join = <T, U, R> (p1: Promise<T>, p2: Promise<U>, j: ((x: T, y: U) => R | Promise<R>)): Promise<R> => {
    return p1.then(x => p2.then(y => j(x, y)));
};

export const delay = (time: Milliseconds): Promise<void> => {
    return new Promise<void>(resolve => setTimeout(resolve, time));
};

type PromiseValue<P> = P extends Promise<infer T> ? T : P;
type PromiseValueObject<P extends Record<string, any>> = Promise<{
    [K in keyof P]: PromiseValue<P[K]>;
}>;
export const allValues = <T extends Record<string, any>>(obj: T): PromiseValueObject<T> => {
    const mapPromise = Object.keys(obj).map(key => {
        return new Promise<{ key: string, value: any }>((resolve, reject) => {
            const p = obj[key];
            if (p instanceof Promise) {
                p.then(value => resolve({ key, value }))
                 .catch(reject);
            } else {
                resolve({ key, value: p });
            }
        });
    });

    return Promise.all(mapPromise)
        .then(map => map.reduce((coll, obj) => {
            coll[obj.key] = obj.value;
            return coll;
        }, {} as any));
};

export const map = <T, R>(arr: T[], f: (x: T) => R | Promise<R>): Promise<R[]> => {
    return Promise.all(arr.map(f));
};
