import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Dataset } from "mlts-experiment-data";
export declare class Deterding extends TensorflowDataset {
    static load(location?: string): Promise<Deterding>;
    private static fromTensorflowDataset;
    static fromDataset(d: Dataset): Deterding;
}
