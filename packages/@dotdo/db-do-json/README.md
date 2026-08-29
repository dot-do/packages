---
name: "@dotdo/db-do-json"
version: 0.1.0
description: Schemaless JSON database adapter for Payload CMS on Cloudflare Durable Objects
license: MIT
repository: "https://github.com/payloadcms/payload"
homepage: "https://github.com/payloadcms/payload#readme"
keywords:
  - payload
  - cms
  - cloudflare
  - durable-objects
  - database
  - adapter
  - json
downloads:
  monthly: 7
published: "2025-12-18T20:56:03.731Z"
updated: "2025-12-18T20:56:04.035Z"
---

# @dotdo/db-do-json

A schemaless JSON database adapter for Payload CMS running on Cloudflare Durable Objects.

## Overview

This package provides:

1. **Database Adapter** - Full Payload CMS database adapter using Durable Objects + SQLite
2. **PayloadAPI** - WorkerEntrypoint for controlled RPC access from dynamic code
3. **Execution Layer** - Sandboxed hook execution in Worker Loaders

## Installation

```bash
pnpm add @dotdo/db-do-json
```

## Usage

### As a Payload Database Adapter

```typescript
import { doJsonAdapter } from '@dotdo/db-do-json'

export default buildConfig({
  db: doJsonAdapter({
    ctx: durableObjectContext,
    storage: durableObjectStorage,
  }),
  // ... rest of config
})
```

### PayloadAPI for Dynamic Code

The `PayloadAPI` WorkerEntrypoint provides controlled database access for dynamic code running in Worker Loaders:

```typescript
import { PayloadAPI } from '@dotdo/db-do-json'

// Export from your worker
export { PayloadAPI }

// In wrangler.toml
// [[durable_objects.bindings]]
// name = "APP_DB"
// class_name = "DB"
```

### Execution Layer

Execute MDX-compiled hooks in a sandboxed environment:

```typescript
import { executeWithHooks, validateCompiledCode } from '@dotdo/db-do-json'

// Validate code before execution
const validation = validateCompiledCode(compiledCode)
if (!validation.safe) {
  throw new Error(validation.reason)
}

// Execute hooks
const result = await executeWithHooks({
  env,
  ctx,
  appId: 'my-app',
  tenantId: 'tenant-123',
  collection: 'products',
  operation: 'create',
  data: { title: 'New Product' },
  compiledCode,
  schema,
})
```

## Exports

### Main (`@dotdo/db-do-json`)

- `doJsonAdapter` / `doAdapter` - Database adapter factory
- `DB` - Durable Object class
- `getStub` - Helper to get DO stub
- `PayloadAPI` - WorkerEntrypoint for RPC
- `DynamicWorkerLoader` - Worker Loader wrapper
- `executeWithHooks` - Main hook execution function
- `validateCompiledCode` - Code safety validation
- `createSandboxedConfig` - Sandbox configuration
- ID utilities: `encodeId`, `decodeId`, `resolveId`

### API Subpath (`@dotdo/db-do-json/api`)

- `PayloadAPI` - WorkerEntrypoint class
- Type exports for API arguments

### Execution Subpath (`@dotdo/db-do-json/execution`)

- `DynamicWorkerLoader` - Worker Loader management
- `executeWithHooks` - Hook execution
- `validateCompiledCode` - Code validation
- `createSandboxedConfig` - Sandbox config
- `sanitizeError` - Error sanitization
- `withTimeout` - Timeout wrapper
- `EXECUTION_LIMITS` - Execution limits constants

## Security

The execution layer provides multiple security layers:

1. **Code Validation** - Blocks `eval()`, `Function()`, `import()`, `process`, `require()`
2. **Network Isolation** - `globalOutbound: null` in Worker Loader
3. **Controlled API** - Only PayloadAPI methods available
4. **Timeout Protection** - 30s default execution timeout
5. **Error Sanitization** - Prevents internal info leakage

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Watch tests
pnpm test:watch
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Dynamic Code (Worker Loader)                │
│  - Compiled MDX hooks                                        │
│  - Access control functions                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ RPC
┌─────────────────────────────────────────────────────────────┐
│              PayloadAPI (WorkerEntrypoint)                   │
│  - Scoped to appId, tenantId, collection                    │
│  - Methods: find, create, update, delete, count             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ RPC
┌─────────────────────────────────────────────────────────────┐
│                  DB (Durable Object)                         │
│  - SQLite storage                                            │
│  - Per-tenant isolation                                      │
└─────────────────────────────────────────────────────────────┘
```

## License

MIT
