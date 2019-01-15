import * as v from 'validtyped';
export declare const AdadeltaParametersSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    rho?: number | undefined;
    epsilon?: number | undefined;
} & Pick<v.ObjectValidator<{
    type: v.Validator<"adadelta">;
    learningRate: v.Validator<number>;
    rho: v.Validator<number>;
    epsilon: v.Validator<number>;
}>, "type" | "learningRate">>>;
export declare const AdagradParametersSchema: v.Validator<v.ObjectValidator<{
    type: v.Validator<"adagrad">;
    learningRate: v.Validator<number>;
}>>;
export declare const RMSPropParametersSchema: v.Validator<v.ObjectValidator<{
    type: v.Validator<"rmsprop">;
    learningRate: v.Validator<number>;
}>>;
export declare const OptimizationParametersSchema: v.Validator<(import("simplytyped/types/objects").ObjectType<{
    threshold?: number | undefined;
    batchSize?: number | undefined;
} & Pick<v.ObjectValidator<{
    threshold: v.Validator<number>;
    iterations: v.Validator<number>;
    batchSize: v.Validator<number>;
}>, "iterations">> & import("simplytyped/types/objects").ObjectType<{
    rho?: number | undefined;
    epsilon?: number | undefined;
} & Pick<v.ObjectValidator<{
    type: v.Validator<"adadelta">;
    learningRate: v.Validator<number>;
    rho: v.Validator<number>;
    epsilon: v.Validator<number>;
}>, "type" | "learningRate">>) | (import("simplytyped/types/objects").ObjectType<{
    threshold?: number | undefined;
    batchSize?: number | undefined;
} & Pick<v.ObjectValidator<{
    threshold: v.Validator<number>;
    iterations: v.Validator<number>;
    batchSize: v.Validator<number>;
}>, "iterations">> & v.ObjectValidator<{
    type: v.Validator<"adagrad">;
    learningRate: v.Validator<number>;
}>) | (import("simplytyped/types/objects").ObjectType<{
    threshold?: number | undefined;
    batchSize?: number | undefined;
} & Pick<v.ObjectValidator<{
    threshold: v.Validator<number>;
    iterations: v.Validator<number>;
    batchSize: v.Validator<number>;
}>, "iterations">> & v.ObjectValidator<{
    type: v.Validator<"rmsprop">;
    learningRate: v.Validator<number>;
}>)>;
export declare type AdadeltaParameters = v.ValidType<typeof AdadeltaParametersSchema>;
export declare type OptimizationParameters = v.ValidType<typeof OptimizationParametersSchema>;
