---
name: "@dotdo/parse-worker"
version: 0.1.0
description: Cloudflare Worker for parsing and compiling MDX app definitions
license: MIT
repository: "https://github.com/payloadcms/payload"
homepage: "https://github.com/payloadcms/payload#readme"
keywords:
  - cloudflare
  - workers
  - mdx
  - parser
  - payload
  - cms
downloads:
  monthly: 8
published: "2025-12-18T20:55:57.651Z"
updated: "2025-12-18T20:55:57.895Z"
---

# @dotdo/parse-worker

A Cloudflare Worker for parsing and compiling MDX application definitions into executable code.

## Overview

This worker is part of the Dynamic Worker Architecture for Payload CMS. It receives MDX source files containing:

- YAML frontmatter (schema definitions)
- Markdown content (documentation)
- TypeScript/JavaScript code blocks (hooks and access control)

It returns compiled JavaScript that can be executed in Dynamic Worker Loaders.

## API

### POST /parse

Parses and compiles MDX source into executable components.

**Request:**

```json
{
  "source": "string", // Raw MDX content
  "appId": "string" // Application identifier
}
```

**Response:**

```json
{
  "schema": {}, // Frontmatter as object
  "code": "string", // Compiled JavaScript module
  "content": "string", // Markdown content
  "hash": "string" // SHA-256 hash of source
}
```

## Code Block Extraction

The worker extracts code blocks tagged with hook languages:

- ` ```ts hooks `
- ` ```js hooks `
- ` ```typescript hooks `
- ` ```javascript hooks `

Other code blocks are ignored.

## Example MDX

```mdx
---
name: Products
slug: products
type: collection
fields:
  - name: title
    type: text
    required: true
---

# Products Collection

This collection manages product data.

\`\`\`ts hooks
export const access = {
read: () => true,
create: ({ req }) => req.user?.role === 'admin'
}

export const hooks = {
  beforeChange: [
    async ({ data }) => {
      data.slug = data.title.toLowerCase()
      return data
    }
  ]
}
\`\`\

`
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check

# Build
pnpm build

# Deploy
pnpm deploy
```

## Testing

Tests use Vitest with `@cloudflare/vitest-pool-workers` for testing in a Workers environment:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch
```

## Architecture

1. **Parser** (`parser.ts`) - Extracts frontmatter and code blocks using gray-matter
2. **Compiler** (`compiler.ts`) - Lightweight TypeScript type-stripping (no external WASM)
3. **Worker** (`index.ts`) - HTTP handler that orchestrates parsing and compilation

## Security

- Only accepts POST requests
- Validates input fields
- Sandboxed code compilation
- No external network access during compilation

## Performance

- CPU-time billing (only runs on MDX changes)
- Lightweight type-stripping (no WASM initialization overhead)
- Returns compiled code for caching in Durable Objects
- Zero external dependencies at runtime (only gray-matter for frontmatter)

## License

MIT
