---
name: "@dotdo/supabase"
version: 0.1.1
description: "Supabase-compatible client for postgres.do - drop-in replacement for @supabase/supabase-js"
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - supabase
  - postgres
  - postgresql
  - database
  - compatibility
  - cloudflare
  - workers
downloads:
  monthly: 18
published: "2026-01-22T15:59:36.117Z"
updated: "2026-01-24T15:49:58.824Z"
---

# @dotdo/supabase

> Supabase client API, postgres.do backend. Same fluent queries, edge-native performance.

**Already using Supabase? Just change this line:**

```typescript
// Before
import { createClient } from '@supabase/supabase-js'

// After
import { createClient } from '@dotdo/supabase'
```

That's it. Your fluent queries just work, now running on Cloudflare's edge.

---

## The Problem

The Supabase developer experience is unmatched. The fluent query builder, the instant APIs, the way your team ships features in hours instead of weeks.

But you're facing trade-offs:

- **External:** Your Supabase project lives in one region. Migrating means rewriting.
- **Internal:** You love the API. You don't want to learn something new.
- **Philosophical:** You shouldn't have to choose between great DX and global performance.

Your users are everywhere. Your database is in `us-east-1`. Every query adds latency you can't optimize in code.

---

## The Guide

**@dotdo/supabase** gives you the Supabase client API backed by PostgreSQL at the edge. Same `from()`, same `select()`, same `eq()`. Different backend.

No API changes. No query rewrites. Just swap the import.

---

## The Plan

### Step 1: Install

```bash
npm install @dotdo/supabase
```

### Step 2: Update Imports

```typescript
// Before
import { createClient } from '@supabase/supabase-js'

// After
import { createClient } from '@dotdo/supabase'
```

### Step 3: Update Connection

```typescript
// Before (Supabase)
const supabase = createClient(
  'https://xyz.supabase.co',
  'your-anon-key'
)

// After (postgres.do)
const supabase = createClient(
  'https://db.postgres.do',
  'your-api-key'
)
```

**Done.** Your fluent queries work exactly the same.

---

## Success: What You Get

| Before (Supabase) | After (@dotdo/supabase) |
|-------------------|-------------------------|
| Single-region database | Edge database in 300+ locations |
| Pauses after 7 days (free tier) | Hibernates instantly, wakes instantly |
| Platform coupling | Standard PostgreSQL |
| Per-project pricing | Pay for what you use |

---

## Avoid the Failure

Without action:

- Users wait for data to travel from a single region
- You pay for capacity whether it's used or not
- Your codebase grows more coupled to the platform
- Switching costs increase with every feature you add

---

## API Compatibility

### Select Queries

```typescript
const supabase = createClient(url, key)

// Basic select
const { data } = await supabase.from('users').select('*')

// Specific columns
const { data } = await supabase.from('users').select('id, name, email')

// With relations
const { data } = await supabase
  .from('posts')
  .select('title, author:users(name, email)')

// Count
const { count } = await supabase
  .from('users')
  .select('*', { count: 'exact', head: true })
```

### Filters

```typescript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')          // Equal
  .neq('role', 'admin')            // Not equal
  .gt('age', 18)                   // Greater than
  .gte('score', 100)               // Greater than or equal
  .lt('price', 50)                 // Less than
  .lte('quantity', 10)             // Less than or equal
  .like('name', '%john%')          // LIKE pattern
  .ilike('email', '%@GMAIL.COM')   // Case-insensitive LIKE
  .is('deleted_at', null)          // IS NULL
  .in('id', [1, 2, 3])             // IN array
  .contains('tags', ['a', 'b'])    // Array contains
  .containedBy('tags', ['a','b'])  // Array contained by
  .range('age', 18, 65)            // BETWEEN
```

### Modifiers

```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .order('price', { ascending: true })
  .limit(20)
  .range(0, 9)  // Pagination: rows 0-9
  .single()     // Expect exactly one row
  .maybeSingle() // Expect zero or one row
```

### Insert

```typescript
// Single row
const { data } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' })
  .select()

// Multiple rows
const { data } = await supabase
  .from('users')
  .insert([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' }
  ])
  .select()

// Upsert (insert or update)
const { data } = await supabase
  .from('users')
  .upsert({ id: 1, name: 'John Updated' })
  .select()
```

### Update

```typescript
const { data } = await supabase
  .from('users')
  .update({ status: 'inactive' })
  .eq('id', 123)
  .select()
```

### Delete

```typescript
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', 123)
```

### RPC (Stored Functions)

```typescript
const { data } = await supabase
  .rpc('get_user_stats', { user_id: 123 })

// With filters on result
const { data } = await supabase
  .rpc('search_users', { query: 'john' })
  .limit(10)
```

---

## Feature Compatibility Matrix

| Feature | @supabase/supabase-js | @dotdo/supabase |
|---------|----------------------|-----------------|
| `from().select()` | Yes | Yes |
| `from().insert()` | Yes | Yes |
| `from().update()` | Yes | Yes |
| `from().delete()` | Yes | Yes |
| `from().upsert()` | Yes | Yes |
| Filter methods (eq, gt, etc.) | Yes | Yes |
| Modifiers (order, limit, range) | Yes | Yes |
| `rpc()` stored functions | Yes | Yes |
| `.single()` / `.maybeSingle()` | Yes | Yes |
| Error handling pattern | Yes | Yes |
| TypeScript generics | Yes | Yes |
| Auth client | Yes | Yes |
| Storage client | Yes | Yes (in-memory) |
| Realtime channels | Yes | Yes |
| Realtime presence | Yes | Yes |
| Realtime broadcast | Yes | Yes |
| Realtime postgres_changes | Yes | Yes (local) |

### Current Limitations

- **Storage**: Uses in-memory backend. Files are stored locally for development and testing. R2-backed persistence coming in v0.2.
- **Realtime postgres_changes**: Works locally within the same client. WebSocket-based distributed realtime coming in v0.2.
- **Auth**: Full API implemented. Uses postgres.do's auth endpoints.

---

## Authentication

Full auth API compatible with GoTrue/Supabase Auth.

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: { name: 'John Doe' }, // User metadata
    emailRedirectTo: 'https://yourapp.com/welcome',
  },
})

if (data.session) {
  console.log('User signed up and logged in:', data.user)
}
```

### Sign In

```typescript
// With password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})

// With OTP (magic link)
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    shouldCreateUser: true,
  },
})
```

### Session Management

```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Refresh session
const { data, error } = await supabase.auth.refreshSession()

// Set session manually (e.g., from URL params)
const { data, error } = await supabase.auth.setSession({
  access_token: 'your-access-token',
  refresh_token: 'your-refresh-token',
})
```

### Update User

```typescript
const { data, error } = await supabase.auth.updateUser({
  email: 'newemail@example.com',
  password: 'new-password',
  data: { name: 'Jane Doe' },
})
```

### Sign Out

```typescript
// Local sign out (default)
await supabase.auth.signOut()

// Global sign out (all devices)
await supabase.auth.signOut({ scope: 'global' })
```

### Listen to Auth Changes

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case 'INITIAL_SESSION':
      // Session recovered from storage
      break
    case 'SIGNED_IN':
      console.log('User signed in:', session?.user)
      break
    case 'SIGNED_OUT':
      console.log('User signed out')
      break
    case 'TOKEN_REFRESHED':
      console.log('Token refreshed')
      break
    case 'USER_UPDATED':
      console.log('User updated:', session?.user)
      break
  }
})
```

### Auth Options

```typescript
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,   // Auto-refresh expiring tokens
    persistSession: true,     // Persist session to storage
    storage: localStorage,    // Storage backend (localStorage, sessionStorage, custom)
    storageKey: 'supabase.auth.token', // Storage key
  },
})
```

---

## Storage

File storage with buckets, uploads, and signed URLs.

### Upload Files

```typescript
// Upload a file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123/avatar.png', file, {
    cacheControl: '3600',
    contentType: 'image/png',
    upsert: false, // Set to true to overwrite
  })

// Upload with signed URL
const { data: { signedUrl, token } } = await supabase.storage
  .from('avatars')
  .createSignedUploadUrl('user-123/avatar.png')

const { data, error } = await supabase.storage
  .from('avatars')
  .uploadToSignedUrl('user-123/avatar.png', token, file)
```

### Download Files

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .download('user-123/avatar.png')

// data is a Blob
const url = URL.createObjectURL(data)
```

### List Files

```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .list('user-123', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
    search: 'avatar',
  })
```

### Get URLs

```typescript
// Public URL (no auth required)
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.png')

// Signed URL (time-limited)
const { data, error } = await supabase.storage
  .from('avatars')
  .createSignedUrl('user-123/avatar.png', 3600) // 1 hour

// Multiple signed URLs
const { data, error } = await supabase.storage
  .from('avatars')
  .createSignedUrls(['avatar1.png', 'avatar2.png'], 3600)
```

### File Operations

```typescript
// Move file
const { data, error } = await supabase.storage
  .from('avatars')
  .move('old/path.png', 'new/path.png')

// Copy file
const { data, error } = await supabase.storage
  .from('avatars')
  .copy('source.png', 'destination.png')

// Update file (replace)
const { data, error } = await supabase.storage
  .from('avatars')
  .update('user-123/avatar.png', newFile)

// Delete files
const { data, error } = await supabase.storage
  .from('avatars')
  .remove(['old-avatar.png', 'temp.png'])
```

### Bucket Management

```typescript
// List all buckets
const { data, error } = await supabase.storage.listBuckets()

// Get bucket info
const { data, error } = await supabase.storage.getBucket('avatars')

// Create bucket
const { data, error } = await supabase.storage.createBucket('documents', {
  public: false,
  fileSizeLimit: 1024 * 1024 * 10, // 10MB
  allowedMimeTypes: ['application/pdf', 'image/*'],
})

// Update bucket
const { data, error } = await supabase.storage.updateBucket('documents', {
  public: true,
})

// Empty bucket (delete all files)
const { data, error } = await supabase.storage.emptyBucket('temp')

// Delete bucket
const { data, error } = await supabase.storage.deleteBucket('old-bucket')
```

---

## Realtime

Realtime enables you to build collaborative applications with presence tracking and broadcast messaging.

### Channels

Create a channel to subscribe to events:

```typescript
const channel = supabase.channel('room-1')
```

### Presence

Track who's online and share user state:

```typescript
const channel = supabase.channel('room-1')

// Listen for presence events
channel
  .on('presence', { event: 'sync' }, () => {
    // Get current presence state
    const state = channel.getPresenceState()
    console.log('Current users:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', key, newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', key, leftPresences)
  })
  .subscribe()

// Track your own presence
await channel.track({
  user_id: '123',
  online_at: new Date().toISOString(),
})

// Untrack when leaving
await channel.untrack()
```

### Broadcast

Send and receive arbitrary messages:

```typescript
const channel = supabase.channel('room-1')

// Listen for broadcast events
channel
  .on('broadcast', { event: 'cursor-move' }, (payload) => {
    console.log('Cursor moved:', payload)
  })
  .on('broadcast', { event: 'typing' }, (payload) => {
    console.log('User typing:', payload)
  })
  .subscribe()

// Send a broadcast message
await channel.send({
  type: 'broadcast',
  event: 'cursor-move',
  payload: { x: 100, y: 200 },
})
```

### Database Changes (postgres_changes)

Listen for database changes in real-time:

```typescript
const channel = supabase.channel('db-changes')

channel
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('New message:', payload.new)
    }
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('User changed:', payload)
    }
  )
  .subscribe()
```

### Channel Management

```typescript
// Get all active channels
const channels = supabase.getChannels()

// Remove a specific channel
await supabase.removeChannel(channel)

// Remove all channels
await supabase.removeAllChannels()
```

---

## TypeScript Support

Full type inference with database schemas:

```typescript
import { createClient } from '@dotdo/supabase'

interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: number; name: string; email: string; active: boolean }
        Insert: { name: string; email: string; active?: boolean }
        Update: { name?: string; email?: string; active?: boolean }
      }
      posts: {
        Row: { id: number; title: string; user_id: number }
        Insert: { title: string; user_id: number }
        Update: { title?: string }
      }
    }
  }
}

const supabase = createClient<Database>(url, key)

// Fully typed - data is { id: number; name: string; email: string; active: boolean }[]
const { data } = await supabase.from('users').select('*')

// Insert type-checked
const { data: newUser } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' }) // active is optional
  .select()
```

### Type Exports

```typescript
import type {
  // Client types
  SupabaseClient,
  SupabaseClientOptions,

  // Database schema types
  GenericSchema,
  GenericTable,
  GenericView,
  GenericFunction,
  GenericRelationship,

  // Response types
  PostgrestResponse,
  PostgrestSingleResponse,
  PostgrestMaybeSingleResponse,
  PostgrestError,

  // Query builder types
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
  FilterOperator,
  QueryFilter,
  OrderConfig,

  // Auth types
  User,
  UserIdentity,
  Factor,
  Session,
  AuthChangeEvent,
  AuthResponse,
  AuthError,
  Subscription,
  GoTrueClient,

  // Storage types
  FileObject,
  Bucket,
  StorageError,
  StorageClient,
  StorageFileApi,

  // Realtime types
  RealtimeChannel,
} from '@dotdo/supabase'
```

### Utility Exports

```typescript
import {
  // Validation utilities (SQL injection prevention)
  validateIdentifier,
  isValidIdentifier,
  validateIdentifiers,
  InvalidIdentifierError,

  // Classes (for extension or testing)
  SupabaseClient,
  AuthClient,
  QueryBuilder,
  FilterBuilder,
  RpcBuilder,
} from '@dotdo/supabase'
```

---

## Error Handling

Same patterns you're used to:

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', 999)
  .single()

if (error) {
  console.error('Code:', error.code)       // PostgreSQL error code
  console.error('Message:', error.message)
  console.error('Details:', error.details)
  console.error('Hint:', error.hint)
}
```

---

## API Reference

### `createClient(url, key, options?)`

Create a Supabase-compatible client.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `db.schema` | `string` | `'public'` | Database schema to use |
| `auth.autoRefreshToken` | `boolean` | `true` | Auto-refresh expiring tokens |
| `auth.persistSession` | `boolean` | `true` | Persist session to storage |
| `auth.storage` | `Storage` | `undefined` | Storage backend for sessions |
| `auth.storageKey` | `string` | `'supabase.auth.token'` | Storage key for session |
| `global.headers` | `Record<string, string>` | `{}` | Custom request headers |
| `global.fetch` | `typeof fetch` | `fetch` | Custom fetch implementation |

### Response Types

```typescript
interface PostgrestResponse<T> {
  data: T | null
  error: PostgrestError | null
  count: number | null
  status: number
  statusText: string
}

interface PostgrestError {
  message: string
  details: string | null
  hint: string | null
  code: string
}
```

---

## Migration Guide

### From @supabase/supabase-js

Migrating from Supabase to postgres.do takes three steps:

#### 1. Install the Package

```bash
npm install @dotdo/supabase
```

#### 2. Update Your Import

```typescript
// Before
import { createClient } from '@supabase/supabase-js'

// After
import { createClient } from '@dotdo/supabase'
```

#### 3. Update Connection URL

```typescript
// Before (Supabase)
const supabase = createClient(
  'https://xyz.supabase.co',
  process.env.SUPABASE_ANON_KEY
)

// After (postgres.do)
const supabase = createClient(
  'https://db.postgres.do',
  process.env.POSTGRES_DO_API_KEY
)
```

**That's it.** All your queries continue to work unchanged.

### What Changes

| Aspect | Supabase | postgres.do |
|--------|----------|-------------|
| Connection URL | `https://xyz.supabase.co` | `https://db.postgres.do` |
| API Key env var | `SUPABASE_ANON_KEY` | `POSTGRES_DO_API_KEY` |
| Dashboard | Supabase Dashboard | Direct SQL (coming soon) |

### What Stays the Same

- All query builder methods (`from`, `select`, `insert`, `update`, `delete`, `upsert`)
- All filter operators (`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `is`, `in`, etc.)
- Response format (`{ data, error, count, status, statusText }`)
- Error structure (`{ message, details, hint, code }`)
- TypeScript types and generics
- Auth API methods
- Storage API methods
- Realtime channel patterns

### Data Migration

To migrate your existing data:

1. **Export from Supabase**: Use `pg_dump` or Supabase's backup feature
2. **Import to postgres.do**: Use standard PostgreSQL import tools
3. **Verify**: Run your test suite against the new backend

---

## Roadmap

### v0.1 (Current)

- Full query builder compatibility
- Authentication (signUp, signIn, signOut, session management)
- Storage (in-memory backend for development)
- Realtime (local events, presence, broadcast)

### v0.2 (Coming Soon)

- **Distributed Realtime**: WebSocket-based realtime across clients
- **R2 Storage Backend**: Persistent file storage with Cloudflare R2
- **Row-Level Security**: Postgres policies enforced at the edge

### v0.3 (Planned)

- **Edge Functions**: Run functions close to your data
- **Database Branching**: Preview environments with isolated data
- **Metrics Dashboard**: Query performance and usage analytics

---

## Part of postgres.do

@dotdo/supabase is part of the [postgres.do](https://github.com/dot-do/postgres) ecosystem - PostgreSQL at the edge.

| Package | Description |
|---------|-------------|
| [`postgres.do`](https://github.com/dot-do/postgres/tree/main/packages/postgres.do) | SQL tagged template client |
| [`@dotdo/postgres`](https://github.com/dot-do/postgres/tree/main/packages/postgres) | Edge PostgreSQL server |
| [`@dotdo/neon`](https://github.com/dot-do/postgres/tree/main/packages/neon) | Neon-compatible client |
| [`@dotdo/postgrest`](https://github.com/dot-do/postgres/tree/main/packages/postgrest) | PostgREST-compatible router |

---

## Links

- [Documentation](https://postgres.do/docs/supabase)
- [GitHub](https://github.com/dot-do/postgres)
- [Supabase API Reference](https://supabase.com/docs/reference/javascript) (for API compatibility)

## License

MIT
