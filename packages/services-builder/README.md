---
name: services-builder
version: 0.1.0
description: AI-delivered services as software
license: MIT
keywords:
  - service
  - ai
  - agent
  - automation
  - saas
downloads:
  monthly: 3
published: "2025-12-17T19:58:06.570Z"
updated: "2025-12-17T19:58:06.727Z"
---

# services-builder

AI-delivered Services-as-Software.

## Quick Start

```bash
npx services-builder
```

## Install

```bash
npm install services-builder
```

## What It Does

Turn any service into AI-powered software. Define the service, deploy the agent.

```bash
service-builder "Tax preparation for freelancers"
```

```
✓ Service Design      What the service delivers
✓ Jobs-to-be-Done     Why customers need it
✓ Agent Design        AI agent specification
✓ Workflow            Step-by-step process
✓ Pricing             Service pricing model
✓ Landing Page        Start selling
```

## CLI

```bash
# Full guided experience
service-builder

# Start from service idea
service-builder "your service idea"

# Run specific modules
service-builder design       # Service design
service-builder agent        # Agent specification
service-builder workflow     # Workflow definition
service-builder pricing      # Pricing model
service-builder landing      # Landing page

# Deploy agent
service-builder deploy
```

## SDK

```typescript
import { service } from 'service-builder'

// Design complete service
const myService = await service.create({
  name: 'TaxBot',
  description: 'Tax preparation for freelancers',
  deliverable: 'Complete tax return ready to file',
  timeline: '24 hours'
})

// Returns complete service package
// {
//   design: { name, description, deliverable, process },
//   jtbd: { mainJob, relatedJobs, outcomes },
//   agent: { persona, capabilities, tools, prompts },
//   workflow: { steps, inputs, outputs, handoffs },
//   pricing: { model, tiers, value },
//   landing: { url, sections }
// }

// Design the AI agent
const agent = await service.agent({
  service: 'Tax preparation',
  persona: 'Expert CPA with 20 years experience',
  capabilities: [
    'Gather income information',
    'Identify deductions',
    'Calculate taxes owed',
    'Generate tax forms'
  ],
  tools: ['document-reader', 'calculator', 'form-generator']
})

// Define workflow
const workflow = await service.workflow({
  service: 'Tax preparation',
  steps: [
    { name: 'intake', description: 'Gather documents and info' },
    { name: 'review', description: 'AI reviews for completeness' },
    { name: 'calculate', description: 'Calculate taxes and deductions' },
    { name: 'generate', description: 'Generate tax forms' },
    { name: 'deliver', description: 'Deliver with explanation' }
  ]
})
```

## The Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. SERVICE DESIGN                                                  │
│     What do you deliver? To whom? How?                              │
├─────────────────────────────────────────────────────────────────────┤
│  2. JOBS TO BE DONE                                                 │
│     Why do customers hire this service?                             │
├─────────────────────────────────────────────────────────────────────┤
│  3. AGENT DESIGN                                                    │
│     What AI agent delivers the service?                             │
│     • Persona and expertise                                         │
│     • Capabilities and limitations                                  │
│     • Tools and integrations                                        │
├─────────────────────────────────────────────────────────────────────┤
│  4. WORKFLOW                                                        │
│     Step-by-step service delivery process                           │
│     • Inputs at each step                                           │
│     • AI actions                                                    │
│     • Human handoffs (if needed)                                    │
├─────────────────────────────────────────────────────────────────────┤
│  5. PRICING                                                         │
│     How do you charge?                                              │
│     • Per-use, subscription, or outcome-based                       │
│     • Value-based pricing                                           │
├─────────────────────────────────────────────────────────────────────┤
│  6. DEPLOY                                                          │
│     Ship the service                                                │
│     • Landing page                                                  │
│     • Agent deployment                                              │
│     • Payment integration                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Service Types

### Task Services
One-time deliverables: tax returns, logo design, legal documents

```typescript
const service = await service.create({
  type: 'task',
  deliverable: 'Complete tax return',
  pricing: 'per-task'
})
```

### Ongoing Services
Continuous delivery: bookkeeping, content writing, customer support

```typescript
const service = await service.create({
  type: 'ongoing',
  deliverable: 'Monthly bookkeeping',
  pricing: 'subscription'
})
```

### Outcome Services
Pay for results: lead generation, sales meetings, placements

```typescript
const service = await service.create({
  type: 'outcome',
  deliverable: 'Qualified sales meeting',
  pricing: 'per-outcome'
})
```

## Agent Definition

```typescript
// Define your service agent
const agent = service.defineAgent({
  name: 'TaxBot',
  persona: `You are an expert CPA with 20 years of experience
    helping freelancers minimize their tax burden legally.`,

  capabilities: [
    'Review financial documents',
    'Identify applicable deductions',
    'Calculate estimated taxes',
    'Generate IRS forms',
    'Explain tax strategies'
  ],

  tools: [
    'document-reader',    // Read uploaded documents
    'calculator',         // Financial calculations
    'form-generator',     // Generate tax forms
    'knowledge-base'      // Tax law reference
  ],

  handoffs: [
    { trigger: 'complex-situation', to: 'human-cpa' },
    { trigger: 'audit-risk', to: 'human-cpa' }
  ]
})
```

## MCP Server

```json
{
  "mcpServers": {
    "service-builder": {
      "command": "npx",
      "args": ["service-builder", "mcp"]
    }
  }
}
```

> "Design an AI service for resume writing"
> "What should my service agent be able to do?"
> "Create a workflow for my legal document service"

## Includes

- [jobs-to-be-done](../jobs-to-be-done) - Service motivation
- [design-sprint](../design-sprint) - Service design
- [product-names](../product-names) - Service naming
- [landing-page](../landing-page) - Service marketing

## License

MIT
