import { BufferType } from 'utilities-ts/src/buffers';
declare type BufferTypeString = 'float32' | 'int32' | 'uint8';
export declare function saveBits(data: BufferType, shape: number[], file: string): Promise<void>;
interface IdxTensor {
    data: BufferType;
    shape: number[];
    type: BufferTypeString;
}
export declare function loadBits(file: string): Promise<IdxTensor>;
export {};
