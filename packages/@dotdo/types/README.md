---
name: "@dotdo/types"
version: 0.2.0
description: "Shared types for the @dotdo ecosystem and *.do packages"
license: MIT
repository: "https://github.com/dotdo/types"
homepage: "https://github.com/dotdo/types#readme"
keywords:
  - types
  - typescript
  - dotdo
  - json-ld
  - semantic
  - rpc
  - workflow
  - api
  - agents
  - ai
  - business-as-code
downloads:
  monthly: 729
published: "2026-01-26T14:39:58.679Z"
updated: "2026-01-26T18:51:59.703Z"
---

# @dotdo/types

[![Doctest Coverage](https://img.shields.io/badge/doctest-0%25-red?style=flat)](./tests/e2e/progress.json)

The universal shared type system for the `.do` ecosystem — enabling **Business-as-Code** and **Services-as-Software**.

## Vision

The `.do` platform enables every aspect of a business to be defined, configured, and operated as code. Traditional services that require humans (accounting, legal, sales, support, HR) are delivered as software through typed, composable, autonomous agents.

```
.org.ai  (think)    →  Ontologies & abstractions for the AI-native future
.as      (define)   →  Typed interface definitions & schemas
.do      (execute)  →  Infrastructure & platform for Business-as-Code
.studio  (create)   →  AI-operated startups studio built on .do
```

This package provides the TypeScript types, interfaces, and runtime constants that power the entire stack — from semantic primitives to autonomous startup creation.

## Install

```bash
pnpm add @dotdo/types
```

## Usage

```typescript
// Import core primitives
import type { Thing, Noun, Verb, Event, Action } from '@dotdo/types/things'

// Import platform primitives
import type { Fn, CodeFunction, GenerativeFunction } from '@dotdo/types/functions'
import type { Workflow } from '@dotdo/types/workflows'
import type { Database, Collection } from '@dotdo/types/database'

// Import high-level business abstractions
import type { Business } from '@dotdo/types/businesses'
import type { Startup } from '@dotdo/types/startups'
import type { SaaS, Tenant } from '@dotdo/types/saas'
import type { Service } from '@dotdo/types/services'
import type { Product } from '@dotdo/types/products'
import type { App } from '@dotdo/types/apps'
import type { API } from '@dotdo/types/apis'
import type { SDK } from '@dotdo/types/sdk'

// Import agent types
import type { Agent, AgentConfig } from '@dotdo/types/agents'
import type { Role } from '@dotdo/types/roles'
import type { Team } from '@dotdo/types/teams'

// Import runtime context
import type { DOContext } from '@dotdo/types/context'

// Runtime constants - discover domains, relationships, definitions
import { domains, relationships, definitions } from '@dotdo/types/domains'
```

## Architecture

The type system follows a layered hierarchy from ontological primitives up to autonomous business creation:

### Layer 0: Things (Ontological Foundation)

The semantic foundation everything builds on. Based on six universal primitives from `.org.ai`:

| Primitive | Purpose | Example |
|-----------|---------|---------|
| **Thing** | Universal base type | Any entity in the system |
| **Noun** | Entity/object definitions | Customer, Product, Invoice |
| **Verb** | Operation/action definitions | Create, Process, Deploy |
| **Event** | Immutable occurrence records | OrderPlaced, PaymentReceived |
| **Action** | Discrete executable operations | SendEmail, ChargeCard |
| **Domain** | Namespace/context boundaries | Finance, Engineering, Sales |

Plus: Properties, Relationships, Cascade operators (`->`, `~>`, `<-`, `<~`), Identity (`$id`), Semantics (`$type`, `$context`, JSON-LD/MDXLD).

### Layer 1: Platform Primitives

The `.do` infrastructure that makes everything executable:

| Module | Domain | Purpose |
|--------|--------|---------|
| `functions/` | functions.do | Computation (Code, Generative, Agentic, Human) |
| `workflows/` | workflows.do | Orchestration, scheduling, state machines |
| `database/` | database.do | Persistence (Relational, Document, Graph, Analytics) |
| `events/` | events.do | Reactivity, triggers, webhooks |
| `rpc/` | rpc.do | Communication, transports, proxying |
| `auth/` | oauth.do | Identity, OAuth, keys, RBAC, FGA |
| `workers/` | workers.do | Runtime (Durable Objects, colo, sandboxing) |
| `context/` | context.do | The unified `$` runtime object |

### Layer 2: AI (Intelligence Services)

| Module | Domain | Purpose |
|--------|--------|---------|
| `ai/` | llm.do | LLM completion & streaming |
| | embeddings.do | Vector embeddings |
| | vectors.do | Similarity search |
| | models.do | Model registry |
| | evals.do | Evaluation & benchmarks |

### Layer 3: Agents (Autonomous Actors)

| Module | Domain | Purpose |
|--------|--------|---------|
| `agents/` | agents.do | Agent definitions, tools, memory |
| `roles/` | roles.do | Executive (CTO, CMO), IC (SWE, BDR) |
| `teams/` | teams.do | Agent composition (devs.do, engineers.do) |

### Layer 4: Services & Products (What Gets Built)

| Module | Domain | Purpose |
|--------|--------|---------|
| `apis/` | apis.do | API definitions, REST, MCP, discovery |
| `sdk/` | sdk.do, cli.do | SDK generation, CLI commands |
| `apps/` | apps.as | Applications, dashboards |
| `services/` | services.do | Services-as-Software |
| `products/` | products.do | Product definitions, roadmaps |
| `sites/` | sites.do | Web presence, blogs, directories |

### Layer 5: Business (High-Level Abstractions)

| Module | Domain | Purpose |
|--------|--------|---------|
| `businesses/` | businesses.do | Business entities, accounting, financials |
| `startups/` | startups.do | Startup formation, fundraising, validation |
| `saas/` | saas.as | Multi-tenancy, plans, usage metering |
| `payments/` | payments.do | Charges, accounts, cards, treasury |
| `communications/` | calls.do, texts.do, emails.do | Voice, SMS, email, messaging |

### Layer 6: Content (Media & Publishing)

| Module | Domain | Purpose |
|--------|--------|---------|
| `content/` | mdx.do, blogs.do | MDX/MDXLD, media, publishing, generation |

### Layer 7: Integrations (External Connections)

| Module | Domain | Purpose |
|--------|--------|---------|
| `integrations/` | *.do | Database, platform, payment, messaging integrations |

### Layer 8: Builder (Meta-Creation)

| Module | Domain | Purpose |
|--------|--------|---------|
| `builder/` | startups.studio | Factory for creating new businesses/products/services |

### Domain Registry

| Module | Purpose |
|--------|---------|
| `domains/` | Runtime constants: domain registry, relationships, .as definitions |

## Domain Taxonomy

The `.do` ecosystem contains 300+ domains organized by category:

- **Agents** (~85) — Named AI workers (priya.do, tom.do, sally.do, mark.do...)
- **Roles** (~15) — Job functions (cto.do, cmo.do, swe.do, devs.do...)
- **Primitives** (~50) — Core platform (functions.do, workflows.do, database.do, events.do...)
- **Business** (~25) — Business-as-Code (payments.do, accounting.do, startups.do...)
- **AI** (~15) — Intelligence services (llm.do, embeddings.do, vectors.do, evals.do...)
- **Content** (~20) — Media & publishing (blogs.do, images.do, videos.do, mdx.do...)
- **Infrastructure** (~20) — Platform infra (browsers.do, tunnels.do, deployments.do...)
- **Integrations** (~30) — External (postgres.do, stripe.do, cloudflare.do, slack.do...)
- **Utilities** (~10) — Kits & tools (startupkit.do, agentkit.do, chatkit.do...)
- **Definitions/.as** (~36) — Interface schemas (agent.as, functions.as, workflows.as...)

## Interface (.as) vs Implementation (.do)

```typescript
// .as defines WHAT something must be (interface)
import type { Agent } from '@dotdo/types/agents'  // agent.as

// .do defines HOW it works (implementation types)
import type { AgentRuntime } from '@dotdo/types/agents'     // agents.do
```

## The $ Context Object

Every `.do` service has access to a typed runtime context:

```typescript
interface DOContext {
  ai: AIContext           // $.ai.generate(), $.ai.embed()
  db: DBContext           // $.db.collection(), $.db.query()
  on: OnContext           // $.on.event(), $.on.schedule()
  every: EveryContext     // $.every.hour(), $.every.day()
  email: EmailContext     // $.email.send()
  slack: SlackContext     // $.slack.post()
  sms: SMSContext         // $.sms.send()
  call: CallContext       // $.call.start()
  pay: PayContext         // $.pay.charge(), $.pay.transfer()
}
```

## Function Tiers

Functions span from pure code to fully autonomous:

```typescript
// Tier 1: Pure computation
const add: CodeFunction<number, { a: number; b: number }> = ...

// Tier 2: AI-powered generation
const summarize: GenerativeFunction<string, { text: string }> = ...

// Tier 3: Multi-step agent reasoning
const research: AgenticFunction<Report, { topic: string }> = ...

// Tier 4: Human-in-the-loop
const approve: HumanFunction<boolean, { proposal: Proposal }> = ...
```

## Business-as-Code

Every business operation is typed and composable:

```typescript
import type { Business, Startup, SaaS } from '@dotdo/types'

// A startup is a typed business entity
const myStartup: Startup = {
  name: 'Acme',
  stage: 'seed',
  hypothesis: 'SMBs need automated invoicing',
  team: ['priya.do', 'tom.do', 'sally.do'],
  products: [invoiceApp],
  metrics: { mrr: 0, customers: 0 }
}
```

## Services-as-Software

Traditional services delivered through autonomous agents:

```typescript
// sally.do - Sales agent
const sally: Agent = {
  role: 'sales',
  capabilities: ['prospect', 'qualify', 'close'],
  tools: ['emails.do', 'calls.do', 'crm'],
  autonomy: 'SemiAutonomous'
}

// accounting.do - Accounting service
const accounting: Service = {
  type: 'financial',
  capabilities: ['JournalEntries', 'FinancialReports', 'Reconciliation'],
  requires: ['payments.do', 'llm.do']
}
```

## Builder / Studio

Agents can create new businesses, products, and services:

```typescript
import type { StartupFactory, Template } from '@dotdo/types/builder'

// An agent creating a new startup
const factory: StartupFactory = {
  template: 'saas',
  config: {
    name: 'InvoiceBot',
    product: { type: 'app', framework: 'next' },
    services: ['payments.do', 'emails.do'],
    agents: ['priya.do', 'tom.do', 'sally.do'],
    infrastructure: { database: 'postgres', hosting: 'cloudflare' }
  }
}
```

## Relationship Predicates

Types include relationship semantics for knowledge graphs:

| Category | Predicates |
|----------|-----------|
| Taxonomic | `isA`, `instanceOf`, `subtypeOf`, `typeOf` |
| Compositional | `partOf`, `memberOf`, `belongsTo`, `owns` |
| Dependency | `uses`, `requires`, `enables`, `dependsOn` |
| Structural | `extends`, `implements`, `inheritsFrom` |
| Integration | `wraps`, `integrates`, `connectsTo` |
| Semantic | `synonymOf`, `relatedTo`, `antonymOf` |
| Capability | `provides`, `exposes` |
| Branding | `brandedAs`, `aliasOf` |

## TypeScript Compatibility

This package supports TypeScript 5.0 and later. CI tests against multiple TypeScript versions:

| TypeScript Version | Status | Notes |
|-------------------|--------|-------|
| 5.0.x | Supported | Minimum supported version |
| 5.4.x | Supported | Stable LTS |
| 5.7.x | Supported | Latest features |

### Version-Specific Notes

- **TypeScript 5.0+**: Required for `verbatimModuleSyntax` and modern `moduleResolution: bundler`
- **TypeScript 5.4+**: Improved `NoInfer` utility type, better generic inference
- **TypeScript 5.7+**: Latest type system improvements

### Local Compatibility Testing

Run type checks against all supported versions:

```bash
pnpm test:ts-compat
```

This will install and test TypeScript 5.0, 5.4, and 5.7 in sequence.

## Documentation as Tests

This repository uses a doctest system that validates all `@example` blocks in JSDoc comments. Every documented example is automatically tested to ensure documentation stays accurate.

```bash
# Run all doctest examples
pnpm test:e2e

# Show coverage report
pnpm test:e2e --report
```

See [tests/e2e/README.md](./tests/e2e/README.md) for more details.

## Contributing

This package is the foundation of the entire `.do` ecosystem. Changes here affect every service, agent, and application in the platform.

## License

MIT
