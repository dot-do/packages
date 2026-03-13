---
name: "@dotdo/duckdb"
version: 0.1.0-rc.1
description: DuckDB for Cloudflare Workers - WASM, Durable Objects, and Containers
license: MIT
repository: "https://github.com/dotdo/duckdb"
homepage: "https://duck.do"
keywords:
  - duckdb
  - cloudflare
  - workers
  - wasm
  - durable-objects
  - containers
downloads:
  monthly: 8
published: "2026-01-23T19:16:44.009Z"
updated: "2026-01-23T19:16:45.719Z"
---

# @dotdo/duckdb

DuckDB for Cloudflare Workers - WASM, Durable Objects, and Containers.

## Overview

This package provides three ways to run DuckDB on Cloudflare:

| Mode | Memory Limit | Cold Start | Best For |
|------|--------------|------------|----------|
| **WASM Worker** | 128MB | ~100ms | Simple queries, edge deployment |
| **Durable Object** | 128MB | ~100ms | Persistent state, WebSocket connections |
| **Container** | Unlimited | ~500ms | Large datasets, full extensions |

## Installation

```bash
npm install @dotdo/duckdb
# or
pnpm add @dotdo/duckdb
```

### Package Size

| Component | Size | Gzipped | Description |
|-----------|------|---------|-------------|
| **Total npm Package** | ~44 MB | - | Full published package |
| **DuckDB WASM Binary** | 36 MB | ~12 MB | Core `duckdb-mvp.wasm` file |
| **JavaScript Glue** | 370 KB | ~90 KB | `duckdb-mvp.js` WASM runtime |
| **TypeScript/JS Library** | ~590 KB | ~206 KB | Compiled library code (`dist/`) |
| **Type Definitions** | ~200 KB | - | TypeScript `.d.ts` files |

**Extension Sizes (included but not yet loadable):**

| Extension | Size | Description |
|-----------|------|-------------|
| `core_functions` | 3.4 MB | Built-in SQL functions |
| `parquet` | 3.1 MB | Parquet file support |
| `json` | 835 KB | JSON functions |
| **Extensions Total** | ~7.4 MB | All extensions combined |

**Included Directories:**

| Directory | Size | Purpose |
|-----------|------|---------|
| `wasm/` | 44 MB | WASM binaries and extensions |
| `dist/` | 1.6 MB | Compiled library (JS + types + source maps) |
| `worker/` | ~50 KB | Deployable REST API worker |
| `container/` | ~52 KB | Container mode worker |
| `ui/` | ~28 KB | Query web interface |

**Deployment Size Comparison:**

| Loading Strategy | Worker Bundle Size | Requires Paid Plan |
|------------------|-------------------|-------------------|
| `wasmSource: 'bundled'` | ~37 MB | Yes (exceeds 25 MB free limit) |
| `wasmSource: 'cdn'` | <1 MB | No |
| `wasmSource: 'r2'` | <1 MB | No (but needs R2 bucket) |

**Deployment Planning:**
- **Free Workers (25 MB limit)**: Use `wasmSource: 'cdn'` or `wasmSource: 'r2'`
- **Paid Workers (100 MB limit)**: Can bundle WASM directly with `wasmSource: 'bundled'`
- **Containers**: No size limits; full package works as-is
- **Cold start impact**: CDN/R2 loading adds ~100-300ms on first request (WASM is cached after)
- Extensions add ~7.4 MB total but are not currently loadable at runtime

## Quick Start

### Option 1: Durable Object (Recommended)

The Durable Object provides persistent DuckDB instances with WebSocket support and hibernation for cost optimization.

**wrangler.toml:**
```toml
name = "my-duckdb-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[durable_objects.bindings]]
name = "DUCKDB"
class_name = "DuckDBDurableObject"

[[migrations]]
tag = "v1"
new_classes = ["DuckDBDurableObject"]
```

**src/index.ts:**
```typescript
import { DuckDBDurableObject, createDuckDBClient } from '@dotdo/duckdb/do';

// Export the Durable Object class
export { DuckDBDurableObject };

interface Env {
  DUCKDB: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Get or create a DuckDB instance by name
    const dbName = url.searchParams.get('db') ?? 'default';

    // Option 1: Use the helper client
    const client = createDuckDBClient(env.DUCKDB, dbName);

    // Execute a query
    const result = await client.query('SELECT 1 + 1 as result');
    return Response.json(result);

    // Option 2: Forward request directly to the DO
    // const id = env.DUCKDB.idFromName(dbName);
    // const stub = env.DUCKDB.get(id);
    // return stub.fetch(request);
  }
};
```

### Option 2: Deploy the REST API Worker

Deploy a pre-built REST API worker with a query UI:

```bash
# Install dependencies
npm install @dotdo/duckdb hono

# Create R2 bucket for data storage
npx wrangler r2 bucket create duckdb-data

# Deploy the worker directly from node_modules
npx wrangler deploy -c node_modules/@dotdo/duckdb/worker/wrangler.jsonc
```

Or copy and customize:

```bash
# Copy worker files to your project
cp -r node_modules/@dotdo/duckdb/worker ./duckdb-worker

# Edit wrangler.jsonc to configure your R2 bucket
# Deploy
npx wrangler deploy -c ./duckdb-worker/wrangler.jsonc
```

### Option 3: Container Mode (No Memory Limits)

> **Note:** Container mode uses [Cloudflare Containers](https://developers.cloudflare.com/containers/), which is currently in beta. Features and APIs may change.

For large datasets that exceed the 128MB WASM limit:

```bash
# Copy container worker files
cp -r node_modules/@dotdo/duckdb/container ./duckdb-container

# Deploy with container support
npx wrangler deploy -c ./duckdb-container/wrangler.jsonc
```

## Client SDK

Use the `duck.do` package for a client SDK:

```typescript
import { DuckDB } from 'duck.do';

const client = new DuckDB({
  endpoint: 'wss://your-worker.dev/ws',
  token: 'your-api-token'
});

await client.connect();

// Execute queries
const users = await client.query<User>('SELECT * FROM users WHERE active = ?', [true]);
console.log(users.rows);

// Stream large results
for await (const chunk of client.stream('SELECT * FROM events')) {
  processChunk(chunk);
}

await client.close();
```

## Package Contents

```
@dotdo/duckdb/
├── dist/           # Compiled library exports
│   ├── index.js    # Main exports (DuckDB class)
│   └── do/         # Durable Object exports
├── wasm/           # DuckDB WASM files (~44MB)
│   ├── duckdb-mvp.wasm
│   ├── duckdb-mvp.js
│   └── extensions/
├── worker/         # Deployable REST API worker
│   ├── worker.ts
│   ├── wrangler.toml
│   └── README.md
├── container/      # Container mode worker
│   ├── worker.ts
│   ├── wrangler.jsonc
│   └── README.md
└── ui/             # Query web interface
    └── index.html
```

## API Reference

### Core Module (`@dotdo/duckdb`)

The package exports two patterns for creating DuckDB instances:

#### Pattern 1: `DuckDB` Class (requires `open()`)

The class-based pattern provides a familiar OOP interface. You must call `open()` before executing queries.

```typescript
import { DuckDB } from '@dotdo/duckdb';

// Create instance with optional configuration
const db = new DuckDB({
  wasmSource: 'cdn',      // 'cdn' | 'r2' (see below for 'bundled')
  memoryLimitMB: 80,      // Memory limit (default: 80, max: 100)
  enableLogging: false,   // Enable debug logging
  variant: 'mvp',         // 'mvp' | 'eh' (exception handling)
});

// IMPORTANT: Must call open() before using the database
await db.open();

// Execute queries
const result = await db.query<{ value: number }>('SELECT 42 as value');
console.log(result.rows[0].value); // 42

// Execute statements without results
await db.execute('CREATE TABLE users (id INTEGER, name VARCHAR)');
await db.execute('INSERT INTO users VALUES ($1, $2)', [1, 'Alice']);

// Register buffers for Parquet/CSV files
const parquetData = await fetch('https://example.com/data.parquet').then(r => r.arrayBuffer());
await db.registerBuffer('data.parquet', parquetData);
const data = await db.query('SELECT * FROM read_parquet("data.parquet")');

// Check memory usage
console.log(`Memory: ${db.getMemoryUsage()} bytes`);

// Clean up
await db.close();
```

#### Pattern 2: `createMinimalDuckDB()` Factory (returns ready instance)

The factory pattern returns a result object with a ready-to-use instance. This is useful for lower-level control and accessing initialization metrics.

```typescript
import { createMinimalDuckDB } from '@dotdo/duckdb';

const result = await createMinimalDuckDB({
  wasmSource: 'cdn',
  memoryLimitMB: 80,
  enableLogging: false,
  variant: 'mvp',
});

if (result.success && result.instance) {
  // Instance is already ready - no open() needed
  const data = await result.instance.query('SELECT 1 as value');
  console.log(data.rows); // [{ value: 1 }]

  // Access initialization metrics
  console.log(`Init took ${result.metrics?.totalTimeMs}ms`);
  console.log(`WASM size: ${result.metrics?.wasmSizeBytes} bytes`);
  console.log(`Was cached: ${result.metrics?.wasCached}`);

  await result.instance.close();
} else {
  console.error('Failed to initialize:', result.error?.message);
}
```

#### Using Bundled WASM (`wasmSource: 'bundled'`)

To use the bundled WASM files shipped with the package, you must use the `loadWasmModule()` function directly and pass the pre-imported WASM module. This is required because Cloudflare Workers need static WASM imports.

```typescript
import { loadWasmModule } from '@dotdo/duckdb';
// Import the WASM module statically (required for Cloudflare Workers)
import duckdbWasm from '@dotdo/duckdb/wasm/duckdb-mvp.wasm';

// Load with bundled WASM
const { module, metrics } = await loadWasmModule(
  { wasmSource: 'bundled', variant: 'mvp' },
  undefined,  // env (not needed for bundled)
  duckdbWasm  // Pass the imported WASM module
);

console.log(`WASM loaded: ${metrics.wasmSizeBytes} bytes`);
```

**Note:** The high-level `DuckDB` class does not currently support `wasmSource: 'bundled'`. Use `wasmSource: 'cdn'` or `wasmSource: 'r2'` with the `DuckDB` class, or use `loadWasmModule()` directly for bundled WASM.

### Durable Object Module (`@dotdo/duckdb/do`)

```typescript
import {
  DuckDBDurableObject,
  createDuckDBClient,
  getDuckDBStub,
  getDuckDBStubFromId
} from '@dotdo/duckdb/do';

// Create a typed client
const client = createDuckDBClient(env.DUCKDB, 'my-database');

// Query with results
const result = await client.query<User>('SELECT * FROM users');
// result.rows: User[]
// result.meta: { queryId, executionTimeMs, rowCount }

// Execute without results (INSERT/UPDATE/DELETE)
await client.execute('INSERT INTO users (name) VALUES (?)', ['Alice']);

// Health check
const health = await client.health();

// Server status
const status = await client.status();
```

### HTTP API (Worker)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service information |
| `/ui` | GET | Query web interface |
| `/health` | GET | Health check |
| `/query` | GET/POST | Execute SQL queries |
| `/execute` | POST | Execute DDL/DML statements |
| `/tables` | GET | List all tables |
| `/schema/:table` | GET | Get table schema |
| `/load` | POST | Load data from R2 |
| `/stats` | GET | Worker statistics |

### WebSocket Protocol (Durable Object)

#### Authentication

The WebSocket protocol uses **first-message authentication** for secure token handling:

```typescript
const ws = new WebSocket('wss://your-worker.dev/');

// After connection opens, send auth message first
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-api-token'
  }));
};

// Handle auth result
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'auth_result') {
    if (msg.success) {
      console.log('Authenticated successfully');
    } else {
      console.error('Auth failed:', msg.error);
    }
  }
};
```

**Security considerations:**
- The auth token is sent over the encrypted `wss://` connection (TLS/SSL)
- Tokens are NOT included in the URL, avoiding exposure in logs and browser history
- Always use `wss://` endpoints in production to ensure encryption
- The `duck.do` client SDK handles this authentication flow automatically

#### Query Messages

```typescript
const ws = new WebSocket('wss://your-worker.dev/');

// Query
ws.send(JSON.stringify({
  type: 'query',
  id: '1',
  sql: 'SELECT * FROM users WHERE id = ?',
  params: [42]
}));

// Stream large results
ws.send(JSON.stringify({
  type: 'stream',
  id: '2',
  sql: 'SELECT * FROM events',
  options: { chunkSize: 1000 }
}));

// Handle responses
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  switch (msg.type) {
    case 'result': console.log(msg.rows); break;
    case 'chunk': console.log(msg.rows); break;
    case 'stream_end': console.log('Done'); break;
    case 'error': console.error(msg.error); break;
  }
};
```

## WASM Files

The package includes pre-built DuckDB WASM files:

- `duckdb-mvp.wasm` - Main DuckDB WASM binary (~38MB)
- `duckdb-mvp.js` - JavaScript glue code
- `extensions/` - Extension files (loading not yet implemented)
  - `core_functions.duckdb_extension.wasm`
  - `json.duckdb_extension.wasm`
  - `parquet.duckdb_extension.wasm`

**Note:** Extension loading is not yet implemented. The extension files are included in the package for future use, but cannot currently be loaded at runtime. Use Container mode if you need full extension support.

## Cost Optimization

The Durable Object uses WebSocket hibernation for significant cost savings:

| Scenario | Without Hibernation | With Hibernation |
|----------|---------------------|------------------|
| 1000 clients, 1 query/min | ~720 DO-hours/day | ~2.4 DO-hours/day |
| Cost reduction | - | **99.7%** |

### Known Limitations

#### Query Cancellation

**DuckDB-WASM does not support query cancellation at the engine level.** While the API provides `cancelQuery()` methods and accepts cancel messages, these operate at the application/protocol level only:

- **Streaming queries**: Cancellation will stop sending additional chunks to the client, but the underlying DuckDB query continues running until completion.
- **Timeout handling**: When a query times out, the timeout error is returned to the client, but the query may continue running in the background until it completes naturally.
- **AbortController**: The internal `AbortController` pattern is used to track query state and prevent sending results after cancellation, but cannot interrupt DuckDB's query execution.

**Implications:**
- Long-running queries cannot be stopped mid-execution
- Resource consumption (CPU, memory) continues until the query completes
- Cloudflare Workers have a 30-second CPU time limit which serves as an effective backstop

**Workarounds:**
1. Use `LIMIT` clauses to bound result set sizes
2. Break large queries into smaller, time-bounded chunks
3. Design queries with appropriate `WHERE` clauses to filter data early
4. For truly interruptible workloads, consider Container mode where you have more control

This is a fundamental limitation of the DuckDB WASM runtime, not specific to this package. The native DuckDB supports query interruption via its C++ API, but this functionality is not exposed in the WASM build.

#### Output Formats

The HTTP API supports multiple output formats via the `format` query parameter:

| Format | Status | Description |
|--------|--------|-------------|
| `json` | Supported | JSON object with data array and metadata (default) |
| `csv` | Supported | Comma-separated values with header row |
| `jsonl` | Supported | JSON Lines (one JSON object per line) |
| `parquet` | Not implemented | Apache Parquet binary format |
| `arrow` | Not implemented | Apache Arrow IPC stream format |

**Note:** Parquet and Arrow output format serialization is not yet implemented. Requesting these formats will return an error. If you need binary output formats, consider using DuckDB's built-in `COPY TO` command to write to a file and then downloading the file from R2 storage.

**Workaround using COPY TO:**
```sql
-- Write query results to Parquet in R2
COPY (SELECT * FROM my_table) TO 's3://my-bucket/output.parquet' (FORMAT PARQUET);

-- Then download the file via R2 API or presigned URL
```

#### Rate Limiting

**Rate limiting uses in-memory storage and is per-instance by design.** The `InMemoryRateLimiter` used in the Worker stores rate limit state in memory within each Worker isolate. This means:

- **Per-isolate limits**: Each Worker isolate maintains its own rate limit counters. A client may be rate limited on one isolate but allowed on another.
- **State not shared**: Rate limit state is not shared across Worker instances or geographical regions.
- **Resets on restart**: When an isolate is recycled or restarted, rate limit counters reset.

This design prioritizes **performance** over strict global enforcement:
- No external storage calls (Redis, KV, etc.) means zero additional latency
- No distributed coordination overhead
- Scales horizontally with Worker instances

For most use cases, per-instance rate limiting provides sufficient protection against abuse while maintaining optimal performance. If you require strict global rate limiting, consider implementing a custom solution using Durable Objects or external storage.

**Configuration:**
```bash
# Environment variables
RATE_LIMIT_WINDOW_MS=60000      # Time window (default: 60000ms / 1 minute)
RATE_LIMIT_MAX_REQUESTS=100     # Max requests per window (default: 100)
RATE_LIMIT_DISABLED=true        # Disable rate limiting entirely
```

#### Query Result Caching

**Query result caching is intentionally not implemented at the application layer.** There are two key reasons for this architectural decision:

1. **Stateless Workers**: Cloudflare Workers are stateless by design. Each request may be handled by a different worker instance with no shared memory. Implementing cross-request caching would require external storage (like KV or R2), adding latency and complexity that typically outweighs the benefits for most query patterns.

2. **DuckDB's Internal Caching**: DuckDB already implements sophisticated internal caching mechanisms including buffer pool management, result caching for common subexpressions, and memory-mapped file access for Parquet/CSV data. These optimizations happen automatically within the DuckDB engine.

**If you need query result caching**, consider these approaches:

- **Cloudflare KV**: Cache serialized results for expensive queries with appropriate TTLs
- **Durable Objects**: Use a single DO instance to maintain in-memory state across requests
- **Application-level caching**: Implement caching in your client application based on query patterns

```typescript
// Example: Manual caching with Cloudflare KV
const cacheKey = `query:${hashQuery(sql, params)}`;
const cached = await env.CACHE.get(cacheKey, 'json');
if (cached) return cached;

const result = await db.query(sql, params);
await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 });
return result;
```

#### Prepared Statements and Hibernation

**Prepared statements are not persisted across hibernation.** When a Durable Object hibernates due to inactivity and later wakes up, all prepared statements are lost. Clients should be prepared to re-create prepared statements if they receive a "statement not found" error.

This is by design - persisting prepared statements to durable storage would add latency and complexity for marginal benefits in the serverless context where connections are typically short-lived.

**Recommended pattern for handling this:**

```typescript
async function executeWithRetry(client, statementId, params, sql) {
  try {
    return await client.executePrepared(statementId, params);
  } catch (error) {
    if (error.message?.includes('not found')) {
      // Re-prepare the statement after hibernation
      const handle = await client.prepare(sql);
      return await client.executePrepared(handle.statementId, params);
    }
    throw error;
  }
}
```

## Limits

| Resource | Worker/DO | Container |
|----------|-----------|-----------|
| Memory | 128MB | Unlimited |
| CPU Time | 30s | 30s |
| Max Result Rows | 100,000 | Configurable |
| Extensions | Not yet supported | All available |

## Testing

### Test Infrastructure Overview

The test suite uses Vitest with different configurations for different testing scenarios:

| Test Type | Config File | Description |
|-----------|-------------|-------------|
| Unit Tests | `vitest.config.ts` | Node.js environment, mock-based |
| Integration Tests | `vitest.integration.config.ts` | Miniflare Workers environment |
| E2E Tests | `packages/e2e/vitest.config.ts` | Full client-server integration |

### Running Tests

```bash
# Unit tests (fast, uses mocks)
pnpm test

# Integration tests (requires Miniflare)
pnpm test:integration

# E2E tests (full stack)
cd packages/e2e && pnpm test
```

### Known Limitation: Mock-Based Testing

**Most tests use mocks instead of real DuckDB WASM.**

This is a deliberate architectural decision with important implications:

#### Why Mocks Are Used

1. **WASM Loading Complexity**: DuckDB WASM (~38MB) requires special handling in Cloudflare Workers:
   - Workers require static WASM imports at deploy time
   - Dynamic `WebAssembly.compile()` is blocked for security reasons
   - Pre-instantiation of WASM modules adds deployment complexity

2. **Test Environment Limitations**:
   - Node.js test environment differs from Workers runtime
   - Miniflare simulates Workers restrictions but doesn't include bundled WASM
   - Loading WASM from CDN in tests adds latency and network dependencies

3. **Test Speed**: Mock-based tests run in milliseconds; real WASM tests take 2-5 seconds per test for initialization

#### What This Means

- **Unit tests** verify application logic, message handling, error propagation, and protocol compliance without actually executing SQL
- **Mocked DuckDB** simulates query responses, making tests deterministic and fast
- **Real WASM execution** is only tested in:
  - `duckdb.test.ts` (when WASM can be loaded from CDN)
  - Manual testing against deployed Workers
  - CI/CD integration tests with pre-deployed infrastructure

#### Tests That Use Mocks

The following test files use mocked DuckDB instances:

- `DuckDBDurableObject.test.ts` - Durable Object WebSocket handlers
- `prepared-statements.test.ts` - Prepared statement lifecycle
- `streaming.test.ts` - Result streaming protocol
- `authentication.test.ts` - Auth flow handling
- `concurrency.test.ts` - Concurrent query handling
- `websocket-hibernation.test.ts` - Hibernation state management
- `memory-cleanup.test.ts` - Resource cleanup
- `transaction-rollback.test.ts` - Transaction handling

#### Tests That Use Real WASM (When Available)

These tests attempt to load real DuckDB WASM and skip gracefully if unavailable:

- `duckdb.test.ts` - Core DuckDB class functionality
- `integration.test.ts` - Workers runtime API compatibility
- `packages/e2e/tests/client-server.test.ts` - Full protocol tests

#### Running Real WASM Tests

To run tests with real DuckDB WASM:

```bash
# Ensure network access for CDN WASM loading
pnpm test src/__tests__/duckdb.test.ts

# Or deploy and test against a real Worker
wrangler deploy
curl https://your-worker.dev/query -d '{"sql": "SELECT 42"}'
```

#### Future Improvements

To enable real WASM integration tests in CI, the following would be needed:

1. **Pre-bundled WASM test fixtures** - Include compiled WASM modules in test assets
2. **Miniflare WASM binding** - Configure Miniflare with pre-loaded WASM modules
3. **Separate test targets** - Fast mock tests for development, slow WASM tests for CI

**Related issues**: duckdb-jiic, duckdb-41tq, duckdb-fti1, duckdb-m7n1, duckdb-lffp, duckdb-ujfi

#### Additional Testing Gaps (Documented)

The following test coverage gaps are intentionally documented and tracked as future improvements:

| Gap | Description | Issue |
|-----|-------------|-------|
| WebSocket backpressure | Tests for flow control under high load | duckdb-quz8 |
| Network communication | duck-do client tests use mocked transports | duckdb-vnkn |
| Flaky test detection | Concurrent timing tests rely on setTimeout | duckdb-27ar |
| Transaction rollback | Tests with real database state | duckdb-0tyv |
| DO hibernation | Persistence and wake behavior testing | duckdb-d6qz |
| Network failures | HTTP transport timeout/failure tests in E2E | duckdb-8iuu |
| KV/WASM caching | Cache operations testing | duckdb-gb9g |
| Load/stress testing | Concurrent WebSocket connections | duckdb-nbuh |

These gaps exist because:
- **WebSocket backpressure/load testing** requires production-like infrastructure
- **Real network communication** testing adds external dependencies and flakiness
- **Hibernation behavior** can only be fully tested in deployed Durable Objects
- **Concurrent timing** tests are inherently non-deterministic in CI environments

For critical production workloads, manual testing against deployed Workers is recommended.

## Troubleshooting

### WASM Loading Issues

#### "Failed to load WASM module" or "WebAssembly.compile is disallowed"

Cloudflare Workers restrict dynamic WASM compilation for security. WASM modules must be statically imported at deploy time.

**Solutions:**

1. **Use CDN or R2 loading (recommended):**
   ```typescript
   const db = new DuckDB({
     wasmSource: 'cdn',  // or 'r2'
     memoryLimitMB: 80
   });
   await db.open();
   ```

2. **For bundled WASM, use static imports:**
   ```typescript
   import { loadWasmModule } from '@dotdo/duckdb';
   import duckdbWasm from '@dotdo/duckdb/wasm/duckdb-mvp.wasm';

   const { module, metrics } = await loadWasmModule(
     { wasmSource: 'bundled', variant: 'mvp' },
     undefined,
     duckdbWasm  // Static import required
   );
   ```

3. **Check your wrangler.toml has proper WASM binding:**
   ```toml
   [wasm_modules]
   DUCKDB_WASM = "node_modules/@dotdo/duckdb/wasm/duckdb-mvp.wasm"
   ```

#### "WASM binary too large" or deployment size errors

The DuckDB WASM binary is ~36MB, which exceeds Cloudflare's free tier limit (25MB).

**Solutions:**

1. **Upgrade to a paid Workers plan (100MB limit)**

2. **Load WASM from CDN instead of bundling:**
   ```typescript
   const db = new DuckDB({ wasmSource: 'cdn' });
   ```

3. **Load WASM from R2 bucket:**
   ```typescript
   const db = new DuckDB({ wasmSource: 'r2' });
   ```

   First upload the WASM file to R2:
   ```bash
   wrangler r2 object put duckdb-wasm/duckdb-mvp.wasm \
     --file node_modules/@dotdo/duckdb/wasm/duckdb-mvp.wasm
   ```

#### WASM loads but queries fail silently

**Solutions:**

1. **Ensure `open()` was called before querying:**
   ```typescript
   const db = new DuckDB({ wasmSource: 'cdn' });
   await db.open();  // Required before any queries!
   const result = await db.query('SELECT 1');
   ```

2. **Enable logging to debug:**
   ```typescript
   const db = new DuckDB({
     wasmSource: 'cdn',
     enableLogging: true
   });
   ```

3. **Check the factory pattern result:**
   ```typescript
   const result = await createMinimalDuckDB({ wasmSource: 'cdn' });
   if (!result.success) {
     console.error('Init failed:', result.error?.message);
   }
   ```

### Memory Limit Issues

#### "Out of memory" or query crashes

Workers and Durable Objects have a 128MB memory limit. DuckDB operations can quickly exceed this.

**Solutions:**

1. **Set explicit memory limits:**
   ```typescript
   const db = new DuckDB({
     wasmSource: 'cdn',
     memoryLimitMB: 80  // Leave headroom for JS heap
   });
   ```

2. **Use LIMIT clauses:**
   ```sql
   SELECT * FROM large_table LIMIT 10000;
   ```

3. **Stream results instead of loading all at once:**
   ```typescript
   // Use the WebSocket streaming protocol for large results
   for await (const chunk of client.stream('SELECT * FROM events')) {
     processChunk(chunk.rows);
   }
   ```

4. **Use Container mode for large datasets:**
   ```bash
   cp -r node_modules/@dotdo/duckdb/container ./duckdb-container
   npx wrangler deploy -c ./duckdb-container/wrangler.jsonc
   ```

5. **Optimize queries to reduce memory usage:**
   ```sql
   -- Project only needed columns
   SELECT id, name FROM users WHERE active = true;

   -- Aggregate server-side instead of client-side
   SELECT department, COUNT(*) FROM users GROUP BY department;
   ```

#### Memory not released after query

DuckDB manages its own memory pool which may not immediately return memory to the system.

**Solutions:**

1. **Close and recreate the database for memory-intensive operations:**
   ```typescript
   await db.close();
   db = new DuckDB({ wasmSource: 'cdn', memoryLimitMB: 80 });
   await db.open();
   ```

2. **Monitor memory usage:**
   ```typescript
   console.log(`Memory used: ${db.getMemoryUsage()} bytes`);
   ```

3. **Use Durable Objects for long-running workloads** - they can hibernate and release memory

### Worker Compatibility Issues

#### "Cannot find module '@dotdo/duckdb'"

**Solutions:**

1. **Ensure the package is installed:**
   ```bash
   npm install @dotdo/duckdb
   # or
   pnpm add @dotdo/duckdb
   ```

2. **Check your tsconfig.json includes proper module resolution:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "bundler",
       "module": "ESNext"
     }
   }
   ```

3. **For Durable Object imports, use the /do subpath:**
   ```typescript
   import { DuckDBDurableObject, createDuckDBClient } from '@dotdo/duckdb/do';
   ```

#### Durable Object class not found

**Solutions:**

1. **Export the class from your worker entry point:**
   ```typescript
   export { DuckDBDurableObject } from '@dotdo/duckdb/do';
   ```

2. **Configure wrangler.toml correctly:**
   ```toml
   [[durable_objects.bindings]]
   name = "DUCKDB"
   class_name = "DuckDBDurableObject"

   [[migrations]]
   tag = "v1"
   new_classes = ["DuckDBDurableObject"]
   ```

3. **Ensure compatibility date supports Durable Objects:**
   ```toml
   compatibility_date = "2024-01-01"
   ```

#### "Hibernation" errors with prepared statements

When a Durable Object hibernates, all in-memory state including prepared statements is lost.

**Solutions:**

1. **Handle statement re-preparation:**
   ```typescript
   async function executeWithRetry(client, statementId, params, sql) {
     try {
       return await client.executePrepared(statementId, params);
     } catch (error) {
       if (error.message?.includes('not found')) {
         const handle = await client.prepare(sql);
         return await client.executePrepared(handle.statementId, params);
       }
       throw error;
     }
   }
   ```

2. **Use simple queries instead of prepared statements for infrequent operations**

3. **Keep connections active to prevent hibernation** (increases costs)

#### "Error: Request limit exceeded" or CPU time errors

Cloudflare Workers have a 30-second CPU time limit.

**Solutions:**

1. **Break large operations into smaller chunks:**
   ```typescript
   // Instead of one large query
   const results = [];
   let offset = 0;
   while (true) {
     const chunk = await db.query(
       `SELECT * FROM data LIMIT 10000 OFFSET ${offset}`
     );
     if (chunk.rows.length === 0) break;
     results.push(...chunk.rows);
     offset += 10000;
   }
   ```

2. **Use Container mode for CPU-intensive workloads**

3. **Optimize queries with proper indexes**

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `WebAssembly.compile is disallowed` | Dynamic WASM compilation blocked | Use static imports or CDN/R2 loading |
| `Out of memory` | Exceeded 128MB limit | Reduce memory limit, use Container mode |
| `Module not found: @dotdo/duckdb` | Package not installed | Run `npm install @dotdo/duckdb` |
| `DuckDBDurableObject is not exported` | Missing class export | Export class in worker entry point |
| `Statement not found` | DO hibernated | Re-prepare statements |
| `Script exceeded CPU time limit` | Query too complex | Optimize query or use Container mode |
| `Deployment too large` | WASM bundled in worker | Use `wasmSource: 'cdn'` or `'r2'` |
| `Cannot call open() twice` | Database already initialized | Check state before calling open() |

### Debugging Tips

1. **Enable logging:**
   ```typescript
   const db = new DuckDB({
     wasmSource: 'cdn',
     enableLogging: true
   });
   ```

2. **Check initialization metrics:**
   ```typescript
   const result = await createMinimalDuckDB({ wasmSource: 'cdn' });
   if (result.success) {
     console.log(`Init time: ${result.metrics?.totalTimeMs}ms`);
     console.log(`WASM size: ${result.metrics?.wasmSizeBytes} bytes`);
     console.log(`From cache: ${result.metrics?.wasCached}`);
   }
   ```

3. **Monitor memory:**
   ```typescript
   console.log(`Memory: ${db.getMemoryUsage()} bytes`);
   ```

4. **Use wrangler tail for production debugging:**
   ```bash
   wrangler tail --format pretty
   ```

5. **Test locally with Miniflare:**
   ```bash
   wrangler dev
   ```

## Related Packages

- [`duck.do`](https://www.npmjs.com/package/duck.do) - Client SDK for duck.do managed service
- [`@cloudflare/workers-types`](https://www.npmjs.com/package/@cloudflare/workers-types) - TypeScript types for Workers

## License

MIT
