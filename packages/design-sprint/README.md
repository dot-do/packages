---
name: design-sprint
version: 0.1.6
description: Solve big problems in five days
license: MIT
keywords:
  - design-sprint
  - google-ventures
  - prototyping
  - user-testing
  - product
downloads:
  monthly: 15
published: "2025-12-17T20:53:21.154Z"
updated: "2025-12-17T20:54:04.173Z"
---

# design-sprint

Solve big problems in five days.

## Quick Start

```bash
npx design-sprint
```

## Install

```bash
npm install design-sprint
```

## CLI

```bash
# Run complete sprint
design-sprint

# Start from a challenge
design-sprint "How might we make code reviews 10x faster?"

# Run specific days
design-sprint map        # Monday: Map the problem
design-sprint sketch     # Tuesday: Sketch solutions
design-sprint decide     # Wednesday: Decide on best
design-sprint prototype  # Thursday: Build prototype
design-sprint test       # Friday: Test with users

# Export
design-sprint export --format md
```

## SDK

```typescript
import { sprint } from 'design-sprint'

// Run complete sprint
const results = await sprint.run({
  challenge: 'How might we make code reviews 10x faster?',
  team: ['product', 'engineering', 'design'],
  deadline: '5 days'
})

// Run individual days
const map = await sprint.monday('reduce code review time')
const sketches = await sprint.tuesday(map)
const decision = await sprint.wednesday(sketches)
const prototype = await sprint.thursday(decision)
const insights = await sprint.friday(prototype)
```

## The Five Days

```
┌─────────────────────────────────────────────────────────────────────┐
│  MONDAY: MAP                                                        │
│  ─────────────────────────────────────────────────────────────────  │
│  • Set the long-term goal                                           │
│  • List sprint questions                                            │
│  • Map the customer journey                                         │
│  • Pick a target moment                                             │
├─────────────────────────────────────────────────────────────────────┤
│  TUESDAY: SKETCH                                                    │
│  ─────────────────────────────────────────────────────────────────  │
│  • Lightning demos of existing solutions                            │
│  • Sketch solutions individually                                    │
│  • Crazy 8s rapid ideation                                          │
│  • Solution sketch with detail                                      │
├─────────────────────────────────────────────────────────────────────┤
│  WEDNESDAY: DECIDE                                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  • Art museum: review all sketches                                  │
│  • Heat map voting                                                  │
│  • Speed critique                                                   │
│  • Straw poll and supervote                                         │
├─────────────────────────────────────────────────────────────────────┤
│  THURSDAY: PROTOTYPE                                                │
│  ─────────────────────────────────────────────────────────────────  │
│  • Pick the right tools                                             │
│  • Divide and conquer                                               │
│  • Stitch it together                                               │
│  • Trial run                                                        │
├─────────────────────────────────────────────────────────────────────┤
│  FRIDAY: TEST                                                       │
│  ─────────────────────────────────────────────────────────────────  │
│  • Interview 5 users                                                │
│  • Watch together                                                   │
│  • Find patterns                                                    │
│  • Decide next steps                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## AI-Assisted Sprint

```typescript
// AI generates lightning demos
const demos = await sprint.lightningDemos('code review tools')

// AI generates solution sketches
const sketches = await sprint.generateSketches({
  challenge: 'faster code reviews',
  constraints: ['must integrate with GitHub', 'under $50/seat']
})

// AI helps with prototype copy
const copy = await sprint.prototypeCopy(decision)

// AI simulates user interviews
const simulatedFeedback = await sprint.simulateTest(prototype, {
  persona: 'engineering manager at Series A startup'
})
```

## Output

```typescript
interface SprintResults {
  challenge: string
  goal: string
  questions: string[]
  map: CustomerJourneyMap
  target: string
  sketches: Sketch[]
  decision: {
    winner: Sketch
    storyboard: Frame[]
  }
  prototype: {
    screens: Screen[]
    flow: string
  }
  insights: {
    patterns: string[]
    quotes: string[]
    recommendations: string[]
    nextSteps: string[]
  }
}
```

## MCP Server

```json
{
  "mcpServers": {
    "design-sprint": {
      "command": "npx",
      "args": ["design-sprint", "mcp"]
    }
  }
}
```

> "Start a design sprint for improving onboarding"
> "Generate solution sketches for my challenge"
> "What questions should we answer in this sprint?"

## License

MIT
