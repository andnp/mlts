import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Data } from '../local/Data';
export declare class Deterding extends TensorflowDataset {
    static load(location?: string): Promise<Deterding>;
    private static fromTensorflowDataset;
    static fromDataset(d: Data): Deterding;
}
