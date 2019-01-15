import { Algorithm } from "../algorithms/Algorithm";
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { ExperimentJson } from './ExperimentSchema';
export declare class ExperimentDescription {
    readonly algorithm: Algorithm;
    readonly dataset: TensorflowDataset;
    readonly optimization: OptimizationParameters;
    readonly definition: ExperimentJson | undefined;
    readonly metaParameters: Record<string, any> | undefined;
    readonly resultsBase: string | undefined;
    readonly path: string | undefined;
    private constructor();
    static getResultsPath(data: ExperimentJson, index: number): string;
    static fromManualSetup(algorithm: Algorithm, dataset: TensorflowDataset, optimization: OptimizationParameters, resultsBase?: string, path?: string): ExperimentDescription;
    static fromJson(location: string, index: number, resultsPath?: string): Promise<ExperimentDescription>;
    static fromCommandLine(): Promise<ExperimentDescription>;
}
