import * as v from 'validtyped';

export interface DatasetDescription {
    features: number;
}

export interface SupervisedDatasetDescription extends DatasetDescription {
    classes: number;
}

export interface MatrixFactorizationDatasetDescription extends DatasetDescription {
    samples: number;
}

export interface SupervisedDictionaryLearningDatasetDescription extends SupervisedDatasetDescription, MatrixFactorizationDatasetDescription { /* stub */ }

export const DatasetDescriptionSchema = v.object({
    features: v.number(),
});

export const SupervisedDatasetDescriptionSchema = v.object({
    classes: v.number(),
}).and(DatasetDescriptionSchema);

export const MatrixFactorizationDatasetDescriptionSchema = v.object({
    samples: v.number(),
}).and(DatasetDescriptionSchema);

export const SupervisedDictionaryLearningDatasetDescriptionSchema = SupervisedDatasetDescriptionSchema.and(MatrixFactorizationDatasetDescriptionSchema);
