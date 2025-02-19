# @vepler/logger

A lightweight, type-safe logging wrapper around Pino built by vepler for its ecosystem. While primarily designed for vepler's internal use, this library is open for public use.

[![npm version](https://img.shields.io/npm/v/@vepler/logger.svg)](https://www.npmjs.com/package/@vepler/logger)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔒 Type-safe logging with TypeScript support
- 🌟 Singleton pattern for consistent logging across your application
- 🔄 Global context management
- 🛡️ Automatic sensitive data redaction
- 🎯 Structured logging with JSON output
- ⚡ High-performance (powered by Pino)
- 🔍 Comprehensive error object handling
- 🌊 Async flush support for graceful shutdowns

## Installation

```bash
npm install @vepler/logger
# or
yarn add @vepler/logger
# or
pnpm add @vepler/logger
```

## Quick Start

```typescript
import PinoWrapper from '@vepler/logger';

// Initialize the logger (do this once at app startup)
PinoWrapper.initialize({
    level: 'info',
    // Optional: Add any Pino options here
});

// Set global context (e.g., in your main application setup)
PinoWrapper.setContext({
    environment: process.env.NODE_ENV,
    service: 'user-service'
});

// Basic logging
PinoWrapper.info('User logged in successfully', {
    userId: '123',
    loginMethod: 'oauth'
});

// Error logging
try {
    // Some operation that might fail
} catch (err) {
    PinoWrapper.error(err, 'Failed to process user request', {
        userId: '123',
        requestId: 'abc-xyz'
    });
}

// Before application shutdown
await PinoWrapper.flush();
```

## Features in Detail

### Initialization

The logger can be initialized with custom options:

```typescript
PinoWrapper.initialize({
    level: 'debug',
    formatters: {
        level: (label) => ({ level: label.toUpperCase() })
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: ['password', 'token', 'authorization', 'secret'],
        remove: true
    }
});
```

### Context Management

Set global context that will be included in all subsequent logs:

```typescript
// Set context
PinoWrapper.setContext({
    environment: 'production',
    service: 'auth-service',
    version: '1.0.0'
});

// Clear context when needed
PinoWrapper.clearContext();
```

### Logging Methods

Available logging methods:

```typescript
PinoWrapper.trace(message, context?);
PinoWrapper.debug(message, context?);
PinoWrapper.info(message, context?);
PinoWrapper.warn(message, context?);
PinoWrapper.error(error, message, context?);
PinoWrapper.fatal(error, message, context?);
```

### Error Handling

The logger automatically handles different types of errors:

```typescript
// Standard Error object
const error = new Error('Database connection failed');
PinoWrapper.error(error, 'Failed to connect');

// Custom error object
const customError = {
    code: 'INVALID_INPUT',
    details: { field: 'email' }
};
PinoWrapper.error(customError, 'Validation failed');

// String error
PinoWrapper.error('Something went wrong', 'Operation failed');
```

### Child Loggers

Create child loggers with additional context:

```typescript
const childLogger = PinoWrapper.child({
    component: 'auth',
    requestId: '123'
});
```

### Multiple Output Streams

Configure multiple output streams during initialization:

```typescript
PinoWrapper.initialize({
    transport: {
        targets: [
            { 
                target: 'pino/file',
                options: { 
                    destination: './logs/info.log',
                    level: 'info'
                }
            },
            {
                target: 'pino/file',
                options: {
                    destination: './logs/error.log',
                    level: 'error'
                }
            }
        ]
    }
});
```

## Best Practices

1. **Initialization**
    - Initialize the logger once at application startup
    - Configure appropriate log levels for different environments

2. **Context Management**
    - Use global context for environment-wide properties
    - Clear context when it's no longer needed
    - Don't overuse context; keep it focused on essential properties

3. **Error Logging**
    - Always include error objects in error/fatal logs
    - Add relevant context to error logs
    - Use appropriate log levels based on error severity

4. **Performance**
    - Avoid expensive operations in log context
    - Use child loggers for request-scoped logging
    - Call `flush()` before application shutdown

## Log Output Example

```json
{
    "level": "ERROR",
    "time": "2024-02-19T12:34:56.789Z",
    "environment": "production",
    "service": "user-service",
    "requestId": "abc-xyz",
    "error": {
        "type": "Error",
        "message": "Database connection failed",
        "stack": "Error: Database connection failed\n    at ...",
        "code": "ECONNREFUSED"
    },
    "msg": "Failed to process user request"
}
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

MIT © vepler

## Credits

Built with ❤️ by vepler. Powered by [Pino](https://getpino.io/).
