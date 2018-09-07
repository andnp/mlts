import * as v from 'validtyped';
import * as _ from 'lodash';
import { ConstructorFor } from 'simplytyped';
import * as path from 'path';
import * as hash from 'object-hash';

import { Algorithm } from "algorithms/Algorithm";
import { readJson, fileExists } from 'utils/files';
import { TensorflowDataset } from 'data/tensorflow/TensorflowDataset';

const algorithmRegistry: Record<string, { constructor: ConstructorFor<Algorithm>, schema: v.Validator<any> }> = {};
const datasetRegistry: Record<string, typeof TensorflowDataset> = {};

export function registerAlgorithm(name: string, constructor: ConstructorFor<Algorithm>, schema: v.Validator<any> = v.any()) {
    algorithmRegistry[name] = { constructor, schema };
}

export function registerDataset(name: string, dataset: typeof TensorflowDataset) {
    datasetRegistry[name] = dataset;
}

const ExperimentSchema = v.object({
    algorithm: v.string(),
    dataset: v.string(),
    metaParameters: v.any(),
});

type ExperimentJson = v.ValidType<typeof ExperimentSchema>;

export class Experiment {
    constructor(
        readonly description: ExperimentJson,
        readonly algorithm: Algorithm,
        readonly dataset: TensorflowDataset,
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
        const saveLocation = path.join('savedModels', hash({ ...data, metaParameters }), `${run}`);

        const exists = await fileExists(saveLocation);

        const algorithm = exists
            ? await (algData.constructor as any as typeof Algorithm).fromSavedState(saveLocation)
            : new algData.constructor(datasetDescriptor, metaParameters, saveLocation);

        return new Experiment(data, algorithm, dataset);
    }
}

// --------------------------------------------
// Compute the MetaParameters used for this run
// --------------------------------------------

function flattenToArray(thing: any): Array<[ string, any[] ]> {
    const accum: any[] = [];
    function inner(thing: any, path = ''): void {
        if (Array.isArray(thing)) {
            // does this contain deeper objects?
            // if so, we need to keep going
            if (typeof thing[0] === 'object') {
               thing.forEach((v, i) => inner(v, `${path}[${i}]`));
               return;
            }

            accum.push([ path, thing ]);
            return;
        }
        if (typeof thing === 'object') {
            const keys = Object.keys(thing);

            keys.forEach(key => {
                inner(thing[key], path ? `${path}.${key}` : key);
            });
            return;
        }

        throw new Error(`Shouldn't be finding something of any other type. <${typeof thing}>`);
    }

    inner(thing);
    return accum;
}

function reconstructParameters(params: Record<string, any>) {
    const res: Record<string, any> = {};
    const keys = Object.keys(params);
    keys.forEach(k => {
        _.set(res, k, params[k]);
    });

    return res;
}

function getParameterPermutation(metaParameters: any, index: number): any {
    // this gives us a list of pairs.
    // each pair is of form [ 'path.to.thing', arrayOfValues ]
    const parameterPairs = flattenToArray(metaParameters);

    const parameters: Record<string, any> = {};
    let accum = 1;
    parameterPairs.forEach(pair => {
        const num = pair[1].length;
        parameters[pair[0]] = pair[1][Math.floor(index / accum) % num];
        accum *= num;
    });

    return reconstructParameters(parameters);
}

function getNumberOfRuns(metaParameters: any): number {
    const parameterPairs = flattenToArray(metaParameters);
    let accum = 1;
    parameterPairs.forEach(pair => accum *= pair[1].length);
    return accum;
}
