declare type TaskFunc<R> = () => R;
export declare function repeat<F extends TaskFunc<any>>(times: number, f: F): Promise<ReturnType<F>[]>;
export {};
