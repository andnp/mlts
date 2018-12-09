import { Observable } from 'utils/observable';
import { promise, fp } from 'utilities-ts';
import { Milliseconds } from 'utilities-ts/src/time';

// --------
// Creation
// --------
test('Can create an observable', () => {
    const obs = Observable.create<string>(observe => {
        observe.next('hi');
    });

    expect(obs).toBeInstanceOf(Observable);
});

test('Can create observable from list of promises', async () => {
    let state = 0;
    const promises = [0, 1, 2, 3].map(i => Promise.resolve(i));

    const obs = Observable.fromPromises(promises);

    await obs.subscribe(d => expect(d).toBe(state++));

    expect(state).toBe(4);
});

// -------------
// Subscriptions
// -------------
test('Can subscribe to updates from observable', async () => {
    let state = 0;
    const obs = Observable.create<number>(observe => {
        [0, 1, 2, 3].forEach(observe.next);
        observe.end();
    });

    obs.subscribe(data => expect(data).toBe(state++));

    await obs;

    expect(state).toBe(4);
});

test('Can map from one observable to another', async () => {
    let state = 1;

    const obs = Observable.create<string>(observe => {
        ['0', '1', '2', '3'].forEach(observe.next);
        observe.end();
    });

    await obs.map(s => parseInt(s) + 1)
        .subscribe(data => expect(data).toBe(state++));

    expect(state).toBe(5);
});

test('Can concatenate two observables', async () => {
    let state = 0;

    const obs1 = Observable.fromArray([0, 1, 2]);
    const obs2 = Observable.fromArray([3, 4, 5]);

    await obs1.concat(obs2).subscribe(data => expect(data).toBe(state++));

    expect(state).toBe(6);
});

test('Can concatenate slow obervables', async () => {
    let state = 0;

    const prom1 = [0, 1, 2, 3].map(i => promise.delay(i * 100 as Milliseconds).then(fp.giveBack(i)));
    const prom2 = [4, 5, 6, 7].map(i => promise.delay(i * 200 as Milliseconds).then(fp.giveBack(i)));
    const obs1 = Observable.fromPromises(prom1);
    const obs2 = Observable.fromPromises(prom2);

    await obs1.concat(obs2).subscribe(data => expect(data).toBe(state++));

    expect(state).toBe(8);
});

test('Can map over promise returning functions', async () => {
    let state = 0;

    await Observable.fromArray([0, 1, 2, 3])
        .map(i => promise.delay(i * 100 as Milliseconds).then(fp.giveBack(i)))
        .subscribe(data => expect(data).toBe(state++));

    expect(state).toBe(4);
});

// ----------
// Aggregates
// ----------
test('Can collect all data passed through stream', async () => {
    const obs = Observable.create<number>(observe => {
        [0, 1, 2, 3].forEach(observe.next);
        observe.end();
    });

    const data = await obs.map(i => i + 1).collect();

    expect(data).toEqual([1, 2, 3, 4]);
});

