---
name: "@dotdo/sdb"
version: 0.1.3
description: Simple Document/Graph Database for Cloudflare Durable Objects
license: MIT
repository: "https://github.com/dot-do/sdb"
homepage: "https://github.com/dot-do/sdb#readme"
keywords:
  - cloudflare
  - cloudflare-workers
  - durable-objects
  - database
  - document-db
  - graph-db
  - serverless-database
  - edge-database
  - document-database
  - graph-database
  - real-time
  - websocket
  - mcp
  - model-context-protocol
downloads:
  monthly: 80
published: "2026-01-25T00:36:13.194Z"
updated: "2026-01-26T01:56:27.772Z"
---

# SDB

[![npm version](https://img.shields.io/npm/v/@dotdo/sdb.svg)](https://www.npmjs.com/package/@dotdo/sdb)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

> **Note**: While 0.1.0 is a stable release, APIs may evolve in future minor versions. See [Stability](#stability) section below.

> Cost-optimized document/graph database for Cloudflare Durable Objects

## Who is SDB for?

**Ideal for:**
- **Prototypes & MVPs** - Ship fast with zero infrastructure setup
- **Edge computing** - Low-latency data access at Cloudflare's 300+ locations
- **Internal tools & dashboards** - Build quickly without database ops overhead
- **Real-time collaborative apps** - WebSocket subscriptions with automatic sync
- **Per-tenant data isolation** - Each Durable Object is a self-contained database

**Not ideal for:**
- **Enterprise compliance** - No SOC2/HIPAA certifications (yet)
- **High-volume OLTP** - Single-threaded DO limits throughput (~1000 writes/sec)
- **Regulatory environments** - Data residency controls are limited
- **Large datasets** - Best for <100MB per DO; use traditional databases for bigger workloads

## Quick Start

### Install

```bash
npm install @dotdo/sdb
# or
yarn add @dotdo/sdb
# or
pnpm add @dotdo/sdb
```

### Worker Setup

The `DB` export works as both a Durable Object class and a client factory:

```typescript
// wrangler entry point (e.g., src/index.ts)
import app, { $Context } from '@dotdo/sdb/worker'
import { DB } from '@dotdo/sdb'

export { DB, $Context }
export default app
```

### Define Schema & Connect

```typescript
import { DB } from '@dotdo/sdb'

const db = DB({
  User: {
    name: 'string',
    email: 'string',
  },
  Post: {
    title: 'string',
    content: 'text',
    author: '-> User',
  }
}, { url: 'https://your-worker.your-domain.workers.dev' })
```

### Quick Untyped Usage

For prototyping or dynamic schemas, use the pre-configured singleton:

```typescript
import { db, configureDB } from '@dotdo/sdb'

// Configure once at app startup
configureDB({ url: 'https://your-worker.your-domain.workers.dev' })

// Use anywhere - collections are accessed dynamically
const users = await db.users.list()
const post = await db.posts.create({ title: 'Hello World' })
```

### CRUD Operations

```typescript
// Create
const user = await db.Users.create({ name: 'Alice', email: 'alice@example.com' })

// Read
const alice = await db.Users.abc123
const allUsers = await db.Users.list()

// Update
await db.Users.abc123.update({ name: 'Alice Smith' })

// Delete
await db.Users.abc123.delete()

// Relationships
const posts = await db.Users.abc123.posts
```

### React Hooks

```typescript
import { useDB, useThing } from '@dotdo/sdb/react'

function UserProfile({ userId }) {
  const { data: user, loading } = useThing(db.Users[userId])
  if (loading) return <div>Loading...</div>
  return <div>{user.name}</div>
}
```

[Full Documentation](#table-of-contents) | [Getting Started Guide](./docs/getting-started.md)

---

## How SDB Compares

| Feature | SDB | Firebase Realtime DB | Supabase | Fauna | DynamoDB |
|---------|-----|---------------------|----------|-------|----------|
| **Platform** | Cloudflare Workers | Google Cloud | AWS/Postgres | Proprietary | AWS |
| **Pricing Model** | Per-request + storage | GB stored + bandwidth | Row-based + compute | Read/write ops | Provisioned/on-demand capacity |
| **Cold Start** | ~0ms (hibernating WS) | ~50-100ms | ~100-200ms | ~50-100ms | ~10-50ms |
| **Real-time** | Native WebSocket | Native | Postgres LISTEN/NOTIFY | Streams | DynamoDB Streams |
| **Graph Queries** | Native (Actions) | Manual joins | SQL joins | Native (GraphQL) | Manual |
| **Edge-native** | Yes (DO locality) | No | No | Global distribution | No (region-based) |

### Why Choose SDB?

SDB is purpose-built for cost-conscious, edge-first applications on Cloudflare. Unlike traditional databases that charge per-row or per-operation, SDB's single-blob checkpoint architecture minimizes SQLite row operations, reducing costs by up to 95%. WebSocket hibernation means you only pay for actual compute time, not idle connections. If you're building on Cloudflare Workers and need real-time sync, graph relationships, and predictable costs at scale, SDB delivers where general-purpose databases add overhead.

---

## Table of Contents

- [How SDB Compares](#how-sdb-compares)
- [Design Philosophy](#design-philosophy)
- [Core Data Model](#core-data-model)
- [Architecture](#architecture)
- [Client API](#client-api)
- [HTTP API](#http-api-worker)
- [DO RPC Interface](#do-rpc-interface)
- [Event Streaming](#event-streaming)
- [Vector Search](#vector-search) *(Coming Soon)*
- [History & Versioning](#history--versioning) *(Coming Soon)*
- [Thing Promotion](#thing-promotion) *(Coming Soon)*
- [Replication](#replication) *(Coming Soon)*
- [Stability](#stability)

---

## Design Philosophy

**Optimize for cost, not just performance.**

- **In-memory first**: Minimize SQLite row reads/writes (cost is per-row, not data size)
- **Single-blob checkpoint**: Store up to ~5MB compressed in one row
- **WebSocket hibernation**: 95% cost reduction via CapnWeb over hibernating WebSockets
- **Event streaming**: CDC flows to parent `$context` DO, then to R2 (Parquet/Iceberg)
- **Read-heavy optimization**: Extra CPU on write makes reads fast (most use cases are read-heavy)

## Core Data Model

Four internal collections with linguistic symmetry:

| Type Definition | Instance | Description |
|-----------------|----------|-------------|
| **Noun** | **Thing** | Entity types → Entity instances |
| **Verb** | **Action** | Relationship types → Relationship instances |

### Thing

An instance of a Noun (entity):

```typescript
// Stored representation
interface Thing {
  _id: number           // Monotonic internal ID (for sqids)
  $id: string           // External URL/sqid identifier
  $type: string         // Noun name
  $oid?: string         // Durable Object ID (if promoted to own DO)
  $version: number      // Version number (for history)
  data: JsonObject      // The actual fields
}

// API response (with synthetic fields from Actions)
interface ThingResponse extends Thing {
  // Synthesized from 'created' Action:
  createdAt: number     // Timestamp
  createdBy: string     // User email URL
  createdIn: string     // Request ID

  // Synthesized from 'updated' Action (if updated):
  updatedAt?: number
  updatedBy?: string
  updatedIn?: string

  // Synthesized from 'deleted' Action (if soft-deleted):
  deletedAt?: number
  deletedBy?: string
  deletedIn?: string

  // Other relationships merged as properties
  [predicate: string]: unknown  // e.g., posts: ['url1', 'url2']
}
```

### Action

An instance of a Verb (relationship). Actions are the source of truth for all metadata:

```typescript
interface Action {
  _id: number           // Monotonic internal ID
  from: string          // Subject Thing $id
  verb: string          // Event form: 'created', 'updated', 'followed'
  to: string            // Object Thing $id or external URL
  at: number            // When this action happened
  $by: string           // Who performed it (user email URL)
  $in: string           // Request context (ray ID)
}

// Example: Creating a post generates an Action:
// {
//   from: 'pst_xyz',        // The thing that was created
//   verb: 'created',        // The event
//   to: 'usr_abc',          // The creator (becomes createdBy)
//   at: 1705612800000,      // When (becomes createdAt)
//   $by: 'alice@co.com',    // Who performed the API call
//   $in: 'req_abc123'       // Request ID (becomes createdIn)
// }

// Reads as a sentence:
// "pst_xyz was created by usr_abc at 1705612800 in req_abc123"
```

When reading a Thing, Actions are queried and their predicates (from the Verb's `reverse` array) are merged into the response.

### Noun

Type definition for Things:

```typescript
interface Noun {
  _id: number
  name: string          // 'User'
  singular: string      // 'user'
  plural: string        // 'users'
  schema?: JsonSchema   // Optional validation schema
  rels?: RelMapping[]   // Relationship definitions
}
```

### Verb

Type definition for Actions:

```typescript
interface Verb {
  _id: number
  action: string        // 'create'
  activity: string      // 'creating'
  event: string         // 'created'
  reverse: string[]     // ['createdBy', 'createdAt', 'createdIn']
  inverse?: string      // 'delete'
}
```

**Seeded Verbs:**

```typescript
// Write verbs (create Actions in DO)
{ action: 'create', activity: 'creating', event: 'created', reverse: ['createdBy', 'createdAt', 'createdIn'], inverse: 'delete' }
{ action: 'update', activity: 'updating', event: 'updated', reverse: ['updatedBy', 'updatedAt', 'updatedIn'] }
{ action: 'delete', activity: 'deleting', event: 'deleted', reverse: ['deletedBy', 'deletedAt', 'deletedIn'], inverse: 'create' }
{ action: 'link',   activity: 'linking',  event: 'linked',  reverse: ['linkedBy', 'linkedAt', 'linkedIn'], inverse: 'unlink' }
{ action: 'unlink', activity: 'unlinking', event: 'unlinked', reverse: ['unlinkedBy', 'unlinkedAt', 'unlinkedIn'], inverse: 'link' }

// Read verbs (for R2 analytics, no Actions stored in DO)
{ action: 'list',   activity: 'listing',   event: 'listed',   reverse: ['listedBy', 'listedAt', 'listedIn'] }
{ action: 'get',    activity: 'getting',   event: 'got',      reverse: ['gotBy', 'gotAt', 'gotIn'] }
{ action: 'search', activity: 'searching', event: 'searched', reverse: ['searchedBy', 'searchedAt', 'searchedIn'] }
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           Client                                │
│   @dotdo/sdb package with $ Proxy, React hooks                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP or WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Worker (Hono)                              │
│  • HTTP REST routes → RPC calls to DO                           │
│  • In-memory Map<doId, WebSocket> for connection reuse          │
│  • CapnWeb sessions for client WebSockets                       │
│  • WorkOS AuthKit for JWT auth                                  │
│  • Thing promotion logic (route to child DOs)                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ CapnWeb RPC (hibernating WebSocket)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Durable Object (SDB)                         │
│  • this = RpcTarget (entire DO is the API)                      │
│  • In-memory: Things, Actions, Orama index                      │
│  • SQLite: Compressed blob checkpoint                           │
│  • Streams events to $context parent DO                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │ Event stream
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Parent $context DO                           │
│  • Buffers events from child DOs                                │
│  • Batches writes to R2                                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      R2 (Parquet/Iceberg)                       │
│  • Full event stream (data + request analytics)                 │
│  • Embeddings table with source text                            │
│  • Query with DuckDB / ClickHouse / etc                         │
└─────────────────────────────────────────────────────────────────┘
```

### Storage Strategy

**Progressive chunking based on data size:**

| Size | Strategy |
|------|----------|
| < 5MB | Single blob (things + actions + meta in one row) |
| > 5MB | Multi-chunk (type + size partitioned) |
| > 100MB | Add column stats, bloom filters |

**SQLite Schema (single-blob mode):**

```sql
-- Single row for small DOs (80% of use cases)
store(
  id INTEGER PRIMARY KEY,
  things BLOB,        -- Compressed JSON: all Things
  actions BLOB,       -- Compressed JSON: all Actions
  nouns BLOB,         -- Noun definitions
  verbs BLOB,         -- Verb definitions
  meta JSON,          -- Indexes, stats, config
  search_index BLOB   -- Serialized Orama
)
```

**SQLite Schema (multi-chunk mode):**

```sql
-- Chunk metadata (always in memory)
chunks(
  id INTEGER PRIMARY KEY,
  type TEXT,          -- $type or 'actions'
  count INTEGER,
  min_at INTEGER,
  max_at INTEGER,
  size_bytes INTEGER,
  column_stats JSON   -- JSON path extraction, types, ranges
)

-- Actual data (loaded on demand)
chunk_data(
  chunk_id INTEGER,
  data BLOB           -- Compressed JSON array
)

-- Relationship indexes (always in memory)
action_index(from_id, verb, to_id, at, chunk_id)
action_reverse(to_id, verb, from_id, at, chunk_id)
```

### History & Versioning *(Coming Soon)*

> **Note:** History and time-travel queries are planned but not yet implemented.

**Append-only by default** with configurable options:

```typescript
const db = DB({
  User: { ... }
}, {
  history: true,           // Default: append-only, full version history
  // or
  history: { ttl: '90d' }, // Keep 90 days of history
  // or
  history: false           // Hard delete, no versions
})

// Time travel queries (coming soon)
db.Users.get('abc').at(timestamp)         // Snapshot at time
db.Users.get('abc').history()             // All versions
db.Users.get('abc').history({ since })    // Versions since date
```

### IDs & Sqids

Every Noun, Verb, Thing, and Action gets a monotonic `_id`. External `$id` values use [sqids](https://sqids.org/) with embedded metadata:

```typescript
// Sqid encodes: type ID + thing ID + optional version
decode('V5kRz2') // → { typeId: 1, thingId: 4523, version: 3 }

// Default $id generation
db.Users.create({ name: 'Alice' })
// → { $id: 'usr_V5kRz2', $type: 'User', ... }
```

### Replication *(Coming Soon)*

> **Note:** Replication is planned but not yet implemented.

**Leader-only writes** with optional geo-placed replicas:

- Primary DO handles all writes
- Replicas receive streamed updates (read-only caches)
- Use [colo.do](https://github.com/drivly/colo.do) patterns for placement
- Future: write-through routing option

### Thing Promotion *(Coming Soon)*

> **Note:** Thing promotion to own DO is planned but not yet implemented. The `$oid` field exists in the schema for future use.

Any Thing can be **promoted to its own DO**:

```
Thing in parent DO  →  Worker detects promotion trigger
                           ↓
                    Creates new child DO
                           ↓
                    Parent becomes $context
                           ↓
                    Worker routes requests to child DO
```

Promotion triggers (configurable):
- Size threshold
- Access frequency
- Explicit API call
- Type-based rules

The `$id` (URL) stays the same - callers don't know or care.

## Client API

### Package Structure

```
@dotdo/sdb
├── index.ts          # DB(), $ Proxy
├── client.ts         # CapnWeb client
├── react.ts          # React hooks
└── types.ts          # TypeScript definitions
```

### Schema Definition

```typescript
import { DB } from '@dotdo/sdb'

const db = DB({
  User: {
    name: 'string',
    email: 'string',
    posts: '<- Post[]',     // Inverse: Posts pointing TO this User
  },
  Post: {
    title: 'string',
    content: 'text',        // Full-text indexed
    author: '-> User',      // Forward: points to User
    tags: '-> Tag[]',
  },
  Tag: {
    name: 'string',
    posts: '<- Post[]',
  }
}, {
  url: 'https://tenant.sdb.do',
  search: true,             // Index all strings (default)
  vectors: true,            // Enable vector search (coming soon)
  vectorDims: 256,          // MRL trim for efficiency (coming soon)
  history: true,            // Append-only (coming soon)
})
```

### Chainable RpcPromise

Everything returns an `RpcPromise` for pipelining:

```typescript
// Property access = chainable (no await needed)
db.Users                              // RpcPromise<User[]>
db.Users.abc                          // RpcPromise<User>
db.Users.abc.posts                    // RpcPromise<Post[]>
db.Users.abc.posts.first.author       // RpcPromise<User>

// Server-side operations (one round trip)
db.Users.map(u => u.posts).flat()
db.Users.filter(u => u.status === 'active').first

// Await anywhere to resolve
const users = await db.Users
const user = await db.Users.abc
const name = await db.Users.abc.name
```

### Shorthand & Explicit APIs

```typescript
// === SHORTHAND ===
db.Users                        // → list all
db.Users('abc')                 // → get by ID
db.Users.abc                    // → get by ID (property access)
db.Users({ status: 'active' })  // → filter

// === EXPLICIT ===
db.Users.list()
db.Users.list({ limit: 10, offset: 20 })
db.Users.get('abc')
db.Users.get('abc').at(timestamp)   // Time travel (coming soon)
db.Users.find({ status: 'active' })
db.Users.count()
db.Users.count({ status: 'active' })

// === MUTATIONS ===
db.Users.create({ name: 'Alice', email: 'a@b.com' })
db.Users.get('abc').update({ name: 'Bob' })
db.Users.get('abc').delete()
db.Users.get('abc').delete({ hard: true })  // If history:false

// === RELATIONSHIPS ===
db.Users.get('abc').posts               // Traverse
db.Users.get('abc').link('follows', 'usr_xyz')
db.Users.get('abc').unlink('follows', 'usr_xyz')

// === BATCH ===
db.batch()
  .create('Users', { name: 'Alice' })
  .create('Users', { name: 'Bob' })
  .link('usr_a', 'follows', 'usr_b')
  .commit()

// === SUBSCRIPTIONS ===
db.Users.$subscribe(event => {
  // { op, $id, data, $version, $at, $by, $in }
})
db.Users.$subscribe({ status: 'active' }, callback)  // Filtered
```

### Search

```typescript
// Full-text (Orama) - Available now
db.Posts.search('cloudflare workers')

// Vector (HNSW + Cloudflare AI embeddings) - Coming soon
db.Posts.search({ vector: queryEmbedding })

// Hybrid - Coming soon
db.Posts.search({
  text: 'cloudflare',
  vector: embedding,
  hybrid: 0.7  // 70% vector, 30% text
})
```

### Query DSL (PostgREST-style)

```typescript
// Filter operators
db.Users.find({
  status: 'active',
  createdAt: { $gt: date },
  score: { $gte: 70 },
  tags: { $in: ['tech', 'ai'] },
})

// Pagination, sorting, projection
db.Users.list({
  limit: 10,
  offset: 20,
  order: { createdAt: 'desc' },
  select: ['name', 'email'],
  expand: ['posts'],
})

// Response with pagination links
{
  $context: 'https://tenant.sdb.do',
  $type: 'users',
  data: [...],
  links: {
    first: 'https://...',
    prev: null,
    next: 'https://...?offset=30',
    last: 'https://...'
  },
  facets: { status: { active: 42, inactive: 8 } }
}
```

### React Hooks

```typescript
import { useDB, useThing, useQuery, useSubscribe, useMutation } from '@dotdo/sdb/react'

// Connection
const db = useDB('https://tenant.sdb.do')

// Single thing with live updates
const { data: user, loading, error } = useThing(db.Users.abc)

// Query with live updates
const { data: posts } = useQuery(db.Users.abc.posts)

// Filtered with refetch
const { data, refetch } = useQuery(
  db.Posts.find({ status: 'published' }),
  { deps: [status] }
)

// Mutations (auto-optimistic by default)
const { data, mutate, pending } = useQuery(db.Users)
await mutate.create({ name: 'Alice' })   // Shows immediately
await mutate.update('abc', { name: 'Bob' })

// Manual subscription
useSubscribe(db.Users, event => console.log(event))
```

## HTTP API (Worker)

The Hono worker exposes a REST API that translates to RPC calls:

```
GET    /:type              → db[type].list()
GET    /:type/:id          → db[type].get(id)
POST   /:type              → db[type].create(body)
PUT    /:type/:id          → db[type].get(id).update(body)
PATCH  /:type/:id          → db[type].get(id).update(body)
DELETE /:type/:id          → db[type].get(id).delete()

GET    /:type/:id/:rel     → db[type].get(id)[rel]
POST   /:type/:id/:rel     → db[type].get(id).link(rel, body.to)
DELETE /:type/:id/:rel/:to → db[type].get(id).unlink(rel, to)

GET    /:type/search?q=    → db[type].search(q)
```

**Query parameters:**

```
?limit=10&offset=20           Pagination
?order=createdAt.desc         Sorting
?select=name,email            Projection
?expand=posts,author          Eager load relationships
?depth=1                      Expand predicates to full objects (0=URLs only, 1-3=nested depth)
?status=active                Filter (equality)
?score=gt.70                  Filter (operator)
```

### Depth Parameter

By default, relationships are returned as URLs. Use `depth=` to expand them to full objects:

```json
// depth=0 (default) - URLs only
{
  "$id": "https://tenant.sdb.do/posts/pst_abc",
  "author": "https://tenant.sdb.do/users/usr_xyz",
  "createdBy": "https://tenant.sdb.do/users/usr_admin"
}

// depth=1 - Expand one level
{
  "$id": "https://tenant.sdb.do/posts/pst_abc",
  "author": {
    "$id": "https://tenant.sdb.do/users/usr_xyz",
    "$type": "https://tenant.sdb.do/nouns/user",
    "name": "Alice",
    "email": "alice@example.com"
  },
  "createdBy": {
    "$id": "https://tenant.sdb.do/users/usr_admin",
    "$type": "https://tenant.sdb.do/nouns/user",
    "name": "Admin"
  }
}

// depth=2 - Nested expansion (author's posts would also expand)
```

**SDK support:**

```typescript
// Via options
db.Posts.get('abc', { depth: 1 })
db.Posts.list({ depth: 2 })

// Via chainable API
db.Posts.abc.expand(1)
db.Posts.abc.author.expand(2)
```

**Performance note:** Higher depth values increase response size and query time. Use sparingly.

**Response format with clickable links:**

```json
{
  "$id": "https://tenant.sdb.do/users/usr_V5kRz2",
  "$type": "https://tenant.sdb.do/nouns/user",
  "$version": "https://tenant.sdb.do/users/usr_V5kRz2?v=3",
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2026-01-18T12:00:00.000Z",
  "createdBy": "https://tenant.sdb.do/users/usr_admin",
  "createdIn": "req_abc123",
  "updatedAt": "2026-01-18T14:30:00.000Z",
  "updatedBy": "https://tenant.sdb.do/users/usr_V5kRz2",
  "updatedIn": "req_def456",
  "posts": [
    "https://tenant.sdb.do/posts/pst_abc",
    "https://tenant.sdb.do/posts/pst_def"
  ]
}
```

## DO RPC Interface

The DO itself is the `RpcTarget`:

```typescript
class SDB extends RpcTarget {
  // Collections
  things(type?: string): ThingsCollection
  thing(id: string): Thing
  actions(): ActionsCollection
  nouns(): NounsCollection
  verbs(): VerbsCollection

  // Meta
  $context: string
  $config: Config

  // Subclasses can extend with custom methods
  // (automatically exposed via RPC)
}

// Custom extension
class MyApp extends SDB {
  async processOrder(orderId: string) {
    // Custom business logic
    // Available via RPC: myApp.processOrder('abc')
  }
}
```

## Event Streaming

Events flow up the `$context` chain:

```typescript
interface Event {
  op: 'create' | 'update' | 'delete'
  $id: string
  $type: string
  data: JsonObject      // Full snapshot (not patches)
  $version: number
  $at: number
  $by: string           // User email URL
  $in: string           // Request ID
}
```

**Tail worker** streams request analytics to the same pipeline:

```typescript
interface RequestEvent {
  op: 'request'
  method: string
  path: string
  status: number
  latencyMs: number
  cpuMs: number
  headers: Record<string, string>
  $at: number
  $by: string
  $in: string           // Cloudflare ray ID
}
```

Both data events and request analytics end up in R2 for unified querying.

## Vector Search *(Coming Soon)*

> **Note:** Vector search with HNSW indexing is planned but not yet implemented. Full-text search using Orama is currently available.

**Planned Cloudflare AI embeddings:**

- `@cf/google/embeddinggemma-300m` - MRL support (128-768 dims), default
- `@cf/baai/bge-m3` - Better quality, larger documents, no MRL

**Planned Architecture:**

```
DO Memory
├─ Things (data only)
├─ HNSW index (graph structure)
└─ Embeddings (stored in blob, loaded on demand)

R2 (for analytics/large-scale)
└─ thing_id, $type, data, text, embedding[], $at, $by, $in
```

**Planned Configuration:**

```typescript
const db = DB({
  Post: {
    title: 'string',
    content: 'text',
    $embed: ['title', 'content'],  // Fields to embed
    $embedModel: 'gemma-300m',     // Model choice
    $embedDims: 256,               // MRL dimension trim
  }
})
```

## Serialization

Things can be serialized to/from multiple formats:

```typescript
import { toJSON, toMarkdown, fromJSON, fromMarkdown } from '@dotdo/sdb'

// JSON (API, programmatic)
const json = toJSON(thing)
// { "$id": "usr_abc", "$type": "User", "data": { "name": "Alice" }, ... }

// Markdown (Git-friendly, human-readable)
const md = toMarkdown(thing)
// ---
// $id: usr_abc
// $type: User
// name: Alice
// ---
// # About Alice
// ...

// Round-trip
const restored = fromMarkdown(md)
```

## Higher-Level Layer: @dotdo/db

SDB is intentionally minimal. For a more opinionated, feature-rich experience, see `@dotdo/db` which builds on SDB and adds:

- **AI Integration**: Natural language queries via tagged templates
- **MDXLD**: Full MDX serialization with components
- **Typed Schemas**: IceType-style schema definitions
- **Business-as-Code**: Workflow and process definitions
- **Agent Memory**: Episodic, semantic, procedural memory types

```typescript
// @dotdo/db (higher layer)
import { DB } from '@dotdo/db'

const db = DB({
  User: {
    name: 'string',
    email: 'string!#',  // required, indexed
    posts: '<- Post[]',
  }
})

// AI-powered queries
const users = await db.Users`who signed up this week?`
```

## Project Structure

```
sdb/
├── src/
│   ├── do/                 # Durable Object
│   │   ├── SDB.ts          # Main DO class (RpcTarget)
│   │   ├── stores/         # Things, Actions, Nouns, Verbs
│   │   ├── storage/        # Blob checkpoint, multi-chunk
│   │   ├── search/         # Orama + HNSW integration
│   │   └── stream/         # Event streaming to $context
│   ├── worker/             # Hono worker
│   │   ├── index.ts        # Routes
│   │   ├── rpc.ts          # CapnWeb session management
│   │   └── auth.ts         # WorkOS AuthKit
│   ├── client/             # @dotdo/sdb package
│   │   ├── index.ts        # DB(), $ Proxy
│   │   ├── rpc.ts          # CapnWeb client
│   │   └── react.ts        # Hooks
│   └── shared/             # Types, sqids, utils
├── wrangler.toml
├── package.json
└── tsconfig.json
```

## Stability

**Current Status: 0.1.0 Stable**

SDB 0.1.0 is a stable release used in production at [Drivly](https://driv.ly). Here is what you should know:

### API Stability

- **APIs may evolve** in future minor versions as we work toward 1.0
- We follow [Semantic Versioning](https://semver.org/) - patch releases (0.1.x) will be backward compatible
- Once we reach 1.0, we will maintain backward compatibility within major versions

### Production Use

- SDB is production-ready for the use cases described in [Who is SDB for?](#who-is-sdb-for)
- Review the [CHANGELOG](./CHANGELOG.md) before upgrading minor versions
- Pin your dependency to a specific version if stability is critical: `"@dotdo/sdb": "0.1.0"`

### Reporting Issues

If you encounter bugs or have feature requests:

1. Check [existing issues](https://github.com/dot-do/sdb/issues) first
2. Open a [new issue](https://github.com/dot-do/sdb/issues/new) with:
   - Clear description of the problem or feature
   - Steps to reproduce (for bugs)
   - Your environment (Node version, Wrangler version, etc.)

### What to Expect

- Active development with regular releases
- Responsive issue triage
- Documentation improvements over time
- Path to 1.0 once APIs fully stabilize

## License

MIT
