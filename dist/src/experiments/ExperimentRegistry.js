"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v = require("validtyped");
const algorithmRegistry = {};
const datasetRegistry = {};
const transformationRegistry = {};
function registerAlgorithm(name, constructor, schema = v.any()) {
    algorithmRegistry[name] = { constructor, schema };
}
exports.registerAlgorithm = registerAlgorithm;
function registerTransformation(name, constructor, schema = v.any()) {
    transformationRegistry[name] = { constructor, schema };
}
exports.registerTransformation = registerTransformation;
function registerDataset(name, dataset) {
    datasetRegistry[name] = dataset;
}
exports.registerDataset = registerDataset;
function getDatasetConstructor(name) {
    const constructor = datasetRegistry[name];
    if (!constructor)
        throw new Error(`Attempted to run an experiment with an unknown dataset: <${name}>`);
    return constructor;
}
exports.getDatasetConstructor = getDatasetConstructor;
function getAlgorithmRegistryData(name) {
    const algData = algorithmRegistry[name];
    if (!algData)
        throw new Error(`Attempted to run an experiment with an unknown algorithm: <${name}>`);
    return algData;
}
exports.getAlgorithmRegistryData = getAlgorithmRegistryData;
function getTransformationRegistryData(name) {
    const transData = transformationRegistry[name];
    if (!transData)
        throw new Error(`Attempted to run an experiment with an unknown transformation: <${name}>`);
    return transData;
}
exports.getTransformationRegistryData = getTransformationRegistryData;
function getTransformationSchemas() {
    const transformations = Object.keys(transformationRegistry);
    return transformations.map(trans => transformationRegistry[trans].schema);
}
exports.getTransformationSchemas = getTransformationSchemas;
//# sourceMappingURL=ExperimentRegistry.js.map