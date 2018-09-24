import * as v from 'validtyped';
import * as _ from 'lodash';
import { ConstructorFor } from 'simplytyped';
import * as path from 'path';

import { Algorithm } from "algorithms/Algorithm";
import { readJson, fileExists } from 'utils/files';
import { TensorflowDataset } from 'data/tensorflow/TensorflowDataset';
import { OptimizationParameters } from 'optimization/OptimizerSchemas';
import { getNumberOfRuns, getParameterPermutation } from './metaParameters';
import { ExperimentSchema, ExperimentJson } from './ExperimentSchema';
import { getResultsPath } from './fileSystem';

const algorithmRegistry: Record<string, { constructor: ConstructorFor<Algorithm>, schema: v.Validator<any> }> = {};
const datasetRegistry: Record<string, typeof TensorflowDataset> = {};

export function registerAlgorithm(name: string, constructor: ConstructorFor<Algorithm>, schema: v.Validator<any> = v.any()) {
    algorithmRegistry[name] = { constructor, schema };
}

export function registerDataset(name: string, dataset: typeof TensorflowDataset) {
    datasetRegistry[name] = dataset;
}

export class Experiment {
    constructor(
        readonly description: ExperimentJson,
        readonly algorithm: Algorithm,
        readonly dataset: TensorflowDataset,
        readonly optimization: OptimizationParameters,
        readonly path: string,
    ) {}

    static async fromJson(location: string, index: number) {
        const data = await readJson(location, ExperimentSchema);

        const datasetConstructor = datasetRegistry[data.dataset];
        if (!datasetConstructor) throw new Error(`Attempted to run an experiment with an unregistered dataset. <${data.dataset}>`);

        const dataset = await datasetConstructor.load();

        const algData = algorithmRegistry[data.algorithm];
        if (!algData) throw new Error(`Attempted to run an experiment with an unregistered algorithm. <${data.algorithm}>`);

        const metaParameters = getParameterPermutation(data.metaParameters, index);

        const paramsValid = algData.schema.validate(metaParameters);
        if (!paramsValid.valid) throw new Error(`Incorrect parameters for algorithms. <${JSON.stringify(paramsValid.errors, undefined, 2)}>`);

        const datasetDescriptor = {
            features: dataset.features,
            classes: dataset.classes,
            samples: dataset.samples,
        };

        const run = Math.floor(index / getNumberOfRuns(data.metaParameters));
        const expLocation = getResultsPath(data, metaParameters, run);
        const saveLocation = path.join('savedModels', expLocation);

        const exists = await fileExists(saveLocation);

        const algorithm = exists
            ? await (algData.constructor as any as typeof Algorithm).fromSavedState(saveLocation)
            : new algData.constructor(datasetDescriptor, metaParameters, saveLocation);

        return new Experiment(data, algorithm, dataset, data.optimization, expLocation);
    }
}
