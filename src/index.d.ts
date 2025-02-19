import { Logger, LoggerOptions, Bindings } from 'pino';

/**
 * Interface for structured log context
 */
export interface LogContext {
  [key: string]: unknown;
}

declare class PinoWrapper {
  private static instance: PinoWrapper;
  private logger: Logger;
  private context: LogContext;

  private constructor(logger: Logger);

  /**
   * Initialize the logger with optional configuration
   * @param options Pino logger options
   */
  public static initialize(options?: LoggerOptions): void;

  private static ensureInitialized(): void;

  /**
   * Set global context that will be included in all subsequent logs
   * @param context The context object to set
   */
  public static setContext(context: LogContext): void;

  /**
   * Clear all global context
   */
  public static clearContext(): void;

  private static mergeContext(additionalContext?: LogContext): LogContext;

  private static formatError(error: Error): Record<string, unknown>;

  /**
   * Log an info message
   * @param message The message to log
   * @param context Optional context to include with the log
   */
  public static info(message: string, context?: LogContext): void;

  /**
   * Log an error with additional context
   * @param err The error object or any value that can be converted to an error
   * @param message The error message
   * @param context Optional context to include with the log
   */
  public static error(err: unknown, message: string, context?: LogContext): void;

  /**
   * Log a debug message
   * @param message The message to log
   * @param context Optional context to include with the log
   */
  public static debug(message: string, context?: LogContext): void;

  /**
   * Log a warning message
   * @param message The message to log
   * @param context Optional context to include with the log
   */
  public static warn(message: string, context?: LogContext): void;

  /**
   * Log a fatal error with additional context
   * @param err The error object or any value that can be converted to an error
   * @param message The error message
   * @param context Optional context to include with the log
   */
  public static fatal(err: unknown, message: string, context?: LogContext): void;

  /**
   * Log a trace message
   * @param message The message to log
   * @param context Optional context to include with the log
   */
  public static trace(message: string, context?: LogContext): void;

  /**
   * Create a child logger with bound context
   * @param bindings The context to bind to the child logger
   * @returns A new PinoWrapper instance with the bound context
   */
  public static child(bindings: Bindings): PinoWrapper;

  /**
   * Get the underlying Pino logger instance
   * @returns The raw Pino logger
   */
  public static getRawLogger(): Logger;

  /**
   * Flush all buffered logs
   * @returns A promise that resolves when all logs have been flushed
   */
  public static flush(): Promise<void>;
}

export default PinoWrapper;
