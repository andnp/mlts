"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const commandLine = require("../utils/commandLine");
const utilities_ts_1 = require("utilities-ts");
const metaParameters_1 = require("./metaParameters");
const ExperimentSchema_1 = require("./ExperimentSchema");
const fileSystem_1 = require("./fileSystem");
const ExperimentRegistry_1 = require("./ExperimentRegistry");
class ExperimentDescription {
    constructor(definition, algorithm, dataset, metaParameters, optimization, resultsBase, path) {
        this.definition = definition;
        this.algorithm = algorithm;
        this.dataset = dataset;
        this.metaParameters = metaParameters;
        this.optimization = optimization;
        this.resultsBase = resultsBase;
        this.path = path;
    }
    static getResultsPath(data, index) {
        const permutation = metaParameters_1.getParameterPermutation(data.metaParameters, index);
        const run = Math.floor(index / metaParameters_1.getNumberOfRuns(data.metaParameters));
        return fileSystem_1.getResultsPath(data, permutation, run);
    }
    static fromJson(location, index, resultsPath, saveRoot) {
        return __awaiter(this, void 0, void 0, function* () {
            const ExperimentSchema = ExperimentSchema_1.getExperimentSchema();
            const data = yield utilities_ts_1.files.readJson(location, ExperimentSchema);
            // ---------------------------------
            // Load Constructors from Registries
            // ---------------------------------
            const datasetConstructor = ExperimentRegistry_1.getDatasetConstructor(data.dataset);
            const algData = ExperimentRegistry_1.getAlgorithmRegistryData(data.algorithm);
            const transformationData = data.transformation && ExperimentRegistry_1.getTransformationRegistryData(data.transformation.type);
            // ------------
            // Load Dataset
            // ------------
            const dataset = yield datasetConstructor.load();
            if (transformationData) {
                const Transformation = transformationData.constructor;
                yield dataset.applyTransformation(new Transformation(data.transformation));
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
            const expLocation = ExperimentDescription.getResultsPath(data, index);
            const root = saveRoot || 'savedModels';
            const saveLocation = path.join(root, expLocation);
            const exists = yield utilities_ts_1.files.fileExists(saveLocation);
            const instantiateAlgorithm = () => new algData.constructor(datasetDescriptor, metaParameters, saveLocation);
            const algorithm = exists
                ? yield algData.constructor
                    .fromSavedState(saveLocation) // load algorithm from save state
                    .catch(instantiateAlgorithm) // if that fails, build a fresh version instead
                : instantiateAlgorithm();
            return new ExperimentDescription(data, algorithm, dataset, metaParameters, data.optimization, resultsPath || 'results', expLocation);
        });
    }
    static fromCommandLine() {
        return __awaiter(this, void 0, void 0, function* () {
            const cla = commandLine.parseArgs();
            const index = cla.i || cla.index;
            const experimentPath = cla.e || cla.experiment;
            const results = cla.r || cla.results;
            const save = cla.s || cla.save;
            if (!index)
                throw new Error('Expected -i or --index to be specified');
            if (!experimentPath)
                throw new Error('Expected -e or --experiment to be specified');
            return this.fromJson(experimentPath, parseInt(index), results, save);
        });
    }
}
exports.ExperimentDescription = ExperimentDescription;
//# sourceMappingURL=ExperimentDescription.js.map