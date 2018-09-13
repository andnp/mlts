type TaskFunc<R> = () => R;

const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

export async function repeat<F extends TaskFunc<any>>(times: number, f: F) {
    const ret: Array<ReturnType<F>> = [];
    for (let i = 0; i < times; ++i) {
        const r = await delay(1).then(f);
        ret.push(r);
    }
    return ret;
}
