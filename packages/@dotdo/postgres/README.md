---
name: "@dotdo/postgres"
version: 0.1.3
description: PostgreSQL server for Cloudflare Workers/DOs with PGLite WASM and tiered storage
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - postgres
  - postgresql
  - pglite
  - wasm
  - cloudflare
  - workers
  - durable-objects
  - serverless
  - iceberg
  - parquet
  - time-travel
downloads:
  monthly: 162
published: "2026-01-22T15:59:28.627Z"
updated: "2026-01-25T13:47:33.285Z"
---

# @dotdo/postgres

> Full PostgreSQL in every Cloudflare Durable Object. Zero infrastructure. Global scale.

[![npm version](https://img.shields.io/npm/v/@dotdo/postgres.svg)](https://www.npmjs.com/package/@dotdo/postgres)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

```typescript
import { PostgresDO, createRoutes } from '@dotdo/postgres/worker'

export { PostgresDO }
export default { fetch: createRoutes().fetch }
```

That's it. You now have PostgreSQL running at the edge.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Reference](#api-reference)
  - [Worker Module](#worker-module)
  - [PGLite Module](#pglite-module)
  - [Migrations Module](#migrations-module)
  - [Observability Module](#observability-module)
  - [Iceberg Module](#iceberg-module)
- [Configuration](#configuration)
- [Examples](#examples)
- [Architecture](#architecture)
- [Related Packages](#related-packages)

## Installation

```bash
npm install @dotdo/postgres @dotdo/pglite
# or
yarn add @dotdo/postgres @dotdo/pglite
# or
pnpm add @dotdo/postgres @dotdo/pglite
```

## Quick Start

### 1. Configure your Worker

```toml
# wrangler.toml
[durable_objects]
bindings = [{ name = "POSTGRES", class_name = "PostgresDO" }]

[[migrations]]
tag = "v1"
new_classes = ["PostgresDO"]

# Optional: R2 for cold storage
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "postgres-data"
```

### 2. Create your Worker

```typescript
// src/index.ts
import { PostgresDO, createRoutes } from '@dotdo/postgres/worker'

export { PostgresDO }
export default { fetch: createRoutes().fetch }
```

### 3. Deploy

```bash
wrangler deploy
```

Done. PostgreSQL at the edge.

## Features

| Feature | Description |
|---------|-------------|
| **PostgresDO** | Full PostgreSQL in every Durable Object via PGLite WASM |
| **Tiered Storage** | Automatic data movement across HOT (DO) / WARM (Cache) / COLD (R2) tiers |
| **Multi-tenant Routing** | Route requests to tenant-specific DOs via subdomain, path, or header |
| **DO Migrations** | Fast, idempotent migrations with schema snapshots for instant bootstrap |
| **Real-time CDC** | Subscribe to database changes via WebSocket (95% cheaper with hibernation) |
| **Write-Ahead Log** | Full WAL support with time-travel queries and point-in-time recovery |
| **Apache Iceberg** | Iceberg v2 table format for WAL storage with analytics support |
| **Observability** | OpenTelemetry-compatible tracing, metrics, and context propagation |
| **Drizzle ORM** | First-class Drizzle ORM integration with migration compatibility |
| **PostgreSQL Extensions** | pgvector, pgcrypto, and more for AI/ML workloads |

### Why @dotdo/postgres?

| Feature | @dotdo/postgres | Traditional DBaaS |
|---------|-----------------|-------------------|
| **Latency** | <10ms (edge) | 50-200ms (regional) |
| **Idle cost** | $0 (hibernation) | $$$ (always running) |
| **Cache reads** | FREE | Per-query cost |
| **Warm starts** | **16ms** (WASM hoisting) | 50-200ms |
| **Cold starts** | ~1200ms (full WASM) | 50-200ms |
| **Per-user DBs** | Built-in | Complex infra |
| **WebSocket** | 95% cheaper | Full connection cost |

### Performance

| Scenario | Latency | Notes |
|----------|---------|-------|
| **Warm query** | 13-16ms | WASM hoisted, consistent |
| **Warm start** (DO reinstantiated) | **16ms** | 75x faster with WASM hoisting |
| **Cold start** | ~1200ms | Full WASM initialization |
| **Non-query endpoints** | **Instant** | Respond while WASM loads |

The key insight: **Isolates stay warm much longer than DO class instances**. WASM hoisting at the module level means most requests hit a warm isolate where WASM is already loaded, reducing latency from ~1200ms to ~16ms.

## API Reference

### Worker Module

Import from `@dotdo/postgres` or `@dotdo/postgres/worker`.

#### PostgresDO

The main Durable Object class that provides PostgreSQL functionality.

```typescript
import { PostgresDO, createPostgresDO, createAuthenticatedPostgresDO } from '@dotdo/postgres'

// Basic usage - export the DO class
export { PostgresDO }

// With custom configuration
export const CustomPostgresDO = createPostgresDO({
  maxConnections: 10,
  statementTimeout: 30000,
})

// With oauth.do authentication
export const AuthenticatedPostgresDO = createAuthenticatedPostgresDO({
  oauthDoBinding: 'OAUTH_DO',
  requiredScopes: ['read', 'write'],
})

// WASM hoisting utilities for diagnostics
import {
  hasBgHoistedPglite,      // Check if WASM is loaded
  isBgWasmLoading,          // Check if WASM is loading
  getBgHoistedPgliteDiagnostics,  // Get detailed diagnostics
} from '@dotdo/postgres/worker'

// Check WASM state
console.log('WASM loaded:', hasBgHoistedPglite())
console.log('WASM loading:', isBgWasmLoading())
console.log('Diagnostics:', getBgHoistedPgliteDiagnostics())
// { hasInstance: true, isLoading: false, loadDurationMs: 1156, ... }
```

#### createRoutes

Create Hono routes for HTTP API access.

```typescript
import { createRoutes } from '@dotdo/postgres/worker'
import { Hono } from 'hono'

const app = new Hono()
app.route('/api/sql', createRoutes(postgresDO))

// Available endpoints:
// GET  /ping          - Health check
// GET  /health        - Detailed health status
// GET  /liveness      - PGLite responsiveness probe
// GET  /readiness     - Ready to accept requests
// POST /query         - Execute SQL query
// POST /batch         - Execute multiple queries
// POST /transaction   - Execute queries in a transaction
// GET  /config        - Get database configuration
// GET  /schema        - Get schema version info
```

#### BackgroundPGLiteManager

Eager-but-non-blocking WASM loading for optimal performance.

```typescript
import { BackgroundPGLiteManager, createBackgroundPGLiteManager } from '@dotdo/postgres/worker'

// In your Durable Object
export class PostgresDO extends DurableObject {
  private manager: BackgroundPGLiteManager

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.manager = createBackgroundPGLiteManager({
      database: 'mydb',
      waitUntil: (p) => ctx.waitUntil(p), // Keep DO alive during WASM load
    })
  }

  async init() {
    // Starts WASM loading in background, returns IMMEDIATELY
    await this.manager.initialize()
  }

  // Health check - responds INSTANTLY (doesn't wait for WASM)
  ping() {
    return {
      ok: true,
      wasmLoaded: this.manager.isWASMLoaded(),
      wasmLoading: this.manager.isLoading(),
    }
  }

  // Query - waits for WASM if not ready (loading already started)
  async query(sql: string) {
    return this.manager.query(sql)
  }
}
```

**Why eager-but-non-blocking?**
- Pure lazy loading "kicks the can down the road" - first query still pays full ~1200ms
- Background loading gives the best of both worlds:
  - Non-query endpoints respond instantly
  - WASM starts loading immediately
  - First query only waits for remaining load time (often near-zero)

#### WebSocket Handler

Real-time query execution and CDC subscriptions via WebSocket.

```typescript
import { WebSocketHandler, createWebSocketHandler } from '@dotdo/postgres/worker'

const wsHandler = createWebSocketHandler(queryExecutor)

// Handle WebSocket upgrade
export default {
  async fetch(request: Request, env: Env) {
    if (request.headers.get('Upgrade') === 'websocket') {
      return wsHandler.handleUpgrade(request)
    }
    // ...
  }
}
```

#### CDC Manager

Subscribe to database changes for real-time updates.

```typescript
import { CDCManager, createCDCManager } from '@dotdo/postgres/worker'

const cdc = createCDCManager(pglite)

// Subscribe to table changes
cdc.subscribe('users', {
  onInsert: (row) => broadcast('user:created', row),
  onUpdate: (row, old) => broadcast('user:updated', { new: row, old }),
  onDelete: (old) => broadcast('user:deleted', old),
})

// Subscribe to specific columns
cdc.subscribe('orders', {
  columns: ['status', 'total'],
  onUpdate: (row) => notifyStatusChange(row),
})
```

#### WAL Manager

Write-Ahead Log for durability and time-travel queries.

```typescript
import { WALManager, createWALManager, R2WALStorage } from '@dotdo/postgres/worker'

// Create WAL manager with R2 storage
const walStorage = new R2WALStorage({
  bucket: env.R2_BUCKET,
  prefix: 'wal/',
})

const wal = createWALManager({
  storage: walStorage,
  flushIntervalMs: 1000,
  maxBufferSize: 1000,
})

// WAL entries are automatically captured on writes
await pglite.query('INSERT INTO users (email) VALUES ($1)', ['user@example.com'])

// Manual flush
await wal.flush()
```

#### Authentication

Integration with oauth.do for user-scoped database access.

```typescript
import { createAuthMiddleware, requireAuth, getAuth } from '@dotdo/postgres/worker'

const app = new Hono()

// Add auth middleware
app.use('*', createAuthMiddleware({
  oauthDoBinding: env.OAUTH_DO,
  tokenCache: new Map(),
}))

// Protected routes
app.get('/api/data', requireAuth(), async (c) => {
  const auth = getAuth(c)
  console.log(`User: ${auth.userId}`)
  // Each user gets their own database instance
  const doId = getDatabaseId(auth.userId)
  const stub = env.POSTGRES.get(doId)
  return stub.fetch(c.req.raw)
})
```

### PGLite Module

Import from `@dotdo/postgres/pglite`.

#### Tiered VFS

Virtual File System with automatic data tiering.

```typescript
import { TieredVFS, CacheLayer, R2StorageLayer, DOVFS } from '@dotdo/postgres/pglite'

// Create cache layer (FREE Cloudflare Cache API)
const cacheLayer = new CacheLayer(caches.default, {
  cacheName: 'pglite-pages',
  ttlSeconds: 300,
  baseUrl: 'https://cache.example.com',
})

// Create R2 layer for cold storage
const r2Layer = new R2StorageLayer({
  bucket: env.R2_BUCKET,
  prefix: 'pglite/',
})

// Create tiered VFS
const tieredVFS = new TieredVFS({
  cacheLayer,
  doStorage: ctx.storage,
  r2Layer,
  pageSize: 8192,
})

// Initialize PGLite with tiered storage
const pglite = await PGlite.create({
  vfs: tieredVFS,
})
```

#### Auto-Promotion and Auto-Demotion

Automatic data movement between storage tiers.

```typescript
import { AutoPromoter, AutoDemoter } from '@dotdo/postgres/pglite'

// Auto-promote frequently accessed data to hotter tiers
const promoter = new AutoPromoter({
  tieredVFS,
  accessThreshold: 10,    // Promote after 10 accesses
  checkIntervalMs: 60000, // Check every minute
})

// Auto-demote cold data to cheaper tiers
const demoter = new AutoDemoter({
  tieredVFS,
  idleTimeMs: 3600000,    // Demote after 1 hour of no access
  checkIntervalMs: 300000, // Check every 5 minutes
})

promoter.start()
demoter.start()
```

#### Production PGLite Wrapper

Production-ready PGLite with connection management and health checks.

```typescript
import { ProductionPGLite, createProductionPGLite } from '@dotdo/postgres/pglite'

const pg = await createProductionPGLite({
  vfs: tieredVFS,
  healthCheckIntervalMs: 30000,
  onConnectionError: (error) => console.error('Connection error:', error),
  onHealthCheckFail: () => alertOps('PGLite health check failed'),
})

// Health check
const health = await pg.healthCheck()
console.log(`Status: ${health.status}, Latency: ${health.latencyMs}ms`)

// Graceful shutdown
await pg.close({ drainTimeoutMs: 5000 })
```

#### ETag Cache Invalidation

Efficient cache invalidation using ETags.

```typescript
import { ETagCache, createETagCache } from '@dotdo/postgres/pglite'

const etagCache = createETagCache({
  maxEntries: 1000,
  ttlMs: 300000,
})

// Cache query result with ETag
const result = await etagCache.getOrSet(
  'users:all',
  async () => pglite.query('SELECT * FROM users'),
  ['users'] // Invalidate when 'users' table changes
)

// Check if cached result is still valid
const conditional = await etagCache.checkConditional(request)
if (conditional.notModified) {
  return new Response(null, { status: 304 })
}
```

### Migrations Module

Import from `@dotdo/postgres/migrations`.

#### Auto-Migrator

Automatic migration on first connection for each DO.

```typescript
import {
  createAutoMigrator,
  defineMigration,
} from '@dotdo/postgres/migrations'

// Define migrations
const migrations = [
  defineMigration({
    id: '0001_create_users',
    name: 'Create users table',
    version: 1,
    up: `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `,
    down: 'DROP TABLE users;',
  }),
  defineMigration({
    id: '0002_add_posts',
    name: 'Create posts table',
    version: 2,
    up: `
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `,
    down: 'DROP TABLE posts;',
  }),
]

// Create auto-migrator
const migrator = createAutoMigrator({ migrations })

// In your DO
class PostgresDO {
  async fetch(request: Request) {
    // Ensures migrations are applied on first access
    await migrator.ensureMigrated(this.pglite)
    // Handle request...
  }
}
```

#### Drizzle ORM Integration

Use Drizzle-generated migrations with postgres.do.

```typescript
import {
  loadBundledDrizzleMigrations,
  createAutoMigrator,
} from '@dotdo/postgres/migrations'

// Bundle Drizzle migrations at build time
import * as bundledMigrations from './drizzle-bundle'

const migrations = loadBundledDrizzleMigrations(bundledMigrations)
const migrator = createAutoMigrator({ migrations })

// Use with Drizzle ORM
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema'

const db = drizzle(pglite, { schema })

// Type-safe queries
const users = await db.select().from(schema.users)
```

#### Migration Validator

Validate migrations before deployment.

```typescript
import {
  validateMigration,
  validateMigrations,
} from '@dotdo/postgres/migrations/validator'

const result = validateMigrations(migrations)

if (!result.valid) {
  for (const issue of result.issues) {
    console.error(`[${issue.severity}] ${issue.category}: ${issue.message}`)
  }
}
```

#### Schema Generator

Generate TypeScript types from your database schema.

```typescript
import { generateSchemaTypes, introspectSchema } from '@dotdo/postgres/migrations'

const schema = await introspectSchema(pglite)
const types = generateSchemaTypes(schema)

console.log(types)
// interface Users {
//   id: number;
//   email: string;
//   name: string | null;
//   created_at: Date | null;
// }
```

### Observability Module

Import from `@dotdo/postgres/observability`.

#### Complete Observability Setup

```typescript
import { createObservability } from '@dotdo/postgres/observability'

const obs = createObservability({
  serviceName: 'postgres-do',
  serviceVersion: '1.0.0',
  environment: 'production',
})

// Instrumented query execution
const result = await obs.query(
  { sql: 'SELECT * FROM users WHERE id = $1', params: [userId] },
  async (sql, params) => pglite.query(sql, params)
)

// Track cache operations
const cached = await obs.cache.get('page-123', 'cache', async () => {
  return cacheLayer.get('page-123')
})

// Track DO lifecycle
await obs.do.trackActivation({ id: doId.toString() }, async () => {
  await this.initPGlite()
})

// Get metrics snapshot
const metrics = obs.metrics.getMetrics()
console.log(`Query count: ${metrics.queryCount}`)
console.log(`Avg latency: ${metrics.avgLatencyMs}ms`)
```

#### Distributed Tracing

W3C Trace Context compatible propagation.

```typescript
import {
  extractSpanContext,
  injectSpanContext,
  createTracer,
} from '@dotdo/postgres/observability'

const tracer = createTracer({
  serviceName: 'postgres-do',
})

export default {
  async fetch(request: Request) {
    // Extract parent context from incoming request
    const parentContext = extractSpanContext(request.headers)

    // Create child span
    const span = tracer.startSpan('handle-request', {
      parent: parentContext,
    })

    try {
      const response = new Response('OK')
      // Inject trace context into response
      injectSpanContext(span.getContext(), response.headers)
      return response
    } finally {
      span.end()
    }
  }
}
```

### Iceberg Module

Import from `@dotdo/postgres/iceberg`.

#### WAL to Iceberg Writer

Store WAL data in Apache Iceberg format for analytics.

```typescript
import {
  createIcebergWALWriter,
  createWALIcebergBridge,
} from '@dotdo/postgres/iceberg'

const writer = createIcebergWALWriter({
  bucket: env.R2_BUCKET,
  tablePath: 'iceberg/wal',
  partitionBy: 'hour', // 'day' or 'hour'
})

// Initialize Iceberg table
await writer.initialize()

// Bridge WAL to Iceberg
const bridge = createWALIcebergBridge(walManager, writer)
bridge.start()

// Query historical data with time travel
const query = `
  SELECT * FROM wal_entries
  FOR SYSTEM_TIME AS OF TIMESTAMP '2024-01-15 10:00:00'
  WHERE table_name = 'users'
`
```

#### Time Travel Queries

Query data as of a specific point in time.

```typescript
import {
  createTimeTravelReader,
  parseTimestamp,
} from '@dotdo/postgres/iceberg'

const reader = createTimeTravelReader({
  bucket: env.R2_BUCKET,
  tablePath: 'iceberg/wal',
})

// Query as of timestamp
const snapshot = await reader.resolveSnapshot({
  mode: 'timestamp',
  timestamp: parseTimestamp('2024-01-15T10:00:00Z'),
})

const result = await reader.query(snapshot, {
  sql: 'SELECT * FROM users',
})
```

## Configuration

### Environment Bindings

```toml
# wrangler.toml
[durable_objects]
bindings = [
  { name = "POSTGRES", class_name = "PostgresDO" }
]

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "postgres-data"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
```

### TypeScript Types

```typescript
interface Env {
  POSTGRES: DurableObjectNamespace
  R2_BUCKET: R2Bucket
  KV: KVNamespace
  // For oauth.do integration
  OAUTH_DO?: DurableObjectNamespace
}
```

### Memory Optimization

PostgreSQL in WASM requires careful memory management for the 128MB Worker limit.

```typescript
// Recommended settings for Cloudflare Workers
const pg = await PGlite.create({
  // Memory-optimized defaults are applied automatically
  // Additional runtime settings:
})

// Reduce memory for specific operations
await pg.exec(`SET work_mem = '1MB'`)
```

## Examples

### Multi-tenant SaaS with Subdomain Routing

```typescript
import { createTenantRouter } from '@dotdo/postgres'

export default {
  async fetch(request: Request, env: Env) {
    const router = createTenantRouter({
      doNamespace: env.POSTGRES,
      extractTenant: 'subdomain',
      baseDomain: 'myapp.com',
      blockedTenants: ['www', 'api', 'admin'],
    })

    return router.route(request)
  }
}
```

### Full-Stack Application with Drizzle

```typescript
import { PostgresDO, createRoutes } from '@dotdo/postgres/worker'
import { createAutoMigrator, loadBundledDrizzleMigrations } from '@dotdo/postgres/migrations'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema'
import * as migrations from './drizzle-bundle'

// Setup migrations
const migrator = createAutoMigrator({
  migrations: loadBundledDrizzleMigrations(migrations),
})

// Extended PostgresDO with Drizzle
class AppPostgresDO extends PostgresDO {
  private db: ReturnType<typeof drizzle>

  async init() {
    await super.init()
    await migrator.ensureMigrated(this.pglite)
    this.db = drizzle(this.pglite, { schema })
  }

  async getUsers() {
    return this.db.select().from(schema.users)
  }

  async createUser(email: string, name: string) {
    return this.db.insert(schema.users).values({ email, name }).returning()
  }
}

export { AppPostgresDO as PostgresDO }
```

### Real-time Dashboard with CDC

```typescript
import { CDCManager, CDCWebSocketHandler } from '@dotdo/postgres/worker'

class DashboardDO extends PostgresDO {
  private cdc: CDCManager
  private wsHandler: CDCWebSocketHandler

  async init() {
    await super.init()

    this.cdc = new CDCManager(this.pglite)
    this.wsHandler = new CDCWebSocketHandler(this.cdc)

    // Subscribe to all table changes
    this.cdc.subscribe('orders', {
      onInsert: (row) => this.broadcast('order:new', row),
      onUpdate: (row) => this.broadcast('order:updated', row),
    })

    this.cdc.subscribe('metrics', {
      onInsert: (row) => this.broadcast('metric:new', row),
    })
  }

  async fetch(request: Request) {
    const url = new URL(request.url)

    if (url.pathname === '/ws' && request.headers.get('Upgrade') === 'websocket') {
      return this.wsHandler.handleUpgrade(request)
    }

    return super.fetch(request)
  }
}
```

### Analytics with Iceberg

```typescript
import {
  createIcebergWALWriter,
  createWALIcebergBridge,
  createHistoricalAnalytics,
} from '@dotdo/postgres/iceberg'

class AnalyticsPostgresDO extends PostgresDO {
  private icebergWriter: IcebergWALWriter
  private analytics: HistoricalAnalytics

  async init() {
    await super.init()

    this.icebergWriter = createIcebergWALWriter({
      bucket: this.env.R2_BUCKET,
      tablePath: `iceberg/${this.id}`,
    })
    await this.icebergWriter.initialize()

    // Bridge WAL to Iceberg
    createWALIcebergBridge(this.walManager, this.icebergWriter).start()

    this.analytics = createHistoricalAnalytics({
      timeTravelReader: createTimeTravelReader({
        bucket: this.env.R2_BUCKET,
        tablePath: `iceberg/${this.id}`,
      }),
    })
  }

  async getGrowthMetrics(startDate: Date, endDate: Date) {
    return this.analytics.analyzeGrowth('users', startDate, endDate)
  }

  async compareSnapshots(timestamp1: Date, timestamp2: Date) {
    return this.analytics.compareSnapshots('users', timestamp1, timestamp2)
  }
}
```

## Architecture

```
                    +------------------+
                    |   Your Client    |
                    +--------+---------+
                             |
              HTTP/WebSocket |
                             v
+------------------------------------------------------------+
|                   Cloudflare Edge (300+ locations)          |
|  +-------------------------------------------------------+  |
|  |                    Worker                              | |
|  |  +--------------------------------------------------+ | |
|  |  |                  PostgresDO                       | | |
|  |  |                                                   | | |
|  |  |  +-------------+  +-------------+  +-----------+  | | |
|  |  |  |   PGLite    |  |    CDC      |  |  Storage  |  | | |
|  |  |  | (Postgres)  |  |   Manager   |  |   Tiers   |  | | |
|  |  |  +-------------+  +-------------+  +-----------+  | | |
|  |  |                                                   | | |
|  |  +--------------------------------------------------+ | |
|  +-------------------------------------------------------+  |
|                             |                               |
|              +--------------+--------------+                |
|              |              |              |                |
|              v              v              v                |
|         +-------+      +-------+      +-------+             |
|         |  DO   |      | Cache |      |  R2   |             |
|         | (HOT) |      |(WARM) |      |(COLD) |             |
|         +-------+      +-------+      +-------+             |
+------------------------------------------------------------+
```

### Tiered Storage

Automatic data movement for optimal cost and performance:

| Tier | Latency | Cost | Description |
|------|---------|------|-------------|
| **HOT** | <1ms | $$$ | In-DO SQLite blobs, synchronous access |
| **WARM** | ~5ms | FREE | Cloudflare Cache API |
| **COLD** | ~50ms | $ | R2 object storage |

## Related Packages

- [`postgres.do`](../postgres.do) - SQL tagged template client with CLI
- [`@dotdo/pglite`](../pglite) - PGLite fork optimized for Cloudflare Workers
- [`@dotdo/neon`](../neon) - Neon-compatible API
- [`@dotdo/supabase`](../supabase) - Supabase-compatible API
- [`@dotdo/mongodb`](../mongodb) - MongoDB-compatible document API

## Links

- [Documentation](https://postgres.do/docs)
- [GitHub](https://github.com/dot-do/postgres)
- [Discord](https://discord.gg/postgres-do)

## License

MIT
