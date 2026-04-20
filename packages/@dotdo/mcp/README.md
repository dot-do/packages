---
name: "@dotdo/mcp"
version: 0.1.5
description: MCP Server library with search, fetch, and do primitives - the core package for building MCP servers
license: MIT
repository: "https://github.com/drivly/mcp"
homepage: "https://mcp.do"
keywords:
  - mcp
  - model-context-protocol
  - ai
  - agents
  - search
  - fetch
  - sandbox
  - cloudflare-workers
  - hono
downloads:
  monthly: 122
published: "2026-01-24T19:52:58.781Z"
updated: "2026-01-26T18:12:53.932Z"
---

# @dotdo/mcp

MCP Server library with search, fetch, and do primitives - the core package for building MCP (Model Context Protocol) servers.

## Installation

```bash
npm install @dotdo/mcp
# or
pnpm add @dotdo/mcp
```

## Quick Start

```typescript
import { createMCPServer, createScope } from '@dotdo/mcp'
import { Hono } from 'hono'

// Define your domain bindings for the sandboxed `do` tool
const scope = createScope({
  bindings: {
    db: {
      query: async (sql: string) => {
        // Your database query implementation
        return []
      }
    },
    api: {
      fetch: async (url: string) => {
        // Your API fetch implementation
        return {}
      }
    }
  },
  permissions: {
    allowNetwork: false // Disable raw fetch in sandbox
  },
  timeout: 5000
})

// Create the MCP server
const mcp = createMCPServer({
  search: async (query, options) => {
    // Implement search logic
    return [{ id: '1', title: 'Result', content: 'Content...' }]
  },
  fetch: async (id, options) => {
    // Implement fetch logic
    return { id, content: 'Fetched content' }
  },
  do: scope
})

// Mount on Hono
const app = new Hono()
app.post('/mcp', mcp.getHttpHandler())
```

## Three Primitives

The MCP server exposes three core tools:

### search

Search for information in your knowledge base.

```typescript
{
  query: string      // The search query
  limit?: number     // Maximum results (optional)
  offset?: number    // Skip results (optional)
}
```

### fetch

Fetch a specific resource by identifier.

```typescript
{
  id: string              // Resource identifier
  includeMetadata?: boolean // Include metadata (optional)
  format?: string         // Desired format (optional)
}
```

### do

Execute TypeScript code in a sandboxed environment with your domain bindings.

```typescript
{
  code: string  // TypeScript code to execute
}
```

## Authentication

The library includes built-in authentication support:

```typescript
import { createMCPServer, createAuthMiddleware } from '@dotdo/mcp'

const mcp = createMCPServer({
  // ... tools config
  auth: {
    mode: 'anon+auth', // 'anon' | 'anon+auth' | 'auth-required'
    oauth: {
      introspectionUrl: 'https://auth.example.com/introspect'
    },
    apiKey: {
      verifyUrl: 'https://keys.example.com/verify'
    }
  }
})

// Use with Hono middleware
const app = new Hono()
const authMiddleware = createAuthMiddleware(mcp.getAuthConfig())
app.use('/mcp/*', authMiddleware)
app.post('/mcp', mcp.getHttpHandler())
```

### Auth Modes

- `anon` - Anonymous access only (readonly)
- `anon+auth` - Both anonymous and authenticated access
- `auth-required` - Authentication required for all access

### Token Types

The library auto-detects token types:

- JWT tokens (three dot-separated parts)
- API keys with `sk_` prefix
- API keys with `do_` prefix

## Exports

```typescript
// Main entry
import { createMCPServer } from '@dotdo/mcp'

// Server for Node.js (uses vm2)
import { createMCPServerNode } from '@dotdo/mcp/node'

// Tools
import { createSearchTool, createFetchTool, createDoTool } from '@dotdo/mcp/tools'

// Scope creation
import { createScope, validateScope } from '@dotdo/mcp/scope'

// Authentication
import {
  createAuthMiddleware,
  authenticate,
  ANONYMOUS_CONTEXT
} from '@dotdo/mcp/auth'
```

## Cloudflare Workers

For Cloudflare Workers with sandboxed code execution:

```typescript
import { createMCPServer } from '@dotdo/mcp'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const mcp = createMCPServer(config, { env })
    return mcp.getHttpHandler()(request)
  }
}
```

## Node.js

For Node.js environments:

```typescript
import { createMCPServerNode } from '@dotdo/mcp/node'

const mcp = createMCPServerNode(config)
```

## Type Integration

This package optionally integrates with `@dotdo/types` for shared type definitions. Install it as a peer dependency if you want to use types from the broader @dotdo ecosystem:

```bash
pnpm add @dotdo/types
```

## License

MIT
