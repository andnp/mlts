import { ExperimentDescription } from "./ExperimentDescription";
export declare class ClassificationErrorExperiment {
    protected description: ExperimentDescription;
    constructor(description: ExperimentDescription);
    run(root?: string): Promise<void>;
}
