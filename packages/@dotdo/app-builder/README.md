---
name: "@dotdo/app-builder"
version: 0.1.0
description: Deploy your own dynamic MDX-powered app builder on Cloudflare Workers
license: MIT
repository: "https://github.com/payloadcms/payload"
homepage: "https://github.com/payloadcms/payload#readme"
keywords:
  - cloudflare
  - workers
  - durable-objects
  - mdx
  - cms
  - app-builder
  - dynamic
downloads:
  monthly: 14
published: "2025-12-18T20:56:23.585Z"
updated: "2025-12-18T20:56:23.865Z"
---

# @dotdo/app-builder

Deploy your own dynamic MDX-powered app builder on Cloudflare Workers with a single line of code.

## Quick Start

```bash
npm install @dotdo/app-builder
```

Create your worker entry point:

```typescript
// src/worker.ts
export * from '@dotdo/app-builder'
```

That's it! The package exports everything you need:

- Default fetch handler
- `DB` Durable Object class (database storage)
- `PayloadAPI` Worker Entrypoint (RPC interface)

## Wrangler Configuration

Copy the example configuration:

```bash
cp node_modules/@dotdo/app-builder/wrangler.example.toml wrangler.toml
```

Or create your own `wrangler.toml`:

```toml
name = "my-app-builder"
main = "src/worker.ts"
compatibility_date = "2024-12-18"
compatibility_flags = ["nodejs_compat"]

# Durable Objects
[[durable_objects.bindings]]
name = "SYSTEM_DB"
class_name = "DB"

[[durable_objects.bindings]]
name = "APP_DB"
class_name = "DB"

# Migrations
[[migrations]]
tag = "v1"
new_classes = ["DB"]
```

## Deploy

```bash
wrangler deploy
```

## Custom Configuration

For more control, create a custom handler:

```typescript
import { createAppBuilder, DB, PayloadAPI } from '@dotdo/app-builder'

// Re-export Durable Object classes
export { DB, PayloadAPI }

// Create handler with custom options
export default createAppBuilder({
  basePath: '/api', // API route prefix (default: '/api')
  cors: true, // Enable CORS (default: true)
  corsOrigin: '*', // CORS origin (default: '*')
  logging: false, // Request logging (default: false)
})
```

## API Endpoints

### Health Check

```
GET /api/health
```

### Parse MDX

````
POST /api/parse
Content-Type: application/json

{
  "source": "---\nname: my-app\ncollections:\n  - name: posts\n---\n\n# My App\n\n```ts hooks\nexport const hooks = {\n  beforeChange: ({ data }) => ({ ...data, slug: data.title.toLowerCase() })\n}\n```"
}
````

### Apps

```
GET    /api/apps              # List all apps
POST   /api/apps              # Create new app
GET    /api/apps/:appId       # Get app by ID
PUT    /api/apps/:appId       # Update app
DELETE /api/apps/:appId       # Delete app
```

### Documents

```
GET    /api/apps/:appId/:tenantId/:collection              # List documents
POST   /api/apps/:appId/:tenantId/:collection              # Create document
GET    /api/apps/:appId/:tenantId/:collection/:documentId  # Get document
PUT    /api/apps/:appId/:tenantId/:collection/:documentId  # Update document
DELETE /api/apps/:appId/:tenantId/:collection/:documentId  # Delete document
```

## MDX App Format

Apps are defined using MDX with YAML frontmatter for schema and TypeScript code blocks for hooks:

````mdx
---
name: blog
slug: blog
collections:
  - name: posts
    slug: posts
    fields:
      - name: title
        type: text
        required: true
      - name: content
        type: richText
      - name: author
        type: relationship
        relationTo: users
---

# Blog App

This app powers a simple blog.

```ts hooks
import type { BeforeChangeHookArgs } from '@dotdo/app-builder'

export const hooks = {
  posts: {
    beforeChange: ({ data }: BeforeChangeHookArgs) => {
      return {
        ...data,
        slug: data.title?.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: new Date().toISOString(),
      }
    },
  },
}

export const access = {
  posts: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
}
```
````

```

## Multi-Tenant Architecture

Each app can have multiple tenants, with complete data isolation:

```

/api/apps/blog/tenant-a/posts # Tenant A's posts
/api/apps/blog/tenant-b/posts # Tenant B's posts (completely separate)

````

Data is stored in separate Durable Objects per `appId:tenantId` combination.

## Advanced Usage

### Access Parsing Utilities

```typescript
import { parseMDX, combineCodeBlocks, compileCode, generateHash } from '@dotdo/app-builder'

const source = `---
name: my-app
---
# Content
`

const parsed = parseMDX(source)
console.log(parsed.frontmatter)  // { name: 'my-app' }
console.log(parsed.content)      // '# Content'
````

### Access Execution Layer

```typescript
import {
  executeWithHooks,
  validateCompiledCode,
  DynamicWorkerLoader,
  EXECUTION_LIMITS,
} from '@dotdo/app-builder'

// Validate user-submitted code is safe
const validation = validateCompiledCode(userCode)
if (!validation.safe) {
  throw new Error(`Unsafe code: ${validation.reason}`)
}
```

## Environment Bindings

The handler expects these Cloudflare bindings:

| Binding     | Type                   | Description                              |
| ----------- | ---------------------- | ---------------------------------------- |
| `SYSTEM_DB` | DurableObjectNamespace | Stores app definitions and system data   |
| `APP_DB`    | DurableObjectNamespace | Stores per-app, per-tenant document data |
| `CACHE`     | KVNamespace (optional) | Cache for compiled code                  |

## License

MIT
