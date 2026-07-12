---
name: "@dotdo/esm"
version: 0.1.1
description: Platform-agnostic core library for esm.do module management.
downloads:
  monthly: 28
published: "2026-01-25T11:57:24.311Z"
updated: "2026-01-26T18:23:16.173Z"
---

# @dotdo/esm

Platform-agnostic core library for esm.do module management.

## Installation

```bash
npm install @dotdo/esm
# or
pnpm add @dotdo/esm
```

## Usage

### Basic Module Management

```typescript
import { ESM, InMemoryStorage } from '@dotdo/esm'

// Create an ESM instance with storage
const esm = ESM.withStorage(new InMemoryStorage())

// Write a module
await esm.write('@myorg/utils', {
  code: `export function add(a, b) { return a + b }`,
  tests: `import { add } from './index.js'
    export default [
      { name: 'adds numbers', fn: () => add(1, 2) === 3 }
    ]`,
})

// Read a module
const module = await esm.read('@myorg/utils')

// Run a module
const result = await esm.run('@myorg/utils', { a: 1, b: 2 })

// Test a module
const testResult = await esm.test('@myorg/utils')
```

### Deploy Adapters

Deploy your ESM modules to any platform with built-in adapters:

```typescript
// Cloudflare Workers
import { createHandler } from '@dotdo/esm/deploy'
import { CloudflareAdapter } from '@dotdo/esm/deploy/cloudflare'

export default {
  fetch: createHandler(new CloudflareAdapter())
}
```

```typescript
// Vercel Edge Functions
import { createHandler } from '@dotdo/esm/deploy'
import { VercelAdapter } from '@dotdo/esm/deploy/vercel'

export default createHandler(new VercelAdapter())
```

```typescript
// AWS Lambda
import { createHandler } from '@dotdo/esm/deploy'
import { AWSLambdaAdapter } from '@dotdo/esm/deploy/aws'

export const handler = createHandler(new AWSLambdaAdapter())
```

```typescript
// Netlify Functions
import { createHandler } from '@dotdo/esm/deploy'
import { NetlifyAdapter } from '@dotdo/esm/deploy/netlify'

export const handler = createHandler(new NetlifyAdapter())
```

```typescript
// Deno Deploy
import { createHandler } from '@dotdo/esm/deploy'
import { DenoAdapter } from '@dotdo/esm/deploy/deno'

Deno.serve(createHandler(new DenoAdapter()))
```

```typescript
// Bun
import { createHandler } from '@dotdo/esm/deploy'
import { BunAdapter } from '@dotdo/esm/deploy/bun'

export default {
  fetch: createHandler(new BunAdapter())
}
```

## Exports

| Export | Description |
|--------|-------------|
| `@dotdo/esm` | Main ESM class and core utilities |
| `@dotdo/esm/types` | TypeScript type definitions |
| `@dotdo/esm/errors` | Error classes |
| `@dotdo/esm/executor` | Code execution utilities |
| `@dotdo/esm/storage` | Storage implementations |
| `@dotdo/esm/deploy` | Universal deploy handler |
| `@dotdo/esm/deploy/cloudflare` | Cloudflare Workers adapter |
| `@dotdo/esm/deploy/vercel` | Vercel Edge adapter |
| `@dotdo/esm/deploy/aws` | AWS Lambda adapter |
| `@dotdo/esm/deploy/netlify` | Netlify Functions adapter |
| `@dotdo/esm/deploy/deno` | Deno Deploy adapter |
| `@dotdo/esm/deploy/bun` | Bun adapter |

## License

MIT
