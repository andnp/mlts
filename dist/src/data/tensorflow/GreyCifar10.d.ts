import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Dataset } from 'mlts-experiment-data';
export declare class GreyCifar10 extends TensorflowDataset {
    static load(location?: string): Promise<GreyCifar10>;
    private static fromTensorflowDataset;
    static fromDataset(d: Dataset): GreyCifar10;
}
