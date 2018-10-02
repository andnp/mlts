export declare const join: <T, U, R>(p1: Promise<T>, p2: Promise<U>, j: (x: T, y: U) => R | Promise<R>) => Promise<R>;
export declare const delay: (time: import("simplytyped/types/utils").Nominal<number, "milliseconds">) => Promise<void>;
declare type PromiseValue<P> = P extends Promise<infer T> ? T : P;
export declare const allValues: <T extends Record<string, any>>(obj: T) => Promise<{ [K in keyof T]: PromiseValue<T[K]>; }>;
export declare const map: <T, R>(arr: T[], f: (x: T) => R | Promise<R>) => Promise<R[]>;
export {};
