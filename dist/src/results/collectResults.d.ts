import { Observable } from 'utilities-ts';
import { OptimizationParameters } from '../optimization';
export declare type Result = {
    metaParameters: any;
    algorithm: string;
    dataset: string;
    path: string;
    hashPath: string;
    optimization: Partial<OptimizationParameters>;
} & Record<string, any>;
export declare function collectResults(rootPath: string, resultFileNames: string[]): Observable<Result>;
