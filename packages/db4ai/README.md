---
name: db4ai
version: 0.3.6
description: AI-powered database operations with CapnWeb RPC transport for db4
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - ai
  - rpc
  - capnproto
  - cloudflare
  - workers
  - durable-objects
downloads:
  monthly: 37
published: "2026-01-04T16:26:11.426Z"
updated: "2026-01-23T17:20:15.136Z"
---

# db4ai

[![npm version](https://img.shields.io/npm/v/db4ai.svg)](https://www.npmjs.com/package/db4ai)
[![license](https://img.shields.io/npm/l/db4ai.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/db4ai), [npm](https://www.npmjs.com/package/db4ai))

The all-in-one client SDK for db4 - a globally distributed database built on Cloudflare's edge infrastructure.

## Description

`db4ai` is the all-in-one client SDK for interacting with db4, a globally distributed document database built on Cloudflare's edge infrastructure. It provides:

- **Schema definition** with `DB()` from IceType
- **Type-safe queries** with full TypeScript inference
- **Real-time subscriptions** via WebSocket
- **Automatic connection pooling** and retry logic
- **Zero-configuration deployment** when used with Cloudflare Workers service bindings

## Features

- Works in Cloudflare Workers, Node.js, and browsers
- Type-safe queries powered by IceType schemas
- Real-time subscriptions with WebSocket support
- Automatic connection pooling and retry logic
- Zero-config in Workers with service bindings

## Installation

```bash
npm install db4ai
```

## Usage

### Schema-First (Recommended)

Define your schema using IceType and create a typed client:

```typescript
import { DB, createClient } from 'db4ai'

// Define your schema using IceType
const schema = DB({
  User: {
    id: 'cuid!',
    email: 'string! #unique',
    name: 'string?',
    posts: '[Post] -> author',
  },
  Post: {
    id: 'cuid!',
    title: 'string!',
    content: 'text',
    author: 'User! <- posts',
  },
})

// Create a client from the schema
const db = createClient({ schema })

// Full type inference - no codegen needed
const user = await db.users.create({ email: 'alice@example.com', name: 'Alice' })
const posts = await db.posts.find({ where: { 'author.id': user.id } })
```

### Direct Client

For when you have types defined separately:

```typescript
import { db4 } from 'db4ai'
import type { Schema } from './schema'

// Initialize the client
const db = db4<Schema>({
  endpoint: 'https://your-db4.workers.dev',
  apiKey: process.env.DB4_API_KEY
})

// Create a document
const user = await db.users.create({
  name: 'Alice',
  email: 'alice@example.com'
})

// Query with type safety
const admins = await db.users.find({
  where: { role: 'admin' },
  orderBy: { createdAt: 'desc' },
  limit: 10
})

// Real-time subscriptions
const unsubscribe = db.users.subscribe(
  { where: { role: 'admin' } },
  (users) => console.log('Admins updated:', users)
)
```

## Usage in Cloudflare Workers

When running inside a Cloudflare Worker, use the service binding for zero-latency access:

```typescript
import { db4 } from 'db4ai'
import type { Schema } from './schema'

export default {
  async fetch(request: Request, env: Env) {
    const db = db4<Schema>({ binding: env.DB4 })

    const users = await db.users.find()
    return Response.json(users)
  }
}
```

## API

Main client SDK for db4 databases:

```typescript
function db4<Schema>(config: DB4Config): DB4Client<Schema>;

interface DB4Client<Schema> {
  [K in keyof Schema]: Collection<Schema[K]>;
}
```

### Client Initialization

```typescript
// Remote endpoint
const db = db4<Schema>({ endpoint, apiKey })

// Service binding (Workers only)
const db = db4<Schema>({ binding: env.DB4 })

// With options
const db = db4<Schema>({
  endpoint,
  apiKey,
  timeout: 30000,
  retries: 3,
  cache: 'default'
})
```

### Collection Operations

```typescript
// Create
await db.collection.create(document)
await db.collection.createMany(documents)

// Read
await db.collection.get(id)
await db.collection.find(query)
await db.collection.findOne(query)
await db.collection.count(query)

// Update
await db.collection.update(id, changes)
await db.collection.updateMany(query, changes)
await db.collection.upsert(query, document)

// Delete
await db.collection.delete(id)
await db.collection.deleteMany(query)
```

### Query Options

```typescript
const results = await db.users.find({
  where: {
    age: { $gte: 18 },
    status: 'active'
  },
  select: ['id', 'name', 'email'],
  include: {
    posts: { limit: 5 }
  },
  orderBy: { createdAt: 'desc' },
  limit: 100,
  offset: 0
})
```

### Transactions

```typescript
const result = await db.transaction(async (tx) => {
  const user = await tx.users.create({ name: 'Bob' })
  await tx.accounts.create({ userId: user.id, balance: 0 })
  return user
})
```

### Real-time Subscriptions

```typescript
// Subscribe to query results
const unsubscribe = db.users.subscribe(query, callback)

// Subscribe to a single document
const unsubscribe = db.users.subscribeOne(id, callback)

// Cleanup
unsubscribe()
```

## Type Safety

db4ai provides full TypeScript inference from your IceType schema:

```typescript
import { DB, createClient } from 'db4ai'

// Schema definition using DB()
const schema = DB({
  User: {
    id: 'cuid!',
    name: 'string!',
    email: 'string! #unique',
    age: 'int?',
    posts: '[Post] -> author',
  },
  Post: {
    id: 'cuid!',
    title: 'string!',
    content: 'text!',
    author: 'User! <- posts',
  },
})

const db = createClient({ schema })

// Full type inference - no codegen needed
type User = typeof db.types.User
// {
//   id: string
//   name: string
//   email: string
//   age?: number
//   posts?: Post[]
// }
```

## Documentation

For complete documentation, visit [db4.dev/docs](https://db4.dev/docs)

## Related Packages

- [@db4/worker](../worker) - Cloudflare Worker runtime
- [@db4/schema](../schema) - IceType schema compiler
- [@db4/do](../do) - Durable Object implementation
- [@db4/query](../query) - Query planning and execution
- [@db4/storage](../storage) - Three-tier storage abstraction

## See Also

- [@db4/ai](../ai) - AI-powered field generation and embeddings
- [@db4/client](../client) - Lower-level client SDK

## License

MIT
