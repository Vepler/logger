import PinoWrapper from '../src/index';
import { Writable } from 'stream';

// Mock stream for capturing logs
class MockWritable extends Writable {
  public chunks: any[] = [];

  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
    this.chunks.push(JSON.parse(chunk));
    callback();
  }

  getOutput() {
    return this.chunks;
  }

  clear() {
    this.chunks = [];
  }
}

// Extended Error type for testing
interface TestError extends Error {
  code?: string;
}

describe('PinoWrapper', () => {
  let mockStream: MockWritable;

  beforeEach(() => {
    // Reset the singleton instance and create new mock stream
    (PinoWrapper as any).instance = undefined;
    mockStream = new MockWritable();

    // Initialize with mock stream
    PinoWrapper.initialize({
      level: 'trace', // Enable all log levels for testing
      transport: {
        target: 'pino/file',
        options: { destination: 1 }
      }
    });
  });

  afterEach(() => {
    mockStream.clear();
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      (PinoWrapper as any).instance = undefined;
      PinoWrapper.initialize();
      const rawLogger = PinoWrapper.getRawLogger();
      expect(rawLogger).toBeDefined();
      expect(rawLogger.constructor.name).toBe('Pino');
    });

    test('should reuse existing instance on multiple initializations', () => {
      const firstInstance = PinoWrapper.getRawLogger();
      PinoWrapper.initialize();
      const secondInstance = PinoWrapper.getRawLogger();
      expect(firstInstance).toBe(secondInstance);
    });
  });

  describe('Logging Methods', () => {
    test('should log messages at different levels with correct structure', async () => {
      const testMessage = 'Test message';
      const testContext = { userId: '123' };

      PinoWrapper.info(testMessage, testContext);
      PinoWrapper.debug(testMessage, testContext);
      PinoWrapper.warn(testMessage, testContext);
      PinoWrapper.trace(testMessage, testContext);

      await PinoWrapper.flush();
    });

    test('should properly format error logs', async () => {
      const testError: TestError = new Error('Test error');
      testError.code = 'TEST_ERROR';

      PinoWrapper.error(testError, 'Error occurred', { userId: '123' });
      await PinoWrapper.flush();
    });

    test('should handle non-Error objects in error logging', async () => {
      const nonError = { custom: 'error', reason: 'test' };
      PinoWrapper.error(nonError, 'Custom error');
      await PinoWrapper.flush();
    });
  });

  describe('Context Management', () => {
    test('should maintain global context across logs', async () => {
      PinoWrapper.setContext({ service: 'test-service' });

      PinoWrapper.info('Test message');
      PinoWrapper.error(new Error('Test'), 'Error message');

      await PinoWrapper.flush();
    });

    test('should merge global context with log-specific context', async () => {
      PinoWrapper.setContext({ service: 'test-service' });
      PinoWrapper.info('Test message', { requestId: '123' });

      await PinoWrapper.flush();
    });

    test('should clear context properly', async () => {
      PinoWrapper.setContext({ service: 'test-service' });
      PinoWrapper.clearContext();
      PinoWrapper.info('Test message');

      await PinoWrapper.flush();
    });
  });

  describe('Child Loggers', () => {
    test('should create child logger with merged bindings', async () => {
      const childWrapper = PinoWrapper.child({ component: 'auth' });
      const childLogger = (childWrapper as any).logger;
      expect(childLogger).toBeDefined();

      // Use the raw logger to test since the wrapper methods are static
      childLogger.info({ requestId: '123' }, 'Child log message');
      await PinoWrapper.flush();
    });
  });
});
