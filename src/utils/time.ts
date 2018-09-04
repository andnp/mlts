import { Nominal } from "simplytyped";

export const seconds = (x: number) => x * 1000 as Milliseconds;
export const minutes = (x: number) => 60 * seconds(x) as Milliseconds;
export const hours = (x: number) => 60 * minutes(x) as Milliseconds;
export const days = (x: number) => 24 * hours(x) as Milliseconds;

export type Milliseconds = Nominal<number, 'milliseconds'>;

export const getUTC = () => new Date().getTime() as Milliseconds;
export const toIso = (time: Milliseconds) => new Date(time).toISOString();
