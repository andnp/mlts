"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_ts_1 = require("utilities-ts");
class Observable {
    constructor() {
        // -----
        // State
        // -----
        this.completed = false;
        this.queue = [];
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
        this.subscribe((data) => __awaiter(this, void 0, void 0, function* () {
            const r = yield sub(data);
            obs.next(r);
        }));
        this.bindEndAndError(obs);
        return obs;
    }
    filter(test) {
        const obs = new Observable();
        this.subscribe((data) => __awaiter(this, void 0, void 0, function* () {
            const filter = yield test(data);
            if (filter)
                obs.next(data);
        }));
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
        this.flush();
    }
    end() {
        if (this.completed || this.err)
            return;
        this.completed = true;
        this.flush().then(() => {
            this.endHandlers.forEach(utilities_ts_1.fp.invoke);
        });
    }
    error(e) {
        if (this.completed || this.err)
            return;
        this.err = e;
        this.flush().then(() => {
            this.errorHandlers.forEach(f => f(e));
        });
    }
    // -----
    // Async
    // -----
    then(f) {
        return __awaiter(this, void 0, void 0, function* () {
            // if this observable is already done, just return
            if (this.completed || this.err)
                return f();
            // otherwise, return once the `end` or `error` function is called
            return new Promise((resolve, reject) => {
                this.onEnd(resolve);
                this.onError(reject);
            }).then(f);
        });
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queue.length === 0)
                return;
            this.queue.forEach(d => this.subscriptions.forEach((s) => __awaiter(this, void 0, void 0, function* () {
                const id = this.getId();
                this.activeTasks[id] = new Promise(resolve => {
                    Promise.resolve(s(d)).then(resolve);
                }).then(() => {
                    delete this.activeTasks[id];
                });
            })));
            this.queue = [];
            yield utilities_ts_1.promise.allValues(this.activeTasks);
        });
    }
    // ------------------
    // Advanced Functions
    // ------------------
    collect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.completed || this.err)
                return [];
            const collection = [];
            this.subscribe(d => collection.push(d));
            return this.then(() => collection);
        });
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
    // ---------
    // Utilities
    // ---------
    bindEndAndError(obs) {
        this.onEnd(() => obs.end());
        this.onError(e => obs.error(e));
    }
}
exports.Observable = Observable;
const uniqueId = () => {
    let i = 0;
    return () => i++;
};
//# sourceMappingURL=observable.js.map