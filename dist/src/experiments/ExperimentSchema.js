"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v = require("validtyped");
const OptimizerSchemas_1 = require("../optimization/OptimizerSchemas");
const ExperimentRegistry_1 = require("./ExperimentRegistry");
exports.getExperimentSchema = () => {
    const transformationSchemas = ExperimentRegistry_1.getTransformationSchemas();
    const TransformationSchema = transformationSchemas.length > 0
        ? v.union(transformationSchemas)
        : v.boolean().and(v.number());
    return v.object({
        algorithm: v.string(),
        dataset: v.string(),
        metaParameters: v.record(v.any()),
        transformation: TransformationSchema,
        optimization: OptimizerSchemas_1.OptimizationParametersSchema,
    }, { optional: ['transformation'] });
};
//# sourceMappingURL=ExperimentSchema.js.map