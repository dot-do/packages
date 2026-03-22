---
name: product-names
version: 0.1.6
description: Name your product. Check the domain. Ship it.
license: MIT
keywords:
  - naming
  - product
  - domains
  - branding
  - startup
downloads:
  monthly: 1
published: "2025-12-17T20:54:08.832Z"
updated: "2025-12-17T20:54:09.089Z"
---

# product-names

Name your product. Check the domain. Ship it.

## Quick Start

```bash
npx product-names "AI code review tool"
```

```
✓ ReviewBot        reviewbot.hq.sb (free)     reviewbot.io ($29)
✓ CodeLens         codelens.hq.sb (free)      codelens.dev ($39)
✓ PRPilot          prpilot.hq.sb (free)       prpilot.io ($29)
✓ ShipCheck        shipcheck.hq.sb (free)     shipcheck.com ($12)
✓ MergeAI          mergeai.hq.sb (free)       mergeai.io ($29)
```

## Install

```bash
npm install product-names
```

## CLI

```bash
# Generate names with domain check
product-names "AI code review tool"

# Specific style
product-names "code review" --style compound    # CodeLens, ShipCheck
product-names "code review" --style brandable   # Revio, Codex
product-names "code review" --style descriptive # ReviewBot, CodeChecker

# More options
product-names "code review" --count 20
product-names "code review" --tld .io,.dev,.ai

# Claim a name
product-names claim "reviewbot.hq.sb"
```

## SDK

```typescript
import { names } from 'product-names'

// Generate names with domain availability
const results = await names.generate({
  description: 'AI code review tool',
  count: 10,
  style: 'compound'  // compound | brandable | descriptive | acronym
})

// [
//   { name: 'ReviewBot', domains: { free: 'reviewbot.hq.sb', paid: [...] } },
//   { name: 'CodeLens', domains: { free: 'codelens.hq.sb', paid: [...] } },
//   ...
// ]

// Generate with constraints
const results = await names.generate({
  description: 'AI code review',
  mustInclude: ['AI', 'code'],
  maxLength: 10,
  style: 'brandable'
})

// Check specific name
const available = await names.check('reviewbot')
// { name: 'reviewbot', domains: [...] }

// Claim and register
const claimed = await names.claim('reviewbot.hq.sb')
```

## Naming Styles

### Compound
Two words merged: `CodeLens`, `ShipCheck`, `ReviewBot`

```typescript
const names = await names.generate({
  description: 'code review',
  style: 'compound'
})
```

### Brandable
Invented words: `Revio`, `Codly`, `Prex`

```typescript
const names = await names.generate({
  description: 'code review',
  style: 'brandable'
})
```

### Descriptive
Clear and direct: `CodeReviewer`, `PRChecker`, `ReviewAI`

```typescript
const names = await names.generate({
  description: 'code review',
  style: 'descriptive'
})
```

### Acronym
Letter-based: `CRAI`, `PRX`, `RVW`

```typescript
const names = await names.generate({
  description: 'code review',
  style: 'acronym'
})
```

## Prefixes & Suffixes

```typescript
// Common prefixes
const prefixes = ['go', 'get', 'try', 'use', 'my', 'the']

// Common suffixes
const suffixes = ['ly', 'ify', 'io', 'ai', 'hq', 'app', 'bot']

// Generate with specific patterns
const names = await names.generate({
  description: 'code review',
  prefix: 'go',     // GoReview, GoCode
  suffix: 'ai'      // ReviewAI, CodeAI
})
```

## Domain Integration

```typescript
import { names } from 'product-names'
import { domains } from 'builder.domains'

// Generate and claim in one flow
const results = await names.generate({ description: 'code review' })
const best = results[0]

// Claim free subdomain
await domains.claim(best.domains.free)

// Or register paid domain
await domains.register(best.domains.paid[0])
```

## MCP Server

```json
{
  "mcpServers": {
    "product-names": {
      "command": "npx",
      "args": ["product-names", "mcp"]
    }
  }
}
```

> "Generate names for my AI code review tool"
> "Find a brandable name for a design tool"
> "Check if 'reviewbot' is available"

## License

MIT
