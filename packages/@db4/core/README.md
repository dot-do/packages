---
name: "@db4/core"
version: 0.1.2
description: Core types, interfaces, and utilities for db4 document database
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - document-database
  - cloudflare
  - workers
  - durable-objects
downloads:
  monthly: 79
published: "2026-01-20T11:28:21.854Z"
updated: "2026-01-23T17:20:12.041Z"
---

# @db4/core

([GitHub](https://github.com/dot-do/db4/tree/main/packages/core), [npm](https://www.npmjs.com/package/@db4/core))

**Type-safe primitives for edge databases.**

---

Your edge database has no safety net. One malformed document corrupts production. One swapped ID cascades into data loss. Runtime type errors surface at 3am, not compile time.

`@db4/core` is the type foundation for db4. Every document, query, transaction, and CDC event flows through these primitives—catching bugs before deployment.

## Installation

```bash
npm install @db4/core
```

## Quick Start

### 1. Define Documents

```typescript
import { type Document, type StoredDocument } from '@db4/core'

interface User extends Document {
  id: string
  email: string
  name: string
  createdAt: number
}

// Stored documents get metadata automatically
type StoredUser = StoredDocument & User
```

### 2. Prevent ID Swaps with Branded Types

```typescript
import {
  type DocumentId,
  type CollectionName,
  createDocumentId,
  createCollectionName
} from '@db4/core'

function getUser(collection: CollectionName, id: DocumentId) { /* ... */ }

const userId = createDocumentId('user_123')
const collection = createCollectionName('users')

getUser(collection, userId) // Compiles
getUser(userId, collection) // TypeScript error—caught at build
```

### 3. Handle Errors Explicitly

```typescript
import { ok, err, isOk, type Result } from '@db4/core'

function parseUser(data: unknown): Result<User, Error> {
  if (!data || typeof data !== 'object') {
    return err(new Error('Invalid user data'))
  }
  return ok(data as User)
}

const result = parseUser(rawData)
if (isOk(result)) {
  console.log(result.data.email) // Type-safe
}
```

## Capabilities

### Branded Types

Eliminate ID-swap bugs. TypeScript treats these as distinct types:

```typescript
import {
  type DocumentId, type BatchId, type ShardId,
  type Timestamp, type Version,
  createDocumentId, createTimestamp
} from '@db4/core'

const docId: DocumentId = createDocumentId('doc_abc123')
const timestamp: Timestamp = createTimestamp(Date.now())
```

### Structured Errors

Categorized errors with retry guidance:

```typescript
import {
  DocumentNotFoundError,
  isRetryableError,
  withRetry
} from '@db4/core'

try {
  await db.get('users', 'nonexistent')
} catch (error) {
  if (error instanceof DocumentNotFoundError) {
    console.log(`${error.documentId} not found in ${error.collection}`)
  }
  if (isRetryableError(error)) {
    await withRetry(() => db.get('users', 'id'), { maxRetries: 3 })
  }
}
```

### Engine Interfaces

Build custom storage backends with standardized contracts:

```typescript
import type { StorageEngine, QueryEngine } from '@db4/core'

class MyStorageEngine implements StorageEngine {
  async get(collection: string, documentId: string) { /* ... */ }
  async insert(collection: string, document: Document) { /* ... */ }
}

class MyQueryEngine implements QueryEngine {
  async query<T>(collection: string, options: QueryOptions) { /* ... */ }
  explain(collection: string, options: QueryOptions) { /* ... */ }
}
```

### Cursor Pagination

Relay-style pagination built in:

```typescript
import { CursorPagination } from '@db4/core'

const pagination = new CursorPagination()

const firstPage = pagination.paginate(documents, {
  first: 10,
  sortFields: ['createdAt'],
  sortDirections: ['desc'],
})

const nextPage = pagination.paginate(documents, {
  first: 10,
  after: firstPage.pageInfo.endCursor,
  sortFields: ['createdAt'],
  sortDirections: ['desc'],
})
```

### Change Data Capture

Track every mutation for sync and analytics:

```typescript
import { createCDCCursor, filterCDCEntries } from '@db4/core'

const cursor = createCDCCursor('shard-1', 0)

const userChanges = filterCDCEntries(entries, {
  collections: ['users'],
  operations: ['INSERT', 'UPDATE'],
})
```

### Observability

Structured logging with auto-redaction and OpenTelemetry:

```typescript
import { createLogger, instrumentQuery } from '@db4/core'

const logger = createLogger({
  level: 'info',
  redaction: { enabled: true, useDefaults: true }
})

logger.info('User created', { userId: 'abc', email: 'user@example.com' })

const result = await instrumentQuery(
  async () => db.query('users', { limit: 10 }),
  { collection: 'users', operation: 'query' }
)
```

## With @db4/core

- Type errors caught at build time—not 3am
- Consistent types across every db4 package
- Automatic retry for transient failures
- Full visibility into every operation
- Relay pagination that just works

## Without It

- Malformed documents corrupt production silently
- Each package invents incompatible types
- Ad-hoc error handling, inconsistent retry logic
- Blind database operations
- Custom pagination in every project

## API Reference

### Types

| Type | Description |
|------|-------------|
| `Document` | Base document interface with required `id` field |
| `StoredDocument` | Document with `_meta` (version, timestamps) |
| `DocumentMeta` | Metadata type with `version`, `createdAt`, `updatedAt` |
| `DocumentId`, `BatchId`, `ShardId`, `CollectionName` | Branded string types |
| `Timestamp`, `Version` | Branded number types |
| `QueryOptions`, `QueryResult` | Query configuration and results |
| `CDCLogEntry`, `CDCBatch`, `CDCCursor` | Change data capture types |
| `Result<T, E>` | Generic result type for error handling |

### Error Classes

| Class | Error Code | When It's Thrown |
|-------|------------|------------------|
| `DocumentNotFoundError` | `DOCUMENT_NOT_FOUND` | Document doesn't exist |
| `DocumentTooLargeError` | `DOCUMENT_TOO_LARGE` | Exceeds 100KB limit |
| `MemoryLimitExceededError` | `MEMORY_LIMIT_EXCEEDED` | Query result exceeds memory limit |
| `ConflictError` | `TRANSACTION_CONFLICT` | Concurrent modification |
| `ValidationError` | `VALIDATION_ERROR` | Invalid input data |
| `QueryTimeoutError` | `QUERY_TIMEOUT` | Query exceeded time limit |
| `TransactionTimeoutError` | `TRANSACTION_TIMEOUT` | Transaction exceeded time limit |
| `BatchError` | `BATCH_OPERATION_ERROR` | Batch operation failures |

### Engine Interfaces

| Interface | Purpose |
|-----------|---------|
| `StorageEngine` | Low-level document storage (CRUD, batch ops) |
| `QueryEngine` | Query execution and optimization |
| `TransactionManager` | Transaction lifecycle and conflict detection |
| `CDCEngine` | Change data capture and streaming |
| `IndexManager` | Index creation and management |

### Constants

```typescript
import {
  MAX_DOCUMENT_SIZE,    // 100KB
  MAX_BATCH_SIZE,       // 900KB
  MAX_RESULT_SIZE,      // 10MB
  DEFAULT_QUERY_LIMIT,  // 100
  MAX_QUERY_LIMIT,      // 10,000
} from '@db4/core'
```

### Utilities

```typescript
import {
  generateId,           // Time-sortable unique IDs
  generateUUID,         // UUID v4
  jsonSize,             // Calculate JSON byte size
  deepClone,            // Clone objects safely
  chunk,                // Split arrays into batches
  groupBy,              // Group array by key function
} from '@db4/core'
```

## db4 Ecosystem

`@db4/core` powers:

- `@db4/schema` - IceType schema compiler
- `@db4/do` - Durable Object implementation
- `@db4/query` - TypeScript query engine
- `@db4/storage` - Three-tier storage
- `@db4/iceberg` - CDC to Apache Iceberg

## License

MIT
