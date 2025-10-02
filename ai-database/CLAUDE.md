# @dot-do/ai-database - Development Guide

## Overview

Unified database abstraction layer supporting both **Cloudflare D1** and **Durable Objects SQLite** with first-class **PayloadCMS** integration.

## Project Status

**Phase 2: Core API Design** ✅ Complete
**Phase 3: D1 Adapter** 🚧 Next
**Phase 4: DO SQLite Adapter** ⏳ Pending
**Phase 5: PayloadCMS Integration** ⏳ Pending

## Architecture

### Inspiration Sources

This package is built from scratch, taking inspiration from:

1. **`api.services/code/runtime/db.ts`** - Elegant Drizzle ORM patterns, query builder
2. **`api.services/code/runtime/database.ts`** - Thing/Relationship collections, namespace routing
3. **`api.services/durableObjects/database-do.ts`** - WebSocket, analytics, stats for DO
4. **`agent/worker/database/database.ts`** - Clean service class pattern
5. **`app/src/db-adapters/db-do-sqlite/`** - Production PayloadCMS adapter

### Core Design Principles

1. **Unified API** - Single interface works with both D1 and DO SQLite
2. **Type Safety** - Full TypeScript support with Drizzle ORM
3. **Adapter Pattern** - Backend-specific features via optional methods
4. **Zero Dependencies** - Core has minimal dependencies, adapters can add more
5. **PayloadCMS First** - Pre-built adapters that actually work

## Directory Structure

```
src/
├── adapters/          # Backend-specific implementations
│   ├── d1/           # D1 adapter (Phase 3)
│   ├── do-sqlite/    # DO SQLite adapter (Phase 4)
│   └── payload/      # PayloadCMS adapters (Phase 5)
├── core/             # Core abstractions
│   ├── factory.ts    # createDatabase() factory
│   └── utils.ts      # Shared utilities
├── migrations/       # Migration utilities (Phase 6)
├── types/            # TypeScript definitions
│   └── index.ts      # All type exports
└── index.ts          # Public API
```

## Development Workflow

### Phase 3: D1 Adapter (Current)

**Implementation checklist:**
- [ ] D1 connection with Drizzle (`drizzle-orm/d1`)
- [ ] Query builder implementation
- [ ] Thing/Relationship collections
- [ ] D1 Sessions API for read replicas
- [ ] Health checks
- [ ] Error handling
- [ ] Unit tests

**Files to create:**
- `src/adapters/d1/database.ts` - Main D1 class
- `src/adapters/d1/collections.ts` - Thing/Relationship implementations
- `src/adapters/d1/query-builder.ts` - Query builder class

### Phase 4: DO SQLite Adapter

**Implementation checklist:**
- [ ] DO SQLite connection with Drizzle (`drizzle-orm/durable-sqlite`)
- [ ] All D1 features plus:
- [ ] WebSocket real-time updates
- [ ] Analytics Engine integration
- [ ] Per-user/namespace/domain routing
- [ ] Stats and monitoring
- [ ] Point-in-time recovery API

### Phase 5: PayloadCMS Integration

**Copy and refine from:**
- `app/src/db-adapters/db-do-sqlite/index.ts`
- `app/src/db-adapters/db-do-sqlite/connect.ts`
- `app/src/db-adapters/db-do-sqlite/execute.ts`
- `app/src/db-adapters/db-do-sqlite/types.ts`

**Create:**
- Dual backend support (D1 and DO SQLite)
- Environment-based selection
- Migration helpers

## Key Decisions

### 1. Unified Interface

All backends implement the same core `Database` interface:

```typescript
interface Database {
  things: ThingCollection
  relationships: RelationshipCollection
  namespace(ns: string): NamespaceCollection
  select<T>(): QueryBuilder<T>
  query<T>(query: DbQuery): Promise<T[]>
  // ... etc
}
```

### 2. Optional Backend Features

Backend-specific features are optional methods:

```typescript
// DO SQLite only
db.getStats?.()
db.subscribe?.('table', callback)
db.restore?.(timestamp)

// D1 only
db.withSession?.('fast')
```

### 3. Thing/Relationship Model

Core entity types from api.services:

```typescript
interface Thing {
  ns: string        // namespace
  id: string        // human-readable slug
  type: string      // Schema.org type
  content?: string  // markdown content
  code?: string     // executable code
  data: object      // structured data
  visibility: 'public' | 'private' | 'unlisted'
}
```

### 4. Migration Strategy

Different patterns for different backends:

**D1:** Standard Drizzle Kit
```bash
drizzle-kit generate
drizzle-kit push:d1
```

**DO SQLite:** Constructor-based
```typescript
state.blockConcurrencyWhile(async () => {
  await migrate(storage, { migrationsFolder: './drizzle' })
})
```

## Testing

### Unit Tests

```bash
pnpm test                  # Run all tests
pnpm test src/adapters/d1  # Test D1 adapter
pnpm test:coverage         # With coverage
```

### Integration Tests

Test both backends with real Cloudflare bindings using Vitest's Workers pool.

## Common Patterns

### Creating Database

```typescript
// D1
const db = createDatabase({
  type: 'D1',
  binding: env.DB
})

// DO SQLite
const db = createDatabase({
  type: 'DO_SQLITE',
  storage: state.storage
})
```

### Querying Data

```typescript
// Query builder (works with both backends)
const users = await db
  .select()
  .from('users')
  .where({ active: true })
  .orderBy('createdAt', 'desc')
  .limit(10)
  .execute()

// Collections API
const thing = await db.things.find('software-developers', 'onet')
const things = await db.things.where({ type: 'Occupation' }).execute()

// Namespace API
const onet = db.namespace('onet')
const occupations = await onet.things.where({ type: 'Occupation' }).execute()
```

## Dependencies

### Core
- `drizzle-orm` - ORM for both D1 and DO SQLite
- `@cloudflare/workers-types` - TypeScript types

### Development
- `drizzle-kit` - Schema management and migrations
- `vitest` - Testing framework
- `typescript` - Type checking

### Optional (Peer)
- `@payloadcms/drizzle` - For PayloadCMS integration

## Legacy Reference

See `/legacy/platform/` and `/legacy/ai/` for historical implementations. **Do not copy code** - study patterns and rewrite for our architecture.

## Next Steps

1. Implement D1 adapter (Phase 3)
2. Implement DO SQLite adapter (Phase 4)
3. PayloadCMS integration (Phase 5)
4. Migration utilities (Phase 6)
5. Full test coverage (Phase 7)
6. Examples and docs (Phase 8)

---

**Status:** In Development (Phase 2 Complete)
**Version:** 0.1.0
**Last Updated:** 2025-10-02
**Managed By:** Claude Code
