declare module 'inly' {
    interface Inly {
        (from: string, to: string): any;
    }
    const static: Inly;
    export = static;
}
