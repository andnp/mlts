export function tuple<T1, T2>(t1: T1, t2: T2): [ T1, T2 ] {
    return [ t1, t2 ];
}

export function assertNever(t: never, msg = 'Unexpected `assertNever` branch reached') {
    throw new Error(msg);
}

/**
 * A noop function that enhances readability through clear expression of intent
 */
export function returnVoid() { /* stub */ }
