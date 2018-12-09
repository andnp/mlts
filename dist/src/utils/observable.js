"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
class Observable {
    constructor() {
        // -----
        // State
        // -----
        this.completed = false;
        this.queue = [];
        this.parallel = 0;
        // -------------
        // Subscriptions
        // -------------
        this.subscriptions = [];
        this.endHandlers = [];
        this.errorHandlers = [];
        this.activeTasks = {};
        this.getId = uniqueId();
    }
    // --------
    // Creators
    // --------
    static create(creator) {
        const obs = new Observable();
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
    static fromPromises(promises) {
        const obs = Observable.create(creator => {
            promises.forEach(promise => {
                promise.then(creator.next);
                promise.catch(creator.error);
            });
            Promise.all(promises).then(creator.end);
        });
        return obs;
    }
    static fromArray(arr) {
        const obs = Observable.create(creator => {
            arr.forEach(creator.next);
            creator.end();
        });
        return obs;
    }
    subscribe(sub) {
        this.subscriptions.push(sub);
        return this;
    }
    onEnd(f) {
        this.endHandlers.push(f);
    }
    onError(f) {
        this.errorHandlers.push(f);
    }
    // ---------------------
    // Special Subscriptions
    // ---------------------
    map(sub) {
        const obs = new Observable();
        this.subscribe(async (data) => {
            const r = await sub(data);
            obs.next(r);
        });
        this.bindEndAndError(obs);
        return obs;
    }
    filter(test) {
        const obs = new Observable();
        this.subscribe(async (data) => {
            const filter = await test(data);
            if (filter)
                obs.next(data);
        });
        this.bindEndAndError(obs);
        return obs;
    }
    // ---------
    // Data Flow
    // ---------
    next(data) {
        if (this.completed || this.err)
            return;
        this.queue.push(data);
        this.execute();
    }
    end() {
        if (this.completed || this.err)
            return;
        this.completed = true;
        this.flush().then(() => {
            this.endHandlers.forEach(utilities_ts_1.fp.invoke);
            this.dispose();
        });
    }
    error(e) {
        if (this.completed || this.err)
            return;
        this.err = e;
        this.flush().then(() => {
            this.errorHandlers.forEach(f => f(e));
            this.dispose();
        });
    }
    // -----
    // Async
    // -----
    async then(f) {
        // if this observable is already done, just return
        if (this.completed || this.err)
            return f();
        // otherwise, return once the `end` or `error` function is called
        return new Promise((resolve, reject) => {
            this.onEnd(resolve);
            this.onError(reject);
        }).then(f);
    }
    async execute() {
        const active = Object.keys(this.activeTasks).length;
        const remaining = this.queue.length;
        const shouldExecute = this.parallel > 0 ? min(this.parallel - active, remaining) : remaining;
        for (let i = 0; i < shouldExecute; ++i) {
            const id = this.getId();
            const d = this.queue.shift();
            const task = utilities_ts_1.promise.map(this.subscriptions, s => s(d));
            this.activeTasks[id] = task;
            task.then(() => {
                delete this.activeTasks[id];
                this.execute();
            });
        }
        await utilities_ts_1.promise.allValues(this.activeTasks)
            .then(() => {
            if (this.queue.length === 0)
                return;
            return this.execute();
        });
    }
    async flush() {
        await this.execute();
        await utilities_ts_1.promise.allValues(this.activeTasks);
        this.queue = [];
    }
    // ------------------
    // Advanced Functions
    // ------------------
    async collect() {
        if (this.completed || this.err)
            return [];
        const collection = [];
        this.subscribe(d => collection.push(d));
        return this.then(() => collection);
    }
    concat(obs) {
        const joint = new Observable();
        this.subscribe(d => joint.next(d));
        this.onError(e => joint.error(e));
        obs.subscribe(d => joint.next(d));
        obs.onError(e => joint.error(e));
        // only end when both have ended
        let otherEnded = false;
        this.onEnd(() => {
            if (otherEnded)
                joint.end();
            otherEnded = true;
        });
        obs.onEnd(() => {
            if (otherEnded)
                joint.end();
            otherEnded = true;
        });
        return joint;
    }
    bottleneck(num) {
        this.parallel = num;
        return this;
    }
    // ---------
    // Utilities
    // ---------
    bindEndAndError(obs) {
        this.onEnd(() => obs.end());
        this.onError(e => obs.error(e));
    }
    dispose() {
        if (!(this.completed || this.err))
            this.end();
        this.activeTasks = {};
        this.queue = [];
        this.errorHandlers = [];
        this.endHandlers = [];
        this.subscriptions = [];
    }
}
exports.Observable = Observable;
const uniqueId = () => {
    let i = 0;
    return () => i++;
};
const min = (a, b) => a < b ? a : b;
//# sourceMappingURL=observable.js.map