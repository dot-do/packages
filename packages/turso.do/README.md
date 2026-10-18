---
name: turso.do
version: 0.0.1
description: Managed service client for Turso-compatible SQLite on Cloudflare
license: MIT
keywords:
  - turso
  - libsql
  - sqlite
  - cloudflare
  - durable-objects
  - managed-service
downloads:
  monthly: 6
published: "2026-01-22T11:02:55.611Z"
updated: "2026-01-22T11:02:55.820Z"
---

# turso.do

[![npm version](https://img.shields.io/npm/v/turso.do.svg)](https://www.npmjs.com/package/turso.do)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

**The simplest way to use SQLite at the edge.**

You want a database. Not a deployment pipeline. Not a configuration nightmare. Not another service to manage.

**Just write SQL.**

## The Problem

Setting up edge databases is complicated. Durable Objects require configuration. Storage needs provisioning. Authentication demands attention. You wanted to build your app, not wrestle with infrastructure.

## The Solution

`turso.do` is SQLite that just works. One import. One line. Done.

```typescript
import { sql } from 'turso.do'

const users = await sql`SELECT * FROM users WHERE active = ${true}`
```

No setup. No configuration. No infrastructure. Just your data, everywhere, fast.

## Installation

```bash
npm install turso.do
```

## Quick Start

### Tagged Template Queries

The fastest way to query:

```typescript
import { sql, createDatabase } from 'turso.do'

// Use the default database
const users = await sql`SELECT * FROM users`

// Parameterized queries are automatic and safe
const user = await sql`SELECT * FROM users WHERE email = ${email}`

// Joins, subqueries, everything works
const posts = await sql`
  SELECT p.*, u.name as author_name
  FROM posts p
  JOIN users u ON p.author_id = u.id
  WHERE p.published = ${true}
  ORDER BY p.created_at DESC
  LIMIT ${10}
`
```

### Named Databases

Create isolated databases for different purposes:

```typescript
import { createDatabase } from 'turso.do'

const analytics = createDatabase('analytics')
const userDb = createDatabase('users')

await analytics.sql`INSERT INTO events (name, data) VALUES (${'pageview'}, ${JSON.stringify(data)})`
await userDb.sql`UPDATE users SET last_seen = datetime('now') WHERE id = ${userId}`
```

### Transactions

ACID transactions with a clean API:

```typescript
import { createDatabase } from 'turso.do'

const db = createDatabase('my-app')

await db.transaction(async (tx) => {
  // Create an order
  const order = await tx.sql`
    INSERT INTO orders (user_id, total)
    VALUES (${userId}, ${total})
    RETURNING id
  `

  // Add line items
  for (const item of items) {
    await tx.sql`
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES (${order[0].id}, ${item.productId}, ${item.quantity}, ${item.price})
    `
  }

  // Decrement inventory
  for (const item of items) {
    await tx.sql`
      UPDATE products
      SET inventory = inventory - ${item.quantity}
      WHERE id = ${item.productId}
    `
  }
})
```

### Batch Operations

Multiple queries, single roundtrip:

```typescript
import { createDatabase } from 'turso.do'

const db = createDatabase('my-app')

const [users, posts, comments] = await db.batch([
  sql`SELECT COUNT(*) as count FROM users`,
  sql`SELECT COUNT(*) as count FROM posts WHERE published = ${true}`,
  sql`SELECT COUNT(*) as count FROM comments WHERE created_at > datetime('now', '-24 hours')`
])
```

## Schema Management

### Create Tables

```typescript
import { sql } from 'turso.do'

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT false,
    created_at TEXT DEFAULT (datetime('now'))
  )
`

await sql`CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)`
```

### Migrations

```typescript
import { createDatabase } from 'turso.do'

const db = createDatabase('my-app')

// Check current version
const [{ version }] = await db.sql`PRAGMA user_version`

if (version < 1) {
  await db.sql`ALTER TABLE users ADD COLUMN avatar_url TEXT`
  await db.sql`PRAGMA user_version = 1`
}

if (version < 2) {
  await db.sql`CREATE TABLE notifications (...)`
  await db.sql`PRAGMA user_version = 2`
}
```

## Real-World Examples

### User Authentication

```typescript
import { sql } from 'turso.do'

export async function createUser(email: string, passwordHash: string) {
  const [user] = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email, created_at
  `
  return user
}

export async function verifyUser(email: string) {
  const [user] = await sql`
    SELECT id, email, password_hash
    FROM users
    WHERE email = ${email}
  `
  return user
}
```

### API Endpoint

```typescript
import { sql } from 'turso.do'

export default {
  async fetch(request: Request) {
    const url = new URL(request.url)

    if (url.pathname === '/api/posts') {
      const posts = await sql`
        SELECT id, title, created_at
        FROM posts
        WHERE published = ${true}
        ORDER BY created_at DESC
        LIMIT 20
      `
      return Response.json(posts)
    }

    return new Response('Not Found', { status: 404 })
  }
}
```

### Real-Time Analytics

```typescript
import { sql, createDatabase } from 'turso.do'

const analytics = createDatabase('analytics')

export async function trackEvent(event: string, properties: object) {
  await analytics.sql`
    INSERT INTO events (name, properties, timestamp)
    VALUES (${event}, ${JSON.stringify(properties)}, ${Date.now()})
  `
}

export async function getDailyStats(date: string) {
  return analytics.sql`
    SELECT
      name,
      COUNT(*) as count,
      COUNT(DISTINCT json_extract(properties, '$.user_id')) as unique_users
    FROM events
    WHERE date(timestamp/1000, 'unixepoch') = ${date}
    GROUP BY name
    ORDER BY count DESC
  `
}
```

## API Reference

### `sql` Template Tag

Execute queries with automatic parameter binding:

```typescript
import { sql } from 'turso.do'

// Parameters are automatically escaped
const results = await sql`SELECT * FROM users WHERE name = ${name}`
```

### `createDatabase(name)`

Create or connect to a named database:

```typescript
import { createDatabase } from 'turso.do'

const db = createDatabase('my-database')

// db.sql - tagged template queries
// db.execute - raw query execution
// db.batch - batched queries
// db.transaction - ACID transactions
```

### `db.transaction(fn)`

Execute a function within a transaction:

```typescript
await db.transaction(async (tx) => {
  await tx.sql`INSERT INTO ...`
  await tx.sql`UPDATE ...`
  // Automatically committed on success, rolled back on error
})
```

### `db.batch(queries)`

Execute multiple queries in a single roundtrip:

```typescript
const results = await db.batch([
  sql`SELECT * FROM users`,
  sql`SELECT * FROM posts`
])
```

## Configuration

### Environment Variables

```bash
TURSO_DO_AUTH_TOKEN=your-auth-token  # Optional: for authenticated access
TURSO_DO_DATABASE=my-app             # Optional: default database name
```

### Custom Configuration

```typescript
import { createDatabase } from 'turso.do'

const db = createDatabase('my-app', {
  authToken: process.env.AUTH_TOKEN,
  baseUrl: 'https://custom.turso.do'
})
```

## Why turso.do?

| Feature | turso.do | Traditional DB |
|---------|----------|----------------|
| Setup time | 0 minutes | 30+ minutes |
| Cold starts | None | Connection timeouts |
| Global latency | < 10ms | 50ms+ |
| Connection limits | Unlimited | Pool exhaustion |
| Scaling | Automatic | Manual configuration |

## Links

- [Documentation](https://turso.do/docs)
- [GitHub Repository](https://github.com/dotdo-io/sqlite)
- [API Reference](https://turso.do/docs/api)

## License

MIT
