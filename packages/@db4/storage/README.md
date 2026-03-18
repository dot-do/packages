---
name: "@db4/storage"
version: 0.1.2
description: Three-tier storage abstraction for db4 - intelligent data tiering from edge to object storage
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - storage
  - tiering
  - cloudflare
  - workers
  - durable-objects
  - r2
  - cache
downloads:
  monthly: 8
published: "2026-01-20T11:31:52.804Z"
updated: "2026-01-23T17:20:47.016Z"
---

# @db4/storage

([GitHub](https://github.com/dot-do/db4/tree/main/packages/storage), [npm](https://www.npmjs.com/package/@db4/storage))

**Stop paying premium prices for data nobody reads.**

Your database stores years of data. 90% hasn't been touched in months. Yet you're paying hot-tier prices to keep it all instantly available. Cache invalidation fails silently. Manual tiering eats engineering hours. Storage bills climb every quarter.

@db4/storage fixes this: automatic three-tier placement keeps active data fast and archives the rest at 1/10th the cost.

## Three Tiers, One API

| Tier | Storage | Latency | Cost | Best For |
|------|---------|---------|------|----------|
| **Hot** | DO SQLite | ~13ms | $$$ | Active transactions, recent writes |
| **Warm** | Edge Cache | ~16ms | $$ | Frequently read, rarely updated |
| **Cold** | R2 Objects | ~116ms | $ | Historical archives, backups |

Data flows between tiers automatically based on access patterns. No manual intervention.

## Installation

```bash
npm install @db4/storage
```

## Get Started in 3 Steps

### 1. Configure Tiers

```typescript
import { TieredStore, StorageTier } from '@db4/storage'

const store = new TieredStore({
  hot: {
    type: 'memory',
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  warm: {
    type: 'cache',
    cache: caches.default,
    ttl: 3600,
    staleWhileRevalidate: 300,
  },
  cold: {
    type: 'r2',
    bucket: env.R2_BUCKET,
    prefix: 'data/',
    compression: 'gzip',
  },
  tiering: {
    hotThresholdMs: 60 * 60 * 1000,      // 1 hour
    warmThresholdMs: 24 * 60 * 60 * 1000, // 24 hours
    accessCountThreshold: 5,
    promoteOnRead: true,
  },
})
```

### 2. Read and Write

```typescript
// Write to hot tier
await store.write('users', 'user-123', {
  name: 'Alice',
  email: 'alice@example.com',
})

// Read with automatic tier traversal: hot -> warm -> cold
const user = await store.read('users', 'user-123')
// Promotes to hot if promoteOnRead is enabled

// Force cold placement for archives
await store.write('archives', 'report-2024', data, {
  tier: StorageTier.COLD,
})
```

### 3. Run Tiering

```typescript
const result = await store.runTiering({ maxOperations: 100 })
// Demotes inactive data, promotes accessed cold data

console.log(`Promoted: ${result.promoted}, Demoted: ${result.demoted}`)
```

## Core Features

### Smart Classification

Documents auto-classify by age and access frequency:

```typescript
import { classifyTier } from '@db4/storage'

const tier = classifyTier(document, {
  hotThresholdMs: 3600000,      // Hot for 1 hour
  warmThresholdMs: 86400000,    // Warm for 24 hours
  accessCountThreshold: 5,      // 5+ accesses = stay hot
  accessWindowMs: 3600000,
})
```

### Access Tracking

Track patterns to make intelligent tiering decisions:

```typescript
import { AccessPatternTracker } from '@db4/storage'

const tracker = new AccessPatternTracker({
  historyWindow: 7 * 24 * 60 * 60 * 1000,
  coldPredictionThreshold: 3,
  coldAgeThreshold: 7 * 24 * 60 * 60 * 1000,
})

tracker.recordAccess('users/user-123')

const coldCandidates = tracker.predictColdDocuments()
const score = tracker.getTieringScore('users/user-123')
// Higher score = keep hotter
```

### Manual Tier Control

Override automatic tiering when needed:

```typescript
// Promote cold data to hot
await store.promote('reports', 'dashboard-summary', StorageTier.HOT)

// Demote old data (deletes from source by default)
await store.demote('logs', 'log-2023-01', StorageTier.COLD)

// Keep a copy in source tier
await store.demote('logs', 'log-2023-02', StorageTier.WARM, {
  keepInSource: true,
})

// Check current tier
const tier = await store.getTier('users', 'user-123')
```

### Cache Invalidation

Version tracking with distributed broadcast:

```typescript
import {
  CacheInvalidationManager,
  InMemoryBroadcastChannel,
  StorageTier,
} from '@db4/storage'

const cache = new CacheInvalidationManager({
  invalidateOnWrite: true,
  versionBasedInvalidation: true,
  defaultTtlMs: 3600000,
  broadcastEnabled: true,
  nodeId: 'worker-1',
})

cache.setBroadcastChannel(new InMemoryBroadcastChannel('my-app'))

cache.set('users', 'user-123', document, 3600000)
const result = cache.get('users', 'user-123', expectedVersion)

if (result.versionMismatch) {
  await cache.invalidate('users', 'user-123', StorageTier.HOT)
}

cache.subscribe((event) => {
  console.log(`${event.type}: ${event.collection}/${event.id}`)
})
```

### Large File Uploads

Multipart uploads for 100MB+ files with resume:

```typescript
import { MultipartUploadState } from '@db4/storage'

const coldStorage = store.getColdStorage()

const result = await coldStorage.writeLarge('videos', 'video-123', largeBuffer, {
  partSize: 100 * 1024 * 1024,
  concurrency: 4,
  onProgress: (p) => console.log(`${p.percentComplete}%`),
  abortSignal: controller.signal,
})

// Resume interrupted uploads
const session = await coldStorage.getUploadStatus(uploadId)
if (session?.state === MultipartUploadState.FAILED) {
  await coldStorage.resumeUpload(uploadId, largeBuffer)
}

await coldStorage.cleanupExpiredUploads(24 * 60 * 60 * 1000)
```

### At-Rest Encryption

AES-256-GCM envelope encryption with key rotation:

```typescript
import {
  EncryptionManager,
  EncryptedStorageWrapper,
  generateMasterKey,
} from '@db4/storage'

const masterKey = await generateMasterKey()

const encryption = new EncryptionManager({
  masterKey,
  defaultKeyExpirationMs: 90 * 24 * 60 * 60 * 1000,
  destructionGracePeriodMs: 7 * 24 * 60 * 60 * 1000,
})
await encryption.initialize()

const wrapper = new EncryptedStorageWrapper({
  encryptionManager: encryption,
  includeIdInAad: true,
  includeCollectionInAad: true,
})

const encrypted = await wrapper.encryptDocument('users', 'user-123', userData)
const decrypted = await wrapper.decryptDocument('users', 'user-123', encrypted)

// Key rotation
const rotation = await encryption.rotateKey({ keepOldKey: true })

if (await wrapper.needsReencryption(encrypted)) {
  await wrapper.reencryptDocument('users', 'user-123', encrypted)
}
```

## API Reference

### TieredStore

| Method | Description |
|--------|-------------|
| `write(collection, id, doc, options?)` | Write to specified tier |
| `read(collection, id)` | Read with automatic tier traversal |
| `delete(collection, id, options?)` | Delete from one or all tiers |
| `getTier(collection, id)` | Get document's current tier |
| `promote(collection, id, tier, options?)` | Move to hotter tier |
| `demote(collection, id, tier, options?)` | Move to colder tier |
| `runTiering(options?)` | Run automatic tiering |
| `writeBatch(collection, docs, options?)` | Batch write |
| `readBatch(collection, ids)` | Batch read |
| `getHotStorage()` | Access hot tier directly |
| `getWarmStorage()` | Access warm tier directly |
| `getColdStorage()` | Access cold tier directly |

### Storage Tiers

| Class | Description |
|-------|-------------|
| `HotStorage` | In-memory with size limits and access tracking |
| `WarmStorage` | Edge Cache with TTL and stale-while-revalidate |
| `ColdStorage` | R2 objects with multipart upload |

### Utilities

| Export | Description |
|--------|-------------|
| `classifyTier()` | Classify document into recommended tier |
| `getTierPriority()` | Numeric priority (hot=2, warm=1, cold=0) |
| `isHotter()` / `isColder()` | Compare tier temperatures |
| `AccessPatternTracker` | Track and analyze access patterns |
| `CacheInvalidationManager` | Cache invalidation with broadcast |
| `InMemoryBroadcastChannel` | In-memory broadcast for testing |
| `EncryptionManager` | Envelope encryption with rotation |
| `EncryptedStorageWrapper` | Document encryption helper |
| `InMemoryKeyStore` | In-memory key store for testing |
| `KeyState` | Key states: ACTIVE, DECRYPT_ONLY, etc. |
| `R2MultipartUploader` | Large file multipart uploads |
| `InMemorySessionStore` | Upload session store for testing |
| `MultipartUploadState` | Upload states: PENDING, IN_PROGRESS, etc. |

### Types

```typescript
enum StorageTier { HOT = 'hot', WARM = 'warm', COLD = 'cold' }

enum MultipartUploadState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
  FAILED = 'failed',
}

enum KeyState {
  ACTIVE = 'active',
  DECRYPT_ONLY = 'decrypt_only',
  PENDING_DESTRUCTION = 'pending_destruction',
  DESTROYED = 'destroyed',
}

interface TieredDocument {
  id: string
  tier?: StorageTier
  _meta: TieredDocumentMeta
  [key: string]: unknown
}

interface TieredStoreConfig {
  hot: HotStorageConfig
  warm: WarmStorageConfig
  cold: ColdStorageConfig
  tiering: TieringConfig
}
```

## Without Tiering

- **10x overspend**: Hot storage for data nobody reads
- **Silent cache failures**: Stale data causes bugs users notice
- **Engineering drain**: Manual migrations eat sprint velocity
- **Performance cliff**: Hot tier fills up, everything slows down

## With @db4/storage

- **10x cost reduction**: Cold data in R2 at $0.015/GB vs $0.15/GB
- **Sub-20ms reads**: Active data stays fast in hot/warm tiers
- **Zero stale data**: Version-based invalidation catches every change
- **Hands-off scaling**: Access patterns drive automatic optimization
- **Encrypted at rest**: AES-256-GCM envelope encryption standard

## Related Packages

- [@db4/core](../core) - Core types and utilities
- [@db4/do](../do) - Durable Object implementation
- [@db4/vortex](../vortex) - 2MB columnar blob format
- [@db4/iceberg](../iceberg) - CDC to Apache Iceberg streaming

## License

MIT
