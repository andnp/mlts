import * as _ from 'lodash';
import * as path from 'path';

import { Algorithm } from "../algorithms/Algorithm";
import { readJson, fileExists } from '../utils/files';
import { TensorflowDataset } from '../data/tensorflow/TensorflowDataset';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';
import { getNumberOfRuns, getParameterPermutation } from './metaParameters';
import { getExperimentSchema, ExperimentJson } from './ExperimentSchema';
import { getResultsPath } from './fileSystem';

import { getDatasetConstructor, getTransformationRegistryData, getAlgorithmRegistryData } from './ExperimentRegistry';

export class ExperimentDescription {
    private constructor(
        readonly definition: ExperimentJson,
        readonly algorithm: Algorithm,
        readonly dataset: TensorflowDataset,
        readonly optimization: OptimizationParameters,
        readonly path: string,
    ) {}

    static async fromJson(location: string, index: number) {
        const ExperimentSchema = getExperimentSchema();
        const data = await readJson(location, ExperimentSchema);

        // ---------------------------------
        // Load Constructors from Registries
        // ---------------------------------
        const datasetConstructor = getDatasetConstructor(data.dataset);
        const algData = getAlgorithmRegistryData(data.algorithm);
        const transformationData = data.transformation && getTransformationRegistryData(data.transformation.type);

        // ------------
        // Load Dataset
        // ------------
        const dataset = await datasetConstructor.load();

        if (transformationData) {
            const Transformation = transformationData.constructor;
            await dataset.applyTransformation(new Transformation(data.transformation));
        }

        // --------------
        // Load Algorithm
        // --------------
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

        return new ExperimentDescription(data, algorithm, dataset, data.optimization, expLocation);
    }
}
