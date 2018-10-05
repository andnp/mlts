export type ArgumentRecord = Record<string, string | undefined>;

export function parseArgs() {
    const [, , ...argList] = process.argv;

    const args: ArgumentRecord = {};

    for (let i = 0; i < argList.length; ++i) {
        const arg = argList[i];
        if (!isFlag(arg)) throw new Error(`Expected to find flag argument. <${arg}>`);

        const nextArg = argList[i + 1];

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

function dropFlags(arg: string) {
    return arg.replace(/-+/, '');
}

function isFlag(arg: string) {
    return arg.substr(0, 1) === '-' || arg.substr(0, 2) === '--';
}
