---
name: duck.do
version: 0.1.0-rc.1
description: Client SDK for duck.do managed DuckDB service
license: MIT
repository: "https://github.com/dotdo/duckdb"
homepage: "https://duck.do"
keywords:
  - duckdb
  - duck.do
  - analytics
  - sql
  - client
downloads:
  monthly: 5
published: "2026-01-23T18:27:22.287Z"
updated: "2026-01-23T18:27:22.503Z"
---

# duck.do

Client SDK for the [duck.do](https://duck.do) managed DuckDB service.

Connect to DuckDB instances running on Cloudflare Durable Objects via WebSocket or HTTP with automatic reconnection, streaming support, and a type-safe API that mirrors the `@duckdb/node-api`.

## Installation

```bash
npm install duck.do
```

```bash
pnpm add duck.do
```

```bash
yarn add duck.do
```

### Package Size

This is a lightweight client SDK with minimal dependencies.

| Component | Size | Gzipped | Description |
|-----------|------|---------|-------------|
| **Total Package** | ~190 KB | ~66 KB | Full npm package |
| **Client Core** | ~27 KB | ~9 KB | Main `DuckDB` client class |
| **WebSocket Transport** | ~21 KB | ~7 KB | Default transport with reconnection |
| **HTTP Transport** | ~29 KB | ~10 KB | Fallback transport |
| **Type Definitions** | ~65 KB | - | TypeScript `.d.ts` files |

**Optional Dependencies:**

| Dependency | Size | When Needed |
|------------|------|-------------|
| `capnweb` | ~50 KB | Only for `CapnWebTransport` (experimental) |

**Bundle Impact:**
- **Browser**: ~66 KB gzipped (all transports)
- **Tree-shaking**: Import only what you need to reduce bundle size
- **Zero WASM**: This is a pure JavaScript client; WASM runs server-side

```typescript
// Full import (~66 KB gzipped)
import { DuckDB, WebSocketTransport, HttpTransport } from 'duck.do';

// Minimal import (~16 KB gzipped) - just client + WebSocket
import { DuckDB } from 'duck.do';
```

### Optional Dependencies

The SDK includes an optional `CapnWebTransport` for high-performance RPC using Cloudflare's [capnweb](https://github.com/cloudflare/capnweb) library. This transport is only needed if you want to use Cap'n Proto binary transport with promise pipelining support.

```bash
# Only install if you need CapnWebTransport
npm install capnweb
```

See the [CapnWebTransport section](#capnwebtransport-experimental) for usage details.

## Quick Start

```typescript
import { DuckDB } from 'duck.do';

// Create a client
const client = new DuckDB({
  endpoint: 'wss://duck.do/v1/db',
  token: 'your-api-token'
});

// Connect to the server
await client.connect();

// Execute a query with type safety
interface User {
  id: number;
  name: string;
  email: string;
}

const result = await client.query<User>('SELECT * FROM users WHERE active = ?', [true]);
console.log(result.rows); // User[]

// Close the connection when done
await client.close();
```

## Features

- **WebSocket transport** (default) with automatic reconnection
- **HTTP fallback** for environments without WebSocket support
- **Streaming results** for large datasets
- **Prepared statements** for repeated queries
- **Bulk appenders** for high-performance inserts
- **Full type safety** with TypeScript generics
- **Event-based API** for connection lifecycle

## API Reference

### DuckDB Client

The main client class for interacting with duck.do.

#### Constructor

```typescript
const client = new DuckDB(options: ClientOptions);
```

#### ClientOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `endpoint` | `string` | *required* | Endpoint URL (WebSocket or HTTP) |
| `token` | `string` | `undefined` | Authentication token |
| `transport` | `'websocket' \| 'http'` | `'websocket'` | Preferred transport |
| `connectTimeout` | `number` | `10000` | Connection timeout (ms) |
| `queryTimeout` | `number` | `30000` | Query timeout (ms) |
| `autoReconnect` | `boolean` | `true` | Enable automatic reconnection |
| `maxReconnectAttempts` | `number` | `5` | Max reconnection attempts |
| `reconnectBackoff` | `number` | `1000` | Reconnection backoff base (ms) |
| `config` | `DuckDBConfig` | `undefined` | DuckDB configuration |
| `debug` | `boolean` | `false` | Enable debug logging |

### Connection Lifecycle

```typescript
// Connect to the server
await client.connect();

// Check connection status
const status = client.getStatus();
// { state: 'connected', connectedAt: 1234567890, reconnectAttempts: 0, activeQueries: 0 }

// Check if connected
client.isConnected(); // true

// Close the connection
await client.close();
```

### Query Execution

#### query()

Execute a query and return all results. Best for moderate-sized result sets.

```typescript
const result = await client.query<User>(
  'SELECT * FROM users WHERE department = $1',
  ['engineering']
);

console.log(result.rows);    // User[]
console.log(result.meta);    // { columns, rowCount, executionTimeMs, ... }
```

#### execute()

Execute a statement without returning results (INSERT, UPDATE, DELETE, etc.).

```typescript
const result = await client.execute(
  'INSERT INTO users (name, email) VALUES ($1, $2)',
  ['Alice', 'alice@example.com']
);

console.log(result.rowsAffected);     // 1
console.log(result.executionTimeMs);  // 5
```

#### executeMany()

Execute multiple statements in a single transaction. If any statement fails, the entire transaction is rolled back.

```typescript
const results = await client.executeMany([
  { sql: 'INSERT INTO orders (user_id, total) VALUES ($1, $2)', params: [1, 100] },
  { sql: 'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2', params: [1, 42] }
]);
```

**Important: Transaction Limitation**

DuckDB does not support nested transactions. Since `executeMany()` automatically wraps all statements in a transaction (BEGIN/COMMIT), your statements **must not** include transaction control statements such as:

- `BEGIN` / `BEGIN TRANSACTION`
- `COMMIT`
- `ROLLBACK`
- `START TRANSACTION`

If any statement contains these keywords, `executeMany()` will throw an error to prevent undefined behavior.

**If you need manual transaction control**, use `execute()` directly:

```typescript
try {
  await client.execute('BEGIN TRANSACTION');
  await client.execute('INSERT INTO users (name) VALUES (?)', ['Alice']);
  await client.execute('INSERT INTO logs (event) VALUES (?)', ['user_created']);
  await client.execute('COMMIT');
} catch (error) {
  await client.execute('ROLLBACK');
  throw error;
}
```

### Streaming Results

For large datasets that should not be loaded into memory at once.

#### stream()

Returns an async iterable of result chunks.

```typescript
let totalRows = 0;

for await (const chunk of client.stream<Event>('SELECT * FROM events')) {
  totalRows += chunk.rows.length;
  await processEvents(chunk.rows);

  console.log(`Progress: ${chunk.rowsSoFar} rows, hasMore: ${chunk.hasMore}`);
}

console.log(`Processed ${totalRows} events`);
```

#### streamAsReadable()

Returns a Web Streams API ReadableStream.

```typescript
const readable = client.streamAsReadable<Event>('SELECT * FROM events');

const reader = readable.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  processChunk(value);
}
```

### Prepared Statements

Prepare statements once, execute multiple times with different parameters.

```typescript
const stmt = await client.prepare(
  'INSERT INTO logs (level, message, timestamp) VALUES ($1, $2, $3)'
);

// Execute with positional parameters
await stmt.run(['info', 'Application started', new Date()]);
await stmt.run(['error', 'Connection failed', new Date()]);

// Query with results
const result = await stmt.query<Log>(['info']);

// Bind parameters for subsequent executions
stmt.bind(['warning', 'Low memory', new Date()]);
await stmt.run(); // Uses bound parameters

// Clear bindings
stmt.clearBindings();

// Close when done
await stmt.close();
```

#### Hibernation Warning

**Important:** When connecting to a DuckDB Durable Object, prepared statements are stored in memory on the server and are **lost when the Durable Object hibernates** due to inactivity. This is a fundamental characteristic of Cloudflare Durable Objects - when they hibernate to save resources, all in-memory state (including prepared statements) is cleared.

After hibernation, any attempt to execute a prepared statement will fail with a "statement not found" error.

**Recommended Pattern for Handling Hibernation:**

```typescript
async function executeWithRetry<T>(
  client: DuckDB,
  sql: string,
  params: ParameterValue[],
  existingStmt?: PreparedStatement
): Promise<{ result: QueryResult<T>; stmt: PreparedStatement }> {
  let stmt = existingStmt;
  try {
    if (!stmt) {
      stmt = await client.prepare(sql);
    }
    const result = await stmt.query<T>(params);
    return { result, stmt };
  } catch (error) {
    if (error instanceof Error && error.message?.includes('not found')) {
      // Re-prepare after hibernation
      stmt = await client.prepare(sql);
      const result = await stmt.query<T>(params);
      return { result, stmt };
    }
    throw error;
  }
}

// Usage
let stmt: PreparedStatement | undefined;
const sql = 'SELECT * FROM users WHERE id = $1';

// First call prepares the statement
const { result, stmt: updatedStmt } = await executeWithRetry<User>(client, sql, [42], stmt);
stmt = updatedStmt;

// Subsequent calls reuse the statement (or re-prepare if hibernated)
const { result: result2 } = await executeWithRetry<User>(client, sql, [43], stmt);
```

**Why This Happens:**

Cloudflare Durable Objects use hibernation to optimize costs - when there are no active WebSocket connections or pending requests, the DO can hibernate and release memory. This provides significant cost savings (up to 99.7% in some scenarios) but means that in-memory state like prepared statements cannot be persisted.

See the [@dotdo/duckdb documentation](https://www.npmjs.com/package/@dotdo/duckdb#known-limitations-with-hibernation) for more details on hibernation behavior.

### Bulk Appenders

High-performance bulk inserts that bypass the query parser.

```typescript
const appender = await client.createAppender('events');

// Append rows one at a time (buffered internally)
for (const event of events) {
  await appender.appendRow([
    event.timestamp,
    event.type,
    event.data
  ]);
}

// Or append multiple rows at once
await appender.appendRows([
  [new Date(), 'click', '{"button": "submit"}'],
  [new Date(), 'view', '{"page": "/home"}'],
]);

// Flush buffered data to the database
const flushResult = await appender.flush();
console.log(`Flushed ${flushResult.rowsFlushed} rows in ${flushResult.durationMs}ms`);

// Close the appender (flushes remaining data)
await appender.close();
```

### Schema Introspection

```typescript
// Get all tables in a schema
const tables = await client.getTables('main');
// [{ name: 'users', schema: 'main', type: 'BASE TABLE', estimatedRowCount: 1000 }]

// Get columns for a table
const columns = await client.getColumns('users');
// [{ name: 'id', type: { id: 'INTEGER' }, nullable: false }, ...]

// Check if a table exists
const exists = await client.tableExists('users');
// true
```

### Utility Methods

```typescript
// Get DuckDB version
const version = await client.getVersion();
// 'v1.0.0'

// Ping the server
const latency = await client.ping();
// 42 (ms)

// Cancel a running query (see limitations below)
const cancelled = await client.cancelQuery(queryId);
// true
```

#### Query Cancellation Limitation

**Important:** DuckDB-WASM does not support query cancellation at the engine level. While `cancelQuery()` is provided for API completeness, it operates at the protocol level only:

- **What cancellation does**: Stops sending results to the client, aborts streaming, and cleans up server-side tracking state
- **What cancellation does NOT do**: It cannot interrupt a running DuckDB query - the query continues executing until completion

**Implications:**
- Long-running queries will continue consuming CPU/memory until they complete naturally
- Timeout errors return immediately to the client, but the query may still be running
- Cloudflare Workers' 30-second CPU time limit serves as the ultimate backstop

**Workarounds:**
1. Use `LIMIT` clauses to bound result sizes
2. Add `WHERE` clauses to filter data early in query execution
3. Break large operations into smaller, time-bounded queries

This is a fundamental limitation of the DuckDB WASM runtime. Native DuckDB supports query interruption via its C++ API, but this is not exposed in the WASM build.

### Event Handling

Subscribe to connection and query lifecycle events.

```typescript
// Connection events
client.on('connect', () => {
  console.log('Connected to duck.do');
});

client.on('disconnect', ({ reason, code }) => {
  console.log(`Disconnected: ${reason} (code: ${code})`);
});

client.on('reconnecting', ({ attempt, maxAttempts }) => {
  console.log(`Reconnecting... attempt ${attempt}/${maxAttempts}`);
});

client.on('error', (error) => {
  console.error('Connection error:', error);
});

// Query events
client.on('queryStart', ({ queryId, sql }) => {
  console.log(`Query ${queryId} started: ${sql}`);
});

client.on('queryEnd', ({ queryId, duration }) => {
  console.log(`Query ${queryId} completed in ${duration}ms`);
});

// Remove listener
client.off('connect', myListener);

// One-time listener
client.once('connect', () => {
  console.log('First connection established');
});
```

## Protocol Version Validation

The SDK validates that the client and server are using compatible protocol versions. This validation behavior differs by transport:

### Version Validation Timing

- **WebSocket Transport**: Version is validated **once per connection** when the first response message is received. After the initial validation, subsequent messages on the same connection skip version checking. This prevents repeated warnings for long-lived connections.

- **HTTP Transport**: Version is validated **once per request** (technically once per transport instance). Since HTTP is stateless, each request includes version information, but the transport only warns/errors on the first response to avoid log noise.

### Why Per-Connection, Not Per-Request?

This design is intentional for several reasons:

1. **Reduced log noise**: Long-lived WebSocket connections would otherwise generate warnings on every message
2. **Performance**: Skipping redundant validation on subsequent messages
3. **Practical compatibility**: Once a version mismatch is detected and logged, continuing to warn provides no additional value

**Important consideration**: If a server restarts with a different protocol version mid-session, the client will **not** detect this change on an existing connection because validation has already completed. To handle this scenario:

- For WebSocket: The connection will typically be closed when the server restarts, triggering reconnection and fresh validation
- For HTTP: Create a new transport instance to reset validation state

### Configuration

Configure version mismatch behavior when creating a transport:

```typescript
const transport = new WebSocketTransport({
  endpoint: 'wss://duck.do/v1/db',
  versionMismatchBehavior: 'warn'  // 'error' | 'warn' | 'ignore'
});
```

| Behavior | Description |
|----------|-------------|
| `'error'` | Throw `ProtocolVersionError` on mismatch (fail fast) |
| `'warn'` | Log a warning and continue (default) |
| `'ignore'` | Silently continue without any notification |

## Transports

The SDK includes two transport implementations for advanced use cases.

### Connection Pooling

**Connection pooling is not needed with this SDK.** The transport architecture is designed to efficiently manage connections without requiring a pool:

- **WebSocket Transport (default)**: Maintains a single persistent bidirectional connection that is multiplexed for all queries. Multiple concurrent queries share the same WebSocket connection with request/response correlation via unique message IDs. The connection includes automatic reconnection with exponential backoff, heartbeat/ping-pong for connection health monitoring, and proper cleanup on disconnect.

- **HTTP Transport (fallback)**: Each request is an independent, stateless HTTP call. There is no persistent connection to pool - each query creates a new HTTP request that completes independently. This is the standard HTTP request/response model where connection management is handled by the underlying HTTP client (which typically uses HTTP/2 connection reuse or HTTP/1.1 keep-alive automatically).

**Why traditional connection pooling doesn't apply:**

1. **WebSocket is inherently multiplexed**: Unlike traditional database drivers that need a pool of connections to handle concurrent queries, WebSocket allows many concurrent requests over a single connection. The SDK tracks pending requests with unique IDs and routes responses appropriately.

2. **HTTP is stateless by design**: HTTP transport makes independent requests without maintaining connection state. Modern HTTP clients already optimize connection reuse at the transport layer (TCP keep-alive, HTTP/2 multiplexing).

3. **Server-side connection management**: The DuckDB Durable Object on the server manages its own database connection. Client-side pooling would have no effect on server-side resource usage.

**For high-concurrency scenarios:**

```typescript
// Single client handles multiple concurrent queries efficiently
const client = new DuckDB({ endpoint: 'wss://duck.do/v1/db', token: 'token' });
await client.connect();

// All these queries share the same WebSocket connection
const results = await Promise.all([
  client.query('SELECT * FROM users'),
  client.query('SELECT * FROM orders'),
  client.query('SELECT * FROM products'),
]);
```

### WebSocketTransport

Default transport with full streaming support and automatic reconnection.

```typescript
import { WebSocketTransport } from 'duck.do';

const transport = new WebSocketTransport({
  endpoint: 'wss://duck.do/v1/db',
  token: 'your-api-token',
  connectTimeout: 10000,
  requestTimeout: 30000,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectBackoff: 1000,
  debug: false
});
```

### HttpTransport

Fallback transport for environments without WebSocket support. Does not support true streaming (results are returned in a single chunk).

```typescript
import { HttpTransport } from 'duck.do';

const transport = new HttpTransport({
  endpoint: 'https://duck.do/v1/db',
  token: 'your-api-token',
  connectTimeout: 10000,
  requestTimeout: 30000,
  debug: false
});
```

### CapnWebTransport (Experimental)

High-performance RPC transport using Cloudflare's [capnweb](https://github.com/cloudflare/capnweb) library. Provides promise pipelining for efficient batched operations. **Requires explicit instantiation** - it is not automatically selected by the client.

**Note:** This transport requires installing the `capnweb` package separately:

```bash
npm install capnweb
```

```typescript
import { CapnWebTransport, DuckDB } from 'duck.do';

// Create the CapnWeb transport explicitly
const transport = new CapnWebTransport({
  endpoint: 'wss://duck.do/v1/db',
  token: 'your-api-token',
  connectTimeout: 10000,
  requestTimeout: 30000,
  useHttpBatch: false, // Set to true for HTTP batch mode instead of WebSocket
  debug: false
});

// Connect the transport
await transport.connect();

// Use the transport directly for RPC calls
const result = await transport.send({
  type: 'query',
  id: '1',
  sql: 'SELECT * FROM users'
});
```

**CapnWeb Features:**

| Feature | Description |
|---------|-------------|
| Promise Pipelining | Chain multiple RPC calls without waiting for intermediate results |
| Bidirectional RPC | Server can call back to the client |
| HTTP Batch Mode | Batch multiple RPC calls into single HTTP requests for serverless environments |
| Automatic Serialization | Handles complex types (Date, BigInt, Uint8Array, Error) automatically |

**When to use CapnWebTransport:**

- You need promise pipelining for complex query chains
- Your server implements the `DuckDBRpcApi` interface via capnweb's `RpcTarget`
- You want bidirectional communication where the server can invoke client methods
- You are working in a serverless environment and prefer HTTP batching over WebSockets

## Types

All types are exported from the main package:

```typescript
import type {
  // Core types
  DuckDBTypeId,
  DuckDBType,
  ColumnInfo,
  TableInfo,

  // Query results
  QueryMeta,
  ExecuteResult,
  QueryResult,
  QueryChunk,

  // Parameters
  ParameterValue,

  // Prepared statements
  PreparedStatementHandle,
  PreparedStatement,

  // Appender
  AppenderHandle,
  AppenderFlushResult,
  Appender,

  // Configuration
  DuckDBConfig,
  ClientOptions,
  ConnectionState,
  ConnectionStatus,

  // Client interface
  DuckDBClient,

  // Events
  ClientEvents,
  EventListener,

  // Errors
  ErrorCode,
  ErrorInfo
} from 'duck.do';
```

### Error Classes

```typescript
import { DuckDBError, ConnectionError, QueryError } from 'duck.do';

try {
  await client.query('SELECT * FROM nonexistent');
} catch (error) {
  if (error instanceof QueryError) {
    console.error('Query failed:', error.message);
    console.error('Code:', error.code);        // 'SYNTAX_ERROR' | 'SEMANTIC_ERROR' | etc.
    console.error('Retryable:', error.retryable);
  } else if (error instanceof ConnectionError) {
    console.error('Connection failed:', error.message);
  } else if (error instanceof DuckDBError) {
    console.error('DuckDB error:', error.message);
  }
}
```

## DuckDB Configuration

Configure DuckDB settings when creating the client:

```typescript
const client = new DuckDB({
  endpoint: 'wss://duck.do/v1/db',
  token: 'your-api-token',
  config: {
    memory_limit: '2GB',
    threads: 4,
    enable_external_access: true,
    enable_object_cache: true,
    max_expression_depth: 1000
  }
});
```

## Security

### WebSocket Authentication

The client SDK uses **first-message authentication** over secure WebSocket connections (`wss://`). This approach is more secure than passing tokens in URL query parameters.

**How it works:**

1. The client establishes a WebSocket connection to the `wss://` endpoint
2. The TLS handshake encrypts all subsequent communication
3. The auth token is sent as the first message after the connection is established
4. The server validates the token and responds with an `auth_result` message
5. If authentication fails, the connection is closed with an appropriate error

**Why first-message auth is secure:**

- **All data is encrypted**: The auth token is transmitted over TLS/SSL encryption (via `wss://`), making it unreadable to network observers
- **Tokens stay out of URLs**: URL query parameters are often logged by proxies, load balancers, CDNs, and server access logs. First-message auth keeps tokens out of URLs entirely
- **No browser history exposure**: Tokens in URLs can appear in browser history and referrer headers
- **Industry standard**: This pattern is used by many real-time services including Slack, Discord, and Firebase

**Important security notes:**

- **Always use `wss://` in production** - The SDK will work with `ws://` but tokens will be transmitted in plaintext
- **Never log or expose tokens** - Treat auth tokens like passwords
- **Use short-lived tokens when possible** - Rotate tokens regularly and use expiring tokens for enhanced security

```typescript
// Secure: Token sent over encrypted wss:// connection
const client = new DuckDB({
  endpoint: 'wss://duck.do/v1/db',  // Always use wss:// in production
  token: 'your-api-token'
});

// The token is NOT included in the WebSocket URL
// It is sent as an encrypted message after the connection is established
await client.connect();
```

## Self-Hosted

To use with your own DuckDB Durable Object deployment:

```typescript
const client = new DuckDB({
  endpoint: 'wss://your-worker.your-account.workers.dev/ws',
  // No token needed for your own deployment
});
```

## Testing

### Mock-Based Transport Testing

The duck-do client SDK uses **mock-based testing** for all transport implementations. This is a deliberate design choice:

- **HTTPTransport** and **WebSocketTransport** tests use mocked network responses
- Tests verify protocol compliance, error handling, and message serialization
- Real network communication is tested only in E2E tests against deployed infrastructure

**Why mocks are used:**

1. **Deterministic tests**: Network conditions vary; mocks provide consistent behavior
2. **No external dependencies**: Tests run without requiring a running server
3. **Fast execution**: Mock tests complete in milliseconds vs. seconds for real connections
4. **Isolation**: Tests can verify specific scenarios (timeouts, errors, reconnection) that are hard to reproduce reliably with real networks

**Testing gaps (documented as future improvements):**

| Gap | Description | Issue |
|-----|-------------|-------|
| Real network communication | All transports use mocks | duckdb-vnkn |
| HTTP timeout/failure tests | Network failure scenarios in E2E | duckdb-8iuu |

For production validation, test against deployed Workers:

```bash
# Deploy your DuckDB Worker
wrangler deploy

# Run E2E tests against deployed infrastructure
cd packages/e2e && pnpm test
```

## Troubleshooting

### Connection Issues

#### "Connection timed out" during connect()

The WebSocket connection could not be established within the timeout period.

**Solutions:**

1. **Increase connection timeout:**
   ```typescript
   const client = new DuckDB({
     endpoint: 'wss://duck.do/v1/db',
     token: 'your-token',
     connectTimeout: 30000  // 30 seconds
   });
   ```

2. **Check endpoint URL:** Ensure the endpoint is correct and accessible:
   - Use `wss://` for secure connections (required in production)
   - Verify the path matches your server configuration

3. **Check network/firewall:** WebSocket connections may be blocked by:
   - Corporate firewalls
   - Proxy servers that don't support WebSocket upgrades
   - Browser extensions

4. **Try HTTP fallback:**
   ```typescript
   const client = new DuckDB({
     endpoint: 'https://duck.do/v1/db',
     transport: 'http'
   });
   ```

#### "Authentication failed"

The server rejected the authentication token.

**Solutions:**
1. Verify the token is correct and not expired
2. Check that the token has appropriate permissions
3. Ensure you're using `wss://` (not `ws://`) to prevent token interception

#### Connection drops frequently

**Solutions:**

1. **Enable auto-reconnect (default):**
   ```typescript
   const client = new DuckDB({
     endpoint: 'wss://duck.do/v1/db',
     autoReconnect: true,
     maxReconnectAttempts: 10,
     reconnectBackoff: 2000  // Start with 2s backoff
   });
   ```

2. **Monitor connection events:**
   ```typescript
   client.on('disconnect', ({ reason, code }) => {
     console.log(`Disconnected: ${reason} (${code})`);
   });

   client.on('reconnecting', ({ attempt, maxAttempts }) => {
     console.log(`Reconnect attempt ${attempt}/${maxAttempts}`);
   });
   ```

3. **Handle reconnection in your application:**
   ```typescript
   client.on('connect', () => {
     // Re-prepare statements after reconnection
     refreshPreparedStatements();
   });
   ```

#### "WebSocket is not defined"

You're running in an environment without native WebSocket support.

**Solutions:**

1. **Use HTTP transport:**
   ```typescript
   const client = new DuckDB({
     endpoint: 'https://duck.do/v1/db',
     transport: 'http'
   });
   ```

2. **Install a WebSocket polyfill (Node.js):**
   ```bash
   npm install ws
   ```
   ```typescript
   import WebSocket from 'ws';
   globalThis.WebSocket = WebSocket;
   ```

### Timeout Handling

#### Query timeouts

Queries exceeding the timeout period will throw an error, but the query may continue running server-side.

**Understanding timeout behavior:**
- Client receives a timeout error immediately
- Server-side query continues until completion (DuckDB WASM limitation)
- Cloudflare Workers' 30-second CPU limit is the ultimate backstop

**Solutions:**

1. **Increase query timeout for long-running queries:**
   ```typescript
   const client = new DuckDB({
     endpoint: 'wss://duck.do/v1/db',
     queryTimeout: 60000  // 60 seconds
   });
   ```

2. **Use LIMIT clauses to bound result sizes:**
   ```typescript
   await client.query('SELECT * FROM events LIMIT 10000');
   ```

3. **Stream large results instead of loading all at once:**
   ```typescript
   for await (const chunk of client.stream('SELECT * FROM events')) {
     // Process incrementally
   }
   ```

4. **Optimize queries with proper indexes and WHERE clauses**

#### Streaming timeouts

When streaming large results, individual chunk fetches may timeout.

**Solutions:**
```typescript
// Monitor streaming progress
for await (const chunk of client.stream('SELECT * FROM large_table')) {
  console.log(`Received ${chunk.rowsSoFar} rows, hasMore: ${chunk.hasMore}`);
  await processChunk(chunk.rows);
}
```

### Transport Selection

#### When to use WebSocket (default)

WebSocket is recommended for most use cases:
- Long-running queries
- Streaming results
- Multiple concurrent queries
- Real-time applications

```typescript
const client = new DuckDB({
  endpoint: 'wss://duck.do/v1/db',
  transport: 'websocket'  // Default
});
```

#### When to use HTTP

Use HTTP transport when:
- WebSocket is blocked by network policies
- Running in serverless environments with short-lived connections
- Simple request/response patterns suffice
- Debugging connection issues

```typescript
const client = new DuckDB({
  endpoint: 'https://duck.do/v1/db',
  transport: 'http'
});
```

**HTTP limitations:**
- No true streaming (results returned in single response)
- Higher latency for multiple sequential queries
- No persistent connection benefits

#### When to use CapnWeb (experimental)

Use CapnWeb for advanced scenarios:
- Promise pipelining for complex query chains
- Bidirectional RPC requirements
- HTTP batch mode in serverless environments

```typescript
import { CapnWebTransport, DuckDB } from 'duck.do';

const transport = new CapnWebTransport({
  endpoint: 'wss://duck.do/v1/db',
  useHttpBatch: true  // For serverless
});
```

**Note:** Requires `npm install capnweb` separately.

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection timeout` | Server unreachable or slow | Increase `connectTimeout`, check network |
| `Query timeout` | Query took too long | Increase `queryTimeout`, optimize query |
| `Authentication failed` | Invalid or expired token | Check token validity |
| `WebSocket closed unexpectedly` | Network issue or server restart | Enable `autoReconnect` |
| `Statement not found` | Server hibernated | Re-prepare statements (see Prepared Statements section) |
| `Protocol version mismatch` | Client/server version incompatible | Update client or check `versionMismatchBehavior` |
| `Transport not connected` | Called query before connect() | Ensure `await client.connect()` completes |

### Debugging

Enable debug logging to troubleshoot issues:

```typescript
const client = new DuckDB({
  endpoint: 'wss://duck.do/v1/db',
  token: 'your-token',
  debug: true  // Enables verbose logging
});

// Monitor all events
client.on('queryStart', ({ queryId, sql }) => {
  console.log(`[${queryId}] Starting: ${sql}`);
});

client.on('queryEnd', ({ queryId, duration }) => {
  console.log(`[${queryId}] Completed in ${duration}ms`);
});

client.on('error', (error) => {
  console.error('Client error:', error);
});
```

### Performance Tips

1. **Reuse client instances:** Don't create a new client for each query
2. **Use prepared statements:** For repeated queries with different parameters
3. **Stream large results:** Avoid loading millions of rows into memory
4. **Batch operations:** Use `executeMany()` for multiple related statements
5. **Monitor connection state:** Use `client.getStatus()` to check health

## Related Packages

- [`@dotdo/duckdb`](https://www.npmjs.com/package/@dotdo/duckdb) - DuckDB for Cloudflare Workers (WASM, DO, Containers)

## License

MIT
