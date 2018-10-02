// tslint:disable no-console
import { AnyFunc } from 'simplytyped';
import { invoke } from './fp';

const toDispose: AnyFunc[] = [];

let exitHandled = false;
const exitHandler = () => {
    if (exitHandled) return;
    exitHandled = true;
    toDispose.forEach(invoke);
    process.exit();
};

process.on('exit', exitHandler);
process.on('unhandledRejection', e => {
    console.log(e);
    exitHandler();
});
process.on('uncaughtException', e => {
    console.log(e);
    exitHandler();
});
// process.on('SIGINT', exitHandler);
// process.on('SIGUSR1', exitHandler);
// process.on('SIGUSR2', exitHandler);

export function onExit(f: AnyFunc) {
    toDispose.push(f);
}
