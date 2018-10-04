import * as v from 'validtyped';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs';
import * as _ from 'lodash';

import { promise, fp, dates, time, returnVoid, tuple } from 'utilities-ts';
import { BuilderFunction } from 'utilities-ts/src/fp';

import { files } from 'utilities-ts';

import { Optimizer } from '../optimization/Optimizer';
import { DatasetDescription, DatasetDescriptionSchema } from '../data/DatasetDescription';
import { writeTensorToCsv, loadTensorFromCsv } from '../utils/tensorflow';
import { History } from '../analysis/History';
import { flatten } from '../utils/flatten';
import { OptimizationParameters } from '../optimization/OptimizerSchemas';

// TODO: consider making distinctions between Supervised, Unsupervised, etc. algs
// they will have different function signatures for training methods.
export abstract class Algorithm {
    protected abstract readonly name: string;
    protected opts: object | undefined;
    protected state: object | undefined;

    constructor (
        protected datasetDescription: DatasetDescription,
        private saveLocation: string,
    ) {}

    // ------------------
    // Building Algorithm
    // ------------------
    protected abstract _build(): Promise<any>;
    private hasBuilt = false;
    async build() {
        if (this.hasBuilt) return;
        await this._build();
        this.hasBuilt = true;
    }


    // --------
    // Training
    // --------
    protected abstract async _train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<History>;
    protected abstract async _predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor2D>;

    async train(X: tf.Tensor2D, Y: tf.Tensor2D, opts?: Partial<OptimizationParameters>, trainOptions?: Partial<TrainOptions>): Promise<History> {
        if (!this.hasBuilt) await this.build();

        const shouldAutosave = !trainOptions || (trainOptions && trainOptions.autosave !== false);
        if (shouldAutosave) this.startBackup();

        const history = await this._train(X, Y, opts);

        if (shouldAutosave) this.stopBackup();
        return history;
    }

    async predict(T: tf.Tensor2D, opts?: Partial<OptimizationParameters>): Promise<tf.Tensor2D> {
        if (!this.hasBuilt) await this.build();
        return this._predict(T, opts);
    }

    // ----------
    // Parameters
    // ----------
    getParameters() {
        return flatten(this.opts);
    }

    // ------
    // Saving
    // ------
    protected async _saveState(location: string): Promise<any> { /* stub */ }

    private models: Record<string, tf.Model> = {};
    protected registerModel(name: string, model: BuilderFunction<tf.Model>): tf.Model {
        if (name in this.models) return this.models[name];
        const m = model();
        this.models[name] = m;
        return m;
    }

    protected assertModel(name: string): tf.Model {
        const m = this.models[name];
        if (!m) throw new Error(`Expected to have a model registered. <${name}>`);
        return m;
    }

    getModel(name?: string): tf.Model {
        const modelNames = Object.keys(this.models);
        if (!name && modelNames.length > 1) throw new Error(`Need to specify a model name for this algorithm. <${JSON.stringify(modelNames)}>`);

        if (modelNames.length === 1) return this.models[modelNames[0]];

        if (name && name in this.models) return this.models[name];

        throw new Error(`Was unable to find model by this name. <${name}>, <${JSON.stringify(modelNames)}>`);
    }

    private parameters: Record<string, tf.Variable<tf.Rank.R2>> = {};
    protected registerParameter(name: string, param: BuilderFunction<tf.Variable<tf.Rank.R2>>): tf.Variable<tf.Rank.R2> {
        if (name in this.parameters) return this.parameters[name];
        const p = param();
        this.parameters[name] = p;
        return p;
    }

    protected assertParametersExist<S extends string>(names: S[]): Record<S, tf.Variable<tf.Rank.R2>> {
        const params = {} as Record<S, tf.Variable<tf.Rank.R2>>;
        names.forEach(name => {
            const p = this.parameters[name];
            if (!p) throw new Error(`Expected to have parameter registered. <${name}>`);
            params[name] = p;
        });
        return params;
    }

    private optimizers: Record<string, Optimizer> = {};
    protected registerOptimizer(name: string, optimizer: BuilderFunction<Optimizer>): Optimizer {
        if (name in this.optimizers) return this.optimizers[name];
        const o = optimizer();
        this.optimizers[name] = o;
        return o;
    }

    protected clearOptimizer(name: string) {
        delete this.optimizers[name];
    }

    async saveState(location = this.saveLocation): Promise<string> {
        const subfolder = path.join(location, this.name, new Date().toISOString());

        await files.createFolder(subfolder);

        // promise.allValues executes each of the right sides in parallel
        // this makes sure that fileSystem latency is minimally a bottleneck here
        const tableOfContents: TableOfContents = await promise.allValues({
            models: this.saveModels(subfolder),
            parameters: this.saveParameters(subfolder),
            optimizers: this.saveOptimizers(subfolder),
            state: this.saveStateDescription(subfolder),
        });

        await files.writeJson(path.join(subfolder, 'toc.json'), tableOfContents);

        return this._saveState(subfolder).then(fp.giveBack(subfolder));
    }

    private async saveModels(subfolder: string): Promise<ModelsTOCEntry> {
        const registeredModels = Object.keys(this.models);
        const modelLocationPairs = await promise.map(registeredModels, modelName => {
            const model = this.models[modelName];
            const location = path.join(subfolder, 'models', modelName);
            return files.createFolder(location)
                .then(() => model.save(`file://${location}`))
                .then(fp.giveBack(tuple(modelName, location)));
        });

        return _.fromPairs(modelLocationPairs);
    }

    private async saveParameters(subfolder: string): Promise<ParametersTOCEntry> {
        const registeredParameters = Object.keys(this.parameters);
        const parametersLocationPairs = await promise.map(registeredParameters, paramName => {
            const param = this.parameters[paramName];
            const location = path.join(subfolder, 'parameters', `${paramName}.csv`);
            const metaData = {
                location,
                shape: param.shape,
            };
            return writeTensorToCsv(location, param)
                .then(fp.giveBack(tuple(paramName, metaData)));
        });

        return _.fromPairs(parametersLocationPairs);
    }

    private async saveOptimizers(subfolder: string) {
        const registeredOptimizers = Object.keys(this.optimizers);
        const optimizerLocations = await promise.map(registeredOptimizers, optName => {
            const optimizer = this.optimizers[optName];
            const location = path.join(subfolder, 'optimizers', optName);
            return optimizer.saveState(location)
                .then(fp.giveBack(tuple(optName, location)));
        });

        return _.fromPairs(optimizerLocations);
    }

    private async saveStateDescription(subfolder: string): Promise<StateTOCEntry> {
        const state = {
            datasetDescription: this.datasetDescription,
            metaParameters: this.opts,
            state: this.state || {},
        };

        const location = path.join(subfolder, 'state.json');
        return files.writeJson(location, state)
            .then(fp.giveBack(location));
    }

    // -------
    // Loading
    // -------

    protected async loadFromDisk(location: string) {
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

    private async loadTableOfContents(location: string): Promise<TableOfContents> {
        return files.readJson(path.join(location, 'toc.json'), TableOfContentsSchema);
    }

    private static async findAllSavedStates(location: string, name: string): Promise<string[]> {
        const algFolder = path.join(location, name);
        return files.readdir(algFolder);
    }

    protected static async findSavedState(location: string, name: string): Promise<string> {
        const algFolder = path.join(location, name);
        const times = await this.findAllSavedStates(location, name);
        const mostRecent = dates.getMostRecent(times);

        return path.join(algFolder, mostRecent.toISOString());
    }

    private async loadTensorsFromDisk(tensors: ParametersTOCEntry): Promise<void> {
        const tensorNames = Object.keys(tensors);

        return promise.map(tensorNames, async (name) => {
            const metaData = tensors[name];
            const tensor = await loadTensorFromCsv(metaData.location, metaData.shape as [number, number]);

            this.parameters[name] = tf.variable(tensor);
        }).then(returnVoid);
    }

    private async loadSaveState(tocEntry: StateTOCEntry): Promise<void> {
        const state = await files.readJson(tocEntry, StateSchema);
        this.state = state;
        this.datasetDescription = state.datasetDescription;
        this.opts = state.metaParameters;
    }

    private async loadModels(tocEntry: ModelsTOCEntry): Promise<void> {
        const modelNames = Object.keys(tocEntry);

        return promise.map(modelNames, async (name) => {
            const location = tocEntry[name];

            const model = await tf.loadModel(`file://${path.join(location, 'model.json')}`);

            this.models[name] = model;
        }).then(returnVoid);
    }

    private async loadOptimizers(tocEntry: OptimizersTOCEntry): Promise<void> {
        const optimizerNames = Object.keys(tocEntry);

        return promise.map(optimizerNames, async (name) => {
            const location = tocEntry[name];

            const optimizer = await Optimizer.fromSavedState(location);

            this.optimizers[name] = optimizer;
        }).then(returnVoid);
    }

    static async fromSavedState(location: string): Promise<Algorithm> {
        throw new Error('Algorithms should implement "fromSavedState" to load back-ups');
    }

    // ----------------------
    // Backup Algorithm State
    // ----------------------

    private backupHandler: NodeJS.Timer | undefined;
    private activeBackup: Promise<void> | undefined;
    private lastSaveLocation: string | undefined;
    private async save() {
        if (this.activeBackup) return;
        const location = await this.saveState().catch();
        const tmp = this.lastSaveLocation;
        this.lastSaveLocation = location;

        if (tmp) await files.removeRecursively(tmp);

        const saves = await Algorithm.findAllSavedStates(this.saveLocation, this.name);
        const oldSaves = saves
        // put the saves in order [oldest, ..., newest]
            .sort()
        // remove the two newest saves from the list
            .slice(0, -2)
        // prepend the filepath to the old save dates
            .map(save => path.join(this.saveLocation, this.name, save));
        // delete all old saves
        await promise.map(oldSaves, save => files.removeRecursively(save));
    }

    private startBackup() {
        this.backupHandler = setInterval(() => {
            if (this.activeBackup) return;
            this.activeBackup = this.save()
                .then(() => this.activeBackup = undefined);
        }, time.minutes(5));
    }

    private stopBackup() {
        // if we stop backing up while there is no backup occurring, save one more time
        if (!this.activeBackup) this.save();
        // if we stop while a save is occurring, save once more afterwards to guarantee we get the algorithm's final state
        else this.activeBackup.then(() => this.save());
        clearInterval(this.backupHandler as any);
    }
}

interface TrainOptions {
    autosave: boolean;
}

const ParametersTOCEntrySchema = v.record(v.object({
    location: v.string(),
    shape: v.array(v.number()),
}));

type ParametersTOCEntry = v.ValidType<typeof ParametersTOCEntrySchema>;

const StateTOCEntrySchema = v.string();
type StateTOCEntry = v.ValidType<typeof StateTOCEntrySchema>;

const ModelsTOCEntrySchema = v.record(v.string());
type ModelsTOCEntry = v.ValidType<typeof ModelsTOCEntrySchema>;

const OptimizersTOCEntrySchema = v.record(v.string());
type OptimizersTOCEntry = v.ValidType<typeof OptimizersTOCEntrySchema>;

const TableOfContentsSchema = v.object({
    models: ModelsTOCEntrySchema,
    parameters: ParametersTOCEntrySchema,
    optimizers: OptimizersTOCEntrySchema,
    state: StateTOCEntrySchema,
});

type TableOfContents = v.ValidType<typeof TableOfContentsSchema>;

const StateSchema = v.object({
    datasetDescription: DatasetDescriptionSchema,
    metaParameters: v.record(v.any()),
    state: v.record(v.any()),
});
