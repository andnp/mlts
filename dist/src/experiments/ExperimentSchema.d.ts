import * as v from 'validtyped';
export declare const getExperimentSchema: () => v.Validator<import("simplytyped").ObjectType<{
    transformation?: any;
    optimization?: (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<v.ObjectValidator<{
        threshold: v.Validator<number>;
        iterations: v.Validator<number>;
        batchSize: v.Validator<number>;
    }>, "iterations">> & import("simplytyped").ObjectType<{
        rho?: number | undefined;
        epsilon?: number | undefined;
    } & Pick<v.ObjectValidator<{
        type: v.Validator<"adadelta">;
        learningRate: v.Validator<number>;
        rho: v.Validator<number>;
        epsilon: v.Validator<number>;
    }>, "type" | "learningRate">>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<v.ObjectValidator<{
        threshold: v.Validator<number>;
        iterations: v.Validator<number>;
        batchSize: v.Validator<number>;
    }>, "iterations">> & v.ObjectValidator<{
        type: v.Validator<"adagrad">;
        learningRate: v.Validator<number>;
    }>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<v.ObjectValidator<{
        threshold: v.Validator<number>;
        iterations: v.Validator<number>;
        batchSize: v.Validator<number>;
    }>, "iterations">> & v.ObjectValidator<{
        type: v.Validator<"rmsprop">;
        learningRate: v.Validator<number>;
    }>) | undefined;
    dataset?: string | undefined;
} & Pick<v.ObjectValidator<{
    algorithm: v.Validator<string>;
    dataset: v.Validator<string>;
    metaParameters: v.Validator<Record<string, any>>;
    transformation: v.Validator<any>;
    optimization: v.Validator<(import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<v.ObjectValidator<{
        threshold: v.Validator<number>;
        iterations: v.Validator<number>;
        batchSize: v.Validator<number>;
    }>, "iterations">> & import("simplytyped").ObjectType<{
        rho?: number | undefined;
        epsilon?: number | undefined;
    } & Pick<v.ObjectValidator<{
        type: v.Validator<"adadelta">;
        learningRate: v.Validator<number>;
        rho: v.Validator<number>;
        epsilon: v.Validator<number>;
    }>, "type" | "learningRate">>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<v.ObjectValidator<{
        threshold: v.Validator<number>;
        iterations: v.Validator<number>;
        batchSize: v.Validator<number>;
    }>, "iterations">> & v.ObjectValidator<{
        type: v.Validator<"adagrad">;
        learningRate: v.Validator<number>;
    }>) | (import("simplytyped").ObjectType<{
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
}>, "algorithm" | "metaParameters">>>;
export declare type ExperimentJson = v.ValidType<ReturnType<typeof getExperimentSchema>>;
