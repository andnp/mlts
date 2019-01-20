import { Dataset } from 'mlts-experiment-data';
import * as tf from '@tensorflow/tfjs';
import { Transformation } from '../../transformations/Transformation';
export declare class TensorflowDataset {
    protected _x: tf.Tensor2D;
    protected _y: tf.Tensor2D;
    protected _t: tf.Tensor2D;
    protected _ty: tf.Tensor2D;
    private limitedSamples;
    private shouldStratify;
    constructor(_x: tf.Tensor2D, _y: tf.Tensor2D, _t: tf.Tensor2D, _ty: tf.Tensor2D);
    transpose: () => this;
    oneHot: (depth: number) => this;
    scaleColumns: () => this;
    scaleByConstant: (constant: number) => this;
    applyTransformation(transform: Transformation): Promise<this>;
    limitSamples(samples: number): this;
    stratify(): this;
    shuffle(): void;
    crossValidate(folds: number, index: number): TensorflowDataset;
    readonly train: [tf.Tensor<tf.Rank.R2>, tf.Tensor<tf.Rank.R2>];
    readonly test: [tf.Tensor<tf.Rank.R2>, tf.Tensor<tf.Rank.R2>];
    readonly features: number;
    readonly samples: number;
    readonly classes: number;
    readonly testSamples: number;
    description(): {
        samples: number;
        features: number;
        classes: number;
        testSamples: number;
    };
    static fromDataset(dataset: Dataset): TensorflowDataset;
    static load(): Promise<TensorflowDataset>;
    private roundRobin;
}
