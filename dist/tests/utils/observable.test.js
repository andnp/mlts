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
const observable_1 = require("utils/observable");
const utilities_ts_1 = require("utilities-ts");
// --------
// Creation
// --------
test('Can create an observable', () => {
    const obs = observable_1.Observable.create(observe => {
        observe.next('hi');
    });
    expect(obs).toBeInstanceOf(observable_1.Observable);
});
test('Can create observable from list of promises', () => __awaiter(this, void 0, void 0, function* () {
    let state = 0;
    const promises = [0, 1, 2, 3].map(i => Promise.resolve(i));
    const obs = observable_1.Observable.fromPromises(promises);
    yield obs.subscribe(d => expect(d).toBe(state++));
    expect(state).toBe(4);
}));
// -------------
// Subscriptions
// -------------
test('Can subscribe to updates from observable', () => __awaiter(this, void 0, void 0, function* () {
    let state = 0;
    const obs = observable_1.Observable.create(observe => {
        [0, 1, 2, 3].forEach(observe.next);
        observe.end();
    });
    obs.subscribe(data => expect(data).toBe(state++));
    yield obs;
    expect(state).toBe(4);
}));
test('Can map from one observable to another', () => __awaiter(this, void 0, void 0, function* () {
    let state = 1;
    const obs = observable_1.Observable.create(observe => {
        ['0', '1', '2', '3'].forEach(observe.next);
        observe.end();
    });
    yield obs.map(s => parseInt(s) + 1)
        .subscribe(data => expect(data).toBe(state++));
    expect(state).toBe(5);
}));
test('Can concatenate two observables', () => __awaiter(this, void 0, void 0, function* () {
    let state = 0;
    const obs1 = observable_1.Observable.fromArray([0, 1, 2]);
    const obs2 = observable_1.Observable.fromArray([3, 4, 5]);
    yield obs1.concat(obs2).subscribe(data => expect(data).toBe(state++));
    expect(state).toBe(6);
}));
test('Can concatenate slow obervables', () => __awaiter(this, void 0, void 0, function* () {
    let state = 0;
    const prom1 = [0, 1, 2, 3].map(i => utilities_ts_1.promise.delay(i * 100).then(utilities_ts_1.fp.giveBack(i)));
    const prom2 = [4, 5, 6, 7].map(i => utilities_ts_1.promise.delay(i * 200).then(utilities_ts_1.fp.giveBack(i)));
    const obs1 = observable_1.Observable.fromPromises(prom1);
    const obs2 = observable_1.Observable.fromPromises(prom2);
    yield obs1.concat(obs2).subscribe(data => expect(data).toBe(state++));
    expect(state).toBe(8);
}));
test('Can map over promise returning functions', () => __awaiter(this, void 0, void 0, function* () {
    let state = 0;
    yield observable_1.Observable.fromArray([0, 1, 2, 3])
        .map(i => utilities_ts_1.promise.delay(i * 100).then(utilities_ts_1.fp.giveBack(i)))
        .subscribe(data => expect(data).toBe(state++));
    expect(state).toBe(4);
}));
test('Can filter over promise returning functions', () => __awaiter(this, void 0, void 0, function* () {
    let state = 0;
    yield observable_1.Observable.fromArray([0, 1, 2, 3])
        .map(i => utilities_ts_1.promise.delay(i * 100).then(utilities_ts_1.fp.giveBack(i)))
        .filter(i => utilities_ts_1.promise.delay(i * 100).then(utilities_ts_1.fp.giveBack(i < 2)))
        .subscribe(data => expect(data).toBe(state++));
    expect(state).toBe(2);
}));
// ----------
// Aggregates
// ----------
test('Can collect all data passed through stream', () => __awaiter(this, void 0, void 0, function* () {
    const obs = observable_1.Observable.create(observe => {
        [0, 1, 2, 3].forEach(observe.next);
        observe.end();
    });
    const data = yield obs.map(i => i + 1).collect();
    expect(data).toEqual([1, 2, 3, 4]);
}));
//# sourceMappingURL=observable.test.js.map