---
name: "@db4/client"
version: 0.1.2
description: Client SDK for db4 document database with real-time subscriptions
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - document-database
  - cloudflare
  - workers
  - durable-objects
  - client
  - sdk
downloads:
  monthly: 119
published: "2026-01-20T11:31:35.245Z"
updated: "2026-01-23T17:20:09.212Z"
---

# @db4/client

[![npm version](https://img.shields.io/npm/v/@db4/client.svg)](https://www.npmjs.com/package/@db4/client)
[![license](https://img.shields.io/npm/l/@db4/client.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/client), [npm](https://www.npmjs.com/package/@db4/client))

## Description

Client SDK for db4 document database with real-time subscriptions, offline support, and AI-powered querying. This package provides a complete client library for interacting with db4 databases, including CRUD operations, batch processing, live queries, and intelligent caching.

The client supports multiple subpath imports for optimal bundle sizes: use `@db4/client/core` for minimal CRUD, `@db4/client/offline` for offline-first apps, `@db4/client/realtime` for live subscriptions, and `@db4/client/ai` for natural language queries.

## Installation

```bash
npm install @db4/client
```

Or with pnpm:

```bash
pnpm add @db4/client
```

## Usage

```typescript
import { createClient } from '@db4/client';

// Create a client
const client = createClient({
  baseUrl: 'https://my-app.db4.io',
  apiKey: 'db4_live_key_12345',
});

// Access a collection
const users = client.collection('users');

// Create a document
const user = await users.create({
  name: 'Alice',
  email: 'alice@myapp.com/api',
  role: 'admin',
});

// Read a document
const fetchedUser = await users.get(user.id);

// Update a document
const updated = await users.update(user.id, {
  role: 'super-admin',
});

// Delete a document
await users.delete(user.id);
```

### Querying Documents

```typescript
import { createClient } from '@db4/client';

const client = createClient({ baseUrl: 'https://my-app.db4.io' });
const posts = client.collection('posts');

// Find with filters
const recentPosts = await posts.find({
  filter: {
    createdAt: { $gte: new Date('2024-01-01') },
    status: 'published',
  },
  sort: { createdAt: 'desc' },
  limit: 10,
});

// Count documents
const count = await posts.count({
  filter: { authorId: 'user_123' },
});
```

### Real-Time Subscriptions

```typescript
import { createClient } from '@db4/client';

const client = createClient({ baseUrl: 'https://my-app.db4.io' });
const messages = client.collection('messages');

// Subscribe to document changes
const subscription = messages.subscribe(
  { filter: { roomId: 'room_123' } },
  {
    onInsert: (doc) => console.log('New message:', doc),
    onUpdate: (doc, changes) => console.log('Updated:', changes),
    onDelete: (id) => console.log('Deleted:', id),
  }
);

// Later, unsubscribe
subscription.unsubscribe();
```

### Offline Support

```typescript
import { createClient, createOfflineManager } from '@db4/client';

const client = createClient({ baseUrl: 'https://my-app.db4.io' });

// Enable offline support
const offline = createOfflineManager(client, {
  storage: 'indexeddb',
  conflictResolution: 'last-write-wins',
  syncInterval: 30000,
});

// Operations work offline and sync when online
const users = offline.collection('users');

// Create works offline
await users.create({ name: 'Bob' });

// Check sync status
const status = offline.getSyncStatus();
console.log(`Pending operations: ${status.pendingCount}`);

// Handle conflicts
offline.onConflict((conflict) => {
  console.log('Conflict detected:', conflict);
  return conflict.serverVersion; // or conflict.localVersion
});
```

### Live Queries

```typescript
import { createClient, createLiveQueryManager } from '@db4/client';

const client = createClient({ baseUrl: 'https://my-app.db4.io' });
const liveQueries = createLiveQueryManager(client);

// Create a live query that updates automatically
const activeUsers = liveQueries.query(
  'users',
  { filter: { status: 'active' } },
  (users) => {
    console.log('Active users updated:', users.length);
    renderUserList(users);
  }
);

// Query result updates automatically when data changes
// Unsubscribe when done
activeUsers.unsubscribe();
```

### Connection Pool

```typescript
import { ConnectionPool } from '@db4/client';

const pool = new ConnectionPool({
  baseUrl: 'https://my-app.db4.io',
  maxConnections: 10,
  idleTimeout: 30000,
});

// Get a connection from the pool
const conn = await pool.acquire();
try {
  await conn.collection('users').create({ name: 'Test' });
} finally {
  pool.release(conn);
}

// Get pool statistics
const stats = pool.getStats();
console.log(`Active: ${stats.active}, Idle: ${stats.idle}`);
```

## Performance

Expected latencies for client operations:

| Component | Latency |
|-----------|---------|
| Network round-trip | ~96ms average |
| Server-side point read | 11ms |
| End-to-end read | ~107ms (network + server) |

Latency varies based on geographic distance to the nearest Cloudflare edge location. For latency-sensitive applications, consider using the offline manager for local-first reads with background sync.

## API

Client creation and database access:

```typescript
function createClient(config: ClientConfig): DB4Client;

interface DB4Client {
  collection<T>(name: string): Collection<T>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
```

### createClient(config)

```typescript
interface ClientConfig {
  baseUrl: string;
  apiKey?: string;
  token?: string | (() => Promise<string>);
  timeout?: number;
  retries?: number;
}

function createClient(config: ClientConfig): DB4Client;
```

### Collection Methods

```typescript
interface Collection<T> {
  create(data: T): Promise<CreateResult<T>>;
  createMany(data: T[]): Promise<CreateManyResult<T>>;
  get(id: string): Promise<T | null>;
  find(options: QueryOptions): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<UpdateResult<T>>;
  updateMany(filter: Filter, data: Partial<T>): Promise<UpdateManyResult>;
  delete(id: string): Promise<DeleteResult>;
  deleteMany(filter: Filter): Promise<DeleteManyResult>;
  count(options?: QueryOptions): Promise<CountResult>;
  subscribe(filter: Filter, callbacks: SubscriptionCallbacks): Subscription;
}
```

### Filter Operators

| Operator | Description |
|----------|-------------|
| `$eq` | Equal to |
| `$ne` | Not equal to |
| `$gt` | Greater than |
| `$gte` | Greater than or equal |
| `$lt` | Less than |
| `$lte` | Less than or equal |
| `$in` | In array |
| `$nin` | Not in array |
| `$contains` | Array contains |
| `$regex` | Regular expression match |

### Offline Types

```typescript
interface OfflineOptions {
  storage: 'memory' | 'localstorage' | 'indexeddb';
  conflictResolution: 'last-write-wins' | 'server-wins' | 'client-wins' | 'manual';
  syncInterval: number;
  maxRetries: number;
}

type ConflictHandler = (conflict: Conflict) => ConflictResolution;
```

## Related Packages

- [@db4/core](../core) - Core types and utilities
- [@db4/rpc](../rpc) - RPC protocol for client-server communication

## See Also

- [@db4/db4ai](../db4ai) - Main SDK with IceType schema integration
- [@db4/replication](../replication) - Read replica routing for high availability

## License

MIT
