"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v = require("validtyped");
exports.DatasetDescriptionSchema = v.object({
    features: v.number(),
});
exports.SupervisedDatasetDescriptionSchema = v.object({
    classes: v.number(),
}).and(exports.DatasetDescriptionSchema);
exports.MatrixFactorizationDatasetDescriptionSchema = v.object({
    samples: v.number(),
}).and(exports.DatasetDescriptionSchema);
exports.SupervisedDictionaryLearningDatasetDescriptionSchema = exports.SupervisedDatasetDescriptionSchema.and(exports.MatrixFactorizationDatasetDescriptionSchema);
//# sourceMappingURL=DatasetDescription.js.map