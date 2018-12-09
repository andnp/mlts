"use strict";
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
    async build() {
        if (this.hasBuilt)
            return;
        await this._build();
        this.hasBuilt = true;
    }
    async train(X, Y, opts, trainOptions) {
        if (!this.hasBuilt)
            await this.build();
        const shouldAutosave = !trainOptions || (trainOptions && trainOptions.autosave !== false);
        if (shouldAutosave)
            this.startBackup();
        const history = await this._train(X, Y, opts);
        if (shouldAutosave)
            await this.stopBackup();
        return history;
    }
    async predict(T, opts) {
        if (!this.hasBuilt)
            await this.build();
        return this._predict(T, opts);
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
    async _saveState(location) { }
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
    async saveState(location = this.saveLocation) {
        const subfolder = path.join(location, this.name, new Date().toISOString());
        await utilities_ts_2.files.createFolder(subfolder);
        // promise.allValues executes each of the right sides in parallel
        // this makes sure that fileSystem latency is minimally a bottleneck here
        const tableOfContents = await utilities_ts_1.promise.allValues({
            models: this.saveModels(subfolder),
            parameters: this.saveParameters(subfolder),
            optimizers: this.saveOptimizers(subfolder),
            state: this.saveStateDescription(subfolder),
        });
        await utilities_ts_2.files.writeJson(path.join(subfolder, 'toc.json'), tableOfContents);
        return this._saveState(subfolder).then(utilities_ts_1.fp.giveBack(subfolder));
    }
    async saveModels(subfolder) {
        const registeredModels = Object.keys(this.models);
        const modelLocationPairs = await utilities_ts_1.promise.map(registeredModels, modelName => {
            const model = this.models[modelName];
            const location = path.join(subfolder, 'models', modelName);
            return utilities_ts_2.files.createFolder(location)
                .then(() => model.save(`file://${location}`).catch(_.noop))
                .then(utilities_ts_1.fp.giveBack(utilities_ts_1.tuple(modelName, location)));
        });
        return _.fromPairs(modelLocationPairs);
    }
    async saveParameters(subfolder) {
        const registeredParameters = Object.keys(this.parameters);
        const parametersLocationPairs = await utilities_ts_1.promise.map(registeredParameters, paramName => {
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
    }
    async saveOptimizers(subfolder) {
        const registeredOptimizers = Object.keys(this.optimizers);
        const optimizerLocations = await utilities_ts_1.promise.map(registeredOptimizers, optName => {
            const optimizer = this.optimizers[optName];
            const location = path.join(subfolder, 'optimizers', optName);
            return optimizer.saveState(location)
                .then(utilities_ts_1.fp.giveBack(utilities_ts_1.tuple(optName, location)));
        });
        return _.fromPairs(optimizerLocations);
    }
    async saveStateDescription(subfolder) {
        const state = {
            datasetDescription: this.datasetDescription,
            metaParameters: this.opts,
            state: this.state || {},
        };
        const location = path.join(subfolder, 'state.json');
        return utilities_ts_2.files.writeJson(location, state)
            .then(utilities_ts_1.fp.giveBack(location));
    }
    // -------
    // Loading
    // -------
    async loadFromDisk(location) {
        const subfolder = await Algorithm.findSavedState(location, this.name);
        const toc = await this.loadTableOfContents(subfolder);
        // execute all of these loading tasks in parallel
        // this will prevent fileSystem latency from being a bottleneck
        await Promise.all([
            this.loadTensorsFromDisk(toc.parameters),
            this.loadSaveState(toc.state),
            this.loadModels(toc.models),
            this.loadOptimizers(toc.optimizers),
        ]);
        await this.build();
        this.saveLocation = location;
        return this;
    }
    async loadTableOfContents(location) {
        return utilities_ts_2.files.readJson(path.join(location, 'toc.json'), TableOfContentsSchema);
    }
    static async findAllSavedStates(location, name) {
        const algFolder = path.join(location, name);
        return utilities_ts_2.files.readdir(algFolder);
    }
    static async findSavedState(location, name) {
        const algFolder = path.join(location, name);
        const times = await this.findAllSavedStates(location, name);
        const mostRecent = utilities_ts_1.dates.getMostRecent(times);
        return path.join(algFolder, mostRecent.toISOString());
    }
    async loadTensorsFromDisk(tensors) {
        const tensorNames = Object.keys(tensors);
        return utilities_ts_1.promise.map(tensorNames, async (name) => {
            const metaData = tensors[name];
            const tensor = await tensorflow_1.loadTensorFromCsv(metaData.location, metaData.shape);
            this.parameters[name] = tf.variable(tensor);
        }).then(utilities_ts_1.returnVoid);
    }
    async loadSaveState(tocEntry) {
        const state = await utilities_ts_2.files.readJson(tocEntry, StateSchema);
        this.state = state;
        this.datasetDescription = state.datasetDescription;
        this.opts = state.metaParameters;
    }
    async loadModels(tocEntry) {
        const modelNames = Object.keys(tocEntry);
        return utilities_ts_1.promise.map(modelNames, async (name) => {
            const location = tocEntry[name];
            const model = await tf.loadModel(`file://${path.join(location, 'model.json')}`);
            this.models[name] = model;
        }).then(utilities_ts_1.returnVoid);
    }
    async loadOptimizers(tocEntry) {
        const optimizerNames = Object.keys(tocEntry);
        return utilities_ts_1.promise.map(optimizerNames, async (name) => {
            const location = tocEntry[name];
            const optimizer = await Optimizer_1.Optimizer.fromSavedState(location);
            this.optimizers[name] = optimizer;
        }).then(utilities_ts_1.returnVoid);
    }
    static async fromSavedState(location) {
        throw new Error('Algorithms should implement "fromSavedState" to load back-ups');
    }
    async save() {
        if (this.activeBackup)
            return;
        const location = await this.saveState().catch(_.noop);
        if (!location)
            return;
        const tmp = this.lastSaveLocation;
        this.lastSaveLocation = location;
        if (tmp)
            await utilities_ts_2.files.removeRecursively(tmp);
        const saves = await Algorithm.findAllSavedStates(this.saveLocation, this.name);
        const oldSaves = saves
            // put the saves in order [oldest, ..., newest]
            .sort()
            // remove the two newest saves from the list
            .slice(0, -2)
            // prepend the filepath to the old save dates
            .map(save => path.join(this.saveLocation, this.name, save));
        // delete all old saves
        await utilities_ts_1.promise.map(oldSaves, save => utilities_ts_2.files.removeRecursively(save));
    }
    startBackup() {
        this.backupHandler = setInterval(() => {
            if (this.activeBackup)
                return;
            this.activeBackup = this.save()
                .then(() => this.activeBackup = undefined);
        }, utilities_ts_1.time.minutes(15));
    }
    async stopBackup() {
        // if we stop backing up while there is no backup occurring, save one more time
        if (!this.activeBackup)
            await this.save();
        // if we stop while a save is occurring, save once more afterwards to guarantee we get the algorithm's final state
        else
            await this.activeBackup.then(() => this.save());
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