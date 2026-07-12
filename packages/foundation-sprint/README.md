---
name: foundation-sprint
version: 0.1.6
description: Build your startup foundation in one day
license: MIT
keywords:
  - startup
  - sprint
  - foundation
  - validation
  - mvp
downloads:
  monthly: 16
published: "2025-12-17T20:54:16.922Z"
updated: "2025-12-17T20:54:17.157Z"
---

# foundation-sprint

Build your startup foundation in one day.

## Quick Start

```bash
npx foundation-sprint
```

## Install

```bash
npm install foundation-sprint
```

## CLI

```bash
# Run the full sprint
foundation-sprint

# Start from an idea
foundation-sprint "AI code review for teams"

# Run specific phases
foundation-sprint problem      # Problem definition
foundation-sprint customer     # Customer discovery
foundation-sprint solution     # Solution design
foundation-sprint validate     # Validation plan

# Export deliverables
foundation-sprint export --format md
```

## SDK

```typescript
import { sprint } from 'foundation-sprint'

// Run complete sprint
const foundation = await sprint.run({
  idea: 'AI code review for teams',
  founder: {
    capabilities: ['ML expertise', '10 years in DevTools'],
    insight: 'Code review is the #1 bottleneck in shipping',
    motivation: 'Hated waiting for reviews as an engineer'
  }
})

// Returns complete foundation
// {
//   problem, customer, solution, mvp,
//   experiments, metrics, risks, nextSteps
// }

// Run individual phases
const problem = await sprint.problem('slow code reviews')
const customer = await sprint.customer(problem)
const solution = await sprint.solution(problem, customer)
const mvp = await sprint.mvp(solution)
```

## The Sprint

```
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: PROBLEM (1 hour)                                          │
│  ─────────────────────────────────────────────────────────────────  │
│  • What problem are you solving?                                    │
│  • Who has this problem?                                            │
│  • How painful is it? (frequency × severity)                        │
│  • How do they solve it today?                                      │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 2: CUSTOMER (1 hour)                                         │
│  ─────────────────────────────────────────────────────────────────  │
│  • Who is your ideal customer?                                      │
│  • What's their job to be done?                                     │
│  • What triggers them to seek a solution?                           │
│  • Where do they hang out?                                          │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 3: SOLUTION (1 hour)                                         │
│  ─────────────────────────────────────────────────────────────────  │
│  • What's your unique approach?                                     │
│  • Why will this work?                                              │
│  • What's the unfair advantage?                                     │
│  • What are the risks?                                              │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 4: MVP (1 hour)                                              │
│  ─────────────────────────────────────────────────────────────────  │
│  • What's the smallest thing you can build?                         │
│  • What hypothesis does it test?                                    │
│  • What does success look like?                                     │
│  • What will you learn?                                             │
├─────────────────────────────────────────────────────────────────────┤
│  PHASE 5: VALIDATE (1 hour)                                         │
│  ─────────────────────────────────────────────────────────────────  │
│  • What experiments will you run?                                   │
│  • What metrics matter?                                             │
│  • What would make you pivot?                                       │
│  • What are your next 3 steps?                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Output

The sprint produces a complete foundation document:

```typescript
interface Foundation {
  problem: {
    statement: string
    severity: number
    frequency: number
    currentSolutions: string[]
  }
  customer: {
    profile: ICP
    jobsToBeDone: string[]
    triggers: string[]
    channels: string[]
  }
  solution: {
    approach: string
    uniqueValue: string
    unfairAdvantage: string
    risks: string[]
  }
  mvp: {
    description: string
    hypothesis: string
    successCriteria: string[]
    timeline: string
  }
  validation: {
    experiments: Experiment[]
    metrics: Metric[]
    pivotTriggers: string[]
    nextSteps: string[]
  }
}
```

## MCP Server

```json
{
  "mcpServers": {
    "foundation-sprint": {
      "command": "npx",
      "args": ["foundation-sprint", "mcp"]
    }
  }
}
```

> "Run a foundation sprint for my startup idea"
> "Help me define the problem I'm solving"
> "What experiments should I run to validate this?"

## Integration

```typescript
import { sprint } from 'foundation-sprint'
import { canvas } from 'lean-canvas'
import { story } from 'storybrand'

// Sprint outputs feed other tools
const foundation = await sprint.run({ idea: 'AI code review' })

// Generate lean canvas from foundation
const leanCanvas = canvas.fromFoundation(foundation)

// Generate brand story from foundation
const brandStory = story.fromFoundation(foundation)
```

## License

MIT
