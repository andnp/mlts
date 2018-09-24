import * as v from 'validtyped';

// -----------------------
// Optimization Parameters
// -----------------------

export const AdadeltaParametersSchema = v.object({
    type: v.string(['adadelta']),
    learningRate: v.number(),
});

export const AdagradParametersSchema = v.object({
    type: v.string(['adagrad']),
    learningRate: v.number(),
});

export const OptimizationParametersSchema = v.object({
    threshold: v.number(),
    iterations: v.number(),
    batchSize: v.number(),
}, { optional: ['threshold', 'batchSize'] }).and(AdadeltaParametersSchema.or(AdagradParametersSchema));

export type AdadeltaParameters = v.ValidType<typeof AdadeltaParametersSchema>;
export type OptimizationParameters = v.ValidType<typeof OptimizationParametersSchema>;
