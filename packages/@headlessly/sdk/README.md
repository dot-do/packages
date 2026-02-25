---
name: "@headlessly/sdk"
version: 0.0.1
description: Headless SaaS Platform for AI Agents
license: MIT
repository: "https://github.com/headlessly/headless.ly"
homepage: "https://headless.ly"
keywords:
  - headless
  - saas
  - ai
  - agents
  - rpc
downloads:
  monthly: 98
published: "2026-02-07T15:33:25.369Z"
updated: "2026-02-07T15:33:25.626Z"
---

# headless.ly

The operating system for agent-first startups.

Create an org. Get everything. CRM, project management, billing, analytics, content, support, marketing, experimentation — as a single unified system that AI agents can operate autonomously.

```typescript
import Headlessly from 'headless.ly'

const org = Headlessly({ tenant: 'my-startup' })

// Everything exists. One line.
await org.Contact.create({ name: 'Alice', email: 'alice@vc.com', stage: 'Lead' })
await org.Deal.create({ name: 'Seed Round', contact: 'contact_1', value: 500_000 })
await org.Issue.create({ title: 'Build MVP', project: 'project_1', status: 'InProgress' })
await org.Subscription.create({ price: 'price_pro', customer: 'customer_1' })
```

## Install

```bash
npm install headless.ly
```

## Why headless.ly?

**You're building a startup, not configuring software.**

Most business tools make you choose modules, design schemas, wire integrations, and learn 15 different APIs. headless.ly gives you one typed graph of everything — contacts, deals, tasks, content, tickets, billing, analytics, experiments — connected and ready for agents to operate from day zero.

- **One graph, not 15 SaaS tools** — every entity lives in the same system
- **Agent-first** — TypeScript SDK is the primary contract, not a bolted-on API
- **Immutable event log** — nothing is ever deleted, every state is reconstructable
- **Zero configuration** — create an org and everything works

## 32 Core Entities

Every entity exists because headless.ly needs it to run itself as an autonomous business. If headless.ly doesn't need it, it doesn't ship. Every entity carries `$type`, `$id`, `$context` (tenant namespace), `$version`, `$createdAt`, `$createdBy`, `$updatedAt`.

### Identity — Authentication & Tenancy (WorkOS-backed)

```typescript
// Users and orgs managed via WorkOS
await org.User.invite({ name: 'Alice', email: 'alice@acme.com', role: 'Member' })
await org.ApiKey.create({ name: 'CI/CD', scopes: ['read', 'write'] })
```

| Entity | Purpose |
|--------|---------|
| **User** | Authenticated humans — founders, team members |
| **Organization** | Tenants — each org gets all 32 entities |
| **ApiKey** | Programmatic access — SDK, CI/CD, agents |

### CRM — People & Relationships

```typescript
await org.Contact.create({ name: 'Alice', email: 'alice@vc.com', stage: 'Lead' })
await org.Contact.qualify('contact_1')
await org.Company.create({ name: 'Acme Corp', domain: 'acme.com' })
await org.Deal.create({ name: 'Enterprise', value: 50_000, stage: 'Proposal' })
```

| Entity | Purpose |
|--------|---------|
| **Contact** | People — developers, founders, VCs, partners |
| **Company** | Organizations — startups, enterprises, partners |
| **Deal** | Sales opportunities with value and pipeline stage |

### Projects — Work (GitHub + Beads superset)

```typescript
await org.Project.create({ name: 'v1 Launch', status: 'Active' })
await org.Issue.create({ title: 'Build auth flow', project: 'project_1', priority: 'High', type: 'Feature' })
await org.Issue.assign('issue_1', { assignee: 'user_1' })
```

| Entity | Purpose |
|--------|---------|
| **Project** | Container for organized work, maps to GitHub Projects |
| **Issue** | Unit of work with deps/hierarchy, syncs with GitHub Issues |
| **Comment** | Polymorphic discussion on Issues, Tickets, or Content |

### Content — Publishing (mdxui-typed)

```typescript
await org.Content.create({ title: 'Pricing', slug: 'pricing', type: 'Page', status: 'Published' })
await org.Content.create({ title: 'Why Agent-First', type: 'Post', status: 'Draft' })
await org.Content.publish('content_1')
await org.Asset.create({ name: 'hero.png', url: 'https://...', type: 'Image' })
```

| Entity | Purpose |
|--------|---------|
| **Content** | Typed MDX — Page, Post, Doc, LandingPage, LeanCanvas, StoryBrand, etc. |
| **Asset** | Media files — images, videos, documents |
| **Site** | mdxui site config — Marketing, Docs, Blog, Directory, etc. |

### Billing — Revenue (Stripe-backed)

```typescript
await org.Product.create({ name: 'headless.ly', type: 'Software' })
await org.Price.create({ name: 'Pro', product: 'product_1', amount: 49, interval: 'Monthly' })
await org.Customer.create({ contact: 'contact_1' })
await org.Subscription.create({ price: 'price_1', customer: 'customer_1' })
await org.Subscription.upgrade('sub_1', { price: 'price_enterprise' })
```

| Entity | Purpose |
|--------|---------|
| **Customer** | Stripe Customer — links Contact to billing identity |
| **Product** | What you sell |
| **Price** | Pricing config — Monthly, Annual, OneTime, Usage |
| **Subscription** | Active paying relationships |
| **Invoice** | Bills — monthly/annual |
| **Payment** | Money movement — charges, refunds, credits |

### Support — Help

```typescript
await org.Ticket.create({ subject: 'API returns 500', priority: 'High', contact: 'contact_1' })
await org.Ticket.assign('ticket_1', { assignee: 'user_1' })
await org.Message.create({ ticket: 'ticket_1', body: 'Looking into this now.', channel: 'Web', direction: 'Outbound' })
await org.Ticket.resolve('ticket_1')
```

| Entity | Purpose |
|--------|---------|
| **Ticket** | Support requests — bugs, questions, feature requests |

### Analytics — Insights

```typescript
// Events captured via browser SDK → forwarded to GA/Sentry/PostHog + stored in lakehouse
await org.Event.track({ name: 'signup', userId: 'user_1', properties: { plan: 'free' } })

// Financial metrics derived from real Stripe data (headless baremetrics)
const mrr = await org.Metric.get('mrr')         // Real MRR from Stripe
const churn = await org.Metric.get('churn_rate') // Real churn rate

// Funnels track the full revenue pipeline
await org.Funnel.analyze('visitor-to-paid')  // visitor → signup → activated → paid
await org.Goal.check('goal_mrr_100k')
```

| Entity | Purpose |
|--------|---------|
| **Event** | Every tracked action — pageviews, API calls, sign-ups (forwarded to GA/PostHog + stored) |
| **Metric** | Real values — MRR, churn, NRR, LTV from Stripe; DAU, NPS from events |
| **Funnel** | Conversion flows — visitor → signup → activate → pay |
| **Goal** | Business objectives — revenue targets, user targets |

### Marketing — Growth

```typescript
await org.Campaign.create({ name: 'Product Hunt Launch', type: 'Event', status: 'Active' })
await org.Segment.create({ name: 'Power Users', definition: { events: { $gte: 100 } } })
await org.Form.create({ name: 'Waitlist', fields: ['name', 'email', 'company'] })
```

| Entity | Purpose |
|--------|---------|
| **Campaign** | Marketing initiatives — launches, drips, content pushes |
| **Segment** | Audience groups — by ICP, usage, stage |
| **Form** | Data collection — sign-up, waitlist, contact us |

### Experimentation — Testing

```typescript
await org.Experiment.create({ name: 'Pricing Test', type: 'ABTest', variants: ['$29', '$49'] })
await org.FeatureFlag.create({ key: 'new-onboarding', rollout: 25 })
await org.FeatureFlag.rollout('new-onboarding', { percentage: 100 })
```

| Entity | Purpose |
|--------|---------|
| **Experiment** | A/B tests on pricing, onboarding, features |
| **FeatureFlag** | Progressive rollouts, beta access |

### Communication

```typescript
// Cross-channel messaging — email, SMS, Slack, Discord, Teams, web, in-app
await org.Message.create({ body: 'Welcome!', channel: 'Email', direction: 'Outbound', to: 'contact_1' })
await org.Message.create({ body: 'Following up', channel: 'Slack', direction: 'Outbound', deal: 'deal_1' })
```

| Entity | Purpose |
|--------|---------|
| **Message** | Cross-channel comms — Email, SMS, Slack, Discord, Teams, Web, InApp, API |

### Platform — Infrastructure

```typescript
// Automation: when a deal closes, create a subscription
org.Deal.closed(deal => {
  org.Subscription.create({ price: 'price_pro', customer: deal.contact })
  org.Contact.update(deal.contact, { stage: 'Customer' })
})

// AI agent with full autonomous interface
await org.Agent.create({ name: 'Support Bot', mode: 'Autonomous', role: 'Support', model: 'claude-sonnet' })
```

| Entity | Purpose |
|--------|---------|
| **Workflow** | Automation rules — deal.closed → subscription.created |
| **Integration** | External connections — Stripe, GitHub, Slack, WorkOS |
| **Agent** | AI agents with do/ask/decide/approve/notify/delegate/escalate/learn |

## Digital Objects

Entities are defined using the `Noun()` function from `digital-objects` — zero dependencies, zero codegen, full TypeScript inference:

```typescript
import { Noun } from 'digital-objects'

export const Contact = Noun('Contact', {
  name: 'string!',
  email: 'string?#',
  phone: 'string?',
  title: 'string?',
  stage: 'Lead | Qualified | Customer | Churned | Partner',
  source: 'string?',
  company: '-> Company.contacts',
  deals: '<- Deal.contact[]',
  messages: '<- Message.contact[]',

  // Custom verbs (CRUD is automatic)
  qualify:  'Qualified',
  capture:  'Captured',
  assign:   'Assigned',
  merge:    'Merged',
  enrich:   'Enriched',
})
```

Every property value tells the parser what it is:

| Value Pattern | Meaning | Example |
|--------------|---------|---------|
| Type string | Data property | `'string!'`, `'number?'`, `'datetime!'` |
| Arrow syntax | Relationship | `'-> Company.contacts'`, `'<- Deal.contact[]'` |
| Pipe-separated PascalCase | Enum | `'Lead \| Qualified \| Customer'` |
| Single PascalCase word | Verb → Event | `'Qualified'`, `'Captured'` |
| `null` | Opt out of inherited verb | `update: null` (makes entity immutable) |

## Verbs & Event Handlers

Every verb has a full conjugation that maps to the execution lifecycle:

```
qualify
  ├── qualify()      → execute the action
  ├── qualifying()   → BEFORE hook (validate, transform, reject)
  ├── qualified()    → AFTER hook (react, trigger side effects)
  └── qualifiedBy    → who performed this action
```

Register handlers directly on the entity:

```typescript
// BEFORE hook — validate or reject
org.Contact.qualifying(contact => {
  if (!contact.email) throw new Error('Cannot qualify without email')
  return contact
})

// AFTER hook — react to what happened
org.Contact.qualified(contact => {
  org.Activity.create({
    type: 'Task',
    subject: `Follow up with ${contact.name}`,
    contact: contact.$id,
  })
})

// Execute
await org.Contact.qualify('contact_123')
// → runs .qualifying() → sets stage → persists event → runs .qualified()
```

## Promise Pipelining

The SDK uses `rpc.do` with capnweb promise pipelining — chain dependent calls without awaiting, and the system batches them into a single round trip:

```typescript
// One round trip, not three
const deals = await org.Contact
  .find({ stage: 'Qualified' })
  .map(contact => contact.deals)
  .filter(deal => deal.status === 'Open')
```

## Time Travel

Every mutation is an event appended to an immutable log. Any point in time can be reconstructed:

```typescript
const contacts = await org.Contact.find(
  { stage: 'Lead' },
  { asOf: '2026-01-15T10:00:00Z' }
)

await org.Contact.rollback('contact_123', { asOf: '2026-02-06T15:00:00Z' })
```

This gives founders confidence to let agents operate freely — anything can be undone.

## Foundational Integrations

Stripe and GitHub aren't "integrations to add later" — they're truth sources from day 1:

```typescript
// Day 0: connect Stripe and GitHub
await org.Integration.connect('stripe', { apiKey: process.env.STRIPE_KEY })
await org.Integration.connect('github', { token: process.env.GITHUB_TOKEN })

// Billing entities are now Stripe-backed
// Creating a Subscription creates a Stripe subscription
await org.Subscription.create({ plan: 'pro', contact: 'contact_1' })

// Project entities sync with GitHub
// Creating an Issue creates a GitHub issue
await org.Issue.create({ title: 'Build auth', project: 'project_1' })
```

### Real Financial Metrics (Headless Baremetrics)

Financial metrics are derived from real Stripe data — not self-reported, not placeholders:

```typescript
const mrr = await org.Metric.get('mrr')           // Real MRR from Stripe subscriptions
const churn = await org.Metric.get('churn_rate')   // Real churn from Stripe events
const nrr = await org.Metric.get('nrr')            // Net revenue retention
const ltv = await org.Metric.get('ltv')            // Lifetime value
const arpu = await org.Metric.get('arpu')          // Average revenue per user
```

### Event Forwarding & Data Lakehouse

The browser SDK captures all events and forwards to your existing tools while building your own data lake:

```html
<!-- One script tag — events flow everywhere -->
<script src="https://js.headless.ly/v1" data-tenant="my-startup" />
```

```
Browser → headless.ly → Google Analytics (web analytics)
                       → Sentry (error tracking)
                       → PostHog (product analytics)
                       → Iceberg R2 Lakehouse (your data, forever)
```

Day 1: external tools handle analytics. Over time, your lakehouse enables more. The revenue pipeline — visitor → signup → paid → $$ — is tracked end-to-end.

### Dashboards — Your Entire Business at a Glance

headless.ly is headless — no built-in UI dashboards. But because everything is one system, a single dashboard connection shows your *entire business*. Most founders wire up 5-10 SaaS tools to get one view. With headless.ly, one connection covers it all.

```typescript
// One API, every metric
const metrics = await org.Metric.dashboard()
// {
//   revenue:    { mrr: 12_500, arr: 150_000, churn: 2.1, nrr: 108 },
//   pipeline:   { leads: 47, qualified: 12, deals_open: 8, deal_value: 340_000 },
//   product:    { tasks_open: 23, milestones_due: 2 },
//   support:    { tickets_open: 5, avg_response: '2h', csat: 94 },
//   marketing:  { campaigns_active: 3, signups_7d: 89 },
//   engagement: { dau: 230, mau: 1_200, events_24h: 15_400 },
// }
```

Plug into any visualization tool: **Numerics** (iOS/Mac widgets), **Grafana** (time-series), **Retool** (internal tools), **Google Sheets** (live connection), or any BI tool via OpenAPI.

### All Integrations

| Connect... | ...and this lights up | When |
|------------|----------------------|------|
| **Stripe** | Products, subscriptions, invoices, MRR, churn → Billing + Metrics | **Day 1** |
| **GitHub** | Repos, issues, PRs, milestones → Projects | **Day 1** |
| **Numerics / Dashboards** | Real-time KPIs → entire business at a glance | **Day 1** |
| **Google Analytics** | Pageviews, sessions → Events (forwarded + stored) | Day 1 (proxy) |
| **Sentry** | Errors → Events (forwarded + stored) | Day 1 (proxy) |
| **PostHog** | Product events → Events (forwarded + stored) | Day 1 (proxy) |
| **Google Apps** | Email → Messages, Calendar → Events | Phase 2 |
| **Slack/Discord** | Messages → Messages, Channels → Segments | Phase 2 |

## ICP Templates

At org creation, select an ICP template that configures defaults without changing the schema:

```typescript
const org = Headlessly({
  tenant: 'my-startup',
  template: 'b2b-saas',
})
```

| Template | Pipeline Stages | Key Metrics |
|----------|----------------|-------------|
| **B2B SaaS** | Lead → Demo → Trial → Closed → Active → Churned | MRR, CAC, LTV |
| **B2C / Consumer** | Signup → Activated → Engaged → Monetized → Churned | DAU/MAU, ARPU |
| **B2D / Developer Tools** | Discovered → Integrated → Active → Scaled | Time-to-first-call, API usage |
| **B2A / Agent Services** | Connected → Configured → Autonomous → Scaled | Tool invocations, success rate |

Same 32 entities. Same schema. Different default labels and metric calculations. Segment includes ICP sentence pattern (`as/at/are/using/to`) for structured audience targeting.

## MCP: Search, Fetch, Do

Three primitives for AI agents — not hundreds of tools:

```typescript
search({ type: 'Contact', filter: { stage: 'Lead' } })
fetch({ type: 'Contact', id: 'abc123' })
do({ method: 'Contact.qualify', args: ['abc123'] })
```

## Multi-Tenancy

Each tenant gets their own Cloudflare Durable Object — complete data isolation:

```
POST   headless.ly/~my-startup/Contact          → create
GET    headless.ly/~my-startup/Contact?stage=Lead → find
GET    headless.ly/~my-startup/Contact/abc123    → get
```

## Journey Subdomains

Different stages of building a startup emphasize different capabilities. Journey subdomains provide contextual focus — all 32 entities are always available, but the subdomain surfaces what matters most:

| Subdomain | Stage | Focus |
|-----------|-------|-------|
| `build.headless.ly` | Day 0-30 | Projects, Issues, Content |
| `launch.headless.ly` | Day 30 | Campaigns, Content, Forms |
| `experiment.headless.ly` | Day 30-60 | Experiments, FeatureFlags, Funnels |
| `grow.headless.ly` | Day 30-90 | Contacts, Deals, Campaigns, Goals |
| `automate.headless.ly` | Day 60+ | Workflows, Agents, Integrations |
| `scale.headless.ly` | Day 90+ | Metrics, Subscriptions, Analytics |

## The Startup Journey

### Day 0 — "I have an idea" → build.headless.ly

```typescript
import Headlessly from 'headless.ly'
const org = Headlessly({ tenant: 'my-startup' })
// Everything exists. CRM, PM, Content, Billing, Analytics, Support — all ready.

// Connect Stripe and GitHub immediately — real data from day 1
await org.Integration.connect('stripe', { apiKey: process.env.STRIPE_KEY })
await org.Integration.connect('github', { token: process.env.GITHUB_TOKEN })
```

### Day 1-30 — "I'm building" → build.headless.ly

```typescript
await org.Contact.create({ name: 'Alice', email: 'alice@vc.com', stage: 'Lead' })
await org.Issue.create({ title: 'Build MVP', project: 'project_1', status: 'InProgress' })
await org.Content.create({ title: 'Introducing Our Product', type: 'Post' })

// Browser SDK captures everything → forwards to GA/Sentry/PostHog + lakehouse
// <script src="https://js.headless.ly/v1" data-tenant="my-startup" />
```

### Day 30-90 — "I have users" → grow.headless.ly

```typescript
// Stripe webhooks are already flowing → billing entities are real
// GitHub events are already syncing → project entities are real
// Financial metrics are computing from Stripe → MRR, churn, NRR are real numbers

org.Contact.qualified(contact => {
  org.Event.create({ name: 'demo_scheduled', source: 'crm', contact: contact.$id })
})

org.Deal.closed(deal => {
  org.Subscription.create({ price: 'price_pro', customer: deal.contact })
  org.Contact.update(deal.contact, { stage: 'Customer' })
})

const mrr = await org.Metric.get('mrr')  // Real number from Stripe
```

### Day 90+ — "I'm scaling" → scale.headless.ly

```typescript
// Full revenue pipeline: visitor → signup → activated → paid → $$ (MRR/NRR/Churn)
await org.Funnel.analyze('visitor-to-paid')

await org.Campaign.create({ name: 'Series A Outreach', type: 'Email' })
await org.Experiment.create({ name: 'Pricing v2', type: 'ABTest', variants: ['$29', '$49'] })
await org.Agent.create({ name: 'Support Bot', mode: 'Autonomous', role: 'Support' })
```

The same system scales from 1 founder to a seed-stage team. No migration. No new tools. The graph grows, agents get smarter, the lakehouse gets deeper, and the immutable event log means nothing is ever lost.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  headless.ly                     │
│     Tenant management, ICP templates, SDK       │
│       RPC client with capnweb pipelining        │
├─────────────────────────────────────────────────┤
│                  objects.do                      │
│          Managed Digital Object service          │
│    Verb conjugation, event subscriptions        │
├──────────────────┬──────────────────────────────┤
│  digital-objects  │       .do services           │
│  (zero-dep schemas)│  payments.do  (Stripe)      │
│                   │  oauth.do     (auth)         │
│  Noun() definitions│  events.do    (CDC)         │
│  32 core entities │  database.do  (ParqueDB)    │
│  Type inference    │  functions.do (execution)   │
├──────────────────┴──────────────────────────────┤
│                   @dotdo/do                      │
│     THE Durable Object for Digital Objects       │
│   StorageHandler · EventsStore · WebSocket      │
├─────────────────────────────────────────────────┤
│              @dotdo/db (ParqueDB)                │
│     Hybrid Relational-Document-Graph DB          │
│   Parquet · Iceberg · time travel · inference   │
├─────────────────────────────────────────────────┤
│          Cloudflare Infrastructure               │
│   Workers · Durable Objects · R2 · KV · AI      │
└─────────────────────────────────────────────────┘
```

## Package Ecosystem

| Package | What it adds |
|---------|-------------|
| `digital-objects` | Pure schemas, zero deps |
| `business-as-code` | + business definition primitives |
| `business.org.ai` | + ontology data (NAICS, O*NET, APQC) |
| `startups.org.ai` | + ICP templates, startup metrics |
| `headless.ly` | + tenant composition, RPC client, managed service |

## License

MIT
