export declare const getResultsPath: (experiment: import("simplytyped/types/objects").ObjectType<{
    transformation?: any;
} & Pick<import("validtyped").ObjectValidator<{
    algorithm: import("validtyped").Validator<string>;
    dataset: import("validtyped").Validator<string>;
    metaParameters: import("validtyped").Validator<Record<string, any>>;
    transformation: import("validtyped").Validator<any>;
    optimization: import("validtyped").Validator<(import("simplytyped/types/objects").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("simplytyped/types/objects").ObjectType<{
        rho?: number | undefined;
        epsilon?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adadelta">;
        learningRate: import("validtyped").Validator<number>;
        rho: import("validtyped").Validator<number>;
        epsilon: import("validtyped").Validator<number>;
    }>, "type" | "learningRate">>) | (import("simplytyped/types/objects").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adagrad">;
        learningRate: import("validtyped").Validator<number>;
    }>) | (import("simplytyped/types/objects").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"rmsprop">;
        learningRate: import("validtyped").Validator<number>;
    }>)>;
}>, "algorithm" | "dataset" | "metaParameters" | "optimization">>, metaParameters: object, run: number) => string;
