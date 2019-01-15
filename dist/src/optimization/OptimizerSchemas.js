"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v = require("validtyped");
// -----------------------
// Optimization Parameters
// -----------------------
exports.AdadeltaParametersSchema = v.object({
    type: v.string(['adadelta']),
    learningRate: v.number(),
    rho: v.number(),
    epsilon: v.number(),
}, { optional: ['rho', 'epsilon'] });
exports.AdagradParametersSchema = v.object({
    type: v.string(['adagrad']),
    learningRate: v.number(),
});
exports.RMSPropParametersSchema = v.object({
    type: v.string(['rmsprop']),
    learningRate: v.number(),
});
exports.OptimizationParametersSchema = v.object({
    threshold: v.number(),
    iterations: v.number(),
    batchSize: v.number(),
}, { optional: ['threshold', 'batchSize'] }).and(v.union([exports.AdadeltaParametersSchema, exports.AdagradParametersSchema, exports.RMSPropParametersSchema]));
//# sourceMappingURL=OptimizerSchemas.js.map