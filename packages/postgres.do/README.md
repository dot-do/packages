---
name: postgres.do
version: 0.1.2
description: PostgreSQL for Cloudflare Workers - sql tagged template client with Drizzle ORM support
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://postgres.do"
keywords:
  - postgres
  - postgresql
  - cloudflare
  - workers
  - sql
  - database
  - drizzle
  - tagged-template
  - serverless
  - pglite
  - wasm
downloads:
  monthly: 26
published: "2026-01-22T15:59:15.325Z"
updated: "2026-01-24T17:13:22.421Z"
---

# postgres.do

> Deploy PostgreSQL to the edge in seconds. Full CLI and SQL client.

[![npm version](https://img.shields.io/npm/v/postgres.do.svg)](https://www.npmjs.com/package/postgres.do)
[![npm downloads](https://img.shields.io/npm/dm/postgres.do.svg)](https://www.npmjs.com/package/postgres.do)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

```typescript
import postgres from 'postgres.do'

const sql = postgres('https://db.postgres.do/mydb')
const users = await sql`SELECT * FROM users WHERE active = ${true}`
```

SQL injection safe. Works everywhere. Zero config.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [CLI](#cli)
- [Why postgres.do?](#why-postgresdo)
- [SQL Client Features](#sql-client-features)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Related Packages](#related-packages)

## Installation

```bash
npm install postgres.do
```

Or with your preferred package manager:

```bash
# yarn
yarn add postgres.do

# pnpm
pnpm add postgres.do

# bun
bun add postgres.do
```

### Requirements

- **Node.js 18+** (for local development and CLI)
- Works in all modern runtimes: Cloudflare Workers, Vercel Edge, Deno, Bun, browsers

### Optional Dependencies

For local development with PGLite:

```bash
npm install @dotdo/pglite
```

For Drizzle ORM integration:

```bash
npm install drizzle-orm
```

## Quick Start

### 1. Install

```bash
npm install postgres.do
```

### 2. Query

```typescript
import postgres from 'postgres.do'

const sql = postgres('https://db.postgres.do/mydb')

// Tagged template queries (SQL injection safe)
const users = await sql`SELECT * FROM users WHERE id = ${userId}`

// Transactions
const result = await sql.begin(async (tx) => {
  await tx`INSERT INTO orders (user_id) VALUES (${userId})`
  return tx`SELECT * FROM orders WHERE user_id = ${userId}`
})
```

That's it. No connection strings. No poolers. No cold starts.

## The Problem

You need a database for your edge application. But:

- **Setting up PostgreSQL** means provisioning servers, configuring networking, managing backups
- **Using managed databases** means 100ms+ latency from edge locations and connection limits
- **Serverless databases** charge per query and still require connection string management

You just want to write `SELECT * FROM users` and have it work. Fast.

## The Solution

**postgres.do** is a complete PostgreSQL solution for the edge:

1. **SQL Client** - Tagged template literals for safe, ergonomic queries
2. **CLI** - Create, manage, migrate, and deploy databases from your terminal
3. **Edge Runtime** - Works in Cloudflare Workers, Vercel Edge, Deno, Bun, and browsers

```
Your Code                postgres.do                  Cloudflare Edge
+----------+            +------------+            +------------------+
|   sql`   |  ------>   |   Client   |  ------>   |   PostgresDO     |
| SELECT   |    HTTP    |   (this    |            |   (PGLite in     |
|   ...`   |    or WS   |   package) |            |   Durable Object)|
+----------+            +------------+            +------------------+
```

## CLI

The `postgres.do` CLI manages your entire database lifecycle:

### Database Management

```bash
# Create a new database
postgres.do create mydb

# List all databases
postgres.do list

# Get database info
postgres.do info mydb

# Delete a database
postgres.do delete mydb --force
```

### Local Development

```bash
# Start local dev server with PGLite
postgres.do dev

# Reset local database
postgres.do dev:reset

# Run with seed data
postgres.do dev --seed
```

### Migrations

```bash
# Create a migration
postgres.do migrate:create add_users_table

# Run pending migrations
postgres.do migrate

# Check migration status
postgres.do migrate:status

# Rollback last migration
postgres.do migrate:rollback

# Preview without applying
postgres.do migrate:dry-run
```

### Schema Management

```bash
# Generate Drizzle schema from existing database
postgres.do introspect --url $DATABASE_URL --output ./schema.ts

# Compare two schemas
postgres.do schema:diff --from $LOCAL_URL --to $PROD_URL

# Pull remote schema to local file
postgres.do schema:pull --url $DATABASE_URL

# Push local schema to database
postgres.do schema:push --input ./schema.ts
```

### Backup and Restore

```bash
# Create backup
postgres.do backup mydb -o backup.sql

# List backups
postgres.do backup:list mydb

# Restore from backup
postgres.do restore backup.sql --database mydb

# Clone a database
postgres.do clone production staging
```

### Interactive Shell

```bash
# Start SQL REPL
postgres.do shell mydb

# Execute single command
postgres.do shell mydb -c "SELECT * FROM users"

# Execute from file
postgres.do shell mydb -f queries.sql
```

### Logs

```bash
# View logs
postgres.do logs mydb

# Follow logs in real-time
postgres.do logs mydb --tail

# Filter by level
postgres.do logs mydb --level error
```

## Why postgres.do?

| Feature | postgres.do | Traditional Setup |
|---------|-------------|-------------------|
| **Setup time** | 10 seconds | Hours to days |
| **Latency** | <10ms (edge) | 50-200ms (regional) |
| **SQL injection** | Impossible | Manual prevention |
| **Connection management** | Automatic | Pool configuration |
| **Local development** | `postgres.do dev` | Docker + config |
| **Migrations** | Built-in CLI | Third-party tools |

## SQL Client Features

### Tagged Template Literals

SQL injection is impossible by design:

```typescript
// Safe - values are parameterized automatically
const users = await sql`SELECT * FROM users WHERE id = ${userId}`

// Multiple parameters work seamlessly
const users = await sql`
  SELECT * FROM users
  WHERE status = ${status}
  AND created_at > ${startDate}
`

// Use sql() helper for arrays in IN clauses
const ids = [1, 2, 3]
const users = await sql`SELECT * FROM users WHERE id IN ${sql(ids)}`

// Dynamic column selection
const columns = ['id', 'name', 'email']
const users = await sql`SELECT ${sql(columns)} FROM users`
```

### Transactions

Automatic rollback on error:

```typescript
const result = await sql.begin(async (tx) => {
  await tx`INSERT INTO orders (user_id, total) VALUES (${userId}, ${total})`
  await tx`UPDATE inventory SET stock = stock - 1 WHERE id = ${productId}`
  return tx`SELECT * FROM orders WHERE user_id = ${userId}`
})

// With transaction options
const result = await sql.begin(async (tx) => {
  return tx`SELECT * FROM orders`
}, {
  isolationLevel: 'serializable',
  readOnly: true
})

// Nested savepoints
const result = await sql.begin(async (tx) => {
  await tx`INSERT INTO users (name) VALUES ('Alice')`

  await tx.savepoint(async (sp) => {
    await sp`INSERT INTO orders (user_id) VALUES (1)`
    // If this throws, only the savepoint is rolled back
  })

  return tx`SELECT * FROM users`
})
```

### Type Parsing

Automatic conversion for PostgreSQL types:

```typescript
const [row] = await sql`SELECT
  created_at,  -- Date object
  is_active,   -- boolean
  metadata,    -- parsed JSON object (JSONB)
  big_number   -- BigInt for int8
FROM users WHERE id = 1`

// Supported automatic type conversions:
// - Boolean (bool)           -> boolean
// - Integer (int2, int4)     -> number
// - BigInt (int8)            -> BigInt
// - Float (float4, float8)   -> number
// - Numeric (numeric)        -> number
// - Timestamp (timestamp)    -> Date
// - Timestamptz (timestamptz)-> Date
// - JSON/JSONB               -> parsed object/array
```

### Custom Type Parsers

Override default type parsing:

```typescript
const sql = postgres({
  url: 'https://db.postgres.do/mydb',
  parsers: {
    // OID 1082 = date type - return as string instead of Date
    1082: (value) => value,
    // OID 1700 = numeric type - use decimal.js for precision
    1700: (value) => new Decimal(value),
  }
})
```

### Raw SQL Queries

For dynamic queries or ORM integration:

```typescript
// Execute raw SQL with parameters
const users = await sql.unsafe(
  'SELECT * FROM users WHERE status = $1 AND role = $2',
  ['active', 'admin']
)

// Useful for dynamic table names (be careful with user input!)
const tableName = 'users' // validated elsewhere
const rows = await sql.unsafe(`SELECT * FROM ${tableName}`)
```

### Transport Options

```typescript
// HTTP (default) - Best for serverless, stateless requests
const sql = postgres({ url: 'https://db.postgres.do/mydb' })

// WebSocket - Best for high-throughput, persistent connections
const sql = postgres({
  url: 'https://db.postgres.do/mydb',
  transport: 'ws'
})

// With full configuration
const sql = postgres({
  url: 'https://db.postgres.do/mydb',
  transport: 'ws',
  apiKey: process.env.POSTGRES_API_KEY,
  connectTimeout: 5000,  // 5 second connection timeout
  queryTimeout: 30000,   // 30 second query timeout
})
```

### Drizzle ORM Integration

Drop-in compatible with Drizzle:

```typescript
import postgres from 'postgres.do'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const sql = postgres('https://db.postgres.do/mydb')
const db = drizzle(sql, { schema })

// Use Drizzle's type-safe query builder
const users = await db.select().from(schema.users)

// Transactions work seamlessly
await db.transaction(async (tx) => {
  await tx.insert(schema.users).values({ name: 'Alice' })
  await tx.insert(schema.orders).values({ userId: 1 })
})
```

## Error Handling

```typescript
import { PostgresError, ConnectionError, TimeoutError } from 'postgres.do'

try {
  await sql`INSERT INTO users (email) VALUES (${email})`
} catch (e) {
  if (e instanceof PostgresError) {
    // Standard PostgreSQL error fields
    console.log(e.code)       // '23505' (unique_violation)
    console.log(e.message)    // 'duplicate key value violates unique constraint'
    console.log(e.severity)   // 'ERROR'
    console.log(e.detail)     // 'Key (email)=(foo@bar.com) already exists.'
    console.log(e.hint)       // Suggestion for fixing the error (if any)
    console.log(e.constraint) // 'users_email_key'
    console.log(e.table)      // 'users'
    console.log(e.column)     // 'email'
  } else if (e instanceof ConnectionError) {
    console.log('Failed to connect:', e.message)
  } else if (e instanceof TimeoutError) {
    console.log('Query timed out:', e.message)
  }
}

// Handle specific PostgreSQL error codes
try {
  await sql`INSERT INTO users (email) VALUES (${email})`
} catch (e) {
  if (e instanceof PostgresError && e.code === '23505') {
    // Handle duplicate key error
    return { error: 'Email already exists' }
  }
  throw e // Re-throw other errors
}
```

## Authentication

Integrate with [oauth.do](https://oauth.do) for user-scoped databases:

```typescript
import { createAuthenticatedClient, withAuth } from 'postgres.do'

// Option 1: Create client with token
const sql = createAuthenticatedClient(token, {
  url: 'https://db.postgres.do/mydb'
})

// Option 2: Wrap your handler
export default {
  fetch: withAuth(async (request, { user, sql }) => {
    const data = await sql`SELECT * FROM my_table`
    return Response.json({ user, data })
  })
}
```

## API Reference

### `postgres(url?, options?)`

Create a PostgreSQL client.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | - | Connection URL (https:// or postgres://) |
| `transport` | `'http' \| 'ws'` | `'http'` | Transport protocol |
| `apiKey` | `string` | - | API key for authentication |
| `connectTimeout` | `number` | `10000` | Connection timeout in ms |
| `queryTimeout` | `number` | `30000` | Query timeout in ms |

### `sql\`query\``

Execute a tagged template query. Returns `Promise<Row[]>`.

### `sql(value)`

Helper for dynamic values in tagged templates (arrays, identifiers).

### `sql.begin(fn, options?)`

Start a transaction. Callback receives transaction-scoped sql.

| Option | Type | Description |
|--------|------|-------------|
| `isolationLevel` | `string` | Transaction isolation level |
| `readOnly` | `boolean` | Read-only transaction |

### `sql.unsafe(query, params?)`

Execute raw SQL. Use with caution - does not prevent SQL injection.

### `sql.end()`

Close the connection and release resources.

## Troubleshooting

### Connection Issues

**Problem:** `ConnectionError: Failed to connect to database`

1. **Check the URL format**: Ensure your URL is valid (`https://db.postgres.do/mydb` or `postgres://db.postgres.do/mydb`)
2. **Verify network access**: Ensure your environment can reach `db.postgres.do`
3. **Check API key**: If using authentication, verify your API key is correct

```typescript
// Debug connection issues
const sql = postgres({
  url: 'https://db.postgres.do/mydb',
  connectTimeout: 5000  // Reduce timeout for faster feedback
})
```

### Query Timeouts

**Problem:** `TimeoutError: Query timed out`

1. **Long-running queries**: Increase the query timeout for complex operations
2. **Large result sets**: Use pagination or streaming for large datasets
3. **Index optimization**: Ensure proper indexes exist for your queries

```typescript
const sql = postgres({
  url: 'https://db.postgres.do/mydb',
  queryTimeout: 60000  // 60 second timeout for complex queries
})

// Use LIMIT for large tables
const users = await sql`SELECT * FROM users LIMIT 100 OFFSET ${page * 100}`
```

### SQL Errors

**Problem:** `PostgresError: relation "users" does not exist`

1. **Table doesn't exist**: Run migrations to create the table
2. **Schema mismatch**: Verify you're connected to the correct database
3. **Case sensitivity**: PostgreSQL lowercases unquoted identifiers

```bash
# Check migration status
postgres.do migrate:status

# Run pending migrations
postgres.do migrate
```

### WebSocket Connection Drops

**Problem:** WebSocket connection frequently disconnects

1. **Network instability**: WebSocket requires stable connection
2. **Idle timeout**: Connections may close after inactivity
3. **Consider HTTP**: For infrequent queries, HTTP transport may be more reliable

```typescript
// Fall back to HTTP if WebSocket fails
const sql = postgres({
  url: 'https://db.postgres.do/mydb',
  transport: 'http'  // More reliable for unstable networks
})
```

### Type Parsing Issues

**Problem:** Dates or JSON not parsing correctly

1. **Custom parsers**: Override default parsing behavior
2. **Check column types**: Ensure PostgreSQL types match expectations

```typescript
const sql = postgres({
  url: 'https://db.postgres.do/mydb',
  parsers: {
    // Return dates as ISO strings instead of Date objects
    1082: (value) => value,
    1114: (value) => value,
    1184: (value) => value,
  }
})
```

### Memory Issues in Local Development

**Problem:** PGLite consuming too much memory

1. **Close connections**: Always call `sql.end()` when done
2. **Limit concurrent queries**: Don't run too many queries in parallel
3. **Restart dev server**: `postgres.do dev:reset` to clear state

```typescript
// Always close connections
const sql = postgres('https://db.postgres.do/mydb')
try {
  const users = await sql`SELECT * FROM users`
  return users
} finally {
  await sql.end()
}
```

### CLI Not Found

**Problem:** `command not found: postgres.do`

1. **Installation**: Ensure package is installed globally or locally
2. **Path issues**: Use npx for local installations

```bash
# Global installation
npm install -g postgres.do
postgres.do --help

# Local installation (use npx)
npm install postgres.do
npx postgres.do --help

# Or add to package.json scripts
# "scripts": { "db": "postgres.do" }
npm run db -- --help
```

## Related Packages

- [`@dotdo/postgres`](../postgres) - PostgreSQL Durable Object server
- [`@dotdo/pglite`](../pglite) - PGLite fork for Cloudflare Workers
- [`@dotdo/neon`](../neon) - Neon-compatible API
- [`@dotdo/supabase`](../supabase) - Supabase-compatible API
- [`@dotdo/mongodb`](../mongodb) - MongoDB-compatible document API

## Links

- [Documentation](https://postgres.do/docs)
- [GitHub](https://github.com/dot-do/postgres)
- [Discord](https://discord.gg/postgres-do)

## License

MIT
