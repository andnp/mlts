import { Result } from './collectResults';
declare type Filter = (res: Result[]) => Result[];
export declare const createParameterFilter: (fixed: Record<string, string | number>) => Filter;
export declare const collectAndFilter: (path: string, resultFiles: string[], filter: Filter) => Promise<Result[]>;
export {};
