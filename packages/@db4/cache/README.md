---
name: "@db4/cache"
version: 0.1.2
description: Edge Cache warm tier for db4 - intelligent caching with invalidation, TTL, and multi-node coherence
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - cache
  - edge-cache
  - warm-tier
  - invalidation
  - ttl
  - cloudflare
  - workers
downloads:
  monthly: 217
published: "2026-01-20T11:28:47.888Z"
updated: "2026-01-23T17:20:03.830Z"
---

# @db4/cache

[![npm version](https://img.shields.io/npm/v/@db4/cache.svg)](https://www.npmjs.com/package/@db4/cache)
[![license](https://img.shields.io/npm/l/@db4/cache.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/cache), [npm](https://www.npmjs.com/package/@db4/cache))

Edge Cache warm tier for db4 - intelligent caching with invalidation, TTL, and multi-node coherence.

## Features

- **Cache-Aside Pattern** - Read-through, write-through, and write-behind caching strategies
- **Stale-While-Revalidate** - Serve stale content while refreshing in the background
- **TTL Expiration** - Configurable sliding and absolute expiration policies
- **Pattern & Tag Invalidation** - Glob patterns, tags with AND/OR logic, and cascading invalidation
- **Multi-Node Coherence** - Version vectors, conflict resolution, and consistency levels
- **Memory Management** - LRU/LFU/FIFO eviction, compression, and memory pressure monitoring
- **Predictive Cache Warming** - Access pattern prediction and priority-based warming

## Installation

```bash
npm install @db4/cache
```

## Quick Start

```typescript
import { CacheAside, TTLCache, CacheInvalidator } from '@db4/cache';

// Basic cache-aside pattern
const cache = new CacheAside({
  loader: {
    load: async (key) => {
      // Fetch from your data source
      return await database.get(key);
    },
  },
  defaultTtlMs: 60000, // 1 minute TTL
  staleWhileRevalidate: true,
  maxStaleMs: 30000,
});

// Get with automatic cache population
const user = await cache.get('user:123');

// Set with write-through
await cache.set('user:123', { name: 'Alice' });
```

## API Reference

### CacheAside

The main cache-aside implementation supporting read-through and write-through patterns.

```typescript
import { CacheAside, type CacheAsideConfig } from '@db4/cache';

const cache = new CacheAside<User>({
  // Required: data loader
  loader: {
    load: async (key) => fetchFromDatabase(key),
    loadMany: async (keys) => fetchManyFromDatabase(keys),
  },

  // Optional: data writer for write-through/write-behind
  writer: {
    write: async (key, value) => saveToDatabase(key, value),
    delete: async (key) => deleteFromDatabase(key),
  },

  // TTL and expiration
  defaultTtlMs: 60000,

  // Size limits
  maxSize: 10000,
  maxMemoryBytes: 100 * 1024 * 1024, // 100MB

  // Eviction policy: 'lru' | 'lfu' | 'fifo' | 'ttl'
  evictionPolicy: 'lru',

  // Write mode: 'write-through' | 'write-behind'
  writeMode: 'write-through',
  writeBehindDelayMs: 100,
  writeBehindBatchSize: 50,

  // Population strategy: 'lazy' | 'eager' | 'refresh-ahead'
  populationStrategy: 'lazy',
  preloadKeys: ['config:app', 'config:features'],
  refreshAheadFactor: 0.8, // Refresh at 80% of TTL

  // Negative caching (cache misses)
  negativeCaching: true,
  negativeCacheTtlMs: 30000,

  // Stale-while-revalidate
  staleWhileRevalidate: true,
  maxStaleMs: 60000,

  // Compression
  compression: {
    enabled: true,
    threshold: 1024,
    algorithm: 'gzip', // 'gzip' | 'deflate' | 'brotli'
  },
});

// Methods
await cache.initialize();                    // Initialize (for eager population)
const value = await cache.get('key');        // Get with auto-load on miss
const values = await cache.getMany(['a', 'b']); // Batch get
await cache.set('key', value);               // Set with write-through
await cache.delete('key');                   // Delete from cache and origin
await cache.invalidate('key');               // Invalidate without origin delete
await cache.warmup(['key1', 'key2']);        // Pre-warm cache
const stats = cache.getStats();              // Get hit/miss statistics
```

### TTLCache

Low-level TTL-based cache with configurable expiration policies.

```typescript
import { TTLCache, type TTLCacheConfig } from '@db4/cache';

const ttlCache = new TTLCache<User>({
  defaultTtlMs: 60000,
  minTtlMs: 1000,
  maxTtlMs: 3600000,
  maxSize: 10000,

  // Expiration policy: 'absolute' | 'sliding'
  expirationPolicy: 'sliding',
  maxAbsoluteTtlMs: 3600000, // Hard cap for sliding

  // Background cleanup
  backgroundCleanup: true,
  cleanupIntervalMs: 60000,
  cleanupBatchSize: 100,
  adaptiveCleanup: true,
  minCleanupIntervalMs: 1000,
  maxCleanupIntervalMs: 300000,

  // Lazy expiration on access
  lazyExpiration: true,

  // Probabilistic early expiration (prevent thundering herd)
  probabilisticEarlyExpiration: true,
  earlyExpirationBeta: 1,

  // Callbacks
  onExpire: (event) => console.log(`Expired: ${event.key}`),
  onCleanup: (stats) => console.log(`Cleaned: ${stats.entriesRemoved}`),
});

// Methods
ttlCache.set('key', value, { ttlMs: 30000, expirationPolicy: 'sliding' });
const value = ttlCache.get('key');           // Get (updates sliding window)
const peeked = ttlCache.peek('key');         // Peek without updating
ttlCache.touch('key');                       // Update access time
ttlCache.extendTtl('key', 60000);            // Add time to TTL
ttlCache.setTtl('key', 120000);              // Set new TTL
const remaining = ttlCache.getRemainingTtl('key');
const expiring = ttlCache.getExpiringSoon(60000);
const stats = ttlCache.getStats();
ttlCache.cleanup();                          // Manual cleanup
ttlCache.destroy();                          // Cleanup and stop timers
```

### CacheInvalidator

Comprehensive cache invalidation with patterns, tags, and cascading.

```typescript
import { CacheInvalidator, type InvalidationConfig } from '@db4/cache';

const invalidator = new CacheInvalidator<{ tags?: string[] }>({
  enablePatternMatching: true,
  enableTagging: true,
  enableCascading: true,
  maxPendingInvalidations: 1000,
});

// Set values with tags
invalidator.set('user:123', { tags: ['user', 'active'] });
invalidator.set('user:456', { tags: ['user', 'inactive'] });
invalidator.set('post:789', { tags: ['post', 'user:123'] });

// Single key invalidation
await invalidator.invalidate('user:123', {
  reason: 'user_updated',
  source: 'api',
  cascade: true,
  maxCascadeDepth: 3,
  traceChain: true,
});

// Conditional invalidation
await invalidator.invalidateIf('user:123', (value) => value.tags?.includes('inactive'));

// Pattern-based invalidation
await invalidator.invalidateByPattern('user:*', {
  exclude: ['user:admin'],
  returnKeys: true,
  maxKeys: 1000,
});

// Tag-based invalidation
await invalidator.invalidateByTag('user');
await invalidator.invalidateByTags(['user', 'active'], { operator: 'AND' });
await invalidator.invalidateByTagPattern('user:*');

// Cascading invalidation rules
invalidator.addCascadeRule({
  trigger: 'user:*',
  cascade: ['posts:$1:*', 'comments:$1:*'],
  description: 'Cascade user changes to posts and comments',
});

// Async cascade rules
invalidator.addCascadeRule({
  trigger: /^category:(\d+)$/,
  cascadeAsync: async (key) => {
    const products = await db.getProductsByCategory(key);
    return products.map(p => `product:${p.id}`);
  },
});

// Batch invalidation
const batch = invalidator.createBatch({ atomic: true });
batch.add('user:123');
batch.addPattern('session:123:*');
batch.addTag('user:123');
await batch.execute();

// Event listeners
invalidator.onBeforeInvalidate((event) => {
  if (event.keys?.includes('protected')) {
    event.cancel = true;
    event.cancelReason = 'Protected key';
  }
});
invalidator.onAfterInvalidate((event) => {
  console.log(`Invalidated: ${event.keys}`);
});
```

### CoherentCache

Multi-node cache with coherence protocol for distributed systems.

```typescript
import { CoherentCache, type CoherenceConfig, type BroadcastChannel } from '@db4/cache';

// Create a broadcast channel (e.g., using Cloudflare Durable Objects)
const channel: BroadcastChannel = {
  subscribe: (handler) => { /* ... */ },
  broadcast: async (message) => { /* ... */ },
  close: () => { /* ... */ },
};

const cache = new CoherentCache<User>({
  nodeId: 'node-1',
  broadcastChannel: channel,
  defaultTtlMs: 60000,

  // Batching
  batchInvalidations: true,
  batchWindowMs: 50,

  // Retries
  broadcastRetries: 3,
  broadcastRetryDelayMs: 100,

  // Version vectors for conflict detection
  useVersionVectors: true,

  // Conflict resolution: 'last-writer-wins' | 'first-writer-wins' | 'custom' | 'merge'
  conflictResolution: 'last-writer-wins',
  conflictResolver: (local, remote) => ({ ...local, ...remote }),
  mergeFunction: (a, b) => ({ ...a, ...b }),
  onConflict: (event) => console.log(`Conflict on ${event.key}`),

  // Consistency: 'eventual' | 'strong' | 'read-your-writes' | 'causal' | 'linearizable'
  consistencyLevel: 'eventual',

  // Cluster awareness
  clusterAware: true,
  healthCheckInterval: 5000,
  nodeTimeout: 15000,
  splitBrainDetection: true,
  onNodeFailure: (event) => console.log(`Node ${event.nodeId} failed`),
  onSplitBrain: (event) => console.log(`Split brain: ${event.partitions}`),
  onNodeRejoin: (event) => console.log(`Node ${event.nodeId} rejoined`),
  autoSyncOnRejoin: true,

  // Sync protocols
  fullSyncOnStart: true,
  incrementalSyncInterval: 30000,
  antiEntropyEnabled: true,
  antiEntropyInterval: 60000,
  useMerkleTrees: true,

  // Performance
  coalesceUpdates: true,
  coalesceWindowMs: 50,
  broadcastRateLimit: 100, // per second
});

// Methods
await cache.initialize();
const writeId = cache.set('key', value, {
  timestamp: Date.now(),
  consistencyLevel: 'strong',
  dependsOn: ['other-key'],
});

const value = cache.get('key');
await cache.invalidate('key', { reason: 'updated' });

// Quorum writes
const result = await cache.setWithQuorum('key', value, {
  requiredAcks: 3,
  timeout: 5000,
});

// Read-your-writes consistency
const afterWrite = await cache.getAfterWrite('key', writeId);

// Linearizable operations
await cache.setLinearizable('key', value);
const linear = await cache.getLinearizable('key');

// Version vectors
const version = cache.getVersionVector('key');
await cache.syncVersionVectors();
const conflict = await cache.detectConflicts('key');

// Node management
cache.addNode('node-2');
cache.removeNode('node-2');
const clusterSize = cache.getClusterSize();

// Merkle tree sync
const tree = cache.getMerkleTree();
const diff = await cache.calculateSyncDiff(remoteMerkleRoot);

cache.destroy();
```

### CacheWarmer

Predictive and priority-based cache warming.

```typescript
import { CacheWarmer, type WarmingConfig } from '@db4/cache';

const warmer = new CacheWarmer<User>({
  source: {
    get: async (key) => fetchFromColdStorage(key),
    getMany: async (keys) => fetchManyFromColdStorage(keys),
    scan: async function* (options) {
      for await (const item of coldStorage.scan(options)) {
        yield item;
      }
    },
    getWithMetadata: async (key) => fetchWithMetadata(key),
  },

  // Strategy: 'predictive' | 'scheduled' | 'manual'
  strategy: 'predictive',

  // Concurrency
  maxConcurrentWarms: 10,
  warmingBatchSize: 20,

  // Predictive warming
  predictionWindow: 60000,
  enableTimePatterns: true,
  enableCoAccessPatterns: true,
  autoWarm: true,
  warmThreshold: 3,
  accessDecayMs: 3600000,
  accessDecayFactor: 0.5,

  // Priority: 'named' | 'deadline'
  priorityMode: 'named',
  categoryPriorities: {
    'user': 'high',
    'config': 'critical',
    'cache': 'low',
  },
  getCategoryFromKey: (key) => key.split(':')[0],

  // Cold tier
  preserveTtlFromSource: true,
  tierProgression: ['cold', 'warm', 'hot'],
  promotionThreshold: 3,
  enablePrefetch: true,
  prefetchRelated: async (key) => getRelatedKeys(key),
  coldStorageRateLimit: 100, // requests per second

  // Compression
  compressWarmedData: true,
  compressionThreshold: 1024,
});

// Record access patterns
warmer.recordAccess('user:123');

// Batch warming
const result = await warmer.warmBatch(['key1', 'key2', 'key3'], {
  onProgress: ({ completed, total, percentage }) => {
    console.log(`Progress: ${percentage}%`);
  },
  signal: abortController.signal,
  skipWarmed: true,
});

// Priority warming
await warmer.warmBatchWithPriorities([
  { key: 'critical:1', priority: 'critical' },
  { key: 'normal:1', priority: 'medium' },
]);

// Prefix warming
await warmer.warmPrefix('user:', { limit: 1000 });

// Schedule warming
warmer.scheduleWarm('key', {
  priority: 'high',
  deadline: Date.now() + 60000,
});

// Get predictions
const predicted = warmer.getPredictedWarms({
  timeWindow: 3600000,
  basedOn: 'user:123', // Co-access based
});

// Cold tier warming
const warmResult = await warmer.warmFromCold('cold:key');

// Check state
const isWarmed = warmer.isWarmed('key');
const tier = warmer.getTier('key');
const entry = warmer.getWarmedEntry('key');

// Lifecycle
warmer.start();
warmer.pause();
warmer.resume();
await warmer.stopGracefully();

// Events
warmer.on('warm', ({ key }) => console.log(`Warmed: ${key}`));
```

### MemoryManager

Memory-efficient cache with tracking, eviction, and compression.

```typescript
import { MemoryManager, type MemoryManagerConfig } from '@db4/cache';

const memory = new MemoryManager<User>({
  maxMemoryBytes: 100 * 1024 * 1024, // 100MB
  maxEntries: 10000,

  // Eviction: 'lru' | 'lfu' | 'fifo' | 'size'
  evictionPolicy: 'lru',
  autoEvict: true,
  evictionTargetPercentage: 0.9,
  minEntriesToKeep: 100,

  // Compression
  compressionEnabled: true,
  compressionAlgorithm: 'deflate',
  compressionThreshold: 1024,

  // Memory pressure thresholds
  pressureThresholds: {
    low: 0.7,
    medium: 0.85,
    high: 0.95,
    critical: 0.99,
  },
  onMemoryPressure: (event) => {
    console.log(`Memory pressure: ${event.level} (${event.percentage}%)`);
  },

  // Size estimation
  enableSizeEstimation: true,
  sizeCalculator: (value) => JSON.stringify(value).length,
});

// Methods
memory.set('key', value, { ttlMs: 60000 });
const value = memory.get('key');
memory.delete('key');

// Batch operations
memory.setMany([['a', valueA], ['b', valueB]]);
const values = memory.getMany(['a', 'b']);
memory.deleteMany(['a', 'b']);

// Memory stats
const stats = memory.getMemoryStats();
const entryInfo = memory.getEntryMemoryInfo('key');
const pressure = memory.getMemoryPressureLevel();

// Eviction
const evicted = memory.evict({ targetBytes: 1024 * 1024 });
memory.evictToFit(50 * 1024 * 1024);
memory.enforceMemoryBudget();

// Compression
memory.compressEntry('key');
memory.decompressEntry('key');

// Dynamic limits
memory.setMemoryBudget(200 * 1024 * 1024);
memory.setEntryLimit(20000);

// Iteration
for (const [key, value] of memory) {
  console.log(key, value);
}

for (const [key, value, memInfo] of memory.entriesWithMemoryInfo()) {
  console.log(`${key}: ${memInfo.bytes} bytes`);
}
```

## Configuration Options

### Eviction Policies

| Policy | Description |
|--------|-------------|
| `lru` | Least Recently Used - evicts entries not accessed recently |
| `lfu` | Least Frequently Used - evicts entries with fewest accesses |
| `fifo` | First In First Out - evicts oldest entries |
| `ttl` | Time To Live - evicts entries closest to expiration |
| `size` | Size-based - evicts largest entries first |

### Consistency Levels

| Level | Description |
|-------|-------------|
| `eventual` | Updates propagate asynchronously |
| `strong` | Quorum-based writes with acknowledgments |
| `read-your-writes` | Reads see own writes immediately |
| `causal` | Causally related operations maintain order |
| `linearizable` | All operations appear in global order |

### Conflict Resolution Strategies

| Strategy | Description |
|----------|-------------|
| `last-writer-wins` | Most recent write wins (by timestamp) |
| `first-writer-wins` | First write wins, subsequent writes rejected |
| `custom` | User-defined resolver function |
| `merge` | Merge function combines conflicting values |

## Related Packages

- [@db4/core](../core) - Core types and engine for db4
- [@db4/storage](../storage) - Three-tier storage abstraction (Hot/Warm/Cold)
- [@db4/do](../do) - Durable Object implementation with SQLite

## License

MIT
