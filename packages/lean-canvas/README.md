---
name: lean-canvas
version: 0.1.6
description: One-page business model. Nine boxes. Total clarity.
license: MIT
keywords:
  - lean-canvas
  - business-model
  - startup
  - planning
  - ai
downloads:
  monthly: 9
published: "2025-12-17T20:54:14.120Z"
updated: "2025-12-17T20:54:14.388Z"
---

# lean-canvas

One-page business model. Nine boxes. Total clarity.

## Quick Start

```bash
npx lean-canvas
```

## Install

```bash
npm install lean-canvas
```

## CLI

```bash
# Interactive wizard
lean-canvas

# Start from an idea
lean-canvas "AI-powered code review for teams"

# Export formats
lean-canvas export --format md    # Markdown
lean-canvas export --format json  # JSON
lean-canvas export --format pdf   # PDF

# Load existing canvas
lean-canvas load ./my-canvas.json
```

## SDK

```typescript
import { canvas } from 'lean-canvas'

// Create from scratch
const myCanvas = canvas.create({
  problem: ['Code reviews take too long', 'Inconsistent feedback quality'],
  customerSegments: ['Engineering teams 10-50 people'],
  uniqueValueProposition: 'Ship faster with AI code review in seconds',
  solution: ['AI analyzes PRs instantly', 'Learns team patterns'],
  channels: ['Developer communities', 'GitHub marketplace'],
  revenueStreams: ['$29/seat/month'],
  costStructure: ['AI compute', 'Engineering team'],
  keyMetrics: ['Reviews/day', 'Time saved', 'NPS'],
  unfairAdvantage: 'Trained on 1M+ code reviews'
})

// Generate from idea
const generated = await canvas.generate('AI-powered code review for teams')

// Validate completeness
const issues = canvas.validate(myCanvas)
// [{ box: 'channels', issue: 'Too vague - specify 2-3 specific channels' }]

// Export
await canvas.export(myCanvas, 'pdf')
await canvas.export(myCanvas, 'md')
```

## The Nine Boxes

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│    PROBLEM      │    SOLUTION     │  UNIQUE VALUE   │ UNFAIR ADVANTAGE│
│                 │                 │   PROPOSITION   │                 │
│ Top 3 problems  │ Top 3 features  │ Single, clear   │ Can't be copied │
│                 │                 │ message         │ or bought       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│  KEY METRICS    │                 │                 │CUSTOMER SEGMENTS│
│                 │                 │                 │                 │
│ Key activities  │    CHANNELS     │                 │ Target customers│
│ you measure     │                 │                 │                 │
│                 │ Path to         │                 │                 │
│                 │ customers       │                 │                 │
├─────────────────┴─────────────────┼─────────────────┴─────────────────┤
│       COST STRUCTURE              │        REVENUE STREAMS            │
│                                   │                                   │
│ Customer acquisition costs        │ Revenue model                     │
│ Distribution costs                │ Lifetime value                    │
│ Hosting, people, etc.             │ Pricing                           │
└───────────────────────────────────┴───────────────────────────────────┘
```

## AI Generation

```typescript
// Generate complete canvas from idea
const canvas = await canvas.generate('marketplace for freelance designers')

// Generate specific boxes
const problems = await canvas.generateBox('problem', {
  idea: 'marketplace for freelance designers',
  customerSegment: 'startups needing design work'
})

// Get AI feedback on your canvas
const feedback = await canvas.review(myCanvas)
// { strengths: [...], weaknesses: [...], suggestions: [...] }
```

## MCP Server

```json
{
  "mcpServers": {
    "lean-canvas": {
      "command": "npx",
      "args": ["lean-canvas", "mcp"]
    }
  }
}
```

> "Create a lean canvas for a pet sitting marketplace"
> "What's missing from my lean canvas?"
> "Suggest better revenue streams for this canvas"

## Integration

```typescript
import { canvas } from 'lean-canvas'
import { db } from 'db.sb'

// Save to database
const saved = await db.collections.canvases.create({
  data: canvas.toJSON(myCanvas)
})

// Load from database
const loaded = canvas.fromJSON(saved.data)
```

## License

MIT
