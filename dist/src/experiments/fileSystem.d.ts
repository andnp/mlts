import { ExperimentDescription } from './ExperimentDescription';
import { ExperimentJson } from './ExperimentSchema';
/**
 * An alias for interpolateResultsPath. This defines the previous
 * behavior in terms of the new system. This way it should be
 * trivial to maintain backwards compatibility with the old system.
 * @param exp An experiment description object
 */
export declare const getResultsPathV1: (exp: ExperimentDescription | Partial<{
    alg: string;
    dataset: string;
    metaParameters: Record<string, any>;
    optimization: (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("simplytyped").ObjectType<{
        rho?: number | undefined;
        epsilon?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adadelta">;
        learningRate: import("validtyped").Validator<number>;
        rho: import("validtyped").Validator<number>;
        epsilon: import("validtyped").Validator<number>;
    }>, "type" | "learningRate">>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adagrad">;
        learningRate: import("validtyped").Validator<number>;
    }>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"rmsprop">;
        learningRate: import("validtyped").Validator<number>;
    }>);
    description: ExperimentJson;
    run: number;
}>) => string;
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
export declare const interpolateResultsPath: (exp: ExperimentDescription | Partial<{
    alg: string;
    dataset: string;
    metaParameters: Record<string, any>;
    optimization: (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("simplytyped").ObjectType<{
        rho?: number | undefined;
        epsilon?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adadelta">;
        learningRate: import("validtyped").Validator<number>;
        rho: import("validtyped").Validator<number>;
        epsilon: import("validtyped").Validator<number>;
    }>, "type" | "learningRate">>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adagrad">;
        learningRate: import("validtyped").Validator<number>;
    }>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"rmsprop">;
        learningRate: import("validtyped").Validator<number>;
    }>);
    description: ExperimentJson;
    run: number;
}>, template?: string) => string;
export declare function experimentJsonToContext(exp: ExperimentJson): {
    alg: string;
    dataset: string | undefined;
    description: ExperimentJson;
    optimization: (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("simplytyped").ObjectType<{
        rho?: number | undefined;
        epsilon?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adadelta">;
        learningRate: import("validtyped").Validator<number>;
        rho: import("validtyped").Validator<number>;
        epsilon: import("validtyped").Validator<number>;
    }>, "type" | "learningRate">>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"adagrad">;
        learningRate: import("validtyped").Validator<number>;
    }>) | (import("simplytyped").ObjectType<{
        threshold?: number | undefined;
        batchSize?: number | undefined;
    } & Pick<import("validtyped").ObjectValidator<{
        threshold: import("validtyped").Validator<number>;
        iterations: import("validtyped").Validator<number>;
        batchSize: import("validtyped").Validator<number>;
    }>, "iterations">> & import("validtyped").ObjectValidator<{
        type: import("validtyped").Validator<"rmsprop">;
        learningRate: import("validtyped").Validator<number>;
    }>) | undefined;
};
