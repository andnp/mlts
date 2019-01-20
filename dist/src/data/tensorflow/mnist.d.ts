import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Dataset } from 'mlts-experiment-data';
export declare class Mnist extends TensorflowDataset {
    static load(location?: string): Promise<Mnist>;
    private static fromTensorflowDataset;
    static fromDataset(d: Dataset): Mnist;
}
