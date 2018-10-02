import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Data } from '../local/Data';
export declare class Mnist extends TensorflowDataset {
    static load(location?: string): Promise<Mnist>;
    private static fromTensorflowDataset;
    static fromDataset(d: Data): Mnist;
}
