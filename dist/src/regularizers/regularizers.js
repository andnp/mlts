"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tf = require("@tensorflow/tfjs");
const v = require("validtyped");
// ---------------------
// L1 Regularizer
// ---------------------
exports.l1ParametersSchema = v.object({
    type: v.string(['l1']),
    weight: v.number(),
});
exports.l1 = (x) => x.norm(1);
// ---------------------
// L2 Regularizer
// ---------------------
exports.l2ParametersSchema = v.object({
    type: v.string(['l2']),
    weight: v.number(),
});
exports.l2 = (x) => x.norm(2);
// ---------------------
// Generic Regularizer
// ---------------------
exports.RegularizerParametersSchema = exports.l1ParametersSchema.or(exports.l2ParametersSchema);
exports.regularize = (params, x) => {
    switch (params.type) {
        case 'l1': return tf.mul(exports.l1(x), params.weight);
        case 'l2': return tf.mul(exports.l2(x), params.weight);
        default: throw new Error(`I don't know this regularizer yet..`);
    }
};
exports.regularizeLayer = (params) => {
    switch (params.type) {
        case 'l1': return tf.regularizers.l1({ l1: params.weight });
        case 'l2': return tf.regularizers.l2({ l2: params.weight });
        default: throw new Error(`I don't know this regularizer yet..`);
    }
};
//# sourceMappingURL=regularizers.js.map