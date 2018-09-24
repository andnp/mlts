import { PlainObject } from "simplytyped";

export function flattenToArray(thing: any): Array<[ string, any[] ]> {
    const accum: any[] = [];
    function inner(thing: any, path = ''): void {
        if (Array.isArray(thing)) {
            // a percontation point (⸮) means that a question is rhetorical
            // does this contain deeper objects⸮
            // if so, we need to keep going
            if (typeof thing[0] === 'object') {
               thing.forEach((v, i) => inner(v, `${path}[${i}]`));
               return;
            }

            accum.push([ path, thing ]);
            return;
        }
        if (typeof thing === 'object') {
            const keys = Object.keys(thing);

            keys.forEach(key => {
                inner(thing[key], path ? `${path}.${key}` : key);
            });
            return;
        }

        if (typeof thing === 'boolean' || typeof thing === 'number' || typeof thing === 'string') {
            accum.push([ path, [thing] ]);
            return;
        }

        throw new Error(`Shouldn't be finding something of any other type. <${typeof thing}>`);
    }

    inner(thing);
    return accum;
}

export function flatten(thing: any): PlainObject {
    const accum: PlainObject = {};
    function inner(thing: any, path = ''): void {
        if (Array.isArray(thing)) {
            thing.forEach((v, i) => inner(v, `${path}[${i}]`));
            return;
        }

        if (typeof thing === 'object') {
            const keys = Object.keys(thing);

            keys.forEach(key => {
                inner(thing[key], path ? `${path}.${key}` : key);
            });

            return;
        }

        accum[path] = thing;
    }

    inner(thing);
    return accum;
}
