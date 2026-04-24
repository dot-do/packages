---
name: startups.studio
version: 0.9.6
description: Define your entire business as code - CLI for syncing MDX business definitions
license: MIT
keywords:
  - startups
  - mdx
  - business-as-code
  - cli
downloads:
  monthly: 3318
published: "2025-12-17T19:48:13.912Z"
updated: "2026-04-07T19:27:21.430Z"
---

# startups.studio

`startups.studio` is the core SDK + CLI for the Startups.Studio platform. It provides zero-config auth, typed collection clients, and agent-friendly CLI commands for working with the control plane API.

This package is the clearest expression of the Business-as-Code idea in the monorepo: businesses are manipulated as structured entities through code, not just through a dashboard.

## What It Includes

- Typed SDK clients for platform collections such as `startups`, `ideas`, `domains`, and `agents`
- A CLI for auth, startup CRUD, and MDX sync workflows
- Local credential storage at `~/.config/startups-studio/credentials.json`

## Business-as-Code Model

- `startups`, `orgs`, and `domains` define the identity of the business
- Collections like `ideas`, `agents`, `workflows`, `budgets`, and `revenue-events` describe how it operates
- `sync` lets business definitions start in MDX and move into machine-readable platform state
- The SDK and CLI make those same concepts available to humans, scripts, and agents

## CLI Examples

```bash
startups.studio auth status
startups.studio startups create --name "Acme AI"
startups.studio startups list --limit 20 --fields id,name,slug
startups.studio sync --dir ./docs --pattern '**/*.mdx' --dry-run
```

`sync` currently scans MDX files, parses frontmatter, and prepares sync output for downstream workflows.

## SDK Example

```ts
import { startups, ideas } from 'startups.studio'

const created = await startups.create({
  name: 'Acme AI',
  slug: 'acme-ai',
})

const validatedIdeas = await ideas.find({ status: 'validated', limit: 10 })
```

Environment overrides:

- `STARTUPS_STUDIO_API_KEY`
- `STARTUPS_STUDIO_API_URL`
- `STARTUPS_STUDIO_ORG`

## Scripts

```bash
pnpm build
pnpm dev
pnpm check-types
pnpm clean
```
