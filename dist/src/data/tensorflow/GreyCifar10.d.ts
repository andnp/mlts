import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Dataset } from 'mlts-experiment-data';
export declare class GreyCifar10 extends TensorflowDataset {
    static load(location?: string): Promise<TensorflowDataset>;
    private static fromTensorflowDataset;
    static fromDataset(d: Dataset): TensorflowDataset;
}
