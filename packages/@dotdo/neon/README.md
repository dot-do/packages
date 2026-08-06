---
name: "@dotdo/neon"
version: 0.1.1
description: "Neon-compatible client for postgres.do - drop-in replacement for @neondatabase/serverless"
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - neon
  - neondatabase
  - postgres
  - postgresql
  - serverless
  - cloudflare
  - workers
  - compatibility
downloads:
  monthly: 29
published: "2026-01-22T15:58:45.898Z"
updated: "2026-01-24T15:49:06.245Z"
---

# @dotdo/neon

> Drop-in replacement for @neondatabase/serverless. Same API, edge-native performance.

**Already using Neon? Just change this line:**

```typescript
// Before
import { neon } from '@neondatabase/serverless'

// After
import { neon } from '@dotdo/neon'
```

That's it. Your code just works, now running on Cloudflare's edge.

---

## The Problem

You chose Neon for its serverless PostgreSQL promise. The API was clean, cold starts were acceptable, and your team shipped fast.

Then came the trade-offs:

- **External:** Migration to anything else means rewriting queries
- **Internal:** You don't want to refactor a working codebase
- **Philosophical:** You shouldn't have to choose between great DX and great performance

Your database sits in one region. Your users are everywhere. Every query travels hundreds of milliseconds. Your bills keep climbing.

---

## The Guide

**@dotdo/neon** is a drop-in compatibility layer that routes your existing Neon code to postgres.do - PostgreSQL running in Cloudflare Durable Objects at the edge.

No API changes. No query rewrites. Just swap the import.

---

## The Plan

### Step 1: Install

```bash
npm install @dotdo/neon
```

### Step 2: Update Imports

Find and replace across your codebase:

```typescript
// Before
import { neon, neonConfig, Pool, Client } from '@neondatabase/serverless'

// After
import { neon, neonConfig, Pool, Client } from '@dotdo/neon'
```

### Step 3: Update Connection URL

```typescript
// Before (Neon)
const sql = neon('postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb')

// After (postgres.do)
const sql = neon('postgres://db.postgres.do/mydb')
```

**Done.** Every query you've written works unchanged.

---

## Success: What You Get

| Before (Neon) | After (@dotdo/neon) |
|---------------|---------------------|
| Regional database | Edge database in 300+ locations |
| Pay per query | FREE reads via Cloudflare Cache |
| 50-200ms latency | Sub-10ms from the edge |
| Vendor lock-in | Standard PostgreSQL |

---

## Avoid the Failure

Without action:

- Monthly bills keep climbing with every query
- Users experience latency you can't optimize away
- Migration gets harder as your codebase grows
- You remain locked into a single vendor's pricing decisions

---

## API Compatibility

### Tagged Template Queries

```typescript
import { neon } from '@dotdo/neon'

const sql = neon('postgres://db.postgres.do/mydb')

// Tagged template queries - works exactly like Neon
const users = await sql`SELECT * FROM users`

// Parameters are SQL injection safe
const user = await sql`SELECT * FROM users WHERE id = ${userId}`

// Full results with column metadata
const sqlFull = neon('postgres://...', { fullResults: true })
const result = await sqlFull`SELECT * FROM users`
console.log(result.fields)  // Column metadata
console.log(result.rows)    // Data rows
```

### Transactions

```typescript
const sql = neon('postgres://db.postgres.do/mydb')

// Transaction callback syntax
const result = await sql.transaction([
  sql`INSERT INTO users (name) VALUES ('Alice')`,
  sql`INSERT INTO audit_log (action) VALUES ('user_created')`,
])

// With isolation level
const result = await sql.transaction(
  [
    sql`UPDATE accounts SET balance = balance - 100 WHERE id = 1`,
    sql`UPDATE accounts SET balance = balance + 100 WHERE id = 2`,
  ],
  { isolationLevel: 'Serializable' }
)
```

### Connection Pool

```typescript
import { Pool } from '@dotdo/neon'

const pool = new Pool({
  connectionString: 'postgres://db.postgres.do/mydb'
})

const client = await pool.connect()
try {
  const result = await client.query('SELECT * FROM users')
  console.log(result.rows)
} finally {
  client.release()
}
```

### Single Client Connection

```typescript
import { Client } from '@dotdo/neon'

const client = new Client({
  connectionString: 'postgres://db.postgres.do/mydb'
})

await client.connect()
const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])
await client.end()
```

### Global Configuration

```typescript
import { neonConfig } from '@dotdo/neon'

// WebSocket constructor for Node.js environments
import ws from 'ws'
neonConfig.webSocketConstructor = ws

// Custom fetch implementation
neonConfig.fetchFunction = customFetch

// Custom endpoint transformation
neonConfig.fetchEndpoint = (host, port) => `https://custom.postgres.do/sql`
```

---

## Feature Compatibility Matrix

| Feature | @neondatabase/serverless | @dotdo/neon |
|---------|--------------------------|-------------|
| `neon()` tagged templates | Yes | Yes |
| `neon().transaction()` | Yes | Yes |
| `fullResults` option | Yes | Yes |
| `arrayMode` option | Yes | Yes |
| `authToken` option | Yes | Yes |
| `Pool` class | Yes | Yes |
| `Client` class | Yes | Yes |
| `neonConfig` settings | Yes | Yes |
| `NeonDbError` | Yes | Yes |
| TypeScript types | Yes | Yes |

---

## TypeScript Support

Full type definitions included:

```typescript
import type {
  NeonQueryFunction,
  FullQueryResults,
  Field,
  HTTPQueryOptions,
  HTTPTransactionOptions,
  PoolConfig,
  ClientConfig,
  QueryResult,
  QueryConfig,
  CustomTypesConfig,
  NeonConfigType,
} from '@dotdo/neon'

// NeonDbError for error handling
import { NeonDbError } from '@dotdo/neon'
```

---

## API Reference

### `neon(connectionString, options?)`

Create an HTTP query function.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fullResults` | `boolean` | `false` | Return fields metadata with rows |
| `arrayMode` | `boolean` | `false` | Return rows as arrays |
| `fetchOptions` | `RequestInit` | - | Custom fetch options |
| `authToken` | `string \| () => string \| Promise<string>` | - | JWT for authorization |

### `Pool(config)`

Create a connection pool.

| Option | Type | Description |
|--------|------|-------------|
| `connectionString` | `string` | Database URL |
| `max` | `number` | Maximum pool size |

### `Client(config)`

Create a single connection.

| Option | Type | Description |
|--------|------|-------------|
| `connectionString` | `string` | Database URL |

### `neonConfig`

Global configuration object.

| Property | Type | Description |
|----------|------|-------------|
| `webSocketConstructor` | `typeof WebSocket` | WebSocket implementation |
| `fetchFunction` | `typeof fetch` | Custom fetch implementation |
| `fetchEndpoint` | `(host, port, options?) => string` | Endpoint transformation |
| `wsProxy` | `string \| ((host, port) => string)` | WebSocket proxy |
| `poolQueryViaFetch` | `boolean` | Route Pool queries via HTTP |

---

## Part of postgres.do

@dotdo/neon is part of the [postgres.do](https://github.com/dot-do/postgres) ecosystem - PostgreSQL at the edge.

| Package | Description |
|---------|-------------|
| [`postgres.do`](https://github.com/dot-do/postgres/tree/main/packages/postgres.do) | SQL tagged template client |
| [`@dotdo/postgres`](https://github.com/dot-do/postgres/tree/main/packages/postgres) | Edge PostgreSQL server |
| [`@dotdo/supabase`](https://github.com/dot-do/postgres/tree/main/packages/supabase) | Supabase-compatible client |
| [`@dotdo/mongodb`](https://github.com/dot-do/postgres/tree/main/packages/mongodb) | MongoDB-compatible client |

---

## Links

- [Documentation](https://postgres.do/docs/neon)
- [GitHub](https://github.com/dot-do/postgres)
- [Neon API Reference](https://neon.tech/docs/serverless/serverless-driver) (for API compatibility)

## License

MIT
