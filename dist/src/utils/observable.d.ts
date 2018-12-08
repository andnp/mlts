export interface RawObservable<T> {
    next(data: T): any;
    end(): any;
    error(e: Error | string): any;
}
export declare type OrPromise<T> = T | Promise<T>;
export declare type ObservableCreatorFunction<T> = (obs: RawObservable<T>) => any;
export declare type SubscriptionFunction<T> = (data: T) => any;
export declare type MapFunction<T, R> = (data: T) => OrPromise<R>;
export declare class Observable<T> {
    protected constructor();
    protected completed: boolean;
    protected err: Error | string | undefined;
    protected queue: T[];
    static create<T>(creator: ObservableCreatorFunction<T>): Observable<T>;
    static fromPromises<T>(promises: Array<Promise<T>>): Observable<T>;
    static fromArray<T>(arr: T[]): Observable<T>;
    protected subscriptions: Array<SubscriptionFunction<T>>;
    subscribe(sub: SubscriptionFunction<T>): this;
    protected endHandlers: Array<() => any>;
    onEnd(f: () => any): void;
    protected errorHandlers: Array<(e: Error | string) => any>;
    onError(f: (e: Error | string) => any): void;
    map<R>(sub: MapFunction<T, R>): Observable<R>;
    filter(test: (d: T) => OrPromise<boolean>): Observable<T>;
    protected next(data: T): void;
    protected end(): void;
    protected error(e: Error | string): void;
    then<R>(f: () => R | Promise<R>): Promise<R>;
    private activeTasks;
    private getId;
    flush(): Promise<void>;
    collect(): Promise<T[]>;
    concat(obs: Observable<T>): Observable<T>;
    protected bindEndAndError(obs: Observable<any>): void;
}
