"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commandLine = require("../utils/commandLine");
const utilities_ts_1 = require("utilities-ts");
const metaParameters_1 = require("./metaParameters");
const ExperimentSchema_1 = require("./ExperimentSchema");
const ExperimentRegistry_1 = require("./ExperimentRegistry");
const random_1 = require("../utils/random");
class ExperimentDescription {
    constructor(algorithm, dataset, optimization, definition, metaParameters, resultsBase = '', run = 0, resultsTemplate = '{{dataset}}/{{alg}}/{{params}}/{{run}}') {
        this.algorithm = algorithm;
        this.dataset = dataset;
        this.optimization = optimization;
        this.definition = definition;
        this.metaParameters = metaParameters;
        this.resultsBase = resultsBase;
        this.run = run;
        this.resultsTemplate = resultsTemplate;
    }
    static fromManualSetup(algorithm, dataset, optimization, resultsBase, run) {
        const definition = {
            algorithm: algorithm.name,
            dataset: dataset.constructor.name,
            optimization,
            metaParameters: {},
        };
        return new ExperimentDescription(algorithm, dataset, optimization, definition, algorithm.getParameters(), resultsBase, run);
    }
    static async fromJson(location, index, resultsPath) {
        const ExperimentSchema = ExperimentSchema_1.getExperimentSchema();
        const data = await utilities_ts_1.files.readJson(location, ExperimentSchema);
        const run = Math.floor(index / metaParameters_1.getNumberOfRuns(data.metaParameters));
        random_1.setSeed(`${run}`);
        // ---------------------------------
        // Load Constructors from Registries
        // ---------------------------------
        // TODO: this _whole_ thing needs to be reworked... It should be generic across all types of experiments. ML and RL
        if (!data.dataset)
            throw new Error('I only know how to deal with experiments containing datasets');
        const datasetConstructor = ExperimentRegistry_1.getDatasetConstructor(data.dataset);
        const algData = ExperimentRegistry_1.getAlgorithmRegistryData(data.algorithm);
        const transformationData = data.transformation && ExperimentRegistry_1.getTransformationRegistryData(data.transformation.type);
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
        const metaParameters = metaParameters_1.getParameterPermutation(data.metaParameters, index);
        const paramsValid = algData.schema.validate(metaParameters);
        if (!paramsValid.valid)
            throw new Error(`Incorrect parameters for algorithms. <${JSON.stringify(paramsValid.errors, undefined, 2)}>`);
        const datasetDescriptor = {
            features: dataset.features,
            classes: dataset.classes,
            samples: dataset.samples,
        };
        const algorithm = new algData.constructor(datasetDescriptor, metaParameters);
        if (!data.optimization)
            throw new Error('I only know how to deal with experiments containing optimization parameters');
        return new ExperimentDescription(algorithm, dataset, data.optimization, data, metaParameters, resultsPath || 'results', run);
    }
    static async fromCommandLine() {
        const cla = commandLine.parseArgs();
        const index = cla.i || cla.index;
        const experimentPath = cla.e || cla.experiment;
        const results = cla.r || cla.results;
        const gpu = cla.gpu;
        const slotId = cla.slotId; // gnu-parallel slot id. used to determine whether gpu should be used.
        const reslot = cla.reslot; // gnu-parallel doesn't start the slot count over for each device. Use this number to do so here.
        const slot = slotId ? parseInt(slotId) : false;
        const reslotted = reslot && slot ? (slot % parseInt(reslot)) + 1 : slot;
        if (gpu && (slot === false || reslotted === 1)) {
            try {
                require('@tensorflow/tfjs-node-gpu');
            }
            catch (e) {
                console.error('Attempted to start with GPU, but failed', e); // tslint:disable-line no-console
                require('@tensorflow/tfjs-node');
            }
        }
        else {
            require('@tensorflow/tfjs-node');
        }
        if (!index)
            throw new Error('Expected -i or --index to be specified');
        if (!experimentPath)
            throw new Error('Expected -e or --experiment to be specified');
        return this.fromJson(experimentPath, parseInt(index), results);
    }
}
exports.ExperimentDescription = ExperimentDescription;
//# sourceMappingURL=ExperimentDescription.js.map