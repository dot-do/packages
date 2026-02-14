---
name: db.sb
version: 0.1.7
description: Database SDK with typed collections and admin UI for Startups.Studio
license: MIT
repository: "https://github.com/dotdo-io/db.sb"
homepage: "https://db.sb"
keywords:
  - database
  - payload
  - cms
  - admin
  - typescript
  - startups
  - sdk
downloads:
  monthly: 23
published: "2025-12-17T19:50:33.333Z"
updated: "2025-12-18T16:31:39.766Z"
---

# `db.sb` StartupBuilders Database

Database SDK with typed collections and admin UI for Startups.Studio.

## Installation

```bash
npm install db.sb
# or
pnpm add db.sb
```

## Quick Start

### Launch Admin UI

The fastest way to get started is with the CLI:

```bash
npx db.sb
```

This will:
1. Authenticate you via OAuth (opens browser if needed)
2. Start the admin server on http://localhost:4000
3. Open the admin UI in your browser

### Programmatic Usage

```typescript
import { DB } from 'db.sb'

// Create an authenticated client
const { db, payload, admin } = await DB()

// Query with full TypeScript types
const customers = await db.customers.find({
  where: { status: { equals: 'active' } },
  limit: 10
})

// Simple CRUD operations
const customer = await db.customers.get('cust_123')
await db.customers.set('cust_123', { name: 'Acme Corp' })
await db.customers.delete('cust_123')

// Upsert (alias for set)
await db.customers.upsert('cust_123', { name: 'Acme Corp' })
```

### Use Collections in Your Own Payload App

```typescript
import { buildConfig } from 'payload'
import { DB, collections } from 'db.sb'

const { payload } = await DB()

export default buildConfig({
  collections,
  db: await payload.adapter(),
  // ... your config
})
```

### Direct Database Export

For simple scripts where you're already authenticated:

```typescript
import { db } from 'db.sb'

// Requires prior authentication via oauth.do
const startups = await db.startups.find()
```

## API Reference

### DB(options?)

Creates an authenticated database client.

```typescript
interface DBOptions {
  url?: string  // RPC URL (default: https://db.sb/rpc or DB_SB_URL env)
}

interface DBResult {
  db: TypedDB                    // Typed database client
  payload: { adapter(): any }    // Payload adapter factory
  admin: AdminServer             // Admin server controls
}
```

### Collection Methods

Each collection provides these typed methods:

```typescript
interface CollectionNamespace<T> {
  // Shorthand methods
  get(id: string): Promise<T | null>
  set(id: string, data: Partial<T>): Promise<T>  // upsert
  delete(id: string): Promise<T>
  upsert(id: string, data: Partial<T>): Promise<T>

  // Full Payload methods
  find(options?: FindOptions): Promise<PaginatedDocs<T>>
  findByID(id: string | { id: string }): Promise<T>
  create(options: { data: Partial<T> }): Promise<T>
  update(options: { id: string; data: Partial<T> }): Promise<T>
  count(options?: CountOptions): Promise<number>
}
```

## Collections

db.sb includes 100+ typed collections organized into domains.

### Functions Collection

The Functions collection supports 4 types of executable functions:

| Type | Description | Use Case |
|------|-------------|----------|
| **Code** | Inline JS/TS/Python scripts | Custom business logic, data transformations |
| **Generative** | AI generation | Content creation, structured output, embeddings |
| **Agentic** | Tool-calling AI agents | Research, multi-step workflows |
| **Human** | Task queue for humans | Approvals, reviews, manual data entry |

#### Code Functions

Execute JavaScript, TypeScript, or Python code in a secure Cloudflare Sandbox.

```typescript
{
  name: 'processOrder',
  type: 'code',
  codeConfig: {
    language: 'typescript',
    script: `
      export default function(input) {
        return {
          total: input.items.reduce((sum, i) => sum + i.price, 0),
          tax: input.items.reduce((sum, i) => sum + i.price, 0) * 0.08
        }
      }
    `,
    entryPoint: 'default',
    timeout: 30000
  },
  inputSchema: { ... },
  outputSchema: { ... }
}
```

#### Generative Functions

AI-powered generation with multiple modes.

```typescript
{
  name: 'generateBlogPost',
  type: 'generative',
  generativeConfig: {
    mode: 'write',  // 'generate' | 'write' | 'list' | 'lists' | 'image' | 'speech' | 'embed'
    promptTemplate: 'Write a blog post about {{topic}} for {{audience}}',
    systemPrompt: 'You are an expert content writer...',
    provider: 'default',  // 'default' | 'fast' | 'local' | 'cloud' | 'enterprise'
    model: 'auto',        // optional, uses best available
    temperature: 0.7,
    maxTokens: 2000,
    outputSchema: { ... }
  }
}
```

#### Agentic Functions

AI agents that can use tools and iterate to solve complex tasks.

```typescript
{
  name: 'researchCompany',
  type: 'agentic',
  agenticConfig: {
    systemPrompt: `You are a research assistant...`,
    provider: 'default',  // 'default' | 'fast' | 'powerful'
    model: 'auto',        // optional, uses best available
    maxIterations: 10,
    timeout: 120000,
    functionTools: ['fn-search', 'fn-summarize'],
    integrationTools: ['tool-apollo', 'tool-web']
  }
}
```

#### Human Functions

Create tasks for human workers with queue-based or direct assignment.

```typescript
{
  name: 'reviewContract',
  type: 'human',
  humanConfig: {
    assignmentMode: 'queue',
    role: 'role-legal',
    priority: 'high',
    taskTemplate: 'Review contract for {{company}}: {{contractType}}',
    instructions: 'Please review the attached contract...',
    timeout: 86400000
  }
}
```

### Collection Groups

| Group | Collections |
|-------|-------------|
| **Business** | businesses, goals, metrics, teams, processes |
| **Product** | products, services, offers, prices, features |
| **Sales** | deals, quotes, proposals |
| **Marketing** | leads, brands, competitors, domains, positioning |
| **Success** | customers, contacts, subscriptions |
| **Financial** | invoices, payments, cards, transfers, refunds |
| **Work** | projects, tasks, issues, agents, workflows, roles |
| **Code** | functions, workers, artifacts, components, packages |
| **Content** | documents, files, pages, sites, blogs |
| **Startup** | founders, ideas, problems, startups, concepts |
| **Integrations** | tools, providers, accounts, webhooks, triggers |
| **Data** | things, relationships, nouns, verbs, actions, events |

### Available Built-in Integrations

| Integration | Category | Description |
|-------------|----------|-------------|
| `sendEmail` | Communication | Send transactional emails |
| `sendSMS` | Communication | Send SMS messages |
| `searchPeople` | Enrichment | Search for people by company/title |
| `searchCompanies` | Enrichment | Search for companies |
| `enrichPerson` | Enrichment | Enrich person data by email |
| `enrichCompany` | Enrichment | Enrich company data by domain |
| `scrape` | Web | Scrape webpage content |
| `crawl` | Web | Crawl entire website |
| `screenshot` | Web | Take webpage screenshot |
| `checkDomain` | Domains | Check domain availability |
| `registerDomain` | Domains | Register a domain |

## Business-as-Code (Git Sync)

Bidirectional sync between GitHub repositories and Payload CMS collections.

### Features

- **Git → DB**: Automatically sync MDX files from GitHub on push
- **DB → Git**: Push database changes back to Git (commit or PR mode)
- **Multi-Repo**: Configure multiple repositories with different settings
- **Conflict Resolution**: git-wins, db-wins, conflict-pr, or manual strategies

### Quick Start

1. **Add git source fields to your collection:**

```typescript
import { gitSourceFields } from 'db.sb/fields'

export const Startups: CollectionConfig = {
  slug: 'startups',
  fields: [
    { name: 'name', type: 'text', required: true },
    ...gitSourceFields(),
  ],
}
```

2. **Enable bidirectional sync with hooks:**

```typescript
import { withGitSync } from 'db.sb/hooks'

export const Startups = withGitSync({
  slug: 'startups',
  fields: [...gitSourceFields()],
}, {
  enabled: true,
  mode: 'pr',
  conflictStrategy: 'git-wins',
})
```

### MDX File Format

```mdx
---
$type: Startup
slug: acme-corp
---

# Acme Corporation

A revolutionary startup.

## Fields

- `name: text!` - Company name
- `industry: text` - Industry vertical
```

## Field Utilities

### MDX Fields

Add MDX content support to any collection:

```typescript
import { withMdx, simpleCollectionWithMdx } from 'db.sb/fields'

// Wrap existing collection
const MyCollection = withMdx(baseCollection, {
  editorOptions: { padding: { top: 20, bottom: 20 } },
  hideData: false,
  includeInFrontmatter: ['name', 'slug']
})

// Create simple collection with MDX
const Posts = simpleCollectionWithMdx('posts', 'Content')
```

## Environment Variables

- `DB_SB_URL` - RPC endpoint (default: https://db.sb/rpc)
- `PORT` - Admin server port (default: 4000)

## Authentication

db.sb uses [oauth.do](https://oauth.do) for authentication. The CLI handles this automatically. For programmatic use, ensure oauth.do is configured in your environment.

## License

MIT
