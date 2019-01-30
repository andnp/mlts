import * as hash from 'object-hash';
import { strings } from 'utilities-ts';

import { ExperimentDescription } from './ExperimentDescription';
import { ExperimentJson } from './ExperimentSchema';
import { OptimizationParameters } from '../optimization';
import { getAlgorithmRegistryData, getDatasetConstructor } from './ExperimentRegistry';

const DEFAULT_PATH_TEMPLATE = '{{dataset}}/{{alg}}/{{params}}/{{run}}';

type ExperimentContext = Partial<{
    alg: string;
    dataset: string;
    metaParameters: Record<string, any>;
    optimization: OptimizationParameters;
    description: ExperimentJson;
    run: number;
}>;

/**
 * An alias for interpolateResultsPath. This defines the previous
 * behavior in terms of the new system. This way it should be
 * trivial to maintain backwards compatibility with the old system.
 * @param exp An experiment description object
 */
export const getResultsPathV1 = (exp: ExperimentDescription | ExperimentContext) => interpolateResultsPath(exp, '{{exp_desc}}/{{run}}');

/**
 * Takes an experiment context object and a template string and replaces the template variables
 * with the appropriate values from the experiment description.
 *
 * @example:
 * ```typescript
 * const data = { run: 2, algName: 'ANN' };
 * const template = '{{algName}}/{{run}}';
 * interpolateResultsPath(data, template); // => "ANN/2"
 * ```
 * @param exp An experiment description object containing the context of the experiment
 * @param template A template string for interpolating the path
 */
export const interpolateResultsPath = (exp: ExperimentContext | ExperimentDescription, template: string = DEFAULT_PATH_TEMPLATE) => {
    const context = exp instanceof ExperimentDescription
        ? descriptionToContext(exp)
        : exp;

    const interpolationData = {
        alg: context.alg,
        dataset: context.dataset,
        params: hash({ metaParameters: context.metaParameters, optimization: context.optimization }),
        exp_desc: hash({ ...context.description, metaParameters: context.metaParameters }),
        run: `${context.run || 0}`,
    };

    return strings.interpolate(interpolationData, template);
};

function descriptionToContext(exp: ExperimentDescription): ExperimentContext {
    return {
        alg: exp.algorithm.name,
        dataset: exp.dataset.constructor.name,
        metaParameters: exp.metaParameters,
        description: exp.definition,
        run: exp.run,
        optimization: exp.optimization,
    };
}

export function experimentJsonToContext(exp: ExperimentJson) {
    const alg = getAlgorithmRegistryData(exp.algorithm).constructor.name;
    const dataset = getDatasetConstructor(exp.dataset).name;
    return {
        alg,
        dataset,
        description: exp,
        optimization: exp.optimization,
    };
}
