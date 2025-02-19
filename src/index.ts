import type { Logger, LoggerOptions, Bindings} from 'pino';
import pino from 'pino';

// Type for structured log context
interface LogContext {
  [key: string]: unknown;
}

// Helper function to ensure unknown error is converted to Error object
function ensureError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }

  if (typeof err === 'string') {
    return new Error(err);
  }

  if (err && typeof err === 'object') {
    // Handle objects with message property
    if ('message' in err && typeof err.message === 'string') {
      const error = new Error(err.message);
      Object.assign(error, err);
      return error;
    }

    // Handle other objects
    return new Error(JSON.stringify(err));
  }

  return new Error(String(err));
}

// Default logger options
const DEFAULT_OPTIONS: LoggerOptions = {
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'token', 'authorization', 'secret'],
    remove: true
  }
};

class PinoWrapper {
  private static instance: PinoWrapper;
  private logger: Logger;
  private context: LogContext = {};

  private constructor(logger: Logger) {
    this.logger = logger;
  }

  public static initialize(options?: LoggerOptions): void {
    if (!PinoWrapper.instance) {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const logger = pino(mergedOptions);
      PinoWrapper.instance = new PinoWrapper(logger);
    }
  }

  private static ensureInitialized(): void {
    if (!PinoWrapper.instance) {
      PinoWrapper.initialize();
    }
  }

  // Method to add context that will be included in all subsequent logs
  public static setContext(context: LogContext): void {
    PinoWrapper.ensureInitialized();
    PinoWrapper.instance.context = { ...PinoWrapper.instance.context, ...context };
  }

  // Method to clear all context
  public static clearContext(): void {
    PinoWrapper.ensureInitialized();
    PinoWrapper.instance.context = {};
  }

  // Helper to merge context with additional fields
  private static mergeContext(additionalContext?: LogContext): LogContext {
    return { ...PinoWrapper.instance.context, ...additionalContext };
  }

  public static info(message: string, context?: LogContext): void {
    PinoWrapper.ensureInitialized();
    const mergedContext = PinoWrapper.mergeContext(context);
    PinoWrapper.instance.logger.info(mergedContext, message);
  }

  private static formatError(error: Error): Record<string, unknown> {
    // Extract all enumerable properties from the error
    const errorProperties = Object.getOwnPropertyNames(error).reduce((acc, key) => {
      if (key !== 'message' && key !== 'stack' && key !== 'name') {
        acc[key] = (error as never)[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    return {
      type: error.name,
      message: error.message,
      stack: error.stack,
      ...errorProperties
    };
  }

  public static error(err: unknown, message: string, context?: LogContext): void {
    PinoWrapper.ensureInitialized();
    const error = ensureError(err);
    const mergedContext = PinoWrapper.mergeContext({
      ...context,
      error: this.formatError(error)
    });
    PinoWrapper.instance.logger.error(mergedContext, message);
  }

  public static debug(message: string, context?: LogContext): void {
    PinoWrapper.ensureInitialized();
    const mergedContext = PinoWrapper.mergeContext(context);
    PinoWrapper.instance.logger.debug(mergedContext, message);
  }

  public static warn(message: string, context?: LogContext): void {
    PinoWrapper.ensureInitialized();
    const mergedContext = PinoWrapper.mergeContext(context);
    PinoWrapper.instance.logger.warn(mergedContext, message);
  }

  public static fatal(err: unknown, message: string, context?: LogContext): void {
    PinoWrapper.ensureInitialized();
    const error = ensureError(err);
    const mergedContext = PinoWrapper.mergeContext({
      ...context,
      error: this.formatError(error)
    });
    PinoWrapper.instance.logger.fatal(mergedContext, message);
  }

  public static trace(message: string, context?: LogContext): void {
    PinoWrapper.ensureInitialized();
    const mergedContext = PinoWrapper.mergeContext(context);
    PinoWrapper.instance.logger.trace(mergedContext, message);
  }

  public static child(bindings: Bindings): PinoWrapper {
    PinoWrapper.ensureInitialized();
    const childLogger = PinoWrapper.instance.logger.child(bindings);
    return new PinoWrapper(childLogger);
  }

  public static getRawLogger(): Logger {
    PinoWrapper.ensureInitialized();
    return PinoWrapper.instance.logger;
  }

  public static flush(): Promise<void> {
    PinoWrapper.ensureInitialized();
    return new Promise((resolve) => {
      PinoWrapper.instance.logger.flush(() => {
        resolve();
      });
    });
  }
}

export default PinoWrapper;
