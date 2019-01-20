import { TensorflowDataset } from '../tensorflow/TensorflowDataset';
import { Deterding as DeterdingLocal, Dataset } from "mlts-experiment-data";

export class Deterding extends TensorflowDataset {
    static async load(location?: string) {
        const d = await DeterdingLocal.load(location);
        return Deterding.fromDataset(d);
    }

    private static fromTensorflowDataset(d: TensorflowDataset) {
        return new Deterding(d.train[0], d.train[1], d.test[0], d.test[1]);
    }

    static fromDataset(d: Dataset) {
        return Deterding.fromTensorflowDataset(super.fromDataset(d));
    }
}
