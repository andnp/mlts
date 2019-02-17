import { SupervisedDictionaryLearningDatasetDescription, TensorflowDataset } from 'data';
import { SupervisedAlgorithm, ReconstructionAlgorithm, UnsupervisedAlgorithm } from "algorithms";
import { OptimizationParameters } from "optimization";
export declare function getFakeClassificationDataset(description: SupervisedDictionaryLearningDatasetDescription, difficulty?: 'easy' | 'medium' | 'hard'): any;
interface ClassificationTestParameters {
    alg: SupervisedAlgorithm;
    dataset: TensorflowDataset;
    optimization: OptimizationParameters;
    error: number;
}
export declare const buildClassificationTest: (params: ClassificationTestParameters) => () => Promise<void>;
interface UnsupervisedReconstructionTestParameters {
    alg: UnsupervisedAlgorithm & ReconstructionAlgorithm;
    dataset: TensorflowDataset;
    optimization: OptimizationParameters;
    error: number;
}
export declare const buildUnsupervisedReconstructionTest: (params: UnsupervisedReconstructionTestParameters) => () => Promise<void>;
export {};
