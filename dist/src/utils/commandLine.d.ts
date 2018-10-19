export declare type ArgumentRecord = Record<string, string | undefined>;
/**
 * Get a record of command line arguments passed to this process
 * For instance: `"-d 1 --retry -e path/to/exp.json"` will become
 * `{ d: 1, retry: "true", e: "path/to/exp.json" }`
 */
export declare function parseArgs(): Record<string, string | undefined>;
