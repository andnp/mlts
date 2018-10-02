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
export interface SupervisedDictionaryLearningDatasetDescription extends SupervisedDatasetDescription, MatrixFactorizationDatasetDescription {
}
export declare const DatasetDescriptionSchema: v.Validator<v.ObjectValidator<{
    features: v.Validator<number>;
}>>;
export declare const SupervisedDatasetDescriptionSchema: v.Validator<v.ObjectValidator<{
    classes: v.Validator<number>;
}> & v.ObjectValidator<{
    features: v.Validator<number>;
}>>;
export declare const MatrixFactorizationDatasetDescriptionSchema: v.Validator<v.ObjectValidator<{
    samples: v.Validator<number>;
}> & v.ObjectValidator<{
    features: v.Validator<number>;
}>>;
export declare const SupervisedDictionaryLearningDatasetDescriptionSchema: v.Validator<v.ObjectValidator<{
    classes: v.Validator<number>;
}> & v.ObjectValidator<{
    features: v.Validator<number>;
}> & v.ObjectValidator<{
    samples: v.Validator<number>;
}>>;
