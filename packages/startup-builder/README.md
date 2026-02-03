---
name: startup-builder
version: 0.1.0
description: Business-as-Code. Define your startup in minutes.
license: MIT
keywords:
  - startup
  - builder
  - business
  - lean-canvas
  - mvp
downloads:
  monthly: 10
published: "2025-12-17T19:56:37.744Z"
updated: "2025-12-17T19:56:37.896Z"
---

# startup-builder

Business-as-Code. Define your startup in minutes.

## Quick Start

```bash
npx startup-builder
```

## Install

```bash
npm install startup-builder
```

## What You Get

One command. Complete startup foundation.

```bash
startup-builder "AI code review for engineering teams"
```

```
✓ Foundation Sprint    Complete problem/solution definition
✓ Lean Canvas         One-page business model
✓ ICP                 Ideal customer profile
✓ Jobs-to-be-Done     Customer motivation map
✓ StoryBrand          Clear messaging framework
✓ Name                Startup name + domain
✓ Landing Page        Ready to deploy
```

## CLI

```bash
# Full guided experience
startup-builder

# Start from idea
startup-builder "your startup idea"

# Run specific modules
startup-builder foundation   # Foundation sprint
startup-builder canvas       # Lean canvas
startup-builder icp          # Ideal customer profile
startup-builder jtbd         # Jobs to be done
startup-builder story        # StoryBrand messaging
startup-builder name         # Name generation
startup-builder landing      # Landing page

# Export everything
startup-builder export --format md
startup-builder export --format json
```

## SDK

```typescript
import { builder } from 'startup-builder'

// Build complete startup foundation
const startup = await builder.create({
  idea: 'AI code review for engineering teams',
  founder: {
    capabilities: ['ML expertise', 'DevTools experience'],
    insight: 'Code review is the biggest bottleneck',
    motivation: 'Hated waiting for reviews'
  }
})

// Returns complete startup package
// {
//   foundation: { problem, customer, solution, mvp, validation },
//   canvas: { ... 9 boxes ... },
//   icp: { firmographics, buyer, problems, goals, buying },
//   jtbd: { mainJob, relatedJobs, forces },
//   story: { character, problem, guide, plan, cta, failure, success },
//   name: { name, tagline, domain },
//   landing: { url, sections }
// }

// Build incrementally
const foundation = await builder.foundation('AI code review')
const canvas = await builder.canvas(foundation)
const icp = await builder.icp(foundation)
const story = await builder.story(foundation, icp)
const name = await builder.name(foundation)
const landing = await builder.landing(name, story)
```

## The Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. FOUNDATION SPRINT                                               │
│     Problem → Customer → Solution → MVP → Validation                │
├─────────────────────────────────────────────────────────────────────┤
│  2. LEAN CANVAS                                                     │
│     Complete business model on one page                             │
├─────────────────────────────────────────────────────────────────────┤
│  3. IDEAL CUSTOMER PROFILE                                          │
│     Know exactly who you're building for                            │
├─────────────────────────────────────────────────────────────────────┤
│  4. JOBS TO BE DONE                                                 │
│     Understand why customers will buy                               │
├─────────────────────────────────────────────────────────────────────┤
│  5. STORYBRAND                                                      │
│     Clarify your message                                            │
├─────────────────────────────────────────────────────────────────────┤
│  6. NAME + DOMAIN                                                   │
│     Find the perfect name, claim the domain                         │
├─────────────────────────────────────────────────────────────────────┤
│  7. LANDING PAGE                                                    │
│     Deploy and start collecting signups                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Output

Everything syncs to your Startups.Studio dashboard and exports to code:

```
my-startup/
├── startup.mdx           # Complete startup definition
├── canvas.mdx            # Lean canvas
├── icp.mdx               # Ideal customer profile
├── messaging.mdx         # StoryBrand script
├── experiments.mdx       # Validation experiments
└── landing/              # Deployable landing page
    ├── index.html
    └── styles.css
```

## Deploy

```typescript
// Deploy everything
const deployed = await builder.deploy(startup, {
  domain: 'acme.hq.sb'  // Or your own domain
})

// {
//   landing: 'https://acme.hq.sb',
//   dashboard: 'https://startups.studio/acme'
// }
```

## MCP Server

```json
{
  "mcpServers": {
    "startup-builder": {
      "command": "npx",
      "args": ["startup-builder", "mcp"]
    }
  }
}
```

> "Build a startup around AI code review"
> "Create a lean canvas for my idea"
> "What should my MVP look like?"

## Includes

- [foundation-sprint](../foundation-sprint) - Foundation definition
- [lean-canvas](../lean-canvas) - Business model canvas
- [ideal-customer-profile](../ideal-customer-profile) - Customer targeting
- [jobs-to-be-done](../jobs-to-be-done) - Customer jobs
- [storybrand](../storybrand) - Messaging framework
- [startup-names](../startup-names) - Name generation
- [landing-page](../landing-page) - Page generation

## License

MIT
