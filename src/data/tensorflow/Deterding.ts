import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import * as deterding from '../local/deterding';
import { Data } from '../local/Data';

export class Deterding extends TensorflowDataset {
    static async load(location?: string) {
        const d = await deterding.load(location);
        return Deterding.fromDataset(d);
    }

    private static fromTensorflowDataset(d: TensorflowDataset) {
        return new Deterding(d.train[0], d.train[1], d.test[0], d.test[1]);
    }

    static fromDataset(d: Data) {
        return Deterding.fromTensorflowDataset(super.fromDataset(d));
    }
}
