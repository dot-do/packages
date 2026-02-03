---
name: "@db4/rest"
version: 0.1.2
description: "Hono-based REST API with PostgREST-style and JSON:API support for db4"
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - rest
  - api
  - hono
  - postgrest
  - jsonapi
  - openapi
  - cloudflare
  - workers
downloads:
  monthly: 154
published: "2026-01-20T11:32:14.450Z"
updated: "2026-01-23T17:20:38.150Z"
---

# @db4/rest

[![npm version](https://img.shields.io/npm/v/@db4/rest.svg)](https://www.npmjs.com/package/@db4/rest)
[![license](https://img.shields.io/npm/l/@db4/rest.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/rest), [npm](https://www.npmjs.com/package/@db4/rest))

Hono-based REST API for db4 with PostgREST-style query syntax, JSON:API response format, and OpenAPI generation.

## Description

`@db4/rest` provides a Hono-based REST API for db4 with PostgREST-style query syntax, JSON:API response format, and automatic OpenAPI specification generation. It enables building RESTful interfaces for your db4 databases with filtering, sorting, pagination, and relationship traversal through URL query parameters.

## Installation

```bash
npm install @db4/rest
```

## Features

- **PostgREST-style query syntax** - Familiar URL query parameters for filtering, sorting, and pagination
- **JSON:API response format** - Standardized response structure with resource objects and relationships
- **HATEOAS links** - Hypermedia links for API discoverability and navigation
- **OpenAPI generation** - Auto-generate OpenAPI 3.1 specs from your db4 schema
- **Hono framework** - Lightweight, fast, edge-first HTTP framework
- **Type-safe** - Full TypeScript inference from your db4 schema

## Usage

```typescript
import { DB } from 'db4ai'
import { createRestApi } from '@db4/rest'

const db = DB({
  User: {
    id: 'cuid!',
    email: 'string! #unique',
    name: 'string',
    posts: '[Post] -> author',
  },
  Post: {
    id: 'cuid!',
    title: 'string!',
    content: 'text',
    author: 'User! <- posts',
  },
})

const api = createRestApi(db, {
  basePath: '/api/v1',
  openapi: true,
})

export default api
```

## Query Syntax

### Filtering

```bash
# Equality
GET /api/v1/users?email=eq.alice@myapp.com/api

# Comparison operators
GET /api/v1/posts?created_at=gt.2024-01-01
GET /api/v1/posts?view_count=gte.100

# Pattern matching
GET /api/v1/posts?title=like.*typescript*
GET /api/v1/users?email=ilike.*@myapp.com/api

# Array operators
GET /api/v1/posts?tags=cs.{javascript,typescript}
GET /api/v1/posts?id=in.(post_1,post_2,post_3)

# Null checks
GET /api/v1/posts?published_at=is.null
GET /api/v1/posts?published_at=not.is.null
```

### Selecting Fields

```bash
# Select specific fields
GET /api/v1/users?select=id,email,name

# Include relations
GET /api/v1/posts?select=id,title,author(id,name)

# Nested relations
GET /api/v1/users?select=id,name,posts(id,title,tags(name))
```

### Sorting & Pagination

```bash
# Sort ascending/descending
GET /api/v1/posts?order=created_at.desc
GET /api/v1/posts?order=title.asc,created_at.desc

# Pagination
GET /api/v1/posts?limit=10&offset=20

# Cursor pagination
GET /api/v1/posts?cursor=eyJpZCI6InBvc3RfMTIzIn0
```

## JSON:API Response Format

```json
{
  "data": [
    {
      "type": "posts",
      "id": "post_123",
      "attributes": {
        "title": "Introduction to db4",
        "content": "...",
        "createdAt": "2024-01-15T10:30:00Z"
      },
      "relationships": {
        "author": {
          "data": { "type": "users", "id": "user_456" }
        }
      },
      "links": {
        "self": "/api/v1/posts/post_123"
      }
    }
  ],
  "included": [
    {
      "type": "users",
      "id": "user_456",
      "attributes": {
        "name": "Alice",
        "email": "alice@myapp.com/api"
      }
    }
  ],
  "links": {
    "self": "/api/v1/posts?limit=10",
    "first": "/api/v1/posts?limit=10",
    "next": "/api/v1/posts?limit=10&cursor=eyJpZCI6InBvc3RfMTMzIn0",
    "prev": null
  },
  "meta": {
    "total": 42,
    "pageSize": 10
  }
}
```

## HATEOAS Links

Every resource includes hypermedia links for navigation:

```json
{
  "data": {
    "type": "users",
    "id": "user_123",
    "attributes": { "name": "Alice" },
    "links": {
      "self": "/api/v1/users/user_123",
      "posts": "/api/v1/users/user_123/posts",
      "followers": "/api/v1/users/user_123/followers"
    }
  }
}
```

## OpenAPI Generation

```typescript
const api = createRestApi(db, {
  openapi: {
    info: {
      title: 'My API',
      version: '1.0.0',
    },
    servers: [{ url: 'https://api.myapp.com/api' }],
  },
})

// OpenAPI spec available at /api/v1/openapi.json
// Swagger UI at /api/v1/docs
```

## Middleware & Hooks

```typescript
const api = createRestApi(db, {
  middleware: [
    cors(),
    rateLimit({ requests: 100, window: '1m' }),
  ],
  hooks: {
    beforeRead: async (ctx, query) => {
      // Add tenant filter
      query.where('tenantId', '=', ctx.get('tenantId'))
    },
    afterRead: async (ctx, data) => {
      // Transform response
      return censor(data, ctx.get('user').permissions)
    },
    beforeWrite: async (ctx, data) => {
      // Validate & transform input
      return { ...data, updatedBy: ctx.get('user').id }
    },
  },
})
```

## API

REST API creation with `createRestApi` function:

```typescript
function createRestApi(db: DB4Client, options?: RestOptions): HonoApp;
```

### `createRestApi(db, options)`

Creates a Hono app with REST endpoints for all db4 entities.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `basePath` | `string` | `/api` | Base path for all endpoints |
| `openapi` | `boolean \| OpenAPIConfig` | `false` | Enable OpenAPI spec generation |
| `middleware` | `MiddlewareHandler[]` | `[]` | Global middleware |
| `hooks` | `RestHooks` | `{}` | Lifecycle hooks |
| `pagination` | `PaginationConfig` | `{ defaultLimit: 20, maxLimit: 100 }` | Pagination settings |
| `responseFormat` | `'jsonapi' \| 'simple'` | `'jsonapi'` | Response format |

## Related Packages

- [@db4/auth](../auth) - Authentication and authorization
- [@db4/core](../core) - Core types and utilities

## See Also

- [@db4/rpc](../rpc) - Binary RPC protocol for high-performance access
- [@db4/mcp](../mcp) - Model Context Protocol for AI agents

## License

MIT
