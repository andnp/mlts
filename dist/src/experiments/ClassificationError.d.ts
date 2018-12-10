import { RawObservable } from "utilities-ts";
import { Experiment, ExperimentResultMessage } from "./Experiment";
export declare class ClassificationErrorExperiment extends Experiment {
    _run(obs: RawObservable<ExperimentResultMessage>): Promise<void>;
}
