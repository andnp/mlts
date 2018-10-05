import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Data } from '../local/Data';
export declare class FashionMnist extends TensorflowDataset {
    static load(location?: string): Promise<FashionMnist>;
    private static fromTensorflowDataset;
    static fromDataset(d: Data): FashionMnist;
}
