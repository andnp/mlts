import { PlainObject } from 'simplytyped';
export declare type Lens = (o: PlainObject) => any;
export declare const lens: (k: string) => Lens;
