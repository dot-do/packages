---
name: "@dotdo/sdk"
version: 0.1.1
description: Define your API once, get a typed client, CLI binary, and MCP server
license: MIT
repository: "https://github.com/dotdo-ai/sdk"
homepage: "https://github.com/dotdo-ai/sdk#readme"
keywords:
  - sdk
  - cli
  - mcp
  - codegen
  - typescript
  - api
downloads:
  monthly: 18
published: "2026-01-26T16:01:54.397Z"
updated: "2026-01-26T16:01:54.743Z"
---

# @dotdo/sdk

A meta-framework that simplifies the process of creating and publishing an SDK with CLI and MCP. Define your API once, get a typed client, CLI binary, and MCP server - all publishable to npm.

## Installation

```bash
npm install @dotdo/sdk
```

## Quick Start

### 1. Create a new SDK project

```bash
npx sdk.do init my-api
cd my-api
npm install
```

### 2. Define your API in `sdk.config.ts`

```typescript
import { defineSDK } from '@dotdo/sdk'

export default defineSDK({
  name: 'my-api',
  baseUrl: 'https://api.example.com',
  api: {
    users: {
      list: {
        input: { limit: 'number?', offset: 'number?' },
        output: 'User[]',
        description: 'List all users',
      },
      get: {
        input: { id: 'string' },
        output: 'User',
        description: 'Get a user by ID',
      },
    },
  },
  types: {
    User: {
      id: 'string',
      name: 'string',
      email: 'string',
    },
  },
})
```

### 3. Generate packages

```bash
npx sdk.do generate
```

This creates four packages in `generated/`:
- `types/` - Shared TypeScript type definitions
- `client/` - Typed SDK client
- `cli/` - CLI binary with subcommands
- `mcp/` - MCP server with tools

### 4. Build and publish

```bash
npx sdk.do build
npx sdk.do publish
```

## API Definition

### Type Strings

Use shorthand type strings for API definitions:

| Type | Meaning |
|------|---------|
| `'string'` | string |
| `'number'` | number |
| `'boolean'` | boolean |
| `'object'` | Record<string, unknown> |
| `'string?'` | optional string |
| `'User[]'` | array of User |
| `'User[]?'` | optional array of User |

### Authentication

```typescript
defineSDK({
  // ...
  auth: {
    type: 'api-key',      // or 'oauth2', 'bearer'
    headerName: 'X-API-Key',
  },
})
```

## CLI Commands

```bash
sdk.do init [name]       # Scaffold new SDK project
sdk.do generate          # Generate client/CLI/MCP from sdk.config.ts
sdk.do dev               # Watch mode - regenerate on config changes
sdk.do build             # Build all generated packages
sdk.do version [bump]    # Bump version (patch/minor/major)
sdk.do publish           # Build and publish all packages to npm
sdk.do login             # Authenticate with npm
```

## Generated Output

### Client Package

```typescript
import { createClient } from '@my-api/client'

const client = createClient({ apiKey: 'your-key' })
const users = await client.users.list({ limit: 10 })
const user = await client.users.get({ id: '123' })
```

### CLI Package

```bash
my-api users list --limit 10
my-api users get --id 123
```

### MCP Package

The MCP server exposes your API as tools:
- `users_list` - List all users
- `users_get` - Get a user by ID

## Exports

```typescript
import { defineSDK } from '@dotdo/sdk'
import { createClient } from '@dotdo/sdk/client'
import { createCLI } from '@dotdo/sdk/cli'
import { sdkToMCPTools } from '@dotdo/sdk/mcp'
import { generate } from '@dotdo/sdk/generate'
```

## License

MIT
