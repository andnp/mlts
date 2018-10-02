import * as v from 'validtyped';
import { ConstructorFor } from 'simplytyped';
import { Algorithm } from "../algorithms/Algorithm";
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
import { Transformation } from '../transformations/Transformation';
export declare function registerAlgorithm(name: string, constructor: ConstructorFor<Algorithm>, schema?: v.Validator<any>): void;
export declare function registerTransformation(name: string, constructor: ConstructorFor<Transformation>, schema?: v.Validator<any>): void;
export declare function registerDataset(name: string, dataset: typeof TensorflowDataset): void;
export declare function getDatasetConstructor(name: string): typeof TensorflowDataset;
export declare function getAlgorithmRegistryData(name: string): {
    constructor: ConstructorFor<Algorithm>;
    schema: v.Validator<any>;
};
export declare function getTransformationRegistryData(name: string): {
    constructor: ConstructorFor<Transformation>;
    schema: v.Validator<any>;
};
export declare function getTransformationSchemas(): v.Validator<any>[];
