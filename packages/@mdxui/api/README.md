---
name: "@mdxui/api"
version: 6.0.0
description: JSON/HATEOAS renderer for MDXUI - expose your UI as a navigable API
license: MIT
keywords:
  - mdxui
  - api
  - rest
  - hateoas
  - openapi
  - hypermedia
downloads:
  monthly: 17
published: "2026-01-24T14:37:51.504Z"
updated: "2026-01-24T14:37:51.771Z"
---

# @mdxui/api

JSON/HATEOAS renderer for MDXUI. Turn your UI components into a navigable REST API with automatic OpenAPI documentation generation.

## Features

- **JSON Rendering** - Convert React component trees to JSON
- **HATEOAS Links** - Generate navigation links for API discoverability
- **OpenAPI Generation** - Auto-generate OpenAPI 3.1 specs from routes
- **Content Negotiation** - Support for JSON, HAL+JSON, and JSON:API formats
- **Caching Utilities** - ETag and Cache-Control header generation

## Installation

```bash
pnpm add @mdxui/api @mdxui/navigation
```

## Quick Start

### 1. Define Your Routes

```typescript
import { createRoutes } from '@mdxui/navigation'
import { z } from 'zod'

const routes = createRoutes({
  users: {
    path: '/users',
    params: z.object({
      limit: z.number().int().min(1).max(100).optional(),
    }),
    meta: {
      summary: 'List all users',
      responseSchema: UserSchema,
      schemaName: 'User',
      isList: true,
    },
    children: {
      detail: {
        path: '/:id',
        params: z.object({ id: z.string().uuid() }),
        meta: { summary: 'Get user by ID' },
      },
    },
  },
})
```

### 2. Render to JSON

```typescript
import { renderToJSON, renderListView, renderDetailView } from '@mdxui/api'

// Simple component rendering
const json = renderToJSON(<UserCard user={user} />)
// => { type: 'UserCard', props: { user: {...} }, children: [...] }

// List view with HATEOAS links
const response = renderListView(users, {
  route: routes.users,
  params: {},
  baseUrl: 'https://api.example.com.ai',
  itemKey: 'id',
  pagination: { cursor: 'abc', limit: 20, hasMore: true },
})
// => { meta: {...}, data: [...], _links: { self, parent, children, next } }

// Detail view with HATEOAS links
const detail = renderDetailView(user, {
  route: routes.users.children.detail,
  params: { id: '123' },
  baseUrl: 'https://api.example.com.ai',
  actions: ['update', 'delete'],
})
```

### 3. Generate OpenAPI Spec

```typescript
import { generateOpenApi } from '@mdxui/api/openapi'

const spec = generateOpenApi(routes, {
  title: 'My API',
  version: '1.0.0',
  description: 'User management API',
  servers: [{ url: 'https://api.example.com.ai', description: 'Production' }],
})

// Serve at /openapi.json
app.get('/openapi.json', (c) => c.json(spec))
```

### 4. Build HATEOAS Links

```typescript
import { createLinkBuilder } from '@mdxui/api/hateoas'

const builder = createLinkBuilder({
  routes,
  baseUrl: 'https://api.example.com.ai',
})

// Navigation links for a route
const links = builder.forRoute(routes.users.children.detail, { id: '123' })
// => {
//   self: { href: 'https://api.example.com.ai/users/123', rel: 'self' },
//   parent: { href: 'https://api.example.com.ai/users', rel: 'parent' },
//   children: [{ href: '.../settings', rel: 'settings' }, ...],
//   siblings: [{ href: '.../profile', rel: 'profile' }]
// }

// Pagination links
const pagination = builder.forPagination(routes.users, {}, {
  cursor: 'page2',
  limit: 20,
  hasMore: true,
})

// Action links
const actions = builder.forActions(routes.users.children.detail, { id: '123' }, [
  { name: 'update', method: 'PUT' },
  { name: 'delete', method: 'DELETE' },
])
```

## API Reference

### Main Exports

#### `renderToJSON(element, context?)`

Render a React element to JSON structure.

```typescript
// Without context - returns raw JSONNode
const json = renderToJSON(<Component />)
// => { type: 'Component', props: {...}, children: [...] }

// With context - returns full ApiResponse with HATEOAS links
const response = renderToJSON(<UserDetail user={user} />, {
  route: routes.users.children.detail,
  params: { id: '123' },
  baseUrl: 'https://api.example.com.ai',
})
// => { meta: {...}, data: {...}, _links: {...} }
```

#### `renderListView(items, options)`

Render a list/collection view with automatic HATEOAS links.

```typescript
const response = renderListView(users, {
  route: routes.users,
  params: {},
  baseUrl: 'https://api.example.com.ai',
  itemKey: 'id',
  pagination: {
    cursor: 'next-page-token',
    prevCursor: 'prev-page-token',
    limit: 20,
    hasMore: true,
    total: 100,
  },
})
```

#### `renderDetailView(item, options)`

Render a single resource view with HATEOAS links.

```typescript
const response = renderDetailView(user, {
  route: routes.users.children.detail,
  params: { id: '123' },
  baseUrl: 'https://api.example.com.ai',
  actions: ['update', 'delete'],
})
```

#### `API(options)` (In Development)

Create an HTTP request handler for your API.

```typescript
import { API } from '@mdxui/api'

const handler = API({
  routes,
  baseUrl: 'https://api.example.com.ai',
  getData: async (route, params) => {
    // Fetch data for the route
  },
})

// Use with Hono, Express, etc.
app.get('/api/*', handler)
```

### OpenAPI Exports (`@mdxui/api/openapi`)

#### `generateOpenApi(routes, options)`

Generate an OpenAPI 3.1 specification from route definitions.

```typescript
const spec = generateOpenApi(routes, {
  title: 'My API',
  version: '1.0.0',
  description: 'API description',
  servers: [{ url: 'https://api.example.com.ai' }],
  basePath: '/api/v1', // Optional path prefix
})
```

Features:
- Converts `:param` to `{param}` format
- Extracts parameters from Zod schemas
- Generates response schemas with HATEOAS structure
- Includes error responses (400, 404, 500) for routes with path params
- Supports `meta.tags`, `meta.summary`, `meta.description`
- Registers component schemas from `meta.responseSchema`

#### `zodToJsonSchema(schema)`

Convert a Zod schema to JSON Schema format.

```typescript
const jsonSchema = zodToJsonSchema(z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user']),
}))
```

### HATEOAS Exports (`@mdxui/api/hateoas`)

#### `createLinkBuilder(options)`

Create a builder for generating HATEOAS navigation links.

```typescript
const builder = createLinkBuilder({
  routes,
  baseUrl: 'https://api.example.com.ai',
})

// Methods:
builder.forRoute(route, params)      // Navigation links
builder.forPagination(route, params, paginationInfo)  // Pagination links
builder.forActions(route, params, actions)  // Action links
```

#### `formatResponse(data, links, contentType)`

Format a response based on content type.

```typescript
import { formatResponse, negotiateContentType } from '@mdxui/api/hateoas'

// Determine content type from Accept header
const contentType = negotiateContentType(
  request.headers.get('Accept'),
  ['application/json', 'application/hal+json', 'application/vnd.api+json'],
  'application/json'
)

const response = formatResponse(data, links, contentType)
```

#### `parseAcceptHeader(header)`

Parse an HTTP Accept header into sorted media types.

```typescript
const types = parseAcceptHeader('application/json, application/hal+json;q=0.9')
// => [
//   { type: 'application/json', quality: 1, params: {} },
//   { type: 'application/hal+json', quality: 0.9, params: {} }
// ]
```

#### Caching Utilities

```typescript
import { generateETag, generateCacheControl, cachePresets, matchesETag } from '@mdxui/api/hateoas'

// Generate ETag from content
const etag = generateETag(responseData)
// => 'W/"a1b2c3d4"'

// Check if client cache is fresh
if (matchesETag(request.headers.get('If-None-Match'), etag)) {
  return new Response(null, { status: 304 })
}

// Generate Cache-Control header
const cacheControl = generateCacheControl({
  public: true,
  maxAge: 3600,
  staleWhileRevalidate: 60,
})
// => 'public, max-age=3600, stale-while-revalidate=60'

// Use presets
generateCacheControl(cachePresets.apiResponse(60))
generateCacheControl(cachePresets.staticAsset())
generateCacheControl(cachePresets.noCache())
```

#### JSON:API Helpers

```typescript
import { toJsonApiResource, toJsonApiCollection, toJsonApiLinks } from '@mdxui/api/hateoas'

// Convert object to JSON:API resource
const resource = toJsonApiResource(user, 'users')
// => { type: 'users', id: '123', attributes: { name: 'Alice', ... } }

// Convert array to JSON:API collection
const collection = toJsonApiCollection(users, 'users', {
  links: { self: '/users' },
  meta: { total: 100 },
})
```

## Response Formats

### JSON (default)

Standard JSON with `_links` object:

```json
{
  "meta": {
    "view": "/users/:id",
    "params": { "id": "123" },
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "data": {
    "id": "123",
    "name": "Alice",
    "email": "alice@example.com.ai"
  },
  "_links": {
    "self": "/users/123",
    "parent": "/users",
    "schema": "/users/schema"
  }
}
```

### HAL+JSON (`application/hal+json`)

Data with embedded `_links`:

```json
{
  "id": "123",
  "name": "Alice",
  "email": "alice@example.com.ai",
  "_links": {
    "self": { "href": "/users/123", "rel": "self", "method": "GET" },
    "parent": { "href": "/users", "rel": "parent", "method": "GET" }
  }
}
```

### JSON:API (`application/vnd.api+json`)

```json
{
  "data": {
    "type": "users",
    "id": "123",
    "attributes": {
      "name": "Alice",
      "email": "alice@example.com.ai"
    }
  },
  "links": {
    "self": "/users/123",
    "related": "/users"
  }
}
```

## Examples

### Basic List/Detail API

```typescript
import { Hono } from 'hono'
import { createRoutes } from '@mdxui/navigation'
import { renderListView, renderDetailView, generateOpenApi, createLinkBuilder } from '@mdxui/api'
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
})

const routes = createRoutes({
  users: {
    path: '/users',
    meta: { responseSchema: UserSchema, schemaName: 'User', isList: true },
    children: {
      detail: {
        path: '/:id',
        params: z.object({ id: z.string().uuid() }),
        meta: { responseSchema: UserSchema, schemaName: 'User' },
      },
    },
  },
})

const app = new Hono()
const baseUrl = 'https://api.example.com.ai'

// OpenAPI spec
app.get('/openapi.json', (c) => c.json(generateOpenApi(routes, {
  title: 'User API',
  version: '1.0.0',
})))

// List users
app.get('/users', async (c) => {
  const users = await db.users.findMany({ take: 20 })
  return c.json(renderListView(users, {
    route: routes.users,
    params: {},
    baseUrl,
    itemKey: 'id',
  }))
})

// Get user by ID
app.get('/users/:id', async (c) => {
  const user = await db.users.findUnique({ where: { id: c.req.param('id') } })
  if (!user) return c.json({ error: 'Not found' }, 404)

  return c.json(renderDetailView(user, {
    route: routes.users.children.detail,
    params: { id: user.id },
    baseUrl,
    actions: ['update', 'delete'],
  }))
})

export default app
```

### With Pagination

```typescript
app.get('/users', async (c) => {
  const cursor = c.req.query('cursor')
  const limit = parseInt(c.req.query('limit') || '20')

  const { items, nextCursor, prevCursor, total } = await db.users.paginate({
    cursor,
    limit,
  })

  return c.json(renderListView(items, {
    route: routes.users,
    params: {},
    baseUrl,
    itemKey: 'id',
    pagination: {
      cursor: nextCursor,
      prevCursor,
      limit,
      hasMore: !!nextCursor,
      total,
    },
  }))
})
```

### Content Negotiation

```typescript
import { formatResponse, negotiateContentType, createLinkBuilder } from '@mdxui/api/hateoas'

app.get('/users/:id', async (c) => {
  const user = await db.users.findUnique({ where: { id: c.req.param('id') } })

  const builder = createLinkBuilder({ routes, baseUrl })
  const links = builder.forRoute(routes.users.children.detail, { id: user.id })

  const contentType = negotiateContentType(
    c.req.header('Accept') || '',
    ['application/json', 'application/hal+json', 'application/vnd.api+json'],
    'application/json'
  )

  const response = formatResponse(user, links, contentType)
  return c.json(response, { headers: { 'Content-Type': contentType } })
})
```

### With Caching

```typescript
import { generateETag, generateCacheControl, matchesETag, cachePresets } from '@mdxui/api/hateoas'

app.get('/users/:id', async (c) => {
  const user = await db.users.findUnique({ where: { id: c.req.param('id') } })

  const etag = generateETag(user)
  const ifNoneMatch = c.req.header('If-None-Match')

  if (ifNoneMatch && matchesETag(ifNoneMatch, etag)) {
    return new Response(null, { status: 304 })
  }

  const response = renderDetailView(user, { route, params, baseUrl })

  return c.json(response, {
    headers: {
      'ETag': etag,
      'Cache-Control': generateCacheControl(cachePresets.apiResponse(60)),
    },
  })
})
```

## TypeScript Types

```typescript
import type {
  // Core types
  JSONNode,
  ApiResponse,
  ApiViewMeta,
  ApiLinks,
  RenderContext,
  RenderOptions,

  // OpenAPI types
  OpenApiSpec,
  OpenApiPath,
  OpenApiOperation,
  OpenApiParameter,
  GenerateOpenApiOptions,

  // HATEOAS types
  HateoasLink,
  HateoasLinks,
  LinkBuilderOptions,
  ContentType,
  CacheOptions,

  // JSON:API types
  JsonApiDocument,
  JsonApiResource,
  JsonApiLinks,
} from '@mdxui/api'
```

## License

MIT
