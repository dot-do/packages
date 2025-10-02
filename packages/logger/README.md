# @dot-do/logger

Lightweight logging utility with structured logging support.

## Installation

```bash
npm install @dot-do/logger
# or
pnpm add @dot-do/logger
# or
yarn add @dot-do/logger
```

## Usage

### Basic Usage

```typescript
import { logger } from '@dot-do/logger'

logger.info('Server started', { port: 3000 })
logger.warn('Memory usage high', { usage: '85%' })
logger.error('Database connection failed', { host: 'localhost', error: err.message })
```

### Create Custom Logger

```typescript
import { createLogger } from '@dot-do/logger'

const log = createLogger({
  level: 'debug', // Minimum log level: 'debug' | 'info' | 'warn' | 'error'
  context: {
    // Base context included in all logs
    service: 'api',
    environment: 'production',
  },
})

log.debug('Processing request', { userId: '123' })
// Output: [2025-01-15T10:30:00.000Z] [DEBUG] Processing request {"service":"api","environment":"production","userId":"123"}
```

### Custom Formatter

```typescript
import { createLogger } from '@dot-do/logger'

const log = createLogger({
  formatter: (level, message, context) => {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...context,
    })
  },
})

log.info('User logged in', { userId: '123' })
// Output: {"timestamp":"2025-01-15T10:30:00.000Z","level":"INFO","message":"User logged in","userId":"123"}
```

## API

### `createLogger(options?)`

Creates a new logger instance.

**Options:**

- `level?: 'debug' | 'info' | 'warn' | 'error'` - Minimum log level (default: `'info'`)
- `context?: Record<string, unknown>` - Base context included in all logs
- `formatter?: (level, message, context?) => string` - Custom log formatter

**Returns:** `Logger` instance with methods: `debug()`, `info()`, `warn()`, `error()`

### `logger`

Default logger instance with `level: 'info'` and no base context.

## Log Levels

Logs are filtered based on the configured level:

- `debug` - All logs
- `info` - Info, warn, and error
- `warn` - Warn and error
- `error` - Only errors

## License

MIT
