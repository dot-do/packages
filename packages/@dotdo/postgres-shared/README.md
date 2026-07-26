---
name: "@dotdo/postgres-shared"
version: 0.1.2
description: Shared utilities and types for dotdo postgres packages
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - postgres
  - postgresql
  - cloudflare
  - workers
  - durable-objects
  - shared
  - errors
  - logging
  - circuit-breaker
  - cache
  - validation
  - utilities
downloads:
  monthly: 67
published: "2026-01-22T15:59:10.696Z"
updated: "2026-01-24T17:13:18.158Z"
---

# @dotdo/postgres-shared

> Shared utilities and types for postgres.do packages. Zero external dependencies.

[![npm version](https://img.shields.io/npm/v/@dotdo/postgres-shared.svg)](https://www.npmjs.com/package/@dotdo/postgres-shared)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This package provides foundational utilities used across all `@dotdo/*` packages, including error handling, logging, caching, circuit breakers, and security primitives. Designed for Cloudflare Workers with zero external dependencies.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Error Handling](#error-handling)
  - [Logging](#logging)
  - [Circuit Breaker](#circuit-breaker)
  - [Cache](#cache)
  - [Validation](#validation)
  - [Security](#security)
  - [Sync Primitives](#sync-primitives)
- [Related Packages](#related-packages)

## Installation

```bash
npm install @dotdo/postgres-shared
```

## Features

| Feature | Description |
|---------|-------------|
| **Standardized Errors** | Type-safe error hierarchy with codes, retryable flags, and recovery patterns |
| **Unified Logger** | Multi-level logging with structured metadata and child loggers |
| **Circuit Breaker** | Resilience pattern for cross-DO communication with multi-instance tracking |
| **Bounded Cache** | LRU cache with TTL support and automatic cleanup |
| **Validation** | Input validation utilities with sanitization |
| **Security** | CSP middleware, secret sanitization, and crypto utilities |
| **Sync Primitives** | Mutex, semaphore, and read-write locks for concurrency control |

## Quick Start

```typescript
import {
  PostgresError,
  createLogger,
  LogLevel,
  CircuitBreaker,
  BoundedCache,
  validateInput,
} from '@dotdo/postgres-shared'

// Create a logger
const logger = createLogger({
  level: LogLevel.INFO,
  prefix: '[MyService]',
})

logger.info('Service started', { version: '1.0.0' })

// Use the cache
const cache = new BoundedCache<string>({
  maxSize: 1000,
  defaultTTL: 60000,
})

cache.set('user:123', 'cached-data')
const data = cache.get('user:123')

// Use circuit breaker for resilient DO calls
const cb = new CircuitBreaker({ failureThreshold: 5 })
const result = await cb.execute('tenant-123', async () => {
  return await doStub.fetch(request)
})
```

## API Reference

### Error Handling

Import from `@dotdo/postgres-shared` or `@dotdo/postgres-shared/errors`.

#### PostgresError

Base error class with standardized fields for programmatic handling.

```typescript
import {
  PostgresError,
  ConnectionError,
  QueryError,
  ValidationError,
  AuthError,
  wrapError,
} from '@dotdo/postgres-shared'

// Throw typed errors
throw new QueryError('Query failed', {
  code: 'QUERY_TIMEOUT',
  context: { sql: 'SELECT * FROM users', timeout: 30000 },
  retryable: true,
})

// Wrap unknown errors
try {
  await riskyOperation()
} catch (e) {
  throw wrapError(e, { context: { operation: 'riskyOperation' } })
}

// Check error properties
if (error instanceof PostgresError) {
  console.log(error.code)       // 'QUERY_TIMEOUT'
  console.log(error.retryable)  // true
  console.log(error.statusCode) // 504
  console.log(error.timestamp)  // Date
  console.log(error.context)    // { sql: '...', timeout: 30000 }
}
```

#### Error Categories

| Error Class | Use Case |
|-------------|----------|
| `QueryError` | SQL execution failures |
| `ConnectionError` | Network/connection issues |
| `ValidationError` | Invalid input data |
| `AuthError` | Authentication/authorization failures |
| `NotFoundError` | Resource not found |
| `ConflictError` | Concurrent modification conflicts |
| `RateLimitError` | Rate limiting exceeded |

### Logging

Import from `@dotdo/postgres-shared` or `@dotdo/postgres-shared/logger`.

#### Unified Logger

Consistent logging across all packages with structured metadata support.

```typescript
import { createLogger, LogLevel, type ILogger } from '@dotdo/postgres-shared'

// Basic usage
const logger = createLogger()
logger.info('Hello world')
logger.error('Something failed', { error: err.message })

// With configuration
const logger = createLogger({
  level: LogLevel.DEBUG,      // Log level threshold
  prefix: '[MyService]',      // Prefix for all messages
  timestamps: true,           // Include ISO timestamps
})

// Log with structured context
logger.info('User logged in', {
  userId: '123',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
})

// Child loggers with scoped context
const requestLogger = logger.child({ requestId: 'abc-123' })
requestLogger.info('Processing')  // Includes requestId automatically

// Set level at runtime
logger.setLevel(LogLevel.ERROR)  // Only errors from now on
```

#### Log Levels

| Level | Value | Use For |
|-------|-------|---------|
| `DEBUG` | 0 | Detailed debugging info |
| `INFO` | 1 | Normal operation info |
| `WARN` | 2 | Recoverable issues |
| `ERROR` | 3 | Errors needing attention |
| `SILENT` | 4 | Disable all logging |

### Circuit Breaker

Import from `@dotdo/postgres-shared` or `@dotdo/postgres-shared/circuit-breaker`.

#### CircuitBreaker

Prevents cascading failures in distributed systems.

```typescript
import {
  CircuitBreaker,
  CircuitOpenError,
  DOCircuitBreakerWrapper,
} from '@dotdo/postgres-shared'

// Basic usage
const cb = new CircuitBreaker({
  failureThreshold: 5,      // Open after 5 failures
  resetTimeoutMs: 30000,    // Try again after 30s
  halfOpenMaxAttempts: 3,   // Allow 3 probes in half-open
})

try {
  const result = await cb.execute('tenant-123', async () => {
    return await doStub.fetch(request)
  })
} catch (error) {
  if (error instanceof CircuitOpenError) {
    return new Response('Service temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '30' },
    })
  }
  throw error
}

// Check circuit state
const state = cb.getState('tenant-123')  // 'CLOSED' | 'OPEN' | 'HALF_OPEN'

// Wrap DO stubs for automatic protection
const wrapper = new DOCircuitBreakerWrapper({
  failureThreshold: 3,
  fallbackResponse: () => new Response('Unavailable', { status: 503 }),
})

const protectedStub = wrapper.wrap(doStub, 'tenant-123')
const response = await protectedStub.fetch(request)
```

#### UnifiedCircuitBreaker

Flexible API supporting both single and multi-instance modes.

```typescript
import { UnifiedCircuitBreaker } from '@dotdo/postgres-shared'

// Single-instance mode (simpler API)
const cb = new UnifiedCircuitBreaker({
  mode: 'single',
  failureThreshold: 5,
  resetTimeoutMs: 30000,
})

await cb.execute(async () => {
  return await fetchData()
})

// Multi-instance mode (track multiple services)
const cb = new UnifiedCircuitBreaker({
  mode: 'multi',
  failureThreshold: 5,
})

await cb.execute('service-a', async () => await serviceA.call())
await cb.execute('service-b', async () => await serviceB.call())
```

### Cache

Import from `@dotdo/postgres-shared` or `@dotdo/postgres-shared/cache`.

#### BoundedCache

LRU cache with TTL support for memory-safe caching.

```typescript
import { BoundedCache } from '@dotdo/postgres-shared'

const cache = new BoundedCache<UserSession>({
  maxSize: 1000,          // Max entries (LRU eviction)
  defaultTTL: 60000,      // 1 minute TTL
  cleanupInterval: 30000, // Cleanup every 30s
})

// Basic operations
cache.set('session:123', session)
cache.set('session:456', session, 120000)  // Custom TTL

const session = cache.get('session:123')  // null if expired
const exists = cache.has('session:123')
cache.delete('session:123')
cache.clear()

// Statistics
console.log(cache.size)  // Current entry count
```

#### InvalidTokenCache

Specialized cache for tracking invalid authentication tokens.

```typescript
import { InvalidTokenCache } from '@dotdo/postgres-shared'

const invalidTokens = new InvalidTokenCache({
  maxSize: 10000,
  ttl: 3600000,  // 1 hour
})

// Mark a token as invalid
invalidTokens.markInvalid('token-abc')

// Check if invalid
if (invalidTokens.isInvalid('token-abc')) {
  return new Response('Unauthorized', { status: 401 })
}
```

### Validation

Import from `@dotdo/postgres-shared` or `@dotdo/postgres-shared/validation`.

#### Input Validation

```typescript
import {
  validateInput,
  validateEmail,
  validateUUID,
  validateUrl,
  sanitizeInput,
} from '@dotdo/postgres-shared/validation'

// Validate with schema
const result = validateInput(data, {
  email: { type: 'email', required: true },
  age: { type: 'number', min: 0, max: 150 },
  name: { type: 'string', maxLength: 100 },
})

if (!result.valid) {
  console.log(result.errors)  // ['email: invalid format', ...]
}

// Individual validators
validateEmail('user@example.com')  // true
validateUUID('123e4567-e89b-12d3-a456-426614174000')  // true
validateUrl('https://example.com')  // true

// Sanitize input
const clean = sanitizeInput(userInput)  // HTML-escaped
```

### Security

#### CSP Middleware

Content Security Policy middleware for Hono.

```typescript
import { createCSPMiddleware } from '@dotdo/postgres-shared/csp'
import { Hono } from 'hono'

const app = new Hono()

app.use('*', createCSPMiddleware({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'", 'wss:'],
}))
```

#### Sanitization

Prevent secret leakage in logs and error messages.

```typescript
import {
  sanitizeConnectionString,
  sanitizeErrorMessage,
  sanitizeHeaders,
} from '@dotdo/postgres-shared/sanitize'

// Mask credentials in connection strings
sanitizeConnectionString('postgres://user:pass@host/db')
// => 'postgres://user:***@host/db'

// Remove sensitive data from error messages
sanitizeErrorMessage('Failed with password=secret123')
// => 'Failed with password=***'

// Clean request headers
sanitizeHeaders(request.headers)
// => Removes Authorization, Cookie, etc.
```

#### Crypto Utilities

```typescript
import {
  generateSecureToken,
  hashString,
  constantTimeCompare,
} from '@dotdo/postgres-shared/crypto'

// Generate secure random token
const token = await generateSecureToken(32)

// Hash a string (SHA-256)
const hash = await hashString('password')

// Timing-safe comparison (prevents timing attacks)
const isValid = constantTimeCompare(provided, expected)
```

### Sync Primitives

Import from `@dotdo/postgres-shared/sync-primitives`.

Concurrency control primitives for async operations.

```typescript
import {
  Mutex,
  Semaphore,
  ReadWriteLock,
} from '@dotdo/postgres-shared/sync-primitives'

// Mutex for exclusive access
const mutex = new Mutex()
await mutex.runExclusive(async () => {
  // Only one execution at a time
  await criticalSection()
})

// Semaphore for limited concurrency
const semaphore = new Semaphore(5)  // Max 5 concurrent
await semaphore.runExclusive(async () => {
  await limitedResource()
})

// Read-write lock
const rwLock = new ReadWriteLock()
await rwLock.runWithReadLock(async () => {
  // Multiple readers allowed
  return await readData()
})
await rwLock.runWithWriteLock(async () => {
  // Exclusive writer access
  await writeData()
})
```

### Event Emitter

Serverless-safe event emitter that avoids mutable module state.

```typescript
import { EventEmitterSafe } from '@dotdo/postgres-shared/event-emitter-safe'

const emitter = new EventEmitterSafe<{
  'user:created': { id: string; email: string }
  'user:deleted': { id: string }
}>()

// Subscribe to events
const unsubscribe = emitter.on('user:created', (data) => {
  console.log('User created:', data.email)
})

// Emit events
emitter.emit('user:created', { id: '123', email: 'user@example.com' })

// Unsubscribe
unsubscribe()
```

### Storage Policy

Tiered storage policy configuration for data movement between HOT/WARM/COLD tiers.

```typescript
import {
  createTierPolicy,
  StorageTier,
} from '@dotdo/postgres-shared/storage-policy'

const policy = createTierPolicy({
  ttl: {
    hotTTLMs: 60000,      // 1 minute in HOT
    warmTTLMs: 300000,    // 5 minutes in WARM
    coldTTLMs: 86400000,  // 1 day before archive
  },
  promotion: {
    coldToWarmAccessCount: 3,
    warmToHotAccessCount: 10,
  },
})

// Determine recommended tier
const tier = policy.recommendTier({
  accessCount: 15,
  lastAccessMs: Date.now() - 30000,
})  // StorageTier.HOT
```

### Access Pattern Tracker

Track data access patterns for tiered storage decisions.

```typescript
import { AccessPatternTracker } from '@dotdo/postgres-shared/access-pattern-tracker'

const tracker = new AccessPatternTracker({
  windowMs: 60000,  // 1 minute window
  maxEntries: 10000,
})

// Record access
tracker.recordAccess('page:123')
tracker.recordAccess('page:123')
tracker.recordAccess('page:123')

// Get access stats
const stats = tracker.getStats('page:123')
console.log(stats.accessCount)    // 3
console.log(stats.accessRate)     // accesses per minute
console.log(stats.isHot)          // true if frequently accessed
```

## Related Packages

- [`@dotdo/postgres`](../postgres) - PostgreSQL Durable Object server
- [`postgres.do`](../postgres.do) - SQL client and CLI
- [`@dotdo/pglite`](../pglite) - PGLite fork for Cloudflare Workers

## License

MIT
