import * as _ from 'lodash';
import * as path from 'path';

import * as commandLine from '../utils/commandLine';

import { Algorithm } from "../algorithms/Algorithm";
import { files } from 'utilities-ts';
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
        readonly metaParameters: Record<string, any>,
        readonly optimization: OptimizationParameters,
        readonly path: string,
    ) {}

    static async fromJson(location: string, index: number) {
        const ExperimentSchema = getExperimentSchema();
        const data = await files.readJson(location, ExperimentSchema);

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

        const exists = await files.fileExists(saveLocation);

        const algorithm = exists
            ? await (algData.constructor as any as typeof Algorithm).fromSavedState(saveLocation)
            : new algData.constructor(datasetDescriptor, metaParameters, saveLocation);

        return new ExperimentDescription(data, algorithm, dataset, metaParameters, data.optimization, expLocation);
    }

    static async fromCommandLine() {
        const cla = commandLine.parseArgs();

        const index = cla.i || cla.index;
        const experimentPath = cla.e || cla.experiment;

        if (!index) throw new Error('Expected -i or --index to be specified');
        if (!experimentPath) throw new Error('Expected -e or --experiment to be specified');

        return this.fromJson(experimentPath, parseInt(index));
    }
}
