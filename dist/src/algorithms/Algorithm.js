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
const v = require("validtyped");
const path = require("path");
const tf = require("@tensorflow/tfjs");
const _ = require("lodash");
const utilities_ts_1 = require("utilities-ts");
const utilities_ts_2 = require("utilities-ts");
const Optimizer_1 = require("../optimization/Optimizer");
const DatasetDescription_1 = require("../data/DatasetDescription");
const tensorflow_1 = require("../utils/tensorflow");
const flatten_1 = require("../utils/flatten");
// TODO: consider making distinctions between Supervised, Unsupervised, etc. algs
// they will have different function signatures for training methods.
class Algorithm {
    constructor(datasetDescription, saveLocation) {
        this.datasetDescription = datasetDescription;
        this.saveLocation = saveLocation;
        this.hasBuilt = false;
        this.models = {};
        this.parameters = {};
        this.optimizers = {};
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasBuilt)
                return;
            yield this._build();
            this.hasBuilt = true;
        });
    }
    train(X, Y, opts, trainOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasBuilt)
                yield this.build();
            const shouldAutosave = !trainOptions || (trainOptions && trainOptions.autosave !== false);
            if (shouldAutosave)
                this.startBackup();
            const history = yield this._train(X, Y, opts);
            if (shouldAutosave)
                this.stopBackup();
            return history;
        });
    }
    predict(T, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.hasBuilt)
                yield this.build();
            return this._predict(T, opts);
        });
    }
    // ----------
    // Parameters
    // ----------
    getParameters() {
        return flatten_1.flatten(this.opts);
    }
    // ------
    // Saving
    // ------
    _saveState(location) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    registerModel(name, model) {
        if (name in this.models)
            return this.models[name];
        const m = model();
        this.models[name] = m;
        return m;
    }
    assertModel(name) {
        const m = this.models[name];
        if (!m)
            throw new Error(`Expected to have a model registered. <${name}>`);
        return m;
    }
    getModel(name) {
        const modelNames = Object.keys(this.models);
        if (!name && modelNames.length > 1)
            throw new Error(`Need to specify a model name for this algorithm. <${JSON.stringify(modelNames)}>`);
        if (modelNames.length === 1)
            return this.models[modelNames[0]];
        if (name && name in this.models)
            return this.models[name];
        throw new Error(`Was unable to find model by this name. <${name}>, <${JSON.stringify(modelNames)}>`);
    }
    registerParameter(name, param) {
        if (name in this.parameters)
            return this.parameters[name];
        const p = param();
        this.parameters[name] = p;
        return p;
    }
    assertParametersExist(names) {
        const params = {};
        names.forEach(name => {
            const p = this.parameters[name];
            if (!p)
                throw new Error(`Expected to have parameter registered. <${name}>`);
            params[name] = p;
        });
        return params;
    }
    registerOptimizer(name, optimizer) {
        if (name in this.optimizers)
            return this.optimizers[name];
        const o = optimizer();
        this.optimizers[name] = o;
        return o;
    }
    clearOptimizer(name) {
        delete this.optimizers[name];
    }
    saveState(location = this.saveLocation) {
        return __awaiter(this, void 0, void 0, function* () {
            const subfolder = path.join(location, this.name, new Date().toISOString());
            yield utilities_ts_2.files.createFolder(subfolder);
            // promise.allValues executes each of the right sides in parallel
            // this makes sure that fileSystem latency is minimally a bottleneck here
            const tableOfContents = yield utilities_ts_1.promise.allValues({
                models: this.saveModels(subfolder),
                parameters: this.saveParameters(subfolder),
                optimizers: this.saveOptimizers(subfolder),
                state: this.saveStateDescription(subfolder),
            });
            yield utilities_ts_2.files.writeJson(path.join(subfolder, 'toc.json'), tableOfContents);
            return this._saveState(subfolder).then(utilities_ts_1.fp.giveBack(subfolder));
        });
    }
    saveModels(subfolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const registeredModels = Object.keys(this.models);
            const modelLocationPairs = yield utilities_ts_1.promise.map(registeredModels, modelName => {
                const model = this.models[modelName];
                const location = path.join(subfolder, 'models', modelName);
                return utilities_ts_2.files.createFolder(location)
                    .then(() => model.save(`file://${location}`))
                    .then(utilities_ts_1.fp.giveBack(utilities_ts_1.tuple(modelName, location)));
            });
            return _.fromPairs(modelLocationPairs);
        });
    }
    saveParameters(subfolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const registeredParameters = Object.keys(this.parameters);
            const parametersLocationPairs = yield utilities_ts_1.promise.map(registeredParameters, paramName => {
                const param = this.parameters[paramName];
                const location = path.join(subfolder, 'parameters', `${paramName}.csv`);
                const metaData = {
                    location,
                    shape: param.shape,
                };
                return tensorflow_1.writeTensorToCsv(location, param)
                    .then(utilities_ts_1.fp.giveBack(utilities_ts_1.tuple(paramName, metaData)));
            });
            return _.fromPairs(parametersLocationPairs);
        });
    }
    saveOptimizers(subfolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const registeredOptimizers = Object.keys(this.optimizers);
            const optimizerLocations = yield utilities_ts_1.promise.map(registeredOptimizers, optName => {
                const optimizer = this.optimizers[optName];
                const location = path.join(subfolder, 'optimizers', optName);
                return optimizer.saveState(location)
                    .then(utilities_ts_1.fp.giveBack(utilities_ts_1.tuple(optName, location)));
            });
            return _.fromPairs(optimizerLocations);
        });
    }
    saveStateDescription(subfolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = {
                datasetDescription: this.datasetDescription,
                metaParameters: this.opts,
                state: this.state || {},
            };
            const location = path.join(subfolder, 'state.json');
            return utilities_ts_2.files.writeJson(location, state)
                .then(utilities_ts_1.fp.giveBack(location));
        });
    }
    // -------
    // Loading
    // -------
    loadFromDisk(location) {
        return __awaiter(this, void 0, void 0, function* () {
            const subfolder = yield Algorithm.findSavedState(location, this.name);
            const toc = yield this.loadTableOfContents(subfolder);
            // execute all of these loading tasks in parallel
            // this will prevent fileSystem latency from being a bottleneck
            yield Promise.all([
                this.loadTensorsFromDisk(toc.parameters),
                this.loadSaveState(toc.state),
                this.loadModels(toc.models),
                this.loadOptimizers(toc.optimizers),
            ]);
            yield this.build();
            this.saveLocation = location;
            return this;
        });
    }
    loadTableOfContents(location) {
        return __awaiter(this, void 0, void 0, function* () {
            return utilities_ts_2.files.readJson(path.join(location, 'toc.json'), TableOfContentsSchema);
        });
    }
    static findAllSavedStates(location, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const algFolder = path.join(location, name);
            return utilities_ts_2.files.readdir(algFolder);
        });
    }
    static findSavedState(location, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const algFolder = path.join(location, name);
            const times = yield this.findAllSavedStates(location, name);
            const mostRecent = utilities_ts_1.dates.getMostRecent(times);
            return path.join(algFolder, mostRecent.toISOString());
        });
    }
    loadTensorsFromDisk(tensors) {
        return __awaiter(this, void 0, void 0, function* () {
            const tensorNames = Object.keys(tensors);
            return utilities_ts_1.promise.map(tensorNames, (name) => __awaiter(this, void 0, void 0, function* () {
                const metaData = tensors[name];
                const tensor = yield tensorflow_1.loadTensorFromCsv(metaData.location, metaData.shape);
                this.parameters[name] = tf.variable(tensor);
            })).then(utilities_ts_1.returnVoid);
        });
    }
    loadSaveState(tocEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield utilities_ts_2.files.readJson(tocEntry, StateSchema);
            this.state = state;
            this.datasetDescription = state.datasetDescription;
            this.opts = state.metaParameters;
        });
    }
    loadModels(tocEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            const modelNames = Object.keys(tocEntry);
            return utilities_ts_1.promise.map(modelNames, (name) => __awaiter(this, void 0, void 0, function* () {
                const location = tocEntry[name];
                const model = yield tf.loadModel(`file://${path.join(location, 'model.json')}`);
                this.models[name] = model;
            })).then(utilities_ts_1.returnVoid);
        });
    }
    loadOptimizers(tocEntry) {
        return __awaiter(this, void 0, void 0, function* () {
            const optimizerNames = Object.keys(tocEntry);
            return utilities_ts_1.promise.map(optimizerNames, (name) => __awaiter(this, void 0, void 0, function* () {
                const location = tocEntry[name];
                const optimizer = yield Optimizer_1.Optimizer.fromSavedState(location);
                this.optimizers[name] = optimizer;
            })).then(utilities_ts_1.returnVoid);
        });
    }
    static fromSavedState(location) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Algorithms should implement "fromSavedState" to load back-ups');
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activeBackup)
                return;
            const location = yield this.saveState();
            const tmp = this.lastSaveLocation;
            this.lastSaveLocation = location;
            if (tmp)
                yield utilities_ts_2.files.removeRecursively(tmp);
            const saves = yield Algorithm.findAllSavedStates(this.saveLocation, this.name);
            const oldSaves = saves
                // put the saves in order [oldest, ..., newest]
                .sort()
                // remove the two newest saves from the list
                .slice(0, -2)
                // prepend the filepath to the old save dates
                .map(save => path.join(this.saveLocation, this.name, save));
            // delete all old saves
            yield utilities_ts_1.promise.map(oldSaves, save => utilities_ts_2.files.removeRecursively(save));
        });
    }
    startBackup() {
        this.backupHandler = setInterval(() => {
            if (this.activeBackup)
                return;
            this.activeBackup = this.save()
                .then(() => this.activeBackup = undefined);
        }, utilities_ts_1.time.minutes(5));
    }
    stopBackup() {
        // if we stop backing up while there is no backup occurring, save one more time
        if (!this.activeBackup)
            this.save();
        // if we stop while a save is occurring, save once more afterwards to guarantee we get the algorithm's final state
        else
            this.activeBackup.then(() => this.save());
        clearInterval(this.backupHandler);
    }
}
exports.Algorithm = Algorithm;
const ParametersTOCEntrySchema = v.record(v.object({
    location: v.string(),
    shape: v.array(v.number()),
}));
const StateTOCEntrySchema = v.string();
const ModelsTOCEntrySchema = v.record(v.string());
const OptimizersTOCEntrySchema = v.record(v.string());
const TableOfContentsSchema = v.object({
    models: ModelsTOCEntrySchema,
    parameters: ParametersTOCEntrySchema,
    optimizers: OptimizersTOCEntrySchema,
    state: StateTOCEntrySchema,
});
const StateSchema = v.object({
    datasetDescription: DatasetDescription_1.DatasetDescriptionSchema,
    metaParameters: v.record(v.any()),
    state: v.record(v.any()),
});
//# sourceMappingURL=Algorithm.js.map