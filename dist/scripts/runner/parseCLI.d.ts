export interface ExperimentMetadata {
    executable: string;
    experimentPath: string;
    number_runs: number;
    repeats: number;
    basePath: string;
}
export declare const parseCLI: () => Promise<ExperimentMetadata[]>;
