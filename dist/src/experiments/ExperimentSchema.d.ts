import * as v from 'validtyped';
export declare const getExperimentSchema: () => v.Validator<import("simplytyped/types/objects").ObjectType<{
    transformation?: any;
} & Pick<v.ObjectValidator<{
    algorithm: v.Validator<string>;
    dataset: v.Validator<string>;
    metaParameters: v.Validator<Record<string, any>>;
    transformation: v.Validator<any>;
    optimization: v.Validator<(import("simplytyped/types/objects").ObjectType<{
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
}>, "algorithm" | "dataset" | "metaParameters" | "optimization">>>;
export declare type ExperimentJson = v.ValidType<ReturnType<typeof getExperimentSchema>>;
