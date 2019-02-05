import * as v from 'validtyped';

import { OptimizationParametersSchema } from '../optimization/OptimizerSchemas';
import { getTransformationSchemas } from './ExperimentRegistry';

export const getExperimentSchema = () => {
    const transformationSchemas = getTransformationSchemas();
    const TransformationSchema = transformationSchemas.length > 0
        ? v.union(transformationSchemas)
        : v.boolean().and(v.number());

    return v.object({
        algorithm: v.string(),
        dataset: v.string(),
        metaParameters: v.record(v.any()),
        transformation: TransformationSchema,
        optimization: OptimizationParametersSchema,
    }, { optional: ['transformation', 'optimization', 'dataset'] });
};

export interface ExperimentJson extends v.ValidType<ReturnType<typeof getExperimentSchema>> {}
