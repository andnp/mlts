import { Printable } from './printer';
export declare type PrintMessage = {
    type: 'flush';
} | {
    type: 'print';
    data: Printable;
};
