---
name: "@db4/do"
version: 0.1.2
description: Durable Object implementation for db4 - edge-native storage with SQLite and automatic coordination
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - durable-objects
  - cloudflare
  - workers
  - sqlite
  - edge-database
downloads:
  monthly: 261
published: "2026-01-20T11:31:45.957Z"
updated: "2026-01-23T17:20:17.886Z"
---

# @db4/do

([GitHub](https://github.com/dot-do/db4/tree/main/packages/do), [npm](https://www.npmjs.com/package/@db4/do))

**Your Cloudflare Workers deserve a database that understands them.**

Durable Objects are powerful. But managing SQLite state, coordinating cross-shard transactions, handling rollbacks, and maintaining consistency? That's where teams get stuck. You write transaction managers, WAL implementations, shard routers, CDC handlers. Before you know it, you've built a database layer instead of shipping your product.

`@db4/do` handles all of that so you can build what matters.

## What You Get

- **ACID Transactions** - Savepoints, nested transactions, automatic rollbacks
- **Memory WAL** - Crash recovery with configurable checkpoints
- **Automatic Sharding** - Consistent hashing with hot shard detection and auto-splitting
- **Full-Text Search** - FTS5 with BM25 ranking, highlighting, snippets
- **Three-Tier Storage** - Hot (DO SQLite) to Warm (Edge Cache) to Cold (R2)
- **CDC Events** - Real-time Change Data Capture streaming
- **Optimistic Locking** - Conflict detection with automatic retry and backoff

## Installation

```bash
npm install @db4/do
```

## Quick Start

### Step 1: Define Your Documents

```typescript
import { createDocumentOperations } from '@db4/do';

const docs = createDocumentOperations({
  sql: ctx.storage.sql,
  collection: 'users',
  onCDC: (event) => console.log('Change:', event),
});

const user = await docs.create({
  $type: 'User',
  name: 'Alice',
  email: 'alice@example.com',
});
```

### Step 2: Run Transactions

```typescript
import { createTransactionManager } from '@db4/do';

const txManager = createTransactionManager({
  collection: 'accounts',
  onCDC: (event) => emitToIceberg(event),
});

await txManager.transaction(async (tx) => {
  const from = await tx.get('account-1');
  const to = await tx.get('account-2');

  if (from.balance < 100) throw new Error('Insufficient funds');

  await tx.update('account-1', { balance: from.balance - 100 });
  await tx.update('account-2', { balance: to.balance + 100 });

  await tx.savepoint('after_transfer');

  try {
    await tx.create({ $type: 'Notification', message: 'Transfer complete' });
  } catch (e) {
    await tx.rollbackTo('after_transfer');
  }
});
```

### Step 3: Scale with Sharding

```typescript
import { createShardRouter } from '@db4/do';

const router = createShardRouter<User>({
  partitionKey: 'tenantId',
  shardCount: 16,
  hotShardThreshold: 1000,
  autoSplit: true,
  enableConsistentHashing: true,
});

await router.insert({
  $id: 'user-1',
  $type: 'User',
  tenantId: 'acme-corp',
  name: 'Alice',
});

// Scatter-gather across shards
const results = await router.query({
  filters: [{ field: 'status', operator: '$eq', value: 'active' }],
  sort: [{ field: 'createdAt', direction: 'desc' }],
  limit: 100,
});

// Direct shard query for partition-key lookups
const shardId = router.getShardFor({ tenantId: 'acme-corp' });
const shardResults = await router.queryInShard(shardId, {
  filters: [{ field: 'role', operator: '$eq', value: 'admin' }]
});
```

## Advanced Features

### Optimistic Locking

Handle concurrent updates with automatic retry:

```typescript
import {
  updateWithOptimisticLock,
  compareAndSwap,
  atomicIncrement,
} from '@db4/do';

const result = await updateWithOptimisticLock(
  store, sql, 'accounts', 'acc-123',
  (doc) => ({ balance: doc.balance - 100 }),
  { maxRetries: 5, initialBackoffMs: 50 }
);

// Atomic compare-and-swap for state machines
const casResult = await compareAndSwap(
  store, sql, 'orders', 'order-1',
  'status', 'pending', 'processing'
);

// Atomic counter increment
const incResult = await atomicIncrement(
  store, sql, 'posts', 'post-1',
  'viewCount', 1
);
```

### Full-Text Search

FTS5-powered search with BM25 ranking:

```typescript
import { createFullTextSearch, parseSearchQuery, queryToFTS5 } from '@db4/do';

const fts = createFullTextSearch(sql);

fts.createIndex({
  name: 'articles_fts',
  collection: 'articles',
  fields: [
    { field: 'title', weight: 2.0 },
    { field: 'body', weight: 1.0 },
    { field: 'tags', weight: 1.5 },
  ],
  tokenizer: 'porter',
});

fts.indexDocument('articles_fts', 'art-1', {
  title: 'Building Edge Databases',
  body: 'Learn how to build databases with Cloudflare...',
  tags: 'cloudflare database edge',
});

const results = fts.search('articles_fts', 'edge database', {
  limit: 20,
  highlight: { startMark: '<em>', endMark: '</em>' },
  snippet: { maxTokens: 64 },
});

const parsed = parseSearchQuery('title:db4 AND (tutorial OR guide)');
const fts5Query = queryToFTS5(parsed);
```

### Memory WAL

Crash recovery with write-ahead logging:

```typescript
import { createMemoryWAL } from '@db4/do';

const wal = createMemoryWAL({
  maxSizeBytes: 10 * 1024 * 1024,
  maxEntries: 10000,
  checkpointInterval: 1000,
  enableChecksums: true,
  onCheckpoint: (lsn) => console.log(`Checkpoint at LSN ${lsn}`),
});

const entry = wal.append({
  type: 'create',
  documentId: 'doc-1',
  collection: 'users',
  after: { name: 'Alice' },
});

const result = await wal.replay(async (entry) => {
  await applyEntry(entry);
});

const checkpointLsn = wal.checkpoint();
wal.truncate(checkpointLsn);
```

### Multi-Tier Storage

Automatic data tiering from hot to cold:

```typescript
import { createStorageIntegrationManager } from '@db4/do';

const storage = createStorageIntegrationManager({
  sqlStorage: ctx.storage.sql,
  r2Bucket: env.MY_R2_BUCKET,
  compactionThreshold: 10000,
  memoryPressureThreshold: 0.8,
});

await storage.writeHot('orders', 'order-1', { total: 99.99 });

const doc = await storage.read('orders', 'order-1');

const results = await storage.rangeQuery('orders', {
  start: '2024-01-01',
  end: '2024-12-31',
  includeColdTier: true,
});

await storage.triggerCompaction();
```

### Range Queries with Cursors

Paginate large datasets efficiently:

```typescript
import { createRangeQueryManager } from '@db4/do';

const rangeManager = createRangeQueryManager(sql);

rangeManager.createIndex({
  name: 'users_by_created',
  collection: 'users',
  fields: [{ field: 'createdAt', direction: 'asc' }],
});

rangeManager.indexDocument('users', 'user-1', {
  createdAt: '2024-06-15',
  name: 'Alice',
});

const page1 = rangeManager.queryRange({
  indexName: 'users_by_created',
  start: { value: '2024-01-01', inclusive: true },
  end: { value: '2024-12-31', inclusive: true },
  limit: 100,
});

if (page1.cursor?.hasMore) {
  const page2 = rangeManager.queryRange({
    indexName: 'users_by_created',
    cursor: page1.cursor.value,
    limit: 100,
  });
}

// Stream with async iterator
const iterator = rangeManager.createIterator({ indexName: 'users_by_created' }, 50);
for await (const doc of iterator) {
  console.log(doc);
}
```

## With @db4/do

- **Sub-10ms reads** worldwide
- **ACID guarantees** without complexity
- **Automatic scaling** via consistent hashing
- **Zero cold starts** - data lives in Durable Objects
- **Real-time CDC** streaming to analytics

## Without It

You'll spend weeks building:

- Manual SQLite transaction management with rollback handling
- Custom WAL for crash recovery
- Shard routing that doesn't handle hot spots
- Ad-hoc CDC that misses edge cases
- Memory management to avoid DO limits

That's time you could spend shipping features users actually want.

## API Reference

### Core

| Export | Description |
|--------|-------------|
| `createDocumentOperations` | CRUD with CDC |
| `createBatchOperations` | Bin-packed batch storage |
| `createTransactionManager` | ACID transactions with savepoints |
| `createTransactionContext` | Explicit transaction control |

### Sharding

| Export | Description |
|--------|-------------|
| `createShardRouter` | Partition-based routing |
| `createConsistentHashRing` | Virtual node hash ring |
| `createRoutingCache` | LRU cache for routing |

### Storage

| Export | Description |
|--------|-------------|
| `createMemoryWAL` | Write-ahead logging |
| `createStorageIntegrationManager` | Multi-tier storage |
| `createFullTextSearch` | FTS5-based search |
| `createRangeQueryManager` | Indexed range queries |

### Utilities

| Export | Description |
|--------|-------------|
| `withOptimisticLock` | Execute with optimistic lock retry |
| `updateWithOptimisticLock` | Update with conflict retry |
| `conditionalUpdateWithOptimisticLock` | Conditional update with predicate |
| `compareAndSwap` | Atomic CAS operations |
| `atomicIncrement` | Atomic counter updates |

## Type Exports

```typescript
// Documents
import type { Document, StoredDocument, CDCEvent, DocumentBatch } from '@db4/do';

// Transactions
import type {
  TransactionContext,
  TransactionOptions,
  IsolationLevel,
  TransactionStore,
  ConflictInfo,
  OptimisticLockOptions,
  OptimisticLockResult,
} from '@db4/do';

// Sharding
import type {
  ShardRouterConfig,
  ShardInfo,
  QueryPlan,
  MigrationPlan,
  VirtualNode,
} from '@db4/do';

// Storage & WAL
import type {
  WALEntry,
  WALStats,
  WALSegment,
  MemoryWALConfig,
  ReplayResult,
} from '@db4/do';

// Full-Text Search
import type {
  FTSIndexConfig,
  FTSField,
  SearchOptions,
  SearchResults,
} from '@db4/do';

// Range Queries
import type {
  IndexDefinition,
  RangeQuery,
  RangeQueryResult,
  QueryCursor,
} from '@db4/do';

// Storage Integration
import type {
  StorageDocument,
  TierCDCEvent,
  MultiTierQueryResult,
  StorageIntegrationOptions,
} from '@db4/do';
```

## Requirements

- Cloudflare Workers with Durable Objects
- `@cloudflare/workers-types` ^4.0.0

## Related Packages

- `@db4/core` - Core types and utilities
- `@db4/schema` - IceType schema compiler
- `@db4/vortex` - 2MB columnar blob storage
- `@db4/storage` - Three-tier storage abstraction
- `@db4/iceberg` - CDC streaming to Apache Iceberg

## License

MIT
