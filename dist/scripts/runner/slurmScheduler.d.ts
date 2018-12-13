export declare const gigs: (m: number) => string;
export declare const hours: (h: number) => string;
export interface ScheduleParams {
    cpus: number;
    tasksPerCPU: number;
    time: string;
    gccVersion: string;
    nodes?: number;
    cpusPerTask?: number;
    memoryPerCPU?: string;
}
export declare const schedule: (o: ScheduleParams) => Promise<void>;
