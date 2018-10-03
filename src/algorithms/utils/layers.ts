import * as v from 'validtyped';
import * as tf from '@tensorflow/tfjs';

import { RegularizerParametersSchema, regularizeLayer } from '../../regularizers/regularizers';
import { assertNever } from '../../utils/tsUtil';

export const LayerMetaParametersSchema = v.object({
    regularizer: RegularizerParametersSchema,
    units: v.number(),
    activation: v.string(['sigmoid', 'linear', 'relu', 'tanh', 'elu']),
    type: v.string(['dense']),
    name: v.string(),
}, { optional: ['name', 'regularizer'] });
export type LayerMetaParameters = v.ValidType<typeof LayerMetaParametersSchema>;

export const constructTFLayer = (layerDef: LayerMetaParameters) => {
    if (layerDef.type === 'dense') {
        return tf.layers.dense({
            units: layerDef.units,
            kernelRegularizer: layerDef.regularizer && regularizeLayer(layerDef.regularizer),
            activation: layerDef.activation,
            name: layerDef.name,
        });
    }

    assertNever(layerDef.type);
    throw new Error('Unexpected line reached');
};

export const constructTFNetwork = (layerDefs: LayerMetaParameters[], input: tf.SymbolicTensor) => {
    let prevLayer = input;
    return layerDefs.map((layerDef, i) => {
        const layer = constructTFLayer(layerDef);
        prevLayer = layer.apply(prevLayer) as tf.SymbolicTensor;
        return prevLayer;
    });
};