import { AnyFunc } from 'simplytyped';
import { invoke } from 'utils/fp';

const toDispose: AnyFunc[] = [];

process.on('beforeExit', () => {
    toDispose.forEach(invoke);
});

export function onExit(f: AnyFunc) {
    toDispose.push(f);
}
