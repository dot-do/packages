---
name: startups.studio
version: 0.1.4
description: Define your entire business as code - CLI for syncing MDX business definitions with db.sb
license: MIT
repository: "https://github.com/dotdo-io/db.sb"
homepage: "https://startups.studio"
keywords:
  - startups
  - mdx
  - business-as-code
  - payload
  - cli
downloads:
  monthly: 28
published: "2025-12-17T19:48:13.912Z"
updated: "2025-12-17T21:20:40.681Z"
---

# startups.studio

Define your entire business as code. Manage startups, products, data models, workflows, agents, and more—all in version-controlled MDX files that sync with your Startups.Studio dashboard.

## Installation

```bash
npm install startups.studio
```

## Quick Start

### 1. Initialize your portfolio

```bash
npx startups.studio init
```

This creates:
```
my-portfolio/
├── portfolio.mdx
└── startups/
    └── my-first-startup.mdx
```

### 2. Define your startup

```mdx
---
name: My SaaS
stage: idea
---

# My SaaS

An AI-powered tool that helps teams do X faster.

## Problem

Teams waste 10+ hours per week on manual Y tasks.

## Solution

Automate Y with AI that learns your patterns.

## Products

### Free
- price: 0
- features: ["Basic automation", "5 workflows/month"]

### Pro
- price: 29
- interval: monthly
- features: ["Unlimited automation", "Custom workflows", "API access"]
```

### 3. Connect to Startups.Studio

```bash
npx startups.studio connect
```

Your MDX files now sync bidirectionally with your dashboard at [startups.studio](https://startups.studio).

## Project Structure

```
my-portfolio/
├── portfolio.mdx                    # Your portfolio identity
│
├── startups/
│   ├── quick-idea.mdx               # Early stage: everything in one file
│   │
│   └── growing-saas/                # Growth stage: expanded structure
│       ├── startup.mdx              # Identity, stage, metrics
│       ├── business.mdx             # Business model, pricing
│       ├── product/
│       │   ├── app.mdx              # Application definition
│       │   ├── api.mdx              # API definition
│       │   └── nouns/               # Data models
│       │       ├── User.mdx
│       │       └── Workspace.mdx
│       ├── team/
│       │   ├── roles.mdx            # Team roles
│       │   └── agents.mdx           # AI agents
│       └── web/
│           ├── site.mdx             # Marketing site
│           └── docs.mdx             # Documentation
│
├── workflows/                       # Automation across startups
│   └── onboarding.mdx
│
└── integrations/                    # External connections
    ├── stripe.mdx
    └── slack.mdx
```

## What You Can Define

### Startups

The core entity. Everything else belongs to a startup.

```mdx
---
name: Acme Corp
stage: growth          # idea | validation | growth | scale
founded: 2024-01-15
founders:
  - name: Alice
    role: CEO
  - name: Bob
    role: CTO
metrics:
  mrr: 15000
  customers: 120
---
```

### Products & Pricing

```mdx
---
name: Pro Plan
type: subscription
price: 99
interval: monthly
features:
  - Unlimited users
  - API access
  - Priority support
limits:
  apiCalls: 100000
  storage: 100GB
---
```

### Data Models (Nouns)

Define your application's data schema:

```mdx
---
name: Workspace
---

## Fields

- `name: text!` - Workspace name
- `slug: text!` (unique) - URL identifier
- `plan: Plan!` - Current subscription
- `settings: json` - Configuration

## Relationships

- `members: Member[]` - Team members
- `projects: Project[]` - Projects in workspace
```

### AI Agents

```mdx
---
name: Support Agent
model: claude-sonnet
---

## Instructions

You are a helpful support agent for Acme Corp. Help users with:
- Account setup
- Billing questions
- Technical troubleshooting

## Tools

- `searchDocs` - Search documentation
- `createTicket` - Escalate to human
- `lookupAccount` - Get account details
```

### Workflows

```mdx
---
name: User Onboarding
trigger: user.created
---

## Steps

1. Send welcome email
2. Create default workspace
3. Schedule onboarding call (if Pro plan)
4. Add to email sequence
```

### Integrations

```mdx
---
name: Stripe
provider: stripe
---

## Configuration

- `webhookEvents: ["checkout.session.completed", "customer.subscription.updated"]`
- `syncProducts: true`
- `syncCustomers: true`

## Mappings

- `stripe.customer` → `customers`
- `stripe.subscription` → `subscriptions`
- `stripe.product` → `products`
```

## Evolution Pattern

Your structure grows with your startup:

### Idea Stage
Everything in one file:
```
startups/
└── my-idea.mdx          # Startup + problem + solution + pricing
```

### Growth Stage
Expanded structure:
```
startups/
└── my-saas/
    ├── startup.mdx
    ├── business.mdx
    ├── product/
    ├── team/
    └── web/
```

### Scale Stage
Own repositories:
```
startups/
└── my-saas/
    └── startup.mdx      # Links to external repos
```

```mdx
---
name: My SaaS
repos:
  - https://github.com/my-saas/web
  - https://github.com/my-saas/api
  - https://github.com/my-saas/mobile
---
```

## CLI Commands

```bash
# Initialize a new portfolio
npx startups.studio init

# Connect to your Startups.Studio account
npx startups.studio connect

# Sync local changes to dashboard
npx startups.studio push

# Pull latest from dashboard
npx startups.studio pull

# Check sync status
npx startups.studio status

# Validate MDX files
npx startups.studio validate

# Generate TypeScript types from nouns
npx startups.studio codegen
```

## GitHub Integration

Install the [Startups.Studio GitHub App](https://github.com/apps/startups-studio) for automatic sync:

1. Push changes to your repo
2. GitHub App receives webhook
3. Changes sync to your dashboard
4. Edit in dashboard? Changes commit back to repo

## API

```typescript
import { Portfolio, Startup, Noun } from 'startups.studio'

// Load portfolio from filesystem
const portfolio = await Portfolio.load('./my-portfolio')

// Access startups
for (const startup of portfolio.startups) {
  console.log(startup.name, startup.stage)
}

// Access a specific startup's nouns
const saas = portfolio.startups.find(s => s.slug === 'my-saas')
for (const noun of saas.nouns) {
  console.log(noun.name, noun.fields)
}

// Generate Payload collection from noun
import { toPayloadCollection } from 'startups.studio/payload'
const collection = toPayloadCollection(noun)
```

## With Payload CMS

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { loadCollections } from 'startups.studio/payload'

export default buildConfig({
  collections: [
    // Your static collections
    Users,

    // Dynamic collections from MDX nouns
    ...await loadCollections('./startups/my-saas/product/nouns'),
  ],
})
```

## Agent API

The Agent API provides expressive, template-literal-based access to AI advisors for startup development. Four specialized personas help you refine ideas, develop positioning, optimize sales, and make technical decisions.

### Personas

| Agent | Domain | Specialties |
|-------|--------|-------------|
| `priya` | Product | Note-and-Vote, MVP scoping, user stories, prioritization |
| `mark` | Marketing | Positioning, messaging, StoryBrand, channel strategy |
| `sally` | Sales | Pricing, objection handling, deal analysis, revenue models |
| `tom` | Tech | Architecture, build-vs-buy, risk assessment, "Magic Lens" |

### Template Literal Syntax

Ask any agent ad-hoc questions using tagged template literals:

```typescript
import { priya, mark, sally, tom } from 'startups.studio/agents'

// Ask product questions
const ideas = await priya`list ${10} ways to improve our onboarding flow`

// Get marketing advice
const copy = await mark`write a one-liner for ${concept}`

// Sales strategy
const pricing = await sally`how should we price ${product} for ${segment}?`

// Technical guidance
const stack = await tom`what stack should we use for ${requirements}?`
```

The response includes the content plus metadata:

```typescript
interface AgentResponse {
  content: string       // The agent's response
  agent: string         // Which persona responded
  model: string         // Model used (e.g., "claude-3-5-sonnet-20241022")
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}
```

### Named Methods

Each agent has specialized methods for common tasks:

#### Priya (Product)

```typescript
// Evaluate a concept with Note-and-Vote
const assessment = await priya.noteAndVote(concept)

// Define minimum viable scope
const mvp = await priya.mvpScope(idea)

// Write user stories with acceptance criteria
const stories = await priya.userStory(feature)

// Prioritize features with ICE scoring
const priorities = await priya.prioritize(features)
```

#### Mark (Marketing)

```typescript
// Develop competitive positioning
const positioning = await mark.positioning(competitor)

// Craft compelling one-liners
const taglines = await mark.oneLiner(concept)

// Apply StoryBrand framework
const story = await mark.storyBrand(startup)

// Identify marketing channels
const channels = await mark.channels(segment)
```

#### Sally (Sales)

```typescript
// Evaluate pricing strategy
const analysis = await sally.priceCheck(offer)

// Anticipate and handle objections
const objections = await sally.objections(pitch)

// Analyze sales opportunities
const deal = await sally.dealAnalysis(opportunity)

// Design revenue model
const model = await sally.revenueModel(business)
```

#### Tom (Tech)

```typescript
// Multi-lens technical analysis
const review = await tom.magicLens(solution)

// Design system architecture
const architecture = await tom.architecture(requirements)

// Build vs buy decision
const decision = await tom.buildVsBuy(feature)

// Technical risk assessment
const risks = await tom.riskAssessment(system)
```

### Custom AI Provider

By default, agents use the Startups.Studio AI gateway. You can provide your own:

```typescript
import { setAIProvider } from 'startups.studio/agents'

setAIProvider({
  async generate({ model, system, prompt, temperature, maxTokens, schema }) {
    // Your implementation
    const response = await yourAI.chat({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    })

    return {
      content: response.text,
      usage: {
        inputTokens: response.usage.input,
        outputTokens: response.usage.output,
      },
    }
  },
})
```

### Creating Custom Agents

Build your own agents with custom personas and methods:

```typescript
import { createAgent, createMethod } from 'startups.studio/agents'

const lawyer = createAgent({
  name: 'Leslie',
  slug: 'leslie',
  domain: 'Legal',
  systemPrompt: `You are a startup legal advisor...`,
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.5,
}, {
  contractReview: createMethod(config, (contract) =>
    `Review this contract for risks: ${contract}`
  ),
  termSheet: createMethod(config, (deal) =>
    `Draft term sheet for: ${JSON.stringify(deal)}`
  ),
})

// Use it
const review = await lawyer.contractReview(contractText)
const terms = await lawyer`what should I look for in a SAFE?`
```

## Environment Variables

```bash
# Required for sync
STARTUPS_STUDIO_API_KEY=sk_live_...

# Optional
STARTUPS_STUDIO_API_URL=https://api.startups.studio  # Default
```

## What Syncs Where

| Entity | Lives in Code | Lives in DB | Notes |
|--------|:-------------:|:-----------:|-------|
| Startups | Yes | Yes | Synced bidirectionally |
| Products | Yes | Yes | Synced bidirectionally |
| Nouns (schemas) | Yes | Yes | Synced bidirectionally |
| Agents | Yes | Yes | Synced bidirectionally |
| Workflows | Yes | Yes | Synced bidirectionally |
| Integrations | Yes | Yes | Synced bidirectionally |
| **Customers** | - | Yes | Runtime data only |
| **Payments** | - | Yes | Runtime data only |
| **Events** | - | Yes | Runtime data only |

## TypeScript Support

Full TypeScript support with generated types:

```typescript
import type { Startup, Product, Noun } from 'startups.studio'

// Types generated from your MDX nouns
import type { User, Workspace, Project } from './generated/types'
```

## Component System

Build entire Sites and Apps from composable MDX components that auto-wire to your Payload collections.

### Sites

Marketing websites, blogs, and documentation:

```tsx
// web/site.mdx
export { components } from 'startups.studio/site'

<Site name="My Startup" domain="mystartup.com">
  <Header logo="/logo.svg" nav={nav} cta={{ text: "Sign Up", href: "/signup" }} />

  <LandingPage>
    <Hero
      title="Build Faster"
      subtitle="Ship products in days, not months"
      cta={{ text: "Get Started", url: "/signup" }}
    />
    <Features features={features} />
    <Pricing plans={plans} />
    <Testimonials testimonials={testimonials} />
  </LandingPage>

  <Blog />        {/* Auto-queries posts collection */}
  <Docs />        {/* Auto-queries docs collection */}

  <Footer logo="/logo.svg" links={footerLinks} />
</Site>
```

### Apps

SaaS dashboards and admin panels:

```tsx
// product/app.mdx
export { components } from 'startups.studio/app'

<App name="My SaaS" auth={{ provider: 'workos' }}>
  <Shell>
    <Sidebar nav={appNav} />
    <Header user={user} />

    <Dashboard metrics={metrics} />
    <Settings />

    {/* Pre-built developer features */}
    <DeveloperDashboard project={project}>
      <APIKeys />       {/* Auto-queries apiKeys collection */}
      <Webhooks />      {/* Auto-queries webhooks collection */}
      <Usage />         {/* Auto-queries usageRecords collection */}
    </DeveloperDashboard>

    <Team />            {/* Auto-queries members collection */}
    <Billing />         {/* Auto-queries subscriptions collection */}
  </Shell>
</App>
```

### Component Contracts

Templates export a `components` object defining available building blocks:

```typescript
// SiteComponents - for marketing sites
export interface SiteComponents {
  Site: Component<SiteProps>          // Root wrapper
  Header: Component<HeaderProps>      // Navigation
  Footer: Component<FooterProps>      // Footer
  LandingPage: Component<PageProps>   // Homepage
  Blog?: Component<BlogProps>         // → posts collection
  Docs?: Component<DocsProps>         // → docs collection
  Hero?: Component<HeroProps>         // Hero section
  Features?: Component<FeaturesProps> // Features grid
  Pricing?: Component<PricingProps>   // Pricing table
}

// AppComponents - for SaaS dashboards
export interface AppComponents {
  App: Component<AppProps>                      // Root wrapper
  Shell: Component<ShellProps>                  // App layout
  Sidebar: Component<SidebarProps>              // Navigation
  Dashboard: Component<DashboardProps>          // Main view
  DeveloperDashboard?: Component<DevDashProps>  // API console
  APIKeys?: Component<APIKeysProps>             // → apiKeys collection
  Webhooks?: Component<WebhooksProps>           // → webhooks collection
  Usage?: Component<UsageProps>                 // → usageRecords collection
  ListView?: Component<ListViewProps>           // Payload override
}
```

### Auto-Wiring to Collections

Components automatically query Payload collections:

| Component | Collection | Query |
|-----------|------------|-------|
| `<Blog />` | `posts` | `{ where: { site } }` |
| `<Docs />` | `docs` | `{ where: { project } }` |
| `<APIKeys />` | `apiKeys` | `{ where: { project } }` |
| `<Webhooks />` | `webhooks` | `{ where: { project } }` |
| `<Usage />` | `usageRecords` | Aggregated by period |
| `<Team />` | `members` | `{ where: { workspace } }` |

Override with manual data:

```tsx
<Blog site={siteId} />           {/* Auto-fetch */}
<Blog posts={customPosts} />     {/* Manual override */}
```

### Extending Templates

```tsx
import { components as defaults } from 'startups.studio/site'

export const components: SiteComponents = {
  ...defaults,
  Header: MyCustomHeader,    // Override specific components
  Hero: MyCustomHero,
}
```

### Live Preview

Every component can be previewed in Payload admin:

1. Edit MDX in left panel
2. See live preview in right panel
3. Switch between story variations
4. Test responsive breakpoints (Mobile/Tablet/Desktop)

See [templates/COMPONENTS.md](../../templates/COMPONENTS.md) for full documentation.

## License

MIT
