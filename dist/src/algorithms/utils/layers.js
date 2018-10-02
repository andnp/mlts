"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v = require("validtyped");
const tf = require("@tensorflow/tfjs");
const regularizers_1 = require("../../regularizers/regularizers");
const tsUtil_1 = require("../../utils/tsUtil");
exports.LayerMetaParametersSchema = v.object({
    regularizer: regularizers_1.RegularizerParametersSchema,
    units: v.number(),
    activation: v.string(['sigmoid', 'linear', 'relu', 'tanh', 'elu']),
    type: v.string(['dense']),
    name: v.string(),
}, { optional: ['name', 'regularizer'] });
exports.constructTFLayer = (layerDef) => {
    if (layerDef.type === 'dense') {
        return tf.layers.dense({
            units: layerDef.units,
            kernelRegularizer: layerDef.regularizer && regularizers_1.regularizeLayer(layerDef.regularizer),
            activation: layerDef.activation,
            name: layerDef.name,
        });
    }
    tsUtil_1.assertNever(layerDef.type);
    throw new Error('Unexpected line reached');
};
exports.constructTFNetwork = (layerDefs, input) => {
    let prevLayer = input;
    return layerDefs.map((layerDef, i) => {
        const layer = exports.constructTFLayer(layerDef);
        prevLayer = layer.apply(prevLayer);
        return prevLayer;
    });
};
//# sourceMappingURL=layers.js.map