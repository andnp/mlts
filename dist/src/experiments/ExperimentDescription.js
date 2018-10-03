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
const files_1 = require("../utils/files");
const metaParameters_1 = require("./metaParameters");
const ExperimentSchema_1 = require("./ExperimentSchema");
const fileSystem_1 = require("./fileSystem");
const ExperimentRegistry_1 = require("./ExperimentRegistry");
class ExperimentDescription {
    constructor(definition, algorithm, dataset, optimization, path) {
        this.definition = definition;
        this.algorithm = algorithm;
        this.dataset = dataset;
        this.optimization = optimization;
        this.path = path;
    }
    static fromJson(location, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const ExperimentSchema = ExperimentSchema_1.getExperimentSchema();
            const data = yield files_1.readJson(location, ExperimentSchema);
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
            const run = Math.floor(index / metaParameters_1.getNumberOfRuns(data.metaParameters));
            const expLocation = fileSystem_1.getResultsPath(data, metaParameters, run);
            const saveLocation = path.join('savedModels', expLocation);
            const exists = yield files_1.fileExists(saveLocation);
            const algorithm = exists
                ? yield algData.constructor.fromSavedState(saveLocation)
                : new algData.constructor(datasetDescriptor, metaParameters, saveLocation);
            return new ExperimentDescription(data, algorithm, dataset, data.optimization, expLocation);
        });
    }
    static fromCommandLine() {
        return __awaiter(this, void 0, void 0, function* () {
            const cla = commandLine.parseArgs();
            const index = cla.i || cla.index;
            const experimentPath = cla.e || cla.experiment;
            if (!index)
                throw new Error('Expected -i or --index to be specified');
            if (!experimentPath)
                throw new Error('Expected -e or --experiment to be specified');
            return this.fromJson(experimentPath, parseInt(index));
        });
    }
}
exports.ExperimentDescription = ExperimentDescription;
//# sourceMappingURL=ExperimentDescription.js.map