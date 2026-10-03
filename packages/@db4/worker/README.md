---
name: "@db4/worker"
version: 0.1.2
description: Cloudflare Worker runtime for db4 - deploy your database to the edge with zero configuration
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - cloudflare
  - workers
  - durable-objects
  - edge-database
  - serverless
downloads:
  monthly: 18
published: "2026-01-23T17:20:58.418Z"
updated: "2026-01-23T17:20:58.726Z"
---

# @db4/worker

[![npm version](https://img.shields.io/npm/v/@db4/worker.svg)](https://www.npmjs.com/package/@db4/worker)
[![license](https://img.shields.io/npm/l/@db4/worker.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/worker), [npm](https://www.npmjs.com/package/@db4/worker))

Cloudflare Worker runtime for db4 - deploy your database to the edge with zero configuration.

## Description

`@db4/worker` is the Cloudflare Worker runtime for db4, enabling deployment of your database to the edge with zero configuration. It provides a complete db4 runtime with automatic Durable Object coordination, built-in WebSocket support for real-time subscriptions, and geographic routing for low-latency access.

## Features

- Complete db4 runtime for Cloudflare Workers
- Automatic Durable Object coordination
- Built-in WebSocket support for real-time subscriptions
- Geographic routing for low-latency access
- Automatic failover and replication

## Installation

```bash
npm install @db4/worker
```

## Usage

```typescript
// src/index.ts
import { createDB4Worker } from '@db4/worker'
import schema from './schema'

const { worker, DB4DO } = createDB4Worker({ schema })

export default worker
export { DB4DO }
```

## Wrangler Configuration

```toml
# wrangler.toml
name = "my-db4"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [
  { name = "DB4_DO", class_name = "DB4DO" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["DB4DO"]

[vars]
DB4_SCHEMA = "User { id! name! email! }"

# R2 bucket for cold storage (optional)
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "db4-storage"

# Cache API for warm tier
# (automatically available, no config needed)
```

## Durable Object Bindings

The worker uses a single Durable Object binding with automatic sharding:

| Binding | Purpose |
|---------|---------|
| `DB4_DO` | Document storage with SQLite backing |

Sharding is handled automatically based on collection and document ID prefixes.

## API

Worker creation and configuration:

```typescript
function createDB4Worker(config: WorkerConfig): { worker: ExportedHandler; DB4DO: DurableObjectClass };
```

### HTTP Endpoints

The worker exposes these HTTP endpoints:

```
GET    /health                    Health check
POST   /api/:collection           Create document
GET    /api/:collection           List/query documents
GET    /api/:collection/:id       Get document by ID
PUT    /api/:collection/:id       Update document
PATCH  /api/:collection/:id       Partial update document
DELETE /api/:collection/:id       Delete document
POST   /api/:collection/query     Execute complex query
POST   /api/:collection/stream    Streaming query (NDJSON)
POST   /api/:collection/batch     Batch create documents
PATCH  /api/:collection/batch     Batch update documents
DELETE /api/:collection/batch     Batch delete documents
POST   /batch                     Execute batch operations
POST   /rpc                       RPC endpoint
GET    /ws                        WebSocket for subscriptions
GET    /subscribe                 WebSocket for subscriptions (alias)
POST   /graphql                   GraphQL endpoint
GET    /graphql/schema            GraphQL schema introspection
```

## Configuration Options

```typescript
const { worker, DB4DO } = createDB4Worker({
  // Required: IceType schema
  schema: schemaDefinition,

  // Optional: Middleware
  middleware: [
    loggingMiddleware,
    rateLimitMiddleware
  ]
})
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB4_API_KEY` | API key for authentication |
| `DB4_SCHEMA` | Inline schema definition |
| `DB4_LOG_LEVEL` | Logging verbosity (debug/info/warn/error) |

## Deployment

```bash
# Development
wrangler dev

# Production
wrangler deploy

# With secrets
wrangler secret put DB4_API_KEY
```

## Custom Request Handling

```typescript
import { createDB4Worker } from '@db4/worker'

const { worker, DB4DO } = createDB4Worker({ schema })

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

    // Custom routes
    if (url.pathname === '/custom') {
      return new Response('Custom response')
    }

    // Default db4 handling
    return worker.fetch(request, env, ctx)
  }
}

export { DB4DO }
```

## Performance

Benchmarked throughput on Cloudflare Workers:

| Workload | Throughput |
|----------|------------|
| Mixed OLTP | 70 ops/sec |
| Batch operations | 1,970 docs/sec |
| Point reads | 90 ops/sec |

Performance scales with Durable Object distribution. Batch operations benefit from reduced round-trip overhead by grouping multiple document writes into single transactions.

## Documentation

For complete documentation, visit [db4.dev/docs/worker](https://db4.dev/docs/worker)

## Related Packages

- [@db4/db4ai](../db4ai) - Main client SDK
- [@db4/schema](../schema) - IceType schema compiler
- [@db4/do](../do) - Durable Object implementation
- [@db4/query](../query) - Query planning and execution
- [@db4/storage](../storage) - Three-tier storage abstraction

## See Also

- [@db4/cli](../cli) - CLI tools for development and deployment
- [@db4/rest](../rest) - REST API with HTTP endpoints
- [@db4/auth](../auth) - Authentication and authorization

## License

MIT
