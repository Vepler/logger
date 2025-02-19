import { Logger, LoggerOptions, StreamEntry, Bindings, MultiStreamOptions, MultiStreamRes } from 'pino';

declare class PinoWrapper {
    private static instance: PinoWrapper;
    private logger: Logger;

    private constructor(logger: Logger);

    public static initialize(options?: LoggerOptions): void;

    private static ensureInitialized(): void;

    public static info(message: string, ...args: any[]): void;
    public static error(err: Error, message: string, ...args: any[]): void;
    public static debug(message: string, ...args: any[]): void;
    public static warn(message: string, ...args: any[]): void;
    public static fatal(err: Error, message: string, ...args: any[]): void;
    public static trace(message: string, ...args: any[]): void;
    public static silent(message: string, ...args: any[]): void;

    public static child(bindings: Bindings): PinoWrapper;

    public static getRawLogger(): Logger;

    public static multistream(streams: StreamEntry[], options?: MultiStreamOptions): MultiStreamRes;
}

export default PinoWrapper;
