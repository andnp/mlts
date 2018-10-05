import { OptimizationParameters } from '../optimization';
export declare type Result = {
    metaParameters: any;
    algorithm: string;
    dataset: string;
    optimization: Partial<OptimizationParameters>;
} & Record<string, any>;
export declare function collectResults(rootPath: string, resultFileNames: string[]): Promise<Result[]>;
