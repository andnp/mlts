import { Algorithm } from "../algorithms/Algorithm";
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { ExperimentJson } from './ExperimentSchema';
export declare class ExperimentDescription {
    algorithm: Algorithm;
    dataset: TensorflowDataset;
    optimization: OptimizationParameters;
    definition: ExperimentJson | undefined;
    metaParameters: Record<string, any> | undefined;
    resultsBase: string;
    run: number;
    resultsTemplate: string;
    private constructor();
    static fromManualSetup(algorithm: Algorithm, dataset: TensorflowDataset, optimization: OptimizationParameters, resultsBase?: string, run?: number): ExperimentDescription;
    static fromJson(location: string, index: number, resultsPath?: string): Promise<ExperimentDescription>;
    static fromCommandLine(): Promise<ExperimentDescription>;
}
