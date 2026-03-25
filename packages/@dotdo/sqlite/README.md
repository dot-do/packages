---
name: "@dotdo/sqlite"
version: 0.0.1
description: Turso WASM SQLite with Cloudflare Durable Objects VFS
license: MIT
keywords:
  - sqlite
  - wasm
  - cloudflare
  - durable-objects
  - libsql
  - turso
downloads:
  monthly: 9
published: "2026-01-22T11:02:51.851Z"
updated: "2026-01-22T11:02:52.097Z"
---

# @dotdo/sqlite

[![npm version](https://img.shields.io/npm/v/@dotdo/sqlite.svg)](https://www.npmjs.com/package/@dotdo/sqlite)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

**The Durable Object SQLite implementation that powers everything.**

You're building the infrastructure. You need SQLite that scales globally, hibernates efficiently, and streams changes in real-time.

**This is the engine.**

## The Problem

Running SQLite at the edge means solving hard problems: storage that survives restarts, replication that stays consistent, costs that don't explode. You need a battle-tested foundation, not a weekend project.

## The Solution

`@dotdo/sqlite` is the core Durable Object implementation. WASM SQLite with a custom VFS. CDC streaming. WAL archival. Hibernation support. All the infrastructure, ready to deploy.

```typescript
import { DatabaseDO, WriterDO } from '@dotdo/sqlite'

export { DatabaseDO, WriterDO }

export default {
  async fetch(request: Request, env: Env) {
    const id = env.DATABASE.idFromName('my-database')
    const db = env.DATABASE.get(id)
    return db.fetch(request)
  }
}
```

Production-grade edge SQLite. Batteries included.

## Installation

```bash
npm install @dotdo/sqlite
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      @dotdo/sqlite                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   WASM      │    │    VFS      │    │   Sync & CDC        │  │
│  │   SQLite    │───▶│   Layer     │───▶│   Engine            │  │
│  │   Engine    │    │             │    │                     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                  │                      │              │
│         v                  v                      v              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Database   │    │ DO Storage  │    │   Writer DO         │  │
│  │  DO Class   │    │ R2 / Cache  │    │   (R2 Aggregator)   │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Wrangler Configuration

```toml
# wrangler.toml
name = "my-sqlite-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [
  { name = "DATABASE", class_name = "DatabaseDO" },
  { name = "WRITER", class_name = "WriterDO" }
]

[[migrations]]
tag = "v1"
new_classes = ["DatabaseDO", "WriterDO"]

[r2_buckets]
bindings = [
  { binding = "WAL_BUCKET", bucket_name = "wal-archive" }
]
```

### Worker Entry Point

```typescript
import { DatabaseDO, WriterDO } from '@dotdo/sqlite'

export { DatabaseDO, WriterDO }

export interface Env {
  DATABASE: DurableObjectNamespace
  WRITER: DurableObjectNamespace
  WAL_BUCKET: R2Bucket
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)
    const dbName = url.pathname.split('/')[2] || 'default'

    const id = env.DATABASE.idFromName(dbName)
    const db = env.DATABASE.get(id)

    return db.fetch(request)
  }
}
```

## Core Components

### DatabaseDO

The primary Durable Object that runs SQLite:

```typescript
import { DatabaseDO, DatabaseDOConfig } from '@dotdo/sqlite'

const config: DatabaseDOConfig = {
  // Storage
  pageSize: 4096,
  cachePages: 2000,

  // Hibernation
  hibernateAfterMs: 10000,  // Hibernate after 10s idle
  onHibernate: 'checkpoint', // WAL checkpoint before sleep

  // CDC
  enableCDC: true,
  cdcBufferSize: 1000,

  // R2 archival
  walArchiveEnabled: true,
  walArchiveInterval: 60000  // Archive every minute
}

export class MyDatabaseDO extends DatabaseDO {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env, config)
  }
}
```

### VFS Layer

The Virtual File System abstracts storage across multiple backends:

```typescript
import {
  DOStorageVFS,
  R2StorageVFS,
  CacheStorageVFS,
  TieredVFS
} from '@dotdo/sqlite/vfs'

// DO Storage - authoritative, cost-optimized with 2MB BLOBs
const doVFS = new DOStorageVFS(state.storage, {
  blobSize: 2 * 1024 * 1024,  // 2MB rows
  pageSize: 4096
})

// R2 - durable WAL archive
const r2VFS = new R2StorageVFS(env.WAL_BUCKET, {
  prefix: 'wal/',
  compression: 'gzip'
})

// Cache API - read-through for hot pages
const cacheVFS = new CacheStorageVFS({
  cacheName: 'sqlite-pages',
  ttl: 3600
})

// Tiered - combines all three
const tieredVFS = new TieredVFS({
  primary: doVFS,
  archive: r2VFS,
  cache: cacheVFS
})
```

### CDC Engine

Change Data Capture for real-time replication:

```typescript
import { CDCGenerator, CDCSubscription } from '@dotdo/sqlite/sync'

// Generate CDC events from WAL
const cdc = new CDCGenerator({
  tableFilter: ['users', 'posts'],  // Only these tables
  includeOldValues: true,           // Include before/after
})

// Subscribe to changes
const subscription = new CDCSubscription({
  onInsert: (table, row) => console.log(`INSERT into ${table}`, row),
  onUpdate: (table, oldRow, newRow) => console.log(`UPDATE ${table}`, oldRow, newRow),
  onDelete: (table, row) => console.log(`DELETE from ${table}`, row),
})

cdc.subscribe(subscription)
```

### WriterDO

Aggregates WAL/CDC from multiple databases for cost-efficient R2 writes:

```typescript
import { WriterDO, WriterDOConfig } from '@dotdo/sqlite'

const config: WriterDOConfig = {
  // Batching
  flushIntervalMs: 60000,    // Flush every minute
  maxBufferSize: 10_000_000, // 10MB max buffer
  maxBufferFrames: 10000,    // 10K frames max

  // R2
  r2Bucket: 'wal-archive',
  r2Prefix: 'cdc/',
  compression: 'gzip'
}

export class MyWriterDO extends WriterDO {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env, config)
  }
}
```

## API Reference

### Database DO HTTP API

```
POST /execute
Body: { "sql": "SELECT * FROM users", "params": [1, 2, 3] }

POST /batch
Body: { "statements": [{ "sql": "...", "params": [...] }, ...] }

POST /transaction
Body: { "statements": [...], "mode": "write" }

GET /sync?from_lsn=1234
Response: WAL frames since LSN

POST /push
Body: WAL frames from replica
```

### Hrana Protocol

Full Turso sync protocol support:

```typescript
import { HranaServer } from '@dotdo/sqlite/hrana'

// The DatabaseDO includes a Hrana server
// Clients connect via:
const client = createClient({
  url: 'file:local.db',
  syncUrl: 'https://your-worker.workers.dev/db/my-database'
})
```

## Cost Optimization

### 2MB BLOB Rows

DO Storage charges per row, not per byte. Maximize value:

```typescript
// Instead of one row per page (4KB each)
// Pack ~512 pages into one 2MB BLOB
const BLOB_SIZE = 2 * 1024 * 1024  // 2MB
const PAGE_SIZE = 4096              // 4KB
const PAGES_PER_BLOB = BLOB_SIZE / PAGE_SIZE  // 512 pages

// Cost: $0.20 per million rows read/write
// Savings: 512x fewer row operations
```

### Hibernation

Durable Objects charge for wall-clock time. Hibernate aggressively:

```typescript
const config = {
  // Hibernate after 10 seconds of inactivity
  hibernateAfterMs: 10000,

  // Checkpoint WAL before hibernation
  onHibernate: 'checkpoint',

  // Accept WebSocket connections (0ms wake time)
  acceptWebSocket: true
}

// Result: 95% runtime cost reduction for typical workloads
```

### R2 Write Aggregation

Database DOs stream to a single Writer DO:

```
100 Database DOs
× 100 CDC events/day each
= 10,000 R2 writes/day (expensive)

WITH Writer DO aggregation:
= 100 batched writes/day (99% cheaper)
```

## Advanced Usage

### Custom VFS Implementation

```typescript
import { VFSInterface } from '@dotdo/sqlite/vfs'

class MyCustomVFS implements VFSInterface {
  async read(offset: number, length: number): Promise<Uint8Array> {
    // Your storage implementation
  }

  async write(offset: number, data: Uint8Array): Promise<void> {
    // Your storage implementation
  }

  async truncate(size: number): Promise<void> {
    // Your storage implementation
  }

  async sync(): Promise<void> {
    // Ensure durability
  }
}
```

### CDC Filtering

```typescript
import { CDCGenerator, CDCFilter } from '@dotdo/sqlite/sync'

const filter: CDCFilter = {
  // Only these tables
  tables: ['users', 'orders'],

  // Only these operations
  operations: ['INSERT', 'UPDATE'],

  // Custom predicate
  predicate: (event) => {
    if (event.table === 'users') {
      return event.newRow.role === 'admin'
    }
    return true
  }
}

const cdc = new CDCGenerator({ filter })
```

### WebSocket Streaming

```typescript
import { DatabaseDO } from '@dotdo/sqlite'

export class MyDatabaseDO extends DatabaseDO {
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') === 'websocket') {
      // Handle WebSocket for CDC streaming
      const pair = new WebSocketPair()
      this.acceptWebSocket(pair[1])

      return new Response(null, {
        status: 101,
        webSocket: pair[0]
      })
    }

    return super.fetch(request)
  }

  webSocketMessage(ws: WebSocket, message: string) {
    const { type, payload } = JSON.parse(message)

    if (type === 'subscribe_cdc') {
      this.subscribeToCDC(ws, payload.tables)
    }
  }
}
```

## Testing

```typescript
import { unstable_dev } from 'wrangler'
import { describe, it, expect } from 'vitest'

describe('DatabaseDO', () => {
  it('executes queries', async () => {
    const worker = await unstable_dev('src/index.ts')

    const response = await worker.fetch('/db/test/execute', {
      method: 'POST',
      body: JSON.stringify({
        sql: 'SELECT 1 + 1 as result'
      })
    })

    const result = await response.json()
    expect(result.rows[0].result).toBe(2)

    await worker.stop()
  })
})
```

## Benchmarks

The package includes a comprehensive benchmark suite to measure performance across various operations.

### Running Benchmarks

```bash
# Run all benchmarks
pnpm benchmark

# Filter by benchmark type
pnpm benchmark -- --filter=query       # Query operations (SELECT, INSERT, UPDATE, DELETE)
pnpm benchmark -- --filter=batch       # Batch execution
pnpm benchmark -- --filter=transaction # Transaction overhead
pnpm benchmark -- --filter=throughput  # Throughput metrics (queries/sec, rows/sec)
pnpm benchmark -- --filter=comparison  # WASM vs native comparison

# Save results as JSON
pnpm vitest bench --config vitest.bench.config.ts --outputJson=results.json
```

### Benchmark Suites

| Suite | Description |
|-------|-------------|
| `query-benchmarks.bench.ts` | Individual SQL operations (SELECT, INSERT, UPDATE, DELETE) |
| `batch-benchmarks.bench.ts` | Multi-statement batch execution |
| `transaction-benchmarks.bench.ts` | Transaction overhead and different modes |
| `throughput.bench.ts` | Throughput metrics with varying payload sizes |
| `comparison.bench.ts` | WASM vs native `better-sqlite3` comparison |

### Sample Output

```
 BENCH  SELECT Operations

 name                                       hz      min      max     mean      p75      p99
 SELECT single row by primary key    48,532/s   0.01ms   0.08ms   0.02ms   0.02ms   0.04ms
 SELECT all columns, all rows        11,234/s   0.06ms   0.18ms   0.09ms   0.09ms   0.16ms
 SELECT with ORDER BY                 8,901/s   0.08ms   0.22ms   0.11ms   0.12ms   0.20ms
```

### WASM Performance Characteristics

WASM SQLite is typically 2-3x slower than native implementations, which is acceptable for the portability benefits:

- **Runs anywhere:** Browsers, Workers, Node.js
- **Sandboxed execution:** No native code security concerns
- **Simple deployment:** No native dependencies
- **Cloudflare Workers:** Required for edge deployment

For detailed benchmark documentation, see [docs/benchmarks.md](../../docs/benchmarks.md).

## Links

- [GitHub Repository](https://github.com/dotdo-io/sqlite)
- [Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
- [SQLite WASM](https://sqlite.org/wasm)
- [Turso libsql](https://github.com/libsql/libsql)

## License

MIT
