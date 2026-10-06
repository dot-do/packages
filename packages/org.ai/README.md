---
name: org.ai
version: 0.1.1
description: Identity for humans and AI agents
license: MIT
repository: "https://github.com/dot-org-ai/org.ai"
homepage: "https://id.org.ai"
keywords:
  - auth
  - identity
  - ai
  - humans
  - durable-objects
  - cloudflare
downloads:
  monthly: 66
published: "2026-01-07T02:05:33.623Z"
updated: "2026-01-09T00:50:55.063Z"
---

# org.ai

**Identity for humans and AI agents.**

You're building the future. Your users aren't just people anymore—they're AI agents, autonomous systems, and humans working alongside them. Traditional auth wasn't built for this world.

org.ai is.

## The Problem

Every AI-powered app faces the same challenge: How do you authenticate an AI agent? How do you give it permissions? How do you know what it's allowed to do?

And once you solve that, how do you make it work seamlessly with the humans who own those agents?

## The Solution

org.ai provides unified identity for:

- **Humans** — OAuth login via Google, GitHub, Apple
- **AI Agents** — API keys with defined capabilities and rate limits
- **Organizations** — Groups where humans and agents collaborate

One identity system. One login. Works everywhere.

## Quick Start

```bash
npm install oauth.do
```

```typescript
import { ensureLoggedIn } from 'oauth.do/node'

// Works for humans (opens browser) and agents (uses API key)
const { token } = await ensureLoggedIn()
```

## How It Works

### For Humans

Users authenticate once with org.ai. Every connected app recognizes them.

```typescript
// Redirect to org.ai login
const url = buildAuthUrl({
  redirectUri: 'https://yourapp.com/callback',
  scope: 'openid profile email',
})
```

### For AI Agents

Agents get API keys with explicit capabilities. You always know what an agent can do.

```typescript
// Create an agent identity
const agent = await identity.createIdentity({
  type: 'agent',
  name: 'Research Assistant',
  capabilities: ['search', 'summarize', 'write'],
  ownerId: humanId, // Agents are always owned by humans
})

// Agent authenticates with API key
const result = await identity.validateApiKey(agentApiKey)
// { valid: true, type: 'agent', capabilities: ['search', 'summarize', 'write'] }
```

### For Apps

Add "Login with org.ai" to your app in minutes.

```typescript
// Register your app
const { clientId, clientSecret } = await identity.registerOAuthClient({
  name: 'My App',
  redirectUris: ['https://myapp.com/callback'],
})

// Users and agents can now authenticate
// GET https://id.org.ai/oauth/authorize?client_id=xxx
```

## Linked Accounts

Connect external services to any identity:

| Type | Providers | Purpose |
|------|-----------|---------|
| Auth | Google, GitHub, Apple | Login |
| Payment | Stripe Connect | Payments |
| AI | Anthropic, OpenAI | API access |
| Platform | Cloudflare, Vercel | Deployments |

```typescript
// Link a Stripe account for payments
await identity.linkAccount({
  identityId: user.id,
  provider: 'stripe',
  type: 'payment',
})
```

## API Keys

Programmatic access for any identity type:

```typescript
// Create an API key
const { key } = await identity.createApiKey({
  name: 'Production',
  identityId: user.id,
  scopes: ['read:data', 'write:data'],
})

// Validate anywhere
const { valid, identity } = await identity.validateApiKey(key)
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       id.org.ai                          │
│                   Identity Provider                      │
│                                                          │
│   Identities        Linked Accounts      OAuth Provider  │
│   ├── Humans        ├── Google           ├── Authorize   │
│   ├── Agents        ├── Stripe           ├── Token       │
│   └── Orgs          └── Anthropic        └── Userinfo    │
└─────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         Your App      Your CLI      Your Agent
```

## Why org.ai?

**Built for AI-native apps.** Not retrofitted OAuth with agent hacks.

**One identity everywhere.** Users authenticate once, access everything.

**Agents are first-class.** Not an afterthought. Full identity, capabilities, and audit trails.

**Open standards.** OAuth 2.0, OpenID Connect, PKCE. Works with everything.

## Installation

```bash
npm install oauth.do   # Client SDK
npm install org.ai     # Server SDK (if self-hosting)
```

## License

MIT
