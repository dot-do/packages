---
name: "@dotdo/electric"
version: 0.1.1
description: ElectricSQL integration for local-first sync with PGLite and Cloudflare Workers
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - electric
  - electricsql
  - sync
  - local-first
  - offline-first
  - pglite
  - postgres
  - cloudflare
  - workers
  - durable-objects
  - durable-streams
  - durable-sessions
downloads:
  monthly: 40
published: "2026-01-22T15:58:35.255Z"
updated: "2026-01-24T15:48:54.599Z"
---

# @dotdo/electric

**Real-time sync between PostgreSQL and your app.**

```typescript
import { ShapeManager, SyncEngine } from '@dotdo/electric'

const shapes = new ShapeManager(pglite)
const sync = new SyncEngine({ url: 'https://db.postgres.do/mydb' })

// Subscribe to a shape - data syncs automatically
await shapes.subscribe({
  table: 'todos',
  where: { userId: currentUser.id }
})

// Changes sync in real-time. Offline? No problem.
await pglite.query(`INSERT INTO todos (title) VALUES ('Ship it')`)
```

## Why @dotdo/electric?

You're building a collaborative app. Users expect:

- Instant UI updates (no loading spinners)
- Offline support (works on the subway)
- Real-time collaboration (see others' changes)
- Conflict resolution (when edits collide)

**The old way:** Polling APIs. Stale data. "Sync failed" toasts. Custom WebSocket spaghetti.

**The electric way:** Subscribe to shapes. Data flows. Offline works. Conflicts resolve. Ship your app.

## What You Get

- **Offline-first** - App works without network, syncs when online
- **Instant updates** - Local reads, zero network latency
- **Real-time sync** - Changes propagate to all clients
- **Shape subscriptions** - Sync only the data you need
- **Conflict resolution** - Last-write-wins or custom strategies
- **FREE cache reads** - Local data = zero network cost

## Installation

```bash
npm install @dotdo/electric @dotdo/pglite
```

## Quick Start

### Basic Sync

```typescript
import { PGlite } from '@dotdo/pglite'
import { ShapeManager, SyncEngine } from '@dotdo/electric'

// Local PGLite database (browser or edge)
const pglite = new PGlite()

// Shape manager handles partial replication
const shapes = new ShapeManager(pglite)

// Subscribe to shapes you care about
await shapes.subscribe({
  table: 'todos',
  where: { userId: 'user_123' }
})

// Data is now local - queries are instant
const todos = await pglite.query('SELECT * FROM todos')

// Local changes sync automatically
await pglite.query(`
  INSERT INTO todos (title, completed) VALUES ('New task', false)
`)
```

### Shape Subscriptions

Define exactly what data to sync:

```typescript
// Simple table subscription
await shapes.subscribe({ table: 'todos' })

// With filters
await shapes.subscribe({
  table: 'todos',
  where: { userId: currentUser.id, completed: false }
})

// With relations
await shapes.subscribe({
  table: 'posts',
  include: {
    comments: { where: { approved: true } },
    author: true
  }
})

// Unsubscribe when done
await shapes.unsubscribe('todos')
```

Think of shapes as "materialized views that sync."

## Durable Streams

Reliable event streaming for real-time features:

```typescript
import { DurableStreamProducer, DurableStreamConsumer } from '@dotdo/electric/streams'

// Producer - emit events
const producer = new DurableStreamProducer({
  streamId: 'chat-room-123',
  url: 'https://db.postgres.do/mydb'
})

await producer.emit({
  type: 'message',
  data: { text: 'Hello!', userId: 'user_123' }
})

// Consumer - receive events
const consumer = new DurableStreamConsumer({
  streamId: 'chat-room-123',
  url: 'https://db.postgres.do/mydb',
  fromSequence: 0  // Resume from any point
})

for await (const event of consumer) {
  console.log('Received:', event)
}
```

Events are durably stored. Consumers can disconnect and resume. No messages lost.

## Durable Sessions

Collaborative sessions with state persistence:

```typescript
import { SessionManager } from '@dotdo/electric/sessions'

const sessions = new SessionManager({
  url: 'https://db.postgres.do/mydb'
})

// Create or join a session
const session = await sessions.create({
  sessionId: 'doc-edit-123',
  initialState: { document: '', cursors: {} }
})

// Participants join
await session.join({ userId: 'user_456', name: 'Jane' })

// Apply mutations (synced to all participants)
await session.mutate({
  type: 'cursor_move',
  data: { userId: 'user_456', position: 42 }
})

// Subscribe to state changes
session.subscribe((state, change) => {
  renderDocument(state.document)
  renderCursors(state.cursors)
})
```

Perfect for: collaborative editing, multiplayer games, shared whiteboards.

## Sync Engine

Full bidirectional sync with conflict handling:

```typescript
import { SyncEngine } from '@dotdo/electric/sync'

const sync = new SyncEngine({
  local: pglite,
  remote: 'https://db.postgres.do/mydb',
  tables: ['todos', 'projects']
})

// Start sync
await sync.start()

// Monitor status
sync.onStateChange((state) => {
  if (state.status === 'synced') showGreenDot()
  if (state.status === 'syncing') showYellowDot()
  if (state.status === 'offline') showGrayDot()
})

// Handle conflicts
sync.onConflict((local, remote) => {
  // Return the winner
  return local.updatedAt > remote.updatedAt ? local : remote
})

// Pause/resume for battery saving
await sync.pause()
await sync.resume()
```

## Architecture

```
+------------------+     +------------------+     +------------------+
|   Browser/Edge   |     |   Browser/Edge   |     |   Browser/Edge   |
|  +------------+  |     |  +------------+  |     |  +------------+  |
|  |   PGLite   |  |     |  |   PGLite   |  |     |  |   PGLite   |  |
|  +-----+------+  |     |  +-----+------+  |     |  +-----+------+  |
|        |         |     |        |         |     |        |         |
|  +-----+------+  |     |  +-----+------+  |     |  +-----+------+  |
|  |   Shapes   |  |     |  |   Shapes   |  |     |  |   Shapes   |  |
|  +-----+------+  |     |  +-----+------+  |     |  +-----+------+  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                    +-------------+-------------+
                    |       postgres.do         |
                    |  +---------------------+  |
                    |  |    Durable Object   |  |
                    |  |  +---------------+  |  |
                    |  |  |    PGLite     |  |  |
                    |  |  +---------------+  |  |
                    |  +---------------------+  |
                    +---------------------------+
```

Each client has a local PGLite. Shape subscriptions define what syncs. Changes flow bidirectionally.

## Offline Support

Electric apps work offline by default:

```typescript
import { OfflineManager } from '@dotdo/electric/offline'

const offline = new OfflineManager({
  sync,
  storage: 'indexeddb'  // Persist across browser sessions
})

// Queue mutations when offline
await offline.mutate({
  sql: 'INSERT INTO todos (title) VALUES ($1)',
  params: ['Offline task']
})

// Mutations apply immediately to local state
// Sync when back online - automatically

// Check connectivity
console.log(offline.isOnline)  // false
console.log(offline.pendingCount)  // 3 mutations queued
```

## Conflict Resolution

Multiple strategies built-in:

```typescript
// Last-write-wins (default)
sync.setConflictStrategy('last-write-wins')

// Server always wins
sync.setConflictStrategy('server-wins')

// Client always wins
sync.setConflictStrategy('client-wins')

// Custom logic
sync.onConflict((local, remote, base) => {
  // Merge intelligently
  return {
    ...remote,
    title: local.title,  // Keep client's title
    updatedAt: Math.max(local.updatedAt, remote.updatedAt)
  }
})
```

## Integration with @dotdo/postgres

Electric extends postgres.do for real-time sync:

```typescript
import { Postgres } from '@dotdo/postgres'
import { SyncEngine } from '@dotdo/electric'

// Your postgres.do database
const db = new Postgres({ url: 'https://db.postgres.do/mydb' })

// Add real-time sync
const sync = new SyncEngine({
  local: pglite,
  remote: db
})

// Server-side changes flow to clients
// Client-side changes flow to server
// Offline mutations queue and sync
```

## Cost Benefits

| Feature | @dotdo/electric | Traditional Sync |
|---------|-----------------|------------------|
| Local reads | FREE (no network) | Per-query cost |
| Offline mode | Full functionality | Degraded/none |
| Real-time | Built-in WebSocket | Complex setup |
| Hibernation | $0 when idle | Always running |

Local-first = fewer requests = lower costs = faster UX.

## API Reference

### ShapeManager
- `subscribe(shape)` - Subscribe to a shape
- `unsubscribe(table)` - Unsubscribe from table
- `getShapes()` - List active subscriptions

### SyncEngine
- `start()` / `stop()` - Control sync
- `onConflict(handler)` - Handle conflicts
- `onStateChange(handler)` - Monitor status

### DurableStreams
- `DurableStreamProducer` - Emit events
- `DurableStreamConsumer` - Consume events

### Sessions
- `SessionManager` - Create/join sessions
- `Session` - Participate in a session

## Links

- [Documentation](https://postgres.do/docs/electric)
- [GitHub](https://github.com/dot-do/postgres)
- [ElectricSQL](https://electric-sql.com/) (Inspiration)

## Related Packages

- [`@dotdo/postgres`](../postgres) - PostgreSQL server
- [`@dotdo/tanstack`](../tanstack) - TanStack integration
- [`@dotdo/pg-lake`](../pglake) - Data lakehouse

## License

MIT
