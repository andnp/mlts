import { Algorithm } from "../algorithms/Algorithm";
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { ExperimentJson } from './ExperimentSchema';
export declare class ExperimentDescription {
    readonly definition: ExperimentJson;
    readonly algorithm: Algorithm;
    readonly dataset: TensorflowDataset;
    readonly metaParameters: Record<string, any>;
    readonly optimization: OptimizationParameters;
    readonly resultsBase: string;
    readonly path: string;
    private constructor();
    static getResultsPath(data: ExperimentJson, index: number): string;
    static fromJson(location: string, index: number, resultsPath?: string): Promise<ExperimentDescription>;
    static fromCommandLine(): Promise<ExperimentDescription>;
}
