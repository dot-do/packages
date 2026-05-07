---
name: jobs-to-be-done
version: 0.1.6
description: Understand why customers really buy
license: MIT
keywords:
  - jtbd
  - jobs-to-be-done
  - customer-research
  - product
  - innovation
downloads:
  monthly: 8
published: "2025-12-17T20:53:23.720Z"
updated: "2025-12-17T20:54:06.695Z"
---

# jobs-to-be-done

Understand why customers really buy.

## Quick Start

```bash
npx jobs-to-be-done
```

## Install

```bash
npm install jobs-to-be-done
```

## CLI

```bash
# Interactive discovery
jobs-to-be-done

# Discover jobs for a product
jobs-to-be-done discover "code review tool"

# Generate job stories
jobs-to-be-done stories "engineering team"

# Map job hierarchy
jobs-to-be-done map "ship software faster"

# Export
jobs-to-be-done export --format md
```

## SDK

```typescript
import { jtbd } from 'jobs-to-be-done'

// Discover jobs
const jobs = await jtbd.discover({
  product: 'AI code review tool',
  customer: 'engineering teams'
})

// Returns job hierarchy
// {
//   mainJob: 'Ship quality software faster',
//   relatedJobs: [...],
//   emotionalJobs: [...],
//   socialJobs: [...]
// }

// Create job stories
const stories = jtbd.stories({
  when: 'a PR is submitted',
  iWantTo: 'get feedback quickly',
  soICan: 'merge and move on to the next feature'
})

// Map forces of progress
const forces = jtbd.forces({
  pushAway: 'Slow reviews blocking releases',
  pullToward: 'Ship features daily',
  anxiety: 'AI might miss important issues',
  habit: 'Trust in human reviewers'
})
```

## The Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│  THE JOB                                                            │
│  ─────────────────────────────────────────────────────────────────  │
│  When [situation], I want to [motivation], so I can [outcome]       │
├─────────────────────────────────────────────────────────────────────┤
│  JOB HIERARCHY                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  Main Job: The core functional job                                  │
│  Related Jobs: Jobs that come before/after                          │
│  Emotional Jobs: How they want to feel                              │
│  Social Jobs: How they want to be perceived                         │
├─────────────────────────────────────────────────────────────────────┤
│  FORCES OF PROGRESS                                                 │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│     Push ────────────────►  ◄──────────────── Habit                 │
│   (pain of current)                    (comfort of current)         │
│                                                                     │
│     Pull ────────────────►  ◄──────────────── Anxiety               │
│   (appeal of new)                      (fear of new)                │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  OUTCOME EXPECTATIONS                                               │
│  ─────────────────────────────────────────────────────────────────  │
│  Desired outcomes: What success looks like                          │
│  Undesired outcomes: What they want to avoid                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Job Stories

```typescript
// Generate job stories
const story = jtbd.story({
  when: 'I submit a pull request',
  iWantTo: 'understand if my code is ready to merge',
  soICan: 'ship the feature and move on'
})

// Generate from customer interviews
const stories = await jtbd.storiesFromInterview(`
  "I hate waiting 2 days for code review.
  By the time I get feedback, I've context-switched
  to something else and have to reload everything."
`)
```

## Forces Analysis

```typescript
// Analyze switching forces
const forces = jtbd.analyzeForces({
  current: 'Manual code review',
  new: 'AI code review'
})

// {
//   push: ['Reviews take 2-3 days', 'Inconsistent feedback'],
//   pull: ['Instant feedback', 'Always available'],
//   anxiety: ['AI might miss security issues', 'Team resistance'],
//   habit: ['Trust human judgment', 'Current process works']
// }

// Calculate momentum
const momentum = jtbd.momentum(forces)
// { score: 72, recommendation: 'Strong potential - address anxiety' }
```

## MCP Server

```json
{
  "mcpServers": {
    "jtbd": {
      "command": "npx",
      "args": ["jobs-to-be-done", "mcp"]
    }
  }
}
```

> "What job does my product get hired for?"
> "Write job stories for my target customer"
> "Analyze the forces preventing customers from switching"

## Integration

```typescript
import { jtbd } from 'jobs-to-be-done'
import { icp } from 'ideal-customer-profile'

// Jobs inform ICP
const jobs = await jtbd.discover({ product: 'AI code review' })
const profile = await icp.fromJobs(jobs)

// Jobs inform feature prioritization
const features = ['instant review', 'GitHub integration', 'Slack alerts']
const ranked = jtbd.rankFeatures(features, jobs)
```

## License

MIT
