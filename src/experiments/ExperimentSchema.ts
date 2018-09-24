import * as v from 'validtyped';

import { OptimizationParametersSchema } from 'optimization/OptimizerSchemas';

export const ExperimentSchema = v.object({
    algorithm: v.string(),
    dataset: v.string(),
    metaParameters: v.any(),
    optimization: OptimizationParametersSchema,
});

export type ExperimentJson = v.ValidType<typeof ExperimentSchema>;
