import * as tf from '@tensorflow/tfjs';
import { Dataset, Data } from '../local/Data';
import { Transformation } from '../../transformations/Transformation';
export declare class TensorflowDataset implements Dataset<tf.Tensor2D> {
    protected _x: tf.Tensor2D;
    protected _y: tf.Tensor2D;
    protected _t: tf.Tensor2D;
    protected _ty: tf.Tensor2D;
    private limitedSamples;
    constructor(_x: tf.Tensor2D, _y: tf.Tensor2D, _t: tf.Tensor2D, _ty: tf.Tensor2D);
    transpose: () => this;
    oneHot: (depth: number) => this;
    scaleColumns: () => this;
    scaleByConstant: (constant: number) => this;
    applyTransformation(transform: Transformation): Promise<this>;
    limitSamples(samples: number): this;
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
    static fromDataset(dataset: Data): TensorflowDataset;
    static load(): Promise<TensorflowDataset>;
}
