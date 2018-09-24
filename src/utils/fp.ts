import { AnyFunc } from 'simplytyped';

export const prop = <K extends string>(key: K) =>
    <T extends Record<K, any>>(obj: T) => obj[key];

export const invokeProp = <K extends string>(key: K) =>
    <T extends Record<K, () => any>>(obj: T): ReturnType<T[K]> => obj[key]();

export const tapEffect = <F extends AnyFunc>(f: F, effect: () => any): F => {
    return ((...args: any[]) => {
        const out = f(...args);
        effect();
        return out;
    }) as any;
};

export const invoke = <F extends AnyFunc>(f: F): ReturnType<F> => f();

export const giveBack = <T>(d: T) => () => d;

export type BuilderFunction<T> = () => T;
