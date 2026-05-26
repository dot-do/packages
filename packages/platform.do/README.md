---
name: platform.do
version: 0.1.11
description: TypeScript SDK and CLI for the .do Platform - unified API for AI, databases, actions, and workflows on Cloudflare
license: MIT
repository: "https://github.com/dot-do/ai"
homepage: "https://platform.do"
keywords:
  - platform
  - sdk
  - cli
  - ai
  - database
  - events
  - tracking
  - webhooks
  - cloudflare
  - workers
  - capnweb
  - rpc
  - typescript
  - actions
  - workflows
  - automation
  - business
  - business-as-code
downloads:
  monthly: 161
published: "2025-11-26T12:33:11.824Z"
updated: "2025-12-11T19:16:52.584Z"
---

# platform.do

[![npm version](https://badge.fury.io/js/platform.do.svg)](https://www.npmjs.com/package/platform.do)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)

The official TypeScript SDK and CLI for the [`.do Platform`](https://platform.do) to build Business-as-Code. 

## Installation

```bash
npm install platform.do
# or
pnpm add platform.do
# or
yarn add platform.do
```

## CLI Usage

Platform.do includes a powerful CLI for executing SDK commands directly from the command line:

```bash
# Generate content with AI
npx platform.do ai.generate('LandingPage', { domain: 'startups.studio' })

# Get a resource from the database
npx platform.do db.get('/sites/example.com')

# Track an event
npx platform.do track({ event: 'page_view', properties: { url: '/' } })
```

See [CLI.md](./CLI.md) for full CLI documentation.

## Quick Start

```typescript
import { $ } from 'platform.do'

// Initialize with your API key
$.init({ apiKey: 'your-api-key' })

// Send an email
await $.Email.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Thanks for signing up'
})

// Generate AI content
const article = await $.AI.generate({
  model: 'claude-3-5-sonnet',
  prompt: 'Write about Cloudflare Workers'
})

// Create a GitHub issue
await $.GitHub.createIssue({
  owner: 'acme',
  repo: 'app',
  title: 'Bug report',
  body: 'Something is broken'
})
```

## How It Works

The `$` object is a **JavaScript Proxy** that provides a clean, intuitive API for executing actions across all platform services.

### The Pattern: `$.Object.action(object, options)`

Every action follows this simple pattern:

```typescript
await $.Object.action(params, options)
```

- **Object** - The type of resource (Email, AI, GitHub, Article, User, etc.)
- **action** - What you want to do (send, create, update, delete, generate, etc.)
- **params** - The data for the action
- **options** - Execution options (mode, durability, retry, etc.)

### Actor Context

The `$` proxy automatically infers **who is performing the action** from your authentication context:

```typescript
// When you initialize with an API key
$.init({ apiKey: 'user_abc123' })

// All subsequent actions automatically include the actor
await $.Article.create({ title: 'Hello' })
// Behind the scenes: actor = 'https://app.do/users/abc123'

// Service account context
$.init({ apiKey: 'service_system' })
await $.Email.send({ to: 'user@example.com' })
// Behind the scenes: actor = 'https://platform.do/system'
```

You don't need to pass the actor explicitly - the SDK handles it for you.

## Execution Modes

The `$` proxy supports three execution modes via the `mode` option:

### 1. `do` (Default - Immediate with Fallback)

Tries to execute immediately. If configured, falls back to queue or workflow on failure.

```typescript
// Default - try immediately
await $.Email.send({
  to: 'user@example.com',
  subject: 'Hello'
})

// With queue fallback
await $.Email.send(
  { to: 'user@example.com' },
  { mode: 'do', queue: true }
)

// With workflow fallback for complex tasks
await $.Article.generate(
  { topic: 'AI' },
  { mode: 'do', durable: true }
)
```

**When to use:**
- Default for most actions
- When you want immediate response if possible
- Cost-conscious (only pay for durability when needed)

**Cost:** $$ (immediate success) to $$$ (with queue fallback)

### 2. `try` (Best-Effort, No Durability)

Attempts once and returns success/failure without throwing.

```typescript
const result = await $.Analytics.track(
  { event: 'page_view' },
  { mode: 'try' }
)

if (result.success) {
  console.log('Tracked:', result.data)
} else {
  console.log('Failed:', result.error)
}
```

**When to use:**
- Non-critical actions
- Analytics and metrics
- When you want graceful failure

**Cost:** $ (no logging) to $$ (with logging)

### 3. `batch` (Always Queue for Async Processing)

Always queues the action for later processing. Returns immediately with queue ID.

```typescript
// Queue for batch processing
await $.Email.send(
  { to: 'user@example.com' },
  { mode: 'batch' }
)

// Delayed execution
await $.Report.generate(
  { type: 'daily' },
  { mode: 'batch', delay: '5m' }
)

// Scheduled execution
await $.Report.generate(
  { type: 'weekly' },
  { mode: 'batch', schedule: '0 9 * * 1' }
)
```

**When to use:**
- Bulk operations
- Rate-limited APIs
- Scheduled/delayed processing
- Cost optimization (batch multiple calls)

**Cost:** $$$ (queue) to $$$$ (workflow)

## Options Reference

All actions accept an optional second argument with these options:

```typescript
interface ExecutionOptions {
  // Execution mode
  mode?: 'do' | 'try' | 'batch'

  // Durability
  durable?: boolean      // Use workflow for multi-step/long-running tasks
  queue?: boolean        // Queue if immediate execution fails

  // Retry configuration
  retry?: {
    maxAttempts: number
    backoff: 'linear' | 'exponential'
    backoffMs?: number
  }

  // Scheduling
  delay?: string        // Delay execution (e.g., '5m', '1h', '1d')
  schedule?: string     // Cron expression (e.g., '0 9 * * *')

  // Actor override (admin only)
  actor?: string

  // Metadata
  meta?: Record<string, any>

  // Logging
  log?: boolean         // Log to analytics (default: true)
}
```

## Examples

### AI Generation

```typescript
// Simple generation
const poem = await $.ai.generate({
  model: 'claude-sonnet-4.5',
  prompt: 'Write a haiku about code'
})

// With durable workflow for long content
const article = await $.ai.generate(
  {
    model: 'claude-sonnet-4.5',
    prompt: 'Write a 5000-word article about Business-as-Code'
  },
  { mode: 'do', durable: true }
)

// Embeddings
const vectors = await $.ai.embed({
  model: 'gemini-embedding-001',
  input: ['Hello world', 'Goodbye world']
})
```

### Database Operations

```typescript
// Get a resource
const user = await $.db.get('https://app.do/users/123')

// Create a resource
const article = await $.db.create({
  type: 'Article',
  title: 'Hello World',
  body: 'Content...'
})

// Update a resource
await $.db.update('https://app.do/articles/456', {
  title: 'Updated Title'
})

// Search
const results = await $.db.search({
  type: 'Article',
  query: 'cloudflare workers',
  limit: 10
})

// Find with filters
const users = await $.db.find({
  type: 'User',
  filters: {
    email: { $in: ['alice@example.com', 'bob@example.com'] },
    status: 'active'
  }
})
```

### Email with Retry

```typescript
await $.Email.send(
  {
    to: 'user@example.com',
    subject: 'Important Update',
    body: 'Please read this'
  },
  {
    mode: 'do',
    queue: true,
    retry: {
      maxAttempts: 3,
      backoff: 'exponential'
    }
  }
)
```

### Scheduled Reports

```typescript
// Daily report at 9am
await $.Report.generate(
  { type: 'daily', format: 'pdf' },
  {
    mode: 'batch',
    schedule: '0 9 * * *'
  }
)

// Weekly report on Mondays
await $.Report.generate(
  { type: 'weekly', format: 'csv' },
  {
    mode: 'batch',
    schedule: '0 9 * * 1'
  }
)
```

### GitHub Integration

```typescript
// Create issue
const issue = await $.GitHub.createIssue({
  owner: 'acme',
  repo: 'app',
  title: 'Feature request',
  body: 'We need dark mode',
  labels: ['enhancement']
})

// Create pull request
const pr = await $.GitHub.createPullRequest({
  owner: 'acme',
  repo: 'app',
  title: 'Add dark mode',
  head: 'feature/dark-mode',
  base: 'main',
  body: 'Implements dark mode support'
})
```

### Stripe Payments

```typescript
// Create charge
const charge = await $.Stripe.createCharge(
  {
    amount: 1000, // $10.00
    currency: 'usd',
    source: 'tok_visa',
    description: 'Premium plan'
  },
  {
    mode: 'do',
    queue: true, // Queue if fails
    retry: { maxAttempts: 3 }
  }
)

// Create subscription
const subscription = await $.Stripe.createSubscription({
  customer: 'cus_123',
  items: [{ price: 'price_premium' }]
})
```

### Event Tracking

```typescript
// Track events (best-effort)
await $.Event.track(
  {
    event: 'page_view',
    properties: {
      path: '/dashboard',
      referrer: 'https://google.com'
    }
  },
  { mode: 'try' }
)

// Track with guaranteed delivery
await $.Event.track(
  {
    event: 'purchase_completed',
    properties: {
      amount: 99.99,
      product: 'premium-plan'
    }
  },
  { mode: 'do', queue: true }
)
```

## Error Handling

### With `do` mode (throws on error)

```typescript
try {
  await $.Email.send({
    to: 'user@example.com',
    subject: 'Hello'
  })
  console.log('Email sent successfully')
} catch (error) {
  console.error('Failed to send email:', error)
}
```

### With `try` mode (returns success/error)

```typescript
const result = await $.Analytics.track(
  { event: 'click' },
  { mode: 'try' }
)

if (result.success) {
  console.log('Tracked:', result.data)
} else {
  console.log('Failed:', result.error)
}
```

### With `batch` mode (returns queue ID)

```typescript
const result = await $.Email.send(
  { to: 'user@example.com' },
  { mode: 'batch' }
)

console.log('Queued with ID:', result.queueId)
```

## TypeScript Support

The SDK is fully typed with TypeScript:

```typescript
import { $, type ExecutionOptions } from 'platform.do'

// All actions are strongly typed
const result: string = await $.AI.generate({
  model: 'claude-3-5-sonnet',
  prompt: 'Hello'
})

// Options are typed
const options: ExecutionOptions = {
  mode: 'do',
  queue: true,
  retry: {
    maxAttempts: 3,
    backoff: 'exponential'
  }
}

await $.Email.send({ to: 'user@example.com' }, options)
```

## Framework Integration

### Next.js App Router

```typescript
// app/actions/email.ts
'use server'

import { $ } from 'platform.do'

export async function sendWelcomeEmail(email: string) {
  return await $.Email.send({
    to: email,
    subject: 'Welcome!',
    body: 'Thanks for signing up'
  })
}
```

### Next.js API Routes

```typescript
// app/api/send-email/route.ts
import { $ } from 'platform.do'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { to, subject, body } = await request.json()

  const result = await $.Email.send(
    { to, subject, body },
    { mode: 'try' }
  )

  if (result.success) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }
}
```

### Express.js

```typescript
import express from 'express'
import { $ } from 'platform.do'

const app = express()

app.post('/api/track', async (req, res) => {
  const result = await $.Event.track(
    { event: req.body.event, properties: req.body.properties },
    { mode: 'try' }
  )

  if (result.success) {
    res.json({ success: true })
  } else {
    res.status(500).json({ error: result.error })
  }
})
```

### React Client Component

```typescript
'use client'

import { $ } from 'platform.do'
import { useState } from 'react'

export function TrackButton() {
  const [tracking, setTracking] = useState(false)

  const handleClick = async () => {
    setTracking(true)
    await $.Event.track(
      { event: 'button_click', properties: { button: 'cta' } },
      { mode: 'try' }
    )
    setTracking(false)
  }

  return (
    <button onClick={handleClick} disabled={tracking}>
      {tracking ? 'Tracking...' : 'Click Me'}
    </button>
  )
}
```

## Behind the Scenes

When you call `$.Email.send(params)`, here's what happens:

1. **Proxy Intercepts** - The `$` proxy captures `Email` and `send`
2. **Actor Resolution** - Gets actor from your API key/auth context
3. **RPC Call** - Sends to actions worker via RPC:
   ```typescript
   rpc.execute({
     actor: 'https://app.do/users/123',
     action: 'Email.send',
     object: params,
     mode: 'do'
   })
   ```
4. **Execution** - Actions worker:
   - Tries immediate RPC call to email worker
   - On success: logs to analytics and returns result
   - On failure (if `queue: true`): queues for retry
5. **Response** - Returns result to your code

The two-layer architecture:
- **User API** - Clean `$.Object.action()` with inferred actor
- **RPC Worker** - Explicit `rpc.execute({ actor, action, object })` for extensibility

## Cost Optimization

Choose the cheapest mode that meets your requirements:

| Mode | Cost | Use Case |
|------|------|----------|
| `try` (no log) | $ | Non-critical tracking |
| `try` (with log) | $$ | Analytics with tracking |
| `do` (immediate) | $$ | Most actions |
| `do` (+ queue) | $$$ | Reliable async |
| `batch` (queue) | $$$ | Batching, rate limiting |
| `do` (+ workflow) | $$$$ | Complex multi-step |
| `batch` (workflow) | $$$$ | Always durable |

**Tips:**
- Use `try` mode for non-critical analytics (cheapest)
- Use `do` mode for most actions (default, good balance)
- Add `queue: true` only when you need guaranteed delivery (moderate cost)
- Use `durable: true` only for long-running or complex tasks (highest cost)
- Use `batch` mode for bulk operations or scheduled tasks

## Available Services

The `$` object provides access to all platform services:

- `$.ai` - AI models (generate, embed, image, speech, video)
- `$.db` - Database operations (get, set, create, update, delete, find, search)
- `$.Email` - Send emails
- `$.Event` - Track events and analytics
- `$.GitHub` - GitHub API (issues, PRs, repos)
- `$.Stripe` - Payments and subscriptions
- `$.WorkOS` - SSO, directory sync, audit logs
- `$.Article` - Content generation and management
- `$.User` - User management
- `$.Report` - Generate reports

And many more! All workers are automatically aggregated into the `$` object.

## Admin Features

For admin/system use, you can explicitly specify the actor:

```typescript
// Override actor for admin operations
await $.Article.create(
  { title: 'System Announcement' },
  { actor: 'https://platform.do/system' }
)

// Or use .as() helper
await $.as('https://app.do/users/123').Article.create({
  title: 'User Article'
})
```

## Contributing

We welcome contributions! Please see our [contribution guidelines](https://github.com/dot-do/core/blob/main/CONTRIBUTING.md).

To contribute to the SDK:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Build: `pnpm build`
6. Submit a pull request

## Development

```bash
# Install dependencies
pnpm install

# Run tests in watch mode
pnpm test:watch

# Build the package
pnpm build

# Run the CLI locally
node dist/cli.js --help
```

## Publishing

The package uses automated publishing via CI/CD. To publish manually:

```bash
# Ensure all tests pass
pnpm test

# Build the package
pnpm build

# Publish to npm (requires npm auth)
npm publish
```

## License

MIT - see [LICENSE](./LICENSE) file for details.

## Links

- [Documentation](https://docs.platform.do)
- [GitHub Repository](https://github.com/dot-do/core)
- [NPM Package](https://www.npmjs.com/package/platform.do)
- [CLI Documentation](./CLI.md)
- [Issue Tracker](https://github.com/dot-do/core/issues)
- [Discord Community](https://discord.gg/platform-do)
