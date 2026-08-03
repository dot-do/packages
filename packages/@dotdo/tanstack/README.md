---
name: "@dotdo/tanstack"
version: 0.1.1
description: "TanStack DB integration for @dotdo/postgres with local-first sync"
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - tanstack
  - tanstack-query
  - tanstack-db
  - postgres
  - pglite
  - local-first
  - sync
  - optimistic-updates
  - cloudflare
  - workers
downloads:
  monthly: 73
published: "2026-01-22T15:59:39.376Z"
updated: "2026-01-24T15:50:02.155Z"
---

# @dotdo/tanstack

**TanStack Query meets PostgreSQL. Type-safe. Instant. Local-first.**

```typescript
import { createQueryAdapter } from '@dotdo/tanstack'
import { useQuery, useMutation } from '@tanstack/react-query'

const db = createQueryAdapter({ database: 'myapp' })

function UserList() {
  // Type-safe queries with automatic caching
  const { data: users } = useQuery(
    db.queryOptions('SELECT * FROM users WHERE active = true')
  )

  // Mutations with cache invalidation
  const createUser = useMutation(
    db.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(['postgres', 'myapp'])
    })
  )
}
```

## Why @dotdo/tanstack?

You're using TanStack Query. It's great for server state. But:

- You still write API endpoints for every query
- Type definitions are manual and error-prone
- Optimistic updates require boilerplate
- Real-time sync needs custom WebSocket code
- Offline support? Start from scratch.

**@dotdo/tanstack connects TanStack Query directly to PostgreSQL.** Type-safe queries, automatic caching, optimistic updates, and offline-first sync - all with the patterns you already know.

## What You Get

| Feature | Description |
|---------|-------------|
| **TanStack Query v5** | Full useQuery/useMutation integration |
| **Type Inference** | Automatic types from your schema |
| **Optimistic Updates** | Instant UI, auto-rollback on error |
| **Smart Caching** | Query key generation, stale time, GC |
| **Live Queries** | Re-render when data changes |
| **Conflict Resolution** | Built-in strategies for sync conflicts |
| **Local-first** | PGLite integration for instant queries |
| **Framework Agnostic** | Hook factories work with any React-like framework |

## Installation

```bash
npm install @dotdo/tanstack
```

### Peer Dependencies

Install only what you need:

```bash
# For TanStack Query integration
npm install @tanstack/query-core @tanstack/react-query

# For local PGLite database
npm install @dotdo/pglite

# For TanStack DB sync patterns
npm install @tanstack/db

# For React hooks
npm install react
```

## Quick Start

### Connect TanStack Query to PostgreSQL

```typescript
import { createQueryAdapter } from '@dotdo/tanstack'
import { useQuery, useMutation } from '@tanstack/react-query'

// Create adapter - connects to postgres.do
const adapter = createQueryAdapter({
  baseUrl: 'https://db.postgres.do',
  database: 'myapp',
  defaultStaleTime: 30000,  // 30 seconds
  defaultGcTime: 300000,    // 5 minutes
})

function UserProfile({ userId }: { userId: string }) {
  // Type-safe query with automatic caching
  const { data: user, isLoading } = useQuery(
    adapter.queryOptions({
      sql: 'SELECT * FROM users WHERE id = $1',
      params: [userId],
      staleTime: 60000,  // Fresh for 1 minute
    })
  )

  // Mutation with invalidation
  const updateUser = useMutation(
    adapter.mutationOptions({
      onSuccess: () => {
        // Refetch user data
      },
    })
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>{user?.[0]?.name}</h1>
      <button onClick={() => updateUser.mutate({
        sql: 'UPDATE users SET name = $1 WHERE id = $2',
        params: ['New Name', userId]
      })}>
        Update Name
      </button>
    </div>
  )
}
```

### Direct Query Execution

```typescript
// Execute queries directly without hooks
const result = await adapter.query('SELECT * FROM users WHERE active = $1', [true])
console.log(result.rows)
```

## Type Inference

Types flow from your database schema to your components:

```typescript
// Define your types
interface User {
  id: string
  name: string
  email: string
  active: boolean
}

// Create a typed collection
const users = createQueryCollection<User>({
  id: 'users',
  table: 'users',
  primaryKey: 'id',
  queryFn: async () => {
    const response = await fetch('/api/users')
    return response.json()
  },
})

// All operations are type-safe
const allUsers: User[] = users.getAll()
const user: User | undefined = users.get('user-123')

// TypeScript catches errors
await users.insert({
  name: 'Alice',           // OK
  email: 'alice@test.com', // OK
  active: 'yes'            // Error: boolean expected
})
```

## Optimistic Updates

UI updates instantly. Rollback automatically on error:

```typescript
import {
  createOptimisticStore,
  applyOptimisticUpdate,
  rollbackOptimisticUpdate,
} from '@dotdo/tanstack'

const store = createOptimisticStore()

// Apply optimistic update - UI updates immediately
const mutation = applyOptimisticUpdate(store, {
  type: 'update',
  collectionId: 'todos',
  recordId: 'todo-123',
  data: { completed: true },
})

try {
  // Send to server
  await saveTodo({ id: 'todo-123', completed: true })
  // Success - mutation confirmed
} catch (error) {
  // Rollback - UI reverts to previous state
  rollbackOptimisticUpdate(store, mutation.id)
}
```

### With TanStack Query

```typescript
const { mutate } = usePostgresMutation(adapter, {
  invalidate: { tables: ['todos'] },
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // Snapshot previous value
    const previous = queryClient.getQueryData(['todos'])

    // Optimistically update
    queryClient.setQueryData(['todos'], (old) =>
      old.map(todo =>
        todo.id === variables.id
          ? { ...todo, completed: true }
          : todo
      )
    )

    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context.previous)
  },
})
```

## Cache Invalidation

Smart refetching when data changes:

```typescript
import { createUseInvalidateQueries } from '@dotdo/tanstack'
import { useQueryClient } from '@tanstack/react-query'

const useInvalidateQueries = createUseInvalidateQueries(useQueryClient)

function TodoActions() {
  const { invalidateQuery, invalidateTables, invalidateAll } = useInvalidateQueries(adapter)

  const handleComplete = async (todoId: string) => {
    await completeTodo(todoId)

    // Invalidate specific query
    invalidateQuery('SELECT * FROM todos WHERE completed = false')

    // Or invalidate all queries for these tables
    invalidateTables(['todos', 'stats'])

    // Or invalidate everything
    invalidateAll()
  }
}
```

### Automatic Invalidation

```typescript
const { mutate } = usePostgresMutation(adapter, {
  invalidate: {
    tables: ['todos'],  // Invalidate queries using these tables
  },
  onSuccess: (data) => {
    console.log('Todo updated:', data)
  },
})
```

## Collection API

Higher-level abstraction for CRUD operations:

### Query Collection

Fetch data via TanStack Query patterns:

```typescript
import { createQueryCollection } from '@dotdo/tanstack'

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

const todos = createQueryCollection<Todo>({
  id: 'todos',
  table: 'todos',
  primaryKey: 'id',
  queryFn: async () => {
    const response = await fetch('/api/todos')
    return response.json()
  },
  staleTime: 60000,       // Cache for 1 minute
  refetchInterval: 30000, // Auto-refetch every 30s
})

// CRUD operations
const allTodos = todos.getAll()
const todo = todos.get('todo-123')
await todos.insert({ title: 'New todo', completed: false })
await todos.update('todo-123', { completed: true })
await todos.delete('todo-123')

// Subscribe to changes
const unsubscribe = todos.subscribe((items) => {
  console.log('Todos updated:', items.length)
})

// Stop auto-refetch when done
todos.stopAutoRefetch()
```

### Sync Collection

Real-time synchronization with a backend:

```typescript
import { createSyncCollection, SyncEngine } from '@dotdo/tanstack'

const todos = createSyncCollection<Todo>({
  id: 'todos',
  table: 'todos',
  syncUrl: 'https://api.example.com/sync/todos',
  pollInterval: 5000,
  shapeParams: { user_id: 'user-123' },  // Filter sync by shape
  debug: true,
})

// Connect to start syncing
await todos.connect()

// Check sync state
const state = todos.getSyncState()
console.log('Connected:', state.connected)
console.log('Initialized:', state.initialized)
console.log('Pending changes:', state.pendingCount)
console.log('Last sync:', state.lastSyncAt)

// Disconnect when done
todos.disconnect()
```

### PGLite Collection

Local-first with PGLite:

```typescript
import { createPGLiteCollection, PGLiteStore } from '@dotdo/tanstack'
import { PGlite } from '@dotdo/pglite'

const pglite = await PGlite.create()

const notes = createPGLiteCollection<Note>({
  id: 'notes',
  table: 'notes',
  pglite,
  autoCreateTable: true,
  tableSchema: `
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `,
})

// Queries hit local PGLite - instant, no network
const allNotes = notes.getAll()

// Or use PGLiteStore for multiple collections
const store = new PGLiteStore({ pglite })

const users = store.createCollection<User>({
  id: 'users',
  table: 'users',
  autoCreateTable: true,
  tableSchema: 'CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT)',
})
```

## React Hooks

### Hook Factories

Create React hooks by providing TanStack Query hooks:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import {
  createUsePostgresQuery,
  createUsePostgresMutation,
  createUseLiveQuery,
} from '@dotdo/tanstack'

// Create hooks (do this once at app initialization)
const usePostgresQuery = createUsePostgresQuery(useQuery)
const usePostgresMutation = createUsePostgresMutation(useMutation, useQueryClient)
const useLiveQuery = createUseLiveQuery(useSyncExternalStore)
```

### usePostgresQuery

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = usePostgresQuery(adapter, {
    sql: 'SELECT * FROM users WHERE id = $1',
    params: [userId],
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.[0]?.name}</div>
}
```

### usePostgresMutation

```typescript
function CreateUserForm() {
  const { mutate, isPending } = usePostgresMutation(adapter, {
    invalidate: { tables: ['users'] },
    onSuccess: (data) => console.log('User created:', data),
    onError: (error) => console.error('Failed:', error),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({
      sql: 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      params: ['Alice', 'alice@example.com'],
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
```

### useLiveQuery

Subscribe to collection changes reactively:

```typescript
function TodoList() {
  // Re-renders automatically when data changes
  const todos = useLiveQuery(todoCollection, {
    where: { completed: false },
    orderBy: { field: 'createdAt', direction: 'desc' },
    limit: 10,
    offset: 0,
    enabled: true,
  })

  return (
    <ul>
      {todos.map(todo => <li key={todo.id}>{todo.title}</li>)}
    </ul>
  )
}

// Filter with a function
const urgentTodos = useLiveQuery(todoCollection, {
  where: (todo) => todo.priority === 'high' && !todo.completed,
})
```

### Collection Mutation Hooks

```typescript
import {
  createUseCollectionInsert,
  createUseCollectionUpdate,
  createUseCollectionDelete,
} from '@dotdo/tanstack'

const useCollectionInsert = createUseCollectionInsert(useMutation)
const useCollectionUpdate = createUseCollectionUpdate(useMutation)
const useCollectionDelete = createUseCollectionDelete(useMutation)

function TodoActions({ collection }: { collection: Collection<Todo> }) {
  const { mutate: insert } = useCollectionInsert(collection)
  const { mutate: update } = useCollectionUpdate(collection)
  const { mutate: remove } = useCollectionDelete(collection)

  return (
    <>
      <button onClick={() => insert({ title: 'New Todo', completed: false })}>
        Add Todo
      </button>
      <button onClick={() => update({ id: 'todo-1', data: { completed: true } })}>
        Complete
      </button>
      <button onClick={() => remove('todo-1')}>
        Delete
      </button>
    </>
  )
}
```

### Prefetch Queries

```typescript
import { createUsePrefetchQuery } from '@dotdo/tanstack'

const usePrefetchQuery = createUsePrefetchQuery(useQueryClient)

function UserListItem({ userId }: { userId: string }) {
  const prefetch = usePrefetchQuery(adapter)

  // Prefetch on hover for instant navigation
  const handleMouseEnter = () => {
    prefetch({
      sql: 'SELECT * FROM user_details WHERE user_id = $1',
      params: [userId],
    })
  }

  return (
    <div onMouseEnter={handleMouseEnter}>
      <Link to={'/users/' + userId}>View Profile</Link>
    </div>
  )
}
```

## Conflict Resolution

Handle conflicts during sync with built-in strategies:

```typescript
import {
  createConflictResolver,
  strategies,
  ConflictResolverBuilder,
  detectConflict,
  resolveConflict,
} from '@dotdo/tanstack'

// Use built-in strategies
const resolver = createConflictResolver('latest-wins')
// Options: 'local-wins' | 'remote-wins' | 'latest-wins' | 'merge' | 'manual'

// Direct strategy functions
const result = await strategies.localWins(conflict)   // Local changes win
const result = await strategies.remoteWins(conflict)  // Remote changes win
const result = await strategies.latestWins(conflict)  // Most recent timestamp wins
const result = await strategies.merge(conflict)       // Merge non-conflicting fields
```

### Custom Conflict Resolution

```typescript
const customResolver = new ConflictResolverBuilder<Todo>()
  .defaultStrategy('latest-wins')
  .forConflictType('update-update', 'merge')
  .forConflictType('delete-update', 'remote-wins')
  .forRecord('important-todo', async (conflict) => {
    // Custom logic for specific records
    return conflict.localValue ?? conflict.remoteValue ?? null
  })
  .build()

// Manual conflict detection
const conflict = detectConflict({
  collectionId: 'todos',
  recordId: 'todo-123',
  localValue: { title: 'Local title' },
  remoteValue: { title: 'Remote title' },
  baseValue: originalTodo,
  localTimestamp: Date.now(),
  remoteTimestamp: Date.now() - 1000,
})

if (conflict) {
  const resolved = await resolveConflict(conflict, 'latest-wins')
}
```

### Conflict Types

| Type | Description |
|------|-------------|
| update-update | Both local and remote updated the same record |
| update-delete | Local updated, remote deleted |
| delete-update | Local deleted, remote updated |
| insert-insert | Both inserted record with same key |

## TanStack Store

Manage multiple collections with a unified store:

```typescript
import { createTanStackStore } from '@dotdo/tanstack'

const store = createTanStackStore({
  defaultStaleTime: 60000,
})

// Register different collection types
const users = store.registerCollection({
  id: 'users',
  table: 'users',
  queryFn: () => fetch('/api/users').then(r => r.json()),
})

const todos = store.registerCollection({
  id: 'todos',
  table: 'todos',
  syncUrl: 'https://api.example.com/sync/todos',
  pollInterval: 5000,
})

const notes = store.registerCollection({
  id: 'notes',
  table: 'notes',
  pglite: pgliteInstance,
  autoCreateTable: true,
  tableSchema: 'CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, content TEXT)',
})

// Access collections
const usersCollection = store.getCollection<User>('users')
const allCollectionIds = store.getCollectionIds()

// Cleanup
await store.dispose()
```

## SyncEngine

Coordinate multiple sync collections with a shared base URL:

```typescript
import { SyncEngine } from '@dotdo/tanstack'

const engine = new SyncEngine({
  baseUrl: 'https://api.example.com',
})

// Register collections (syncUrl defaults to baseUrl/v1/shape)
const todos = engine.registerCollection<Todo>({
  id: 'todos',
  table: 'todos',
  pollInterval: 5000,
})

const projects = engine.registerCollection<Project>({
  id: 'projects',
  table: 'projects',
  syncUrl: 'https://other-api.com/sync',  // Override base URL
})

// Connect all collections at once
await engine.connectAll()

// Get collection by ID
const todosCollection = engine.getCollection<Todo>('todos')

// Get all collection IDs
const ids = engine.getCollectionIds()

// Disconnect all
engine.disconnectAll()
```

## API Reference

### Query Adapter

| Method | Description |
|--------|-------------|
| query(sql, params?) | Execute a SQL query |
| queryOptions(params) | Create TanStack Query options |
| mutationOptions(options?) | Create TanStack Mutation options |
| getQueryKey(sql, params?) | Generate a query key |
| database | Get the database name |

### Collection Interface

| Method | Description |
|--------|-------------|
| id | Collection identifier |
| getAll() | Get all items |
| get(id) | Get item by ID |
| insert(data) | Insert new item |
| update(id, data) | Update existing item |
| delete(id) | Delete item |
| subscribe(callback) | Subscribe to changes |
| getSyncState() | Get current sync state |

### SyncState

| Property | Type | Description |
|----------|------|-------------|
| connected | boolean | Whether sync is active |
| initialized | boolean | Whether initial sync completed |
| pendingCount | number | Number of pending changes |
| lastSyncAt | number or undefined | Timestamp of last sync |
| lastError | Error or undefined | Last sync error |

### Utility Functions

| Function | Description |
|----------|-------------|
| normalizeSQL(sql) | Normalize SQL for consistent query keys |
| createQueryKey(db, sql, params?) | Generate a query key |
| extractTablesFromSQL(sql) | Extract table names from SQL |
| getMutationType(sql) | Determine mutation type (insert/update/delete) |
| isReadOnlyQuery(sql) | Check if SQL is a SELECT query |

## TypeScript Types

Full TypeScript support with exported types:

```typescript
import type {
  // Core types
  BaseRecord,
  Collection,
  TanStackStore,
  SyncState,

  // Collection options
  CollectionOptions,
  QueryCollectionOptions,
  SyncCollectionOptions,
  PGLiteCollectionOptions,

  // Query types
  QueryParams,
  MutationParams,
  QueryResult,
  PostgresQueryKey,

  // Conflict types
  Conflict,
  ConflictType,
  ConflictStrategy,
  ConflictResolver,

  // Optimistic types
  OptimisticState,
  PendingMutation,
  AppliedMutation,

  // Hook types
  UsePostgresQueryOptions,
  UsePostgresMutationOptions,
  UseLiveQueryOptions,
  PostgresQueryState,
  PostgresMutationState,
} from '@dotdo/tanstack'
```

## Module Exports

Subpath exports for tree-shaking:

```typescript
// Main entry
import { createQueryAdapter, createSyncCollection } from '@dotdo/tanstack'

// Subpath imports
import { QueryCollection } from '@dotdo/tanstack/query'
import { SyncCollection, SyncEngine } from '@dotdo/tanstack/sync'
import { OptimisticStore } from '@dotdo/tanstack/optimistic'
import { ConflictResolverBuilder, strategies } from '@dotdo/tanstack/conflict'
import { PGLiteCollection, PGLiteStore } from '@dotdo/tanstack/pglite'
import { QueryAdapter } from '@dotdo/tanstack/adapter'
import { createUsePostgresQuery } from '@dotdo/tanstack/hooks'
```

## Migration Guide

### From TanStack Query Direct Usage

If you're currently using TanStack Query directly with a REST API or custom data fetching:

**Before (Direct TanStack Query):**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      return res.json()
    },
  })
}

function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (user) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(user),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

**After (@dotdo/tanstack):**
```typescript
import { createQueryAdapter } from '@dotdo/tanstack'
import { useQuery, useMutation } from '@tanstack/react-query'

const db = createQueryAdapter({ database: 'myapp' })

function useUsers() {
  return useQuery(db.queryOptions('SELECT * FROM users'))
}

function useCreateUser() {
  return useMutation(
    db.mutationOptions({
      invalidate: { tables: ['users'] },
    })
  )
}

// Usage:
// const { mutate } = useCreateUser()
// mutate({ sql: 'INSERT INTO users (name) VALUES ($1)', params: ['Alice'] })
```

### From Custom Local State to SyncCollection

If you're managing local state manually with sync logic:

**Before (Custom Sync):**
```typescript
const [todos, setTodos] = useState([])
const [pendingChanges, setPendingChanges] = useState([])

// Manual sync logic, conflict handling, etc.
```

**After (SyncCollection):**
```typescript
import { createSyncCollection } from '@dotdo/tanstack'

const todos = createSyncCollection({
  id: 'todos',
  table: 'todos',
  syncUrl: 'https://api.example.com/sync',
  pollInterval: 5000,
})

// Automatic sync, pending tracking, and conflict handling
await todos.connect()

// Subscribe to changes
todos.subscribe(items => setTodos(items))

// Mutations are optimistic with automatic pending tracking
await todos.insert({ title: 'New todo', completed: false })
console.log(todos.getSyncState().pendingCount) // 1 until confirmed
```

### From Custom React Query Hooks

If you have custom hooks wrapping TanStack Query:

**Before:**
```typescript
// hooks/usePostgres.ts
export function usePostgresQuery(sql, params) {
  return useQuery({
    queryKey: ['postgres', sql, params],
    queryFn: () => executeQuery(sql, params),
  })
}
```

**After:**
```typescript
// hooks/usePostgres.ts
import { createUsePostgresQuery, createQueryAdapter } from '@dotdo/tanstack'
import { useQuery } from '@tanstack/react-query'

const adapter = createQueryAdapter({ database: 'myapp' })
export const usePostgresQuery = createUsePostgresQuery(useQuery)

// Usage in components:
// const { data } = usePostgresQuery(adapter, 'SELECT * FROM users')
```

### From React Context for Data

If you're using React Context for shared data state:

**Before:**
```typescript
const DataContext = createContext()

function DataProvider({ children }) {
  const [users, setUsers] = useState([])
  // ... complex state management
}
```

**After:**
```typescript
import { createTanStackStore, createPGLiteCollection } from '@dotdo/tanstack'

// Create store once at app initialization
const store = createTanStackStore()

// Register collections
const users = store.registerCollection({
  id: 'users',
  table: 'users',
  queryFn: () => fetch('/api/users').then(r => r.json()),
})

// Use in components with useLiveQuery
const useLiveQuery = createUseLiveQuery(useSyncExternalStore)

function UserList() {
  const activeUsers = useLiveQuery(users, {
    where: { active: true },
    orderBy: { field: 'name', direction: 'asc' },
  })
  return <ul>{activeUsers.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### Key Migration Benefits

| Before | After |
|--------|-------|
| Manual query key management | Automatic query keys from SQL |
| Custom fetch wrappers | Built-in postgres.do integration |
| Manual cache invalidation | Declarative table-based invalidation |
| Custom sync logic | Built-in sync with polling |
| Manual optimistic updates | Automatic pending mutation tracking |
| Custom conflict handling | Built-in resolution strategies |

### Breaking Changes Checklist

When migrating, watch for these common issues:

1. **Query Keys** - The adapter generates keys as `['postgres', database, sql, ...params]`. Update any manual query key references.

2. **Error Handling** - Errors are now tracked in `syncState.lastError`. Check your error boundaries.

3. **Subscription Cleanup** - Always call the unsubscribe function returned by `subscribe()` to prevent memory leaks.

4. **TypeScript** - All collections are generic. Provide your record type: `createSyncCollection<Todo>({...})`.

5. **Async Initialization** - `SyncCollection.connect()` and `PGLiteCollection.initialize()` are async. Ensure you await them.

## Related Packages

- [@dotdo/postgres](../postgres) - PostgreSQL server for Cloudflare Workers
- [@dotdo/pglite](../pglite) - PGLite optimized for Cloudflare Workers
- [@dotdo/electric](../electric) - Real-time sync with ElectricSQL patterns

## Links

- [TanStack Query](https://tanstack.com/query) - The async state manager
- [TanStack DB](https://github.com/TanStack/db) - Local-first sync patterns
- [postgres.do](https://postgres.do) - PostgreSQL at the edge

## License

MIT
