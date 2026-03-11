---
name: sales-builder
version: 0.1.1
description: Autonomous demand gen, marketing, and sales
license: MIT
keywords:
  - sales
  - marketing
  - demand-gen
  - outreach
  - growth
downloads:
  monthly: 7
published: "2025-12-17T19:58:43.831Z"
updated: "2025-12-17T21:59:06.704Z"
---

# sales-builder

Autonomous demand gen, marketing, and sales.

## Quick Start

```bash
npx sales-builder
```

## Install

```bash
npm install sales-builder
```

## What It Does

Build your growth engine. AI-powered lead generation, nurturing, and conversion.

```bash
sales-builder "B2B SaaS for engineering teams"
```

```
✓ ICP                 Who to target
✓ Messaging           What to say
✓ Channels            Where to reach them
✓ Landing Pages       Where to convert them
✓ Outreach            How to engage them
✓ Sequences           How to nurture them
```

## CLI

```bash
# Full guided experience
sales-builder

# Start from business
sales-builder "your business description"

# Run specific modules
sales-builder icp           # Ideal customer profile
sales-builder messaging     # StoryBrand messaging
sales-builder channels      # Channel strategy
sales-builder landing       # Landing pages
sales-builder outreach      # Outreach templates
sales-builder sequences     # Email sequences

# Launch campaigns
sales-builder launch --channel linkedin
sales-builder launch --channel email
sales-builder launch --channel content
```

## SDK

```typescript
import { sales } from 'sales-builder'

// Build complete sales engine
const engine = await sales.create({
  business: 'AI code review for engineering teams',
  stage: 'early',  // early | growth | scale
  budget: 'low'    // low | medium | high
})

// Returns complete sales package
// {
//   icp: { firmographics, buyer, problems, goals },
//   messaging: { story, oneLiners, headlines },
//   channels: { ranked, strategies },
//   landing: { pages, variants },
//   outreach: { templates, personalization },
//   sequences: { welcome, nurture, sales }
// }

// Generate outreach
const outreach = await sales.outreach({
  icp: engine.icp,
  channel: 'linkedin',
  tone: 'professional'
})

// Generate sequences
const sequence = await sales.sequence({
  type: 'nurture',
  length: 5,
  goal: 'book-demo'
})
```

## The Growth Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. TARGETING (ICP)                                                 │
│     Know exactly who to go after                                    │
├─────────────────────────────────────────────────────────────────────┤
│  2. MESSAGING (StoryBrand)                                          │
│     Say the right thing                                             │
├─────────────────────────────────────────────────────────────────────┤
│  3. CHANNELS                                                        │
│     Reach them where they are                                       │
│     • LinkedIn  • Email  • Content  • Ads  • Community              │
├─────────────────────────────────────────────────────────────────────┤
│  4. LANDING PAGES                                                   │
│     Convert traffic to leads                                        │
├─────────────────────────────────────────────────────────────────────┤
│  5. OUTREACH                                                        │
│     Personalized first touch                                        │
├─────────────────────────────────────────────────────────────────────┤
│  6. SEQUENCES                                                       │
│     Automated nurturing                                             │
├─────────────────────────────────────────────────────────────────────┤
│  7. PIPELINE                                                        │
│     Track and close deals                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Channel Strategies

### LinkedIn

```typescript
const linkedin = await sales.channel('linkedin', {
  icp: engine.icp,
  budget: 'low'
})

// {
//   profile: { headline, about, banner },
//   content: { posts, articles, comments },
//   outreach: { connectionRequests, messages },
//   automation: { triggers, responses }
// }
```

### Email

```typescript
const email = await sales.channel('email', {
  icp: engine.icp,
  warmth: 'cold'  // cold | warm | hot
})

// {
//   templates: { initial, followUp, breakup },
//   sequences: { 5-touch, 7-touch },
//   personalization: { variables, research }
// }
```

### Content

```typescript
const content = await sales.channel('content', {
  icp: engine.icp,
  format: 'blog'  // blog | video | podcast
})

// {
//   topics: { pillar, cluster },
//   calendar: { weekly schedule },
//   seo: { keywords, optimization }
// }
```

## Outreach Templates

```typescript
// Generate personalized outreach
const template = await sales.outreach({
  channel: 'linkedin',
  type: 'connection-request',
  personalization: ['company', 'role', 'recent-post']
})

// Personalize for a lead
const message = sales.personalize(template, {
  name: 'Sarah',
  company: 'Acme Inc',
  role: 'VP Engineering',
  recentPost: 'Scaling engineering teams'
})
```

## Email Sequences

```typescript
// Welcome sequence
const welcome = await sales.sequence({
  type: 'welcome',
  length: 5,
  goal: 'activation'
})

// Nurture sequence
const nurture = await sales.sequence({
  type: 'nurture',
  length: 10,
  goal: 'book-demo'
})

// Sales sequence
const sales = await sales.sequence({
  type: 'sales',
  length: 7,
  goal: 'close-deal'
})
```

## MCP Server

```json
{
  "mcpServers": {
    "sales-builder": {
      "command": "npx",
      "args": ["sales-builder", "mcp"]
    }
  }
}
```

> "Build a sales engine for my SaaS"
> "Write LinkedIn outreach for engineering managers"
> "Create an email sequence to book demos"

## Includes

- [ideal-customer-profile](../ideal-customer-profile) - Targeting
- [storybrand](../storybrand) - Messaging
- [jobs-to-be-done](../jobs-to-be-done) - Buyer motivation
- [landing-page](../landing-page) - Conversion

## License

MIT
