---
name: "@dotdo/postgrest"
version: 0.1.1
description: PostgREST-compatible REST API for postgres.do - automatic CRUD endpoints from your schema
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - postgrest
  - rest
  - api
  - postgres
  - postgresql
  - crud
  - hono
  - cloudflare
  - workers
downloads:
  monthly: 8
published: "2026-01-22T15:59:31.773Z"
updated: "2026-01-24T15:49:55.438Z"
---

# @dotdo/postgrest

PostgREST-compatible REST API for postgres.do - automatic CRUD endpoints from your PostgreSQL schema.

## Overview

This package implements the [PostgREST API specification](https://postgrest.org/), allowing existing applications built for PostgREST or Supabase to work seamlessly with postgres.do. It provides a Hono-based router that automatically creates REST endpoints for your database tables.

## Features

- **Full PostgREST query syntax** - Filters, ordering, pagination, and column selection
- **Resource embedding** - Automatic JOINs based on foreign key relationships
- **Schema caching** - Optimal performance with intelligent metadata caching
- **Hono router integration** - Mount anywhere in your Hono application
- **Complete header handling** - Prefer, Range, Content-Range headers
- **CORS support** - Configurable cross-origin resource sharing
- **SQL injection protection** - Built-in validation and parameterized queries
- **Full-text search** - Support for PostgreSQL's text search operators

## Installation

```bash
npm install @dotdo/postgrest hono
# or
pnpm add @dotdo/postgrest hono
# or
yarn add @dotdo/postgrest hono
```

## Quick Start

```typescript
import { Hono } from 'hono'
import { createPostgRESTRouter } from '@dotdo/postgrest'
import postgres from 'postgres.do'

const app = new Hono()
const sql = postgres('postgres://db.postgres.do/mydb')

// Create and mount the PostgREST router
app.route('/rest/v1', createPostgRESTRouter(sql))

export default app
```

You now have a full PostgREST-compatible API:

```bash
# List users
curl https://api.example.com/rest/v1/users

# Filter users
curl https://api.example.com/rest/v1/users?active=eq.true

# Insert user
curl -X POST https://api.example.com/rest/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

## API Reference

### `createPostgRESTRouter(sql, options?)`

Creates a Hono router with PostgREST-compatible endpoints.

```typescript
import { createPostgRESTRouter } from '@dotdo/postgrest'
import type { SQLExecutor, PostgRESTRouterOptions } from '@dotdo/postgrest'
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `sql` | `SQLExecutor` | Function to execute SQL queries |
| `options` | `PostgRESTRouterOptions` | Configuration options |

#### SQLExecutor Type

```typescript
interface SQLExecutor {
  (sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schema` | `string` | `'public'` | PostgreSQL schema to use |
| `basePath` | `string` | `''` | Base path for Location headers |
| `maxLimit` | `number` | `1000` | Maximum rows per request |
| `defaultLimit` | `number` | `100` | Default rows per request |
| `schemaCacheTTL` | `number` | `60000` | Schema cache TTL in milliseconds |
| `cors` | `boolean` | `true` | Enable CORS headers |
| `corsOrigins` | `string \| string[]` | - | Allowed CORS origins |
| `corsCredentials` | `boolean` | - | Allow credentials with CORS |
| `validateTable` | `(table: string) => boolean` | - | Custom table name validator |
| `validateFunction` | `(fn: string) => boolean` | - | Custom function name validator |

### REST Endpoints

The router creates the following endpoints for each table:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/:table` | Select rows with optional filters |
| `HEAD` | `/:table` | Get count without data |
| `POST` | `/:table` | Insert new rows |
| `PATCH` | `/:table` | Update rows matching filters |
| `DELETE` | `/:table` | Delete rows matching filters |
| `GET` | `/rpc/:function` | Call a stored function (read-only) |
| `POST` | `/rpc/:function` | Call a stored function |

## Query Syntax

### Column Selection

```http
GET /users?select=id,name,email
GET /users?select=*
GET /users?select=id,posts(title,content)  # With embedded resources
GET /users?select=id,name:full_name         # Column alias
```

### Filtering Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `?status=eq.active` |
| `neq` | Not equal | `?status=neq.deleted` |
| `gt` | Greater than | `?age=gt.18` |
| `gte` | Greater or equal | `?score=gte.100` |
| `lt` | Less than | `?price=lt.50` |
| `lte` | Less or equal | `?qty=lte.10` |
| `like` | Pattern match | `?name=like.*john*` |
| `ilike` | Case-insensitive | `?email=ilike.*@GMAIL.COM` |
| `is` | NULL/boolean check | `?deleted_at=is.null` |
| `in` | In array | `?id=in.(1,2,3)` |
| `cs` | Contains (arrays) | `?tags=cs.{a,b}` |
| `cd` | Contained by | `?tags=cd.{a,b,c}` |
| `ov` | Overlaps | `?tags=ov.{a,b}` |
| `sl` | Strictly left | `?range=sl.[1,5]` |
| `sr` | Strictly right | `?range=sr.[1,5]` |
| `nxl` | Not extends left | `?range=nxl.[1,5]` |
| `nxr` | Not extends right | `?range=nxr.[1,5]` |
| `adj` | Adjacent | `?range=adj.[1,5]` |

### Negation

```http
GET /users?age=not.eq.25       # NOT equal
GET /users?name=not.like.*test*
```

### Logical Operators

```http
GET /users?or=(status.eq.active,role.eq.admin)
GET /users?and=(age.gte.18,age.lte.65)
```

### Full-Text Search

```http
GET /posts?content=fts.search+term      # to_tsquery
GET /posts?content=plfts.search+term    # plainto_tsquery
GET /posts?content=phfts.search+phrase  # phraseto_tsquery
GET /posts?content=wfts.search+term     # websearch_to_tsquery
```

### Ordering

```http
GET /users?order=created_at.desc
GET /users?order=name.asc,id.desc
GET /users?order=name.asc.nullsfirst
GET /users?order=name.desc.nullslast
```

### Pagination

```http
GET /users?limit=10&offset=20
```

Or using the Range header:

```http
GET /users
Range: items=0-24
```

### Resource Embedding

Fetch related data based on foreign key relationships:

```http
GET /posts?select=id,title,author:users(name,email)
GET /users?select=*,posts(*)
```

## Headers

### Request Headers

| Header | Description | Example |
|--------|-------------|---------|
| `Prefer` | Request preferences | `return=representation, count=exact` |
| `Range` | Pagination range | `items=0-24` |

### Prefer Options

| Option | Values | Description |
|--------|--------|-------------|
| `return` | `representation`, `minimal`, `headers-only` | Response body preference |
| `count` | `exact`, `planned`, `estimated`, `none` | Row count mode |
| `resolution` | `merge-duplicates`, `ignore-duplicates` | Upsert conflict resolution |
| `missing` | `default`, `null` | Missing column handling |
| `tx` | `commit`, `rollback` | Transaction handling |
| `max-affected` | number | Maximum affected rows |

```bash
# Return inserted/updated rows
Prefer: return=representation

# Return nothing (faster)
Prefer: return=minimal

# Get exact count
Prefer: count=exact
```

### Response Headers

| Header | Description |
|--------|-------------|
| `Content-Range` | Pagination info: `items 0-24/100` |
| `Location` | URL of created resource (POST) |
| `Preference-Applied` | Applied preferences |

## CRUD Operations

### GET /:table - Select rows

```bash
# All rows
GET /users

# With filters
GET /users?status=eq.active&age=gt.18

# Select columns
GET /users?select=id,name,email

# With relations
GET /posts?select=*,author:users(name)

# Ordering
GET /users?order=created_at.desc

# Pagination
GET /users?limit=10&offset=20
```

### POST /:table - Insert rows

```bash
# Single row
POST /users
{"name": "John", "email": "john@example.com"}

# Multiple rows
POST /users
[
  {"name": "John", "email": "john@example.com"},
  {"name": "Jane", "email": "jane@example.com"}
]

# With representation return
POST /users
Prefer: return=representation
{"name": "John", "email": "john@example.com"}
```

### PATCH /:table - Update rows

```bash
# Update with filter (required)
PATCH /users?id=eq.123
{"status": "inactive"}
```

**Note:** PATCH requires filters to prevent accidental full-table updates.

### DELETE /:table - Delete rows

```bash
# Delete with filter (required)
DELETE /users?id=eq.123
```

**Note:** DELETE requires filters to prevent accidental full-table deletes.

### POST /rpc/:function - Call stored functions

```bash
# POST with body
POST /rpc/get_user_stats
{"user_id": 123}

# GET with query params
GET /rpc/get_user_stats?user_id=123
```

## Additional Exports

### PostgrestParser

Parse PostgREST query parameters manually:

```typescript
import { PostgrestParser } from '@dotdo/postgrest'
import type { ParsedQuery, Filter, OrderClause, EmbeddedResource, FilterOperator } from '@dotdo/postgrest'

const parser = new PostgrestParser()
const params = new URLSearchParams('select=id,name&age=gt.18&order=name.asc')
const parsed = parser.parse(params)
// {
//   columns: ['id', 'name'],
//   filters: [{ column: 'age', operator: 'gt', value: 18 }],
//   order: [{ column: 'name', direction: 'asc' }],
//   embedded: [],
// }
```

#### ParsedQuery Type

```typescript
interface ParsedQuery {
  columns: string[] | '*'
  embedded: EmbeddedResource[]
  filters: Filter[]
  order: OrderClause[]
  limit?: number
  offset?: number
  count?: 'exact' | 'planned' | 'estimated'
}

interface Filter {
  column: string
  operator: FilterOperator
  value: unknown
  negate?: boolean
}

interface OrderClause {
  column: string
  direction: 'asc' | 'desc'
  nullsFirst?: boolean
}

interface EmbeddedResource {
  name: string
  columns: string[] | '*'
  alias?: string
  embedded?: EmbeddedResource[]
  filters?: Filter[]
  order?: OrderClause[]
  limit?: number
  offset?: number
}
```

### QueryBuilder

Build SQL queries from parsed parameters:

```typescript
import { QueryBuilder, buildQuery } from '@dotdo/postgrest'
import type { BuiltQuery, QueryBuilderOptions } from '@dotdo/postgrest'

const builder = new QueryBuilder({ schema: 'public', maxLimit: 1000, defaultLimit: 100 })
const { sql, params, countSql } = builder.buildSelect('users', {
  columns: ['id', 'name'],
  filters: [{ column: 'active', operator: 'eq', value: true }],
  order: [{ column: 'name', direction: 'asc' }],
  embedded: [],
  limit: 10,
})
// sql: SELECT "users"."id", "users"."name" FROM "public"."users" WHERE "active" = $1 ORDER BY "name" ASC LIMIT 10
// params: [true]

// Convenience function
const query = buildQuery('select', 'users', {
  query: parsedQuery,
  tableSchema: schema,
  builderOptions: { schema: 'public' },
})
```

#### QueryBuilder Methods

| Method | Description |
|--------|-------------|
| `buildSelect(table, query, schema?, foreignKeys?)` | Build SELECT query |
| `buildInsert(table, data, returning?)` | Build INSERT query |
| `buildUpdate(table, data, filters, returning?)` | Build UPDATE query |
| `buildDelete(table, filters, returning?)` | Build DELETE query |
| `buildRPC(functionName, args?)` | Build function call |

### SchemaCache

Cache database schema for optimal performance:

```typescript
import { SchemaCache } from '@dotdo/postgrest'
import type { TableSchema, ColumnInfo, ForeignKeyInfo, SchemaCacheOptions } from '@dotdo/postgrest'

const cache = new SchemaCache({
  schema: 'public',
  cacheTTL: 60000,
  queryFn: sql,
})

await cache.hasTable('users')          // Check table exists
await cache.getTable('users')          // Get table schema
await cache.getTables()                // Get all tables
await cache.getColumn('users', 'id')   // Get column info
await cache.validateColumns('users', ['id', 'name'])  // Validate columns exist
await cache.getAllForeignKeys()        // Get all foreign keys
await cache.getForeignKeysTo('users')  // Get FKs referencing table
await cache.getEmbeddingInfo('posts', 'users')  // Get embedding relationship
await cache.refresh()                  // Force cache refresh
cache.clear()                          // Clear cache
```

#### Schema Types

```typescript
interface TableSchema {
  name: string
  schema: string
  columns: Map<string, ColumnInfo>
  primaryKey: string[]
  foreignKeys: ForeignKeyInfo[]
  indexes: string[]
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey: boolean
  isUnique: boolean
  maxLength?: number
  precision?: number
  scale?: number
}

interface ForeignKeyInfo {
  name: string
  column: string
  referencedTable: string
  referencedColumn: string
  onDelete?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION'
  onUpdate?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION'
}
```

### Header Utilities

```typescript
import {
  parsePreferHeader,
  setResponseHeaders,
  buildContentRange,
  parseRangeHeader,
  buildLocationHeader,
  getResponseStatus,
  setCORSHeaders,
  buildHeadersOnlyResponse,
} from '@dotdo/postgrest'
import type { PreferHeader, ResponseHeaderOptions } from '@dotdo/postgrest'

// Parse Prefer header
const prefer = parsePreferHeader('return=representation, count=exact')
// { return: 'representation', count: 'exact' }

// Build Content-Range header
const range = buildContentRange({ offset: 0, rowCount: 25, totalCount: 100 })
// "items 0-24/100"

// Parse Range header
const { offset, limit } = parseRangeHeader('items=0-24')
// { offset: 0, limit: 25 }

// Build Location header for created resource
const location = buildLocationHeader('/rest/v1', 'users', { id: 123 })
// "/rest/v1/users?id=eq.123"

// Get appropriate response status
const status = getResponseStatus('POST', 1, prefer)
// 201
```

#### PreferHeader Type

```typescript
interface PreferHeader {
  return?: 'representation' | 'minimal' | 'headers-only'
  count?: 'exact' | 'planned' | 'estimated' | 'none'
  resolution?: 'merge-duplicates' | 'ignore-duplicates'
  missing?: 'default' | 'null'
  tx?: 'commit' | 'rollback'
  maxAffected?: number
}
```

### CSP Middleware

Content Security Policy middleware for API routes:

```typescript
import {
  csp,
  securityHeaders,
  API_CSP_DEFAULTS,
  STRICT_WEB_CSP,
  DEVELOPMENT_CSP,
  CSP_PRESETS,
  buildCSPHeader,
  generateSecureNonce,
  getDefaultDirectives,
} from '@dotdo/postgrest'
import type { CSPDirectives, CSPEnvironment, CSPOptions, SecurityHeadersOptions } from '@dotdo/postgrest'

// Apply CSP to API routes
app.use('/api/*', csp(API_CSP_DEFAULTS))

// Apply comprehensive security headers
app.use(securityHeaders({ enableCSP: true, environment: 'production' }))
```

## CORS Configuration

The router provides fine-grained CORS control with a security-first approach.

### Default Behavior (Restrictive)

By default, CORS is enabled but no `Access-Control-Allow-Origin` header is set:

```typescript
const api = createPostgRESTRouter(sql, {
  cors: true,  // Enable CORS preflight handling
  // No corsOrigins set - restrictive default
})
```

### Single Origin

```typescript
const api = createPostgRESTRouter(sql, {
  cors: true,
  corsOrigins: 'https://app.example.com',
})
```

### Multiple Origins

```typescript
const api = createPostgRESTRouter(sql, {
  cors: true,
  corsOrigins: [
    'https://app.example.com',
    'https://admin.example.com',
  ],
})
```

### Wildcard (Allow All Origins)

**Warning:** Only use for public APIs.

```typescript
const api = createPostgRESTRouter(sql, {
  cors: true,
  corsOrigins: '*',
})
```

### Credentials Mode

```typescript
const api = createPostgRESTRouter(sql, {
  cors: true,
  corsOrigins: 'https://app.example.com',  // Must be specific origin
  corsCredentials: true,
})
```

**Note:** Per CORS specification, credentials cannot be used with wildcard origin.

## Error Handling

The router returns appropriate HTTP status codes and error messages:

| Status | Condition |
|--------|-----------|
| `400` | Invalid table name, missing filters for PATCH/DELETE, null violation |
| `403` | Permission denied |
| `404` | Table not found |
| `409` | Duplicate key or foreign key violation |
| `500` | Database error |

Error response format:

```json
{
  "error": "Duplicate key violation",
  "message": "duplicate key value violates unique constraint...",
  "code": "23505"
}
```

## PostgREST Compatibility Notes

This package aims for high compatibility with the [PostgREST specification](https://postgrest.org/).

### Supported Features

- Horizontal filtering (all operators)
- Vertical filtering (column selection)
- Ordering with nulls positioning
- Pagination (limit/offset and Range header)
- Resource embedding via foreign keys
- Prefer header (return, count, resolution, missing, tx, max-affected)
- Content-Range response header
- Location header for created resources
- RPC function calls (GET and POST)
- CORS preflight handling
- HEAD requests for count-only queries

### Differences from PostgREST

- **Safety guards**: PATCH and DELETE require filters to prevent accidental full-table operations
- **Schema introspection**: Uses information_schema queries rather than pg_catalog
- **Embedding**: Uses subqueries rather than lateral joins for simpler queries
- **No row-level security**: RLS should be implemented at the database level

## TypeScript Types

All types are exported for use in your application:

```typescript
import type {
  // Router types
  SQLExecutor,
  PostgRESTRouterOptions,

  // Parser types
  ParsedQuery,
  Filter,
  FilterOperator,
  OrderClause,
  EmbeddedResource,

  // Schema types
  TableSchema,
  ColumnInfo,
  ForeignKeyInfo,
  SchemaCacheOptions,

  // Builder types
  BuiltQuery,
  QueryBuilderOptions,

  // Header types
  PreferHeader,
  ResponseHeaderOptions,

  // CSP types
  CSPDirectives,
  CSPEnvironment,
  CSPOptions,
  SecurityHeadersOptions,
  SecurityMiddlewareOptions,
} from '@dotdo/postgrest'
```

## Part of the postgres.do Ecosystem

@dotdo/postgrest is part of [postgres.do](https://github.com/dot-do/postgres) - PostgreSQL at the edge.

| Package | Description |
|---------|-------------|
| [`postgres.do`](../postgres.do) | SQL tagged template client |
| [`@dotdo/postgres`](../postgres) | PostgreSQL server (DO + PGLite) |
| [`@dotdo/supabase`](../supabase) | Supabase-compatible client |
| [`@dotdo/neon`](../neon) | Neon-compatible API |

## Links

- [Documentation](https://postgres.do/docs/postgrest)
- [GitHub](https://github.com/dot-do/postgres)
- [PostgREST API Spec](https://postgrest.org/en/stable/api.html)

## License

MIT
