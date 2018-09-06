type TaskFunc<R> = () => R;

const delay = (time: number) => new Promise(resolve => setTimeout(resolve, time));

export async function repeat<F extends TaskFunc<any>>(times: number, f: F) {
    for (let i = 0; i < times; ++i) {
        await delay(1).then(f);
    }
}
