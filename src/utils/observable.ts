import { fp, promise } from "utilities-ts";

export interface RawObservable<T> {
    next(data: T): any;
    end(): any;
    error(e: Error | string): any;
}

export type OrPromise<T> = T | Promise<T>;
export type ObservableCreatorFunction<T> = (obs: RawObservable<T>) => any;
export type SubscriptionFunction<T> = (data: T) => any;
export type MapFunction<T, R> = (data: T) => OrPromise<R>;

export class Observable<T> {
    protected constructor() {}

    // -----
    // State
    // -----
    protected completed = false;
    protected err: Error | string | undefined;
    protected queue: T[] = [];
    protected parallel: number = 0;

    // --------
    // Creators
    // --------
    static create<T>(creator: ObservableCreatorFunction<T>): Observable<T> {
        const obs = new Observable<T>();

        // Create on next frame.
        // This allows subscriptions to occur before the creator function is called.
        setTimeout(() => {
            creator({
                next: d => obs.next(d),
                end: () => obs.end(),
                error: e => obs.error(e),
            });
        }, 1);

        return obs;
    }

    static fromPromises<T>(promises: Array<Promise<T>>): Observable<T> {
        const obs = Observable.create<T>(creator => {
            promises.forEach(promise => {
                promise.then(creator.next);
                promise.catch(creator.error);
            });

            Promise.all(promises).then(creator.end);
        });

        return obs;
    }

    static fromArray<T>(arr: T[]): Observable<T> {
        const obs = Observable.create<T>(creator => {
            arr.forEach(creator.next);
            creator.end();
        });

        return obs;
    }

    // -------------
    // Subscriptions
    // -------------
    protected subscriptions: Array<SubscriptionFunction<T>> = [];
    subscribe(sub: SubscriptionFunction<T>) {
        this.subscriptions.push(sub);
        return this;
    }

    protected endHandlers: Array<() => any> = [];
    onEnd(f: () => any) {
        this.endHandlers.push(f);
    }

    protected errorHandlers: Array<(e: Error | string) => any> = [];
    onError(f: (e: Error | string) => any) {
        this.errorHandlers.push(f);
    }

    // ---------------------
    // Special Subscriptions
    // ---------------------
    map<R>(sub: MapFunction<T, R>): Observable<R> {
        const obs = new Observable<R>();

        this.subscribe(async (data) => {
            const r = await sub(data);
            obs.next(r);
        });
        this.bindEndAndError(obs);

        return obs;
    }

    filter(test: (d: T) => OrPromise<boolean>): Observable<T> {
        const obs = new Observable<T>();

        this.subscribe(async (data) => {
            const filter = await test(data);
            if (filter) obs.next(data);
        });
        this.bindEndAndError(obs);

        return obs;
    }

    // ---------
    // Data Flow
    // ---------
    protected next(data: T) {
        if (this.completed || this.err) return;
        this.queue.push(data);
        this.execute();
    }

    protected end() {
        if (this.completed || this.err) return;
        this.completed = true;
        this.flush().then(() => {
            this.endHandlers.forEach(fp.invoke);
            this.dispose();
        });
    }

    protected error(e: Error | string) {
        if (this.completed || this.err) return;
        this.err = e;
        this.flush().then(() => {
            this.errorHandlers.forEach(f => f(e));
            this.dispose();
        });
    }

    // -----
    // Async
    // -----
    async then<R>(f: () => R | Promise<R>): Promise<R> {
        // if this observable is already done, just return
        if (this.completed || this.err) return f();

        // otherwise, return once the `end` or `error` function is called
        return new Promise((resolve, reject) => {
            this.onEnd(resolve);
            this.onError(reject);
        }).then(f);
    }

    private activeTasks: Record<string, Promise<any>> = {};
    private getId = uniqueId();
    private async execute() {
        const active = Object.keys(this.activeTasks).length;
        const remaining = this.queue.length;
        const shouldExecute = this.parallel > 0 ? min(this.parallel - active, remaining) : remaining;

        for (let i = 0; i < shouldExecute; ++i) {
            const id = this.getId();
            const d = this.queue.shift()!;

            const task = promise.map(this.subscriptions, s => s(d));
            this.activeTasks[id] = task;

            task.then(() => {
                delete this.activeTasks[id];
                this.execute();
            });
        }

        await promise.allValues(this.activeTasks)
            .then(() => {
                if (this.queue.length === 0) return;

                return this.execute();
            });
    }

    async flush() {
        await this.execute();
        await promise.allValues(this.activeTasks);
        this.queue = [];
    }

    // ------------------
    // Advanced Functions
    // ------------------
    async collect(): Promise<T[]> {
        if (this.completed || this.err) return [];

        const collection: T[] = [];
        this.subscribe(d => collection.push(d));

        return this.then(() => collection);
    }

    concat(obs: Observable<T>): Observable<T> {
        const joint = new Observable<T>();
        this.subscribe(d => joint.next(d));
        this.onError(e => joint.error(e));

        obs.subscribe(d => joint.next(d));
        obs.onError(e => joint.error(e));

        // only end when both have ended
        let otherEnded = false;
        this.onEnd(() => {
            if (otherEnded) joint.end();
            otherEnded = true;
        });

        obs.onEnd(() => {
            if (otherEnded) joint.end();
            otherEnded = true;
        });

        return joint;
    }

    bottleneck(num: number): Observable<T> {
        this.parallel = num;
        return this;
    }

    // ---------
    // Utilities
    // ---------
    protected bindEndAndError(obs: Observable<any>) {
        this.onEnd(() => obs.end());
        this.onError(e => obs.error(e));
    }

    dispose() {
        if (!(this.completed || this.err)) this.end();

        this.activeTasks = {};
        this.queue = [];
        this.errorHandlers = [];
        this.endHandlers = [];
        this.subscriptions = [];
    }
}


const uniqueId = () => {
    let i = 0;
    return () => i++;
};

const min = (a: number, b: number) => a < b ? a : b;
