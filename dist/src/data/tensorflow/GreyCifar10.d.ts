import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Data } from '../local/Data';
export declare class GreyCifar10 extends TensorflowDataset {
    static load(location?: string): Promise<GreyCifar10>;
    private static fromTensorflowDataset;
    static fromDataset(d: Data): GreyCifar10;
}
