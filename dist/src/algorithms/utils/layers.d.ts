import * as v from 'validtyped';
import * as tf from '@tensorflow/tfjs';
export declare const LayerMetaParametersSchema: v.Validator<import("simplytyped/types/objects").ObjectType<{
    name?: string | undefined;
    regularizer?: v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }> | undefined;
} & Pick<v.ObjectValidator<{
    regularizer: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
    units: v.Validator<number>;
    activation: v.Validator<"sigmoid" | "linear" | "relu" | "tanh" | "elu">;
    type: v.Validator<"dense">;
    name: v.Validator<string>;
}>, "type" | "units" | "activation">>>;
export declare type LayerMetaParameters = v.ValidType<typeof LayerMetaParametersSchema>;
export declare const constructTFLayer: (layerDef: import("simplytyped/types/objects").ObjectType<{
    name?: string | undefined;
    regularizer?: v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }> | undefined;
} & Pick<v.ObjectValidator<{
    regularizer: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
    units: v.Validator<number>;
    activation: v.Validator<"sigmoid" | "linear" | "relu" | "tanh" | "elu">;
    type: v.Validator<"dense">;
    name: v.Validator<string>;
}>, "type" | "units" | "activation">>) => tf.layers.Layer;
export declare const constructTFNetwork: (layerDefs: import("simplytyped/types/objects").ObjectType<{
    name?: string | undefined;
    regularizer?: v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }> | undefined;
} & Pick<v.ObjectValidator<{
    regularizer: v.Validator<v.ObjectValidator<{
        type: v.Validator<"l1">;
        weight: v.Validator<number>;
    }> | v.ObjectValidator<{
        type: v.Validator<"l2">;
        weight: v.Validator<number>;
    }>>;
    units: v.Validator<number>;
    activation: v.Validator<"sigmoid" | "linear" | "relu" | "tanh" | "elu">;
    type: v.Validator<"dense">;
    name: v.Validator<string>;
}>, "type" | "units" | "activation">>[], input: tf.SymbolicTensor) => tf.SymbolicTensor[];
