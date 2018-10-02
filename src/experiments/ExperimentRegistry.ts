import * as v from 'validtyped';
import { ConstructorFor } from 'simplytyped';

import { Algorithm } from "../algorithms/Algorithm";
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
import { Transformation } from '../transformations/Transformation';


const algorithmRegistry: Record<string, { constructor: ConstructorFor<Algorithm>, schema: v.Validator<any> }> = {};
const datasetRegistry: Record<string, typeof TensorflowDataset> = {};
const transformationRegistry: Record<string, { constructor: ConstructorFor<Transformation>, schema: v.Validator<any> }> = {};

export function registerAlgorithm(name: string, constructor: ConstructorFor<Algorithm>, schema: v.Validator<any> = v.any()) {
    algorithmRegistry[name] = { constructor, schema };
}

export function registerTransformation(name: string, constructor: ConstructorFor<Transformation>, schema: v.Validator<any> = v.any()) {
    transformationRegistry[name] = { constructor, schema };
}

export function registerDataset(name: string, dataset: typeof TensorflowDataset) {
    datasetRegistry[name] = dataset;
}

export function getDatasetConstructor(name: string) {
    const constructor = datasetRegistry[name];
    if (!constructor) throw new Error(`Attempted to run an experiment with an unknown dataset: <${name}>`);
    return constructor;
}

export function getAlgorithmRegistryData(name: string) {
    const algData = algorithmRegistry[name];
    if (!algData) throw new Error(`Attempted to run an experiment with an unknown algorithm: <${name}>`);
    return algData;
}

export function getTransformationRegistryData(name: string) {
    const transData = transformationRegistry[name];
    if (!transData) throw new Error(`Attempted to run an experiment with an unknown transformation: <${name}>`);
    return transData;
}

export function getTransformationSchemas() {
    const transformations = Object.keys(transformationRegistry);

    return transformations.map(trans => transformationRegistry[trans].schema);
}
