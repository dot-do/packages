---
name: ideal-customer-profile
version: 0.1.6
description: "Know exactly who you're selling to"
license: MIT
keywords:
  - icp
  - ideal-customer-profile
  - sales
  - marketing
  - buyer-persona
downloads:
  monthly: 17
published: "2025-12-17T20:53:18.686Z"
updated: "2025-12-17T20:54:01.645Z"
---

# ideal-customer-profile

Know exactly who you're selling to.

## Quick Start

```bash
npx ideal-customer-profile
```

## Install

```bash
npm install ideal-customer-profile
```

## CLI

```bash
# Interactive wizard
ideal-customer-profile

# Generate from product description
ideal-customer-profile "AI code review tool"

# Generate persona
ideal-customer-profile persona "engineering manager at Series A startup"

# Export
ideal-customer-profile export --format md
```

## SDK

```typescript
import { icp } from 'ideal-customer-profile'

// Define your ICP
const profile = icp.create({
  // Firmographics
  company: {
    size: '10-200 employees',
    stage: 'Series A to Series C',
    industry: ['SaaS', 'Fintech', 'Developer Tools'],
    revenue: '$1M-$50M ARR',
    techStack: ['GitHub', 'Slack', 'Modern CI/CD']
  },

  // Role
  buyer: {
    title: ['Engineering Manager', 'VP Engineering', 'CTO'],
    reports: '5-20 engineers',
    experience: '5+ years in engineering'
  },

  // Pain points
  problems: [
    'Code reviews blocking shipping',
    'Inconsistent review quality',
    'Senior engineers spending too much time reviewing'
  ],

  // Goals
  goals: [
    'Ship faster without sacrificing quality',
    'Scale the team without scaling bottlenecks',
    'Keep senior engineers focused on architecture'
  ],

  // Buying behavior
  buying: {
    budget: '$500-$5000/month',
    decisionProcess: 'Bottom-up with manager approval',
    evaluationCriteria: ['Easy GitHub integration', 'Accuracy', 'Speed']
  }
})

// Generate from product
const generated = await icp.generate('AI code review tool for teams')

// Create buyer persona
const persona = await icp.persona(profile)
// { name: 'Engineering Emma', day-in-life, challenges, goals, objections }

// Score a lead against ICP
const score = icp.score(profile, leadData)
// { score: 85, matches: [...], gaps: [...] }
```

## The Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│  FIRMOGRAPHICS - The Company                                        │
│  ─────────────────────────────────────────────────────────────────  │
│  Size: How many employees?                                          │
│  Stage: Seed? Series A? Enterprise?                                 │
│  Industry: What verticals?                                          │
│  Revenue: How much are they making?                                 │
│  Tech stack: What tools do they use?                                │
├─────────────────────────────────────────────────────────────────────┤
│  BUYER - The Person                                                 │
│  ─────────────────────────────────────────────────────────────────  │
│  Title: What's their role?                                          │
│  Reports: How big is their team?                                    │
│  Experience: What's their background?                               │
├─────────────────────────────────────────────────────────────────────┤
│  PROBLEMS - Why They Buy                                            │
│  ─────────────────────────────────────────────────────────────────  │
│  What keeps them up at night?                                       │
│  What are they trying to fix?                                       │
├─────────────────────────────────────────────────────────────────────┤
│  GOALS - What Success Looks Like                                    │
│  ─────────────────────────────────────────────────────────────────  │
│  What are they trying to achieve?                                   │
│  How do they measure success?                                       │
├─────────────────────────────────────────────────────────────────────┤
│  BUYING BEHAVIOR - How They Buy                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Budget: What can they spend?                                       │
│  Process: Who else is involved?                                     │
│  Criteria: What matters most?                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Lead Scoring

```typescript
// Score leads against your ICP
const leads = [
  { company: 'Acme Inc', size: 50, stage: 'Series A', ... },
  { company: 'BigCorp', size: 5000, stage: 'Public', ... }
]

const scored = leads.map(lead => ({
  ...lead,
  icpScore: icp.score(profile, lead)
}))

// Filter to best-fit leads
const bestFit = scored.filter(l => l.icpScore.score >= 70)
```

## MCP Server

```json
{
  "mcpServers": {
    "icp": {
      "command": "npx",
      "args": ["ideal-customer-profile", "mcp"]
    }
  }
}
```

> "Create an ICP for my developer tool"
> "Score this lead against my ICP"
> "Create a buyer persona for my product"

## License

MIT
