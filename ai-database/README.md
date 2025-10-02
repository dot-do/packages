# @dot-do/ai-database

Unified database abstraction layer supporting both **Cloudflare D1** and **Durable Objects SQLite**, with first-class **PayloadCMS** integration.

## Features

- 🔄 **Dual Backend Support** - Single API for D1 and DO SQLite
- ⚡ **Zero-Latency Option** - DO SQLite runs in same thread as your code
- 🎯 **Type-Safe** - Full TypeScript support with Drizzle ORM
- 📦 **PayloadCMS Ready** - Pre-built adapters for both backends
- 🔍 **Query Builder** - Elegant, chainable query API
- 🏗️ **Migration Tools** - Utilities for both D1 and DO SQLite migrations
- 📊 **Monitoring** - Built-in stats and health checks

## Installation

```bash
pnpm add @dot-do/ai-database
```

## Quick Start

### D1 Backend

```typescript
import { createDatabase } from '@dot-do/ai-database'

// In your Worker
export default {
  async fetch(request, env) {
    const db = createDatabase({
      type: 'D1',
      binding: env.DB
    })

    const users = await db.select()
      .from('users')
      .where({ active: true })
      .execute()

    return Response.json(users)
  }
}
```

### DO SQLite Backend

```typescript
import { createDatabase } from '@dot-do/ai-database'

export class MyDurableObject extends DurableObject {
  private db

  constructor(state, env) {
    super(state, env)

    this.db = createDatabase({
      type: 'DO_SQLITE',
      storage: state.storage
    })
  }

  async fetch(request) {
    const stats = await this.db.getStats()
    return Response.json(stats)
  }
}
```

### PayloadCMS Integration

```typescript
import { createPayloadAdapter } from '@dot-do/ai-database/adapters/payload'
import { buildConfig } from 'payload'

export default buildConfig({
  db: createPayloadAdapter({
    type: process.env.DATABASE_BACKEND || 'D1',
    binding: env.DB, // for D1
    storage: doStorage, // for DO SQLite
  }),
  collections: [/* ... */]
})
```

## Architecture

### Unified API

All backends share the same core API:

```typescript
interface Database {
  // Collections
  things: ThingCollection
  relationships: RelationshipCollection

  // Namespace access
  namespace(ns: string): NamespaceCollection

  // Query builders
  select<T>(): QueryBuilder<T>
  from(table: string): QueryBuilder

  // Direct operations
  query<T>(query: DbQuery): Promise<T[]>
  insert(table: string, data: any): Promise<any>
  update(table: string, data: any, where: Where): Promise<any>
  delete(table: string, where: Where): Promise<void>

  // Utility
  getHealthStatus(): Promise<HealthStatusResult>
}
```

### Backend-Specific Features

**DO SQLite only:**
```typescript
// WebSocket real-time updates
await db.subscribe('users', (change) => {
  console.log('User changed:', change)
})

// Stats and monitoring
const stats = await db.getStats()

// Point-in-time recovery
await db.restore(timestamp)
```

**D1 only:**
```typescript
// Read replica support via Sessions API
const readDb = db.withSession('fast') // or 'fresh'
const users = await readDb.select().from('users').execute()
```

## Migrations

### D1 Migrations

```bash
# Generate migration
pnpm db:generate

# Push to D1
pnpm db:push:d1
```

### DO SQLite Migrations

Migrations run automatically in the Durable Object constructor:

```typescript
import { migrate } from '@dot-do/ai-database/migrations'

export class PayloadDatabase extends DurableObject {
  constructor(state, env) {
    super(state, env)

    state.blockConcurrencyWhile(async () => {
      await migrate(state.storage, {
        migrationsFolder: './drizzle'
      })
    })
  }
}
```

## D1 vs DO SQLite Comparison

| Feature                | D1                    | DO SQLite              |
| ---------------------- | --------------------- | ---------------------- |
| Latency                | ~5-50ms (network)     | ~0.1ms (same-thread)   |
| Best for               | Stateless apps        | Real-time, stateful    |
| Storage per database   | Unlimited             | 10GB per DO            |
| Read replicas          | Yes (Sessions API)    | No (single instance)   |
| Point-in-time recovery | No                    | Yes (30 days)          |
| WebSocket support      | No                    | Yes                    |
| Migration pattern      | Drizzle Kit           | DO constructor         |

## Examples

See `/examples` for complete examples:

- Basic D1 usage
- DO SQLite with real-time features
- PayloadCMS integration
- Migration from D1 to DO SQLite

## Documentation

- [API Reference](./docs/api.md)
- [Migration Guide](./docs/migrations.md)
- [PayloadCMS Integration](./docs/payload.md)
- [Performance Benchmarks](./docs/performance.md)

## Contributing

This package is part of the [@dot-do](https://github.com/dot-do) monorepo.

---

**Status:** Under Development
**Version:** 0.1.0
**License:** MIT
