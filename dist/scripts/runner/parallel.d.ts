import { ExperimentMetadata } from './parseCLI';
interface ParallelOptions {
    base_cmd: string;
    parallel_jobs?: number;
    delay?: number;
    remotes?: string[];
    workdir?: string;
    setup: string;
    reslot?: number;
}
export declare const run: (exps: ExperimentMetadata[], opts?: Partial<ParallelOptions> | undefined) => Promise<void>;
export {};
