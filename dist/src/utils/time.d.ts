import { Nominal } from "simplytyped";
export declare const seconds: (x: number) => Nominal<number, "milliseconds">;
export declare const minutes: (x: number) => Nominal<number, "milliseconds">;
export declare const hours: (x: number) => Nominal<number, "milliseconds">;
export declare const days: (x: number) => Nominal<number, "milliseconds">;
export declare type Milliseconds = Nominal<number, 'milliseconds'>;
export declare const getUTC: () => Nominal<number, "milliseconds">;
export declare const toIso: (time: Nominal<number, "milliseconds">) => string;
