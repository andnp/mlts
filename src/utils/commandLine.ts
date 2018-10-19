export type ArgumentRecord = Record<string, string | undefined>;

/**
 * Get a record of command line arguments passed to this process
 * For instance: `"-d 1 --retry -e path/to/exp.json"` will become
 * `{ d: 1, retry: "true", e: "path/to/exp.json" }`
 */
export function parseArgs() {
    const [, , ...argList] = process.argv;

    const args: ArgumentRecord = {};

    for (let i = 0; i < argList.length; ++i) {
        const arg = argList[i];
        if (!isFlag(arg)) throw new Error(`Expected to find flag argument. <${arg}>`);

        const nextArg = argList[i + 1];

        // if we are on the last flag, or if the next arg is a flag
        // then we must be dealing with a boolean flag
        // we'll set the value as "true" then move on
        // otherwise we need to parse the next arg to know the value
        if (!nextArg || isFlag(nextArg)) {
            args[dropFlags(arg)] = 'true';
        } else {
            args[dropFlags(arg)] = nextArg;
            // we've already processed i + 1 now, so skip over it
            i += 1;
        }
    }

    return args;
}

/**
 * Takes a command line argument in the form "-f" or "--flag"
 * and returns "f" or "flag" respectively
 * @param arg - the command line argument
 */
function dropFlags(arg: string) {
    return arg.replace(/-+/, '');
}

/**
 * Returns true if the given string starts with "-" or "--"
 * @param arg - a string that may have "-" or "--" preceding it
 */
function isFlag(arg: string) {
    return arg.substr(0, 1) === '-' || arg.substr(0, 2) === '--';
}
