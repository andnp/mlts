import { Algorithm } from "../algorithms/Algorithm";
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { ExperimentJson } from './ExperimentSchema';
export declare class ExperimentDescription {
    readonly definition: ExperimentJson;
    readonly algorithm: Algorithm;
    readonly dataset: TensorflowDataset;
    readonly optimization: OptimizationParameters;
    readonly path: string;
    private constructor();
    static fromJson(location: string, index: number): Promise<ExperimentDescription>;
}
