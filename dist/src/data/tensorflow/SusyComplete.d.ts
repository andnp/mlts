import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Data } from '../local/Data';
export declare class SusyComplete extends TensorflowDataset {
    static load(location?: string): Promise<SusyComplete>;
    private static fromTensorflowDataset;
    static fromDataset(d: Data): SusyComplete;
}
