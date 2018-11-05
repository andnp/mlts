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
        readonly resultsBase: string,
        readonly path: string,
    ) {}

    static getResultsPath(data: ExperimentJson, index: number) {
        const permutation = getParameterPermutation(data.metaParameters, index);
        const run = Math.floor(index / getNumberOfRuns(data.metaParameters));
        return getResultsPath(data, permutation, run);
    }

    static async fromJson(location: string, index: number, resultsPath?: string, saveRoot?: string) {
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

        const expLocation = ExperimentDescription.getResultsPath(data, index);
        const root = saveRoot || 'savedModels';
        const saveLocation = path.join(root, expLocation);

        const exists = await files.fileExists(saveLocation);

        const instantiateAlgorithm = () => new algData.constructor(datasetDescriptor, metaParameters, saveLocation);
        const algorithm = exists
            ? await (algData.constructor as any as typeof Algorithm)
                .fromSavedState(saveLocation) // load algorithm from save state
                .catch(instantiateAlgorithm)  // if that fails, build a fresh version instead
            : instantiateAlgorithm();

        return new ExperimentDescription(data, algorithm, dataset, metaParameters, data.optimization, resultsPath || 'results', expLocation);
    }

    static async fromCommandLine() {
        const cla = commandLine.parseArgs();

        const index = cla.i || cla.index;
        const experimentPath = cla.e || cla.experiment;
        const results = cla.r || cla.results;
        const save = cla.s || cla.save;
        const gpu = cla.gpu;
        const slotId = cla.slotId; // gnu-parallel slot id. used to determine whether gpu should be used.

        if (gpu && (slotId === '1' || slotId === undefined)) {
            try {
                require('@tensorflow/tfjs-node-gpu');
            } catch(e) {
                console.error('Attempted to start with GPU, but failed', e); // tslint:disable-line no-console
            }
        }

        if (!index) throw new Error('Expected -i or --index to be specified');
        if (!experimentPath) throw new Error('Expected -e or --experiment to be specified');

        return this.fromJson(experimentPath, parseInt(index), results, save);
    }
}
