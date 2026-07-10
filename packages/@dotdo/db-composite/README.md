---
name: "@dotdo/db-composite"
version: 0.1.0
description: A Payload database adapter that routes operations between local and remote databases with automatic background synchronization
license: MIT
repository: "https://github.com/dot-do/payload"
homepage: "https://github.com/dot-do/payload/tree/main/packages/db-composite"
keywords:
  - payload
  - payloadcms
  - composite
  - database
  - adapter
  - sync
  - routing
  - cloudflare
  - workers
  - edge
downloads:
  monthly: 15
published: "2025-12-18T14:26:32.939Z"
updated: "2025-12-18T14:26:33.223Z"
---

# @dotdo/db-composite

A Payload CMS database adapter that routes operations between local and remote databases with automatic background synchronization. Perfect for edge computing, offline-first applications, and hybrid database architectures.

## Why?

Modern applications need fast reads and durable writes. This adapter lets you:

- **Read from local storage** (SQLite, file system) for sub-millisecond latency
- **Write to remote databases** (ClickHouse, Postgres) for durability and analytics
- **Sync automatically** in the background without blocking requests
- **Configure per-collection** for fine-grained control

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Request   │────▶│    Local    │────▶│   Remote    │
│             │     │   (fast)    │     │  (durable)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    ▲
                           │    Background      │
                           └────── Sync ────────┘
```

## Features

- **Smart Routing** - Route reads and writes to local or remote adapters per collection
- **Background Sync** - Automatic sync with retry and exponential backoff
- **Dual Write** - Write to both adapters simultaneously for critical data
- **Failure Handling** - Queue failed syncs for retry, or fail immediately
- **Environment Adapters** - Native support for Node.js, Cloudflare Workers, Durable Objects, and Vercel
- **Zero Config Defaults** - Works out of the box with sensible defaults

## Installation

```bash
npm install @dotdo/db-composite
# or
pnpm add @dotdo/db-composite
# or
yarn add @dotdo/db-composite
```

## Quick Start

### Node.js / Local Development

```typescript
import { compositeAdapter, syncLogCollection } from '@dotdo/db-composite'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  collections: [
    // Your collections...
    syncLogCollection, // Required: tracks sync state
  ],
  db: compositeAdapter({
    adapters: {
      local: sqliteAdapter({ filename: './data.db' }),
      remote: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } }),
    },
  }),
})
```

### Cloudflare Workers

```typescript
import { compositeAdapter, syncLogCollection } from '@dotdo/db-composite/workers'
import { d1Adapter } from '@dotdo/db-d1'
import { clickhouseAdapter } from '@dotdo/db-clickhouse'

export default buildConfig({
  collections: [syncLogCollection],
  db: compositeAdapter({
    adapters: {
      local: d1Adapter({ binding: 'DB' }),
      remote: clickhouseAdapter({ url: process.env.CLICKHOUSE_URL }),
    },
  }),
})

// In your Worker fetch handler:
export default {
  async fetch(request, env, ctx) {
    const response = await payload.handle(request)
    payload.db.sync(ctx) // Sync in background using waitUntil()
    return response
  },
}
```

### Cloudflare Durable Objects

```typescript
import { compositeAdapter, syncLogCollection } from '@dotdo/db-composite/do'
import { doSqliteAdapter } from '@dotdo/db-do-sqlite'
import { clickhouseAdapter } from '@dotdo/db-clickhouse'

export class MyDurableObject {
  payload: Payload
  state: DurableObjectState

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.state.blockConcurrencyWhile(async () => {
      this.payload = await getPayload({
        config: buildConfig({
          collections: [syncLogCollection],
          db: compositeAdapter({
            state,
            adapters: {
              local: doSqliteAdapter({ state }),
              remote: clickhouseAdapter({ url: env.CLICKHOUSE_URL }),
            },
          }),
        }),
      })
      await this.payload.db.initAlarm()
    })
  }

  async alarm() {
    await this.payload.db.handleAlarm()
  }
}
```

### Vercel Edge Functions

```typescript
import { compositeAdapter, syncLogCollection } from '@dotdo/db-composite/vercel'
import { vercelKVAdapter } from '@dotdo/db-vercel-kv'
import { postgresAdapter } from '@payloadcms/db-postgres'

export default buildConfig({
  collections: [syncLogCollection],
  db: compositeAdapter({
    adapters: {
      local: vercelKVAdapter({
        /* ... */
      }),
      remote: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } }),
    },
  }),
})
```

## Configuration

### Routing Defaults

Control how all collections route operations:

```typescript
compositeAdapter({
  adapters: { local, remote },
  defaults: {
    read: 'local', // 'local' | 'remote' - where to read from
    write: 'local', // 'local' | 'remote' | 'dual' - where to write
    sync: 'background', // 'background' | false - sync local writes to remote
    onRemoteFail: 'queue', // 'queue' | 'fail' - what to do when remote fails
  },
})
```

### Per-Collection Overrides

Override routing for specific collections:

```typescript
compositeAdapter({
  adapters: { local, remote },
  collections: {
    // Critical data: write to both, fail if remote is down
    payments: {
      write: 'dual',
      onRemoteFail: 'fail',
    },

    // Analytics: write directly to remote, no sync needed
    events: {
      write: 'remote',
      read: 'remote',
      sync: false,
    },

    // Drafts: local only, never sync
    drafts: {
      write: 'local',
      read: 'local',
      sync: false,
    },
  },

  // Same options available for globals
  globals: {
    siteSettings: {
      write: 'dual',
      onRemoteFail: 'fail',
    },
  },
})
```

## Routing Strategies

### `write: 'local'` (Default)

Writes go to local adapter, then sync to remote in background.

```
Request ──▶ Local DB ──▶ Response
                │
                └──▶ Background Sync ──▶ Remote DB
```

Best for: Most use cases. Fast writes with eventual consistency.

### `write: 'remote'`

Writes go directly to remote adapter. No sync needed.

```
Request ──▶ Remote DB ──▶ Response
```

Best for: Analytics events, logs, data that doesn't need local caching.

### `write: 'dual'`

Writes go to both adapters simultaneously.

```
Request ──▶ Local DB ──┬──▶ Response
           Remote DB ──┘
```

Best for: Critical data where you need immediate durability AND local caching.

### `read: 'local'` (Default)

Reads from local adapter for fastest response.

### `read: 'remote'`

Reads from remote adapter. Useful when remote is the source of truth.

## Sync Mechanism

### How It Works

1. **Write Operation** - Data written to local adapter
2. **Log Change** - Change event recorded in `_sync_log` collection
3. **Background Sync** - Worker processes pending changes
4. **Apply to Remote** - Changes applied to remote adapter
5. **Mark Synced** - Change event marked as synced

### Retry Logic

Failed syncs are retried with exponential backoff:

- Attempt 1: 1s delay
- Attempt 2: 2s delay
- Attempt 3: 4s delay
- ...up to 5 minute max delay

After 10 failed attempts, changes are moved to "dead letter" status for manual review.

### Sync Status

Monitor sync health programmatically:

```typescript
const status = await payload.db.getSyncStatus()

console.log(status)
// {
//   pendingChanges: 5,
//   failedCount: 0,
//   lastSyncedAt: 1702900000000,
//   lastError: null
// }
```

### Manual Sync

Trigger sync manually when needed:

```typescript
// Node.js
await payload.db.sync()

// Workers (with context)
payload.db.sync(ctx)
```

## API Reference

### Entry Points

| Import                        | Environment        | Sync Method           |
| ----------------------------- | ------------------ | --------------------- |
| `@dotdo/db-composite`         | Node.js            | Thread-based interval |
| `@dotdo/db-composite/workers` | Cloudflare Workers | `ctx.waitUntil()`     |
| `@dotdo/db-composite/do`      | Durable Objects    | Alarms                |
| `@dotdo/db-composite/vercel`  | Vercel Edge        | `waitUntil()`         |

### `compositeAdapter(args)`

Creates the composite adapter.

```typescript
interface CompositeAdapterArgs {
  adapters: {
    local: DatabaseAdapterObj // Fast, local storage
    remote: DatabaseAdapterObj // Durable, remote storage
  }
  defaults?: RoutingDefaults
  collections?: Record<string, CollectionRouting>
  globals?: Record<string, GlobalRouting>
}

interface RoutingDefaults {
  read?: 'local' | 'remote' // Default: 'local'
  write?: 'local' | 'remote' | 'dual' // Default: 'local'
  sync?: 'background' | false // Default: 'background'
  onRemoteFail?: 'queue' | 'fail' // Default: 'queue'
}
```

### `syncLogCollection`

Required collection that tracks sync state. Add to your collections:

```typescript
import { syncLogCollection } from '@dotdo/db-composite'

export default buildConfig({
  collections: [
    // your collections...
    syncLogCollection,
  ],
})
```

### Adapter Methods

```typescript
// Trigger manual sync
await payload.db.sync()

// Get sync status
const status = await payload.db.getSyncStatus()
// Returns: { pendingChanges, failedCount, lastSyncedAt, lastError }
```

### Durable Objects Methods

```typescript
// Initialize alarm (call in constructor)
await payload.db.initAlarm()

// Handle alarm callback
await payload.db.handleAlarm()
```

## Examples

### E-commerce with Local-First Reads

```typescript
compositeAdapter({
  adapters: {
    local: sqliteAdapter({ filename: './catalog.db' }),
    remote: postgresAdapter({
      /* ... */
    }),
  },
  collections: {
    // Products: fast reads, synced writes
    products: {
      read: 'local',
      write: 'local',
      sync: 'background',
    },

    // Orders: dual write for durability
    orders: {
      write: 'dual',
      onRemoteFail: 'fail',
    },

    // Cart: local only, never sync
    cart: {
      write: 'local',
      sync: false,
    },
  },
})
```

### Analytics Pipeline

```typescript
compositeAdapter({
  adapters: {
    local: sqliteAdapter({
      /* ... */
    }),
    remote: clickhouseAdapter({
      /* ... */
    }),
  },
  defaults: {
    read: 'local',
    write: 'local',
    sync: 'background',
  },
  collections: {
    // Events go directly to ClickHouse
    events: {
      write: 'remote',
      read: 'remote',
      sync: false,
    },

    // Aggregated stats cached locally
    stats: {
      write: 'remote',
      read: 'local',
    },
  },
})
```

### Multi-Region with Edge Caching

```typescript
// Edge Worker
compositeAdapter({
  adapters: {
    local: d1Adapter({ binding: 'CACHE_DB' }),
    remote: planetscaleAdapter({
      /* ... */
    }),
  },
  defaults: {
    read: 'local', // Fast edge reads
    write: 'dual', // Write-through cache
    onRemoteFail: 'queue',
  },
})
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  CompositeAdapterArgs,
  RoutingDefaults,
  CollectionRouting,
  GlobalRouting,
  SyncStatus,
  ChangeEvent,
} from '@dotdo/db-composite'
```

## License

MIT
