import { AnyFunc } from 'simplytyped';
export declare const prop: <K extends string>(key: K) => <T extends Record<K, any>>(obj: T) => T[K];
export declare const invokeProp: <K extends string>(key: K) => <T extends Record<K, () => any>>(obj: T) => ReturnType<T[K]>;
export declare const tapEffect: <F extends AnyFunc<any>>(f: F, effect: () => any) => F;
export declare const invoke: <F extends AnyFunc<any>>(f: F) => ReturnType<F>;
export declare const giveBack: <T>(d: T) => () => T;
export declare type BuilderFunction<T> = () => T;
