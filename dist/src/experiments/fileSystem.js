"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hash = require("object-hash");
const utilities_ts_1 = require("utilities-ts");
const ExperimentDescription_1 = require("./ExperimentDescription");
const DEFAULT_PATH_TEMPLATE = '{{dataset}}/{{alg}}/{{params}}/{{run}}';
/**
 * An alias for interpolateResultsPath. This defines the previous
 * behavior in terms of the new system. This way it should be
 * trivial to maintain backwards compatibility with the old system.
 * @param exp An experiment description object
 */
exports.getResultsPathV1 = (exp) => exports.interpolateResultsPath(exp, '{{exp_desc}}/{{run}}');
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
exports.interpolateResultsPath = (exp, template = DEFAULT_PATH_TEMPLATE) => {
    const context = exp instanceof ExperimentDescription_1.ExperimentDescription
        ? descriptionToContext(exp)
        : exp;
    const interpolationData = {
        alg: context.alg,
        dataset: context.dataset,
        params: hash({ metaParameters: context.metaParameters, optimization: context.optimization }),
        exp_desc: hash({ ...context.description, metaParameters: context.metaParameters }),
        run: `${context.run || 0}`,
    };
    return utilities_ts_1.strings.interpolate(interpolationData, template);
};
function descriptionToContext(exp) {
    return {
        alg: exp.definition.algorithm,
        dataset: exp.definition.dataset,
        metaParameters: exp.metaParameters,
        description: exp.definition,
        run: exp.run,
        optimization: exp.optimization,
    };
}
function experimentJsonToContext(exp) {
    return {
        alg: exp.algorithm,
        dataset: exp.dataset || exp.environment,
        description: exp,
        optimization: exp.optimization,
    };
}
exports.experimentJsonToContext = experimentJsonToContext;
//# sourceMappingURL=fileSystem.js.map