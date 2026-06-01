---
name: create-startups
version: 0.2.0
description: Startup Factory CLI - Generate and validate startup ideas with AI
license: MIT
keywords:
  - startups
  - create
  - cli
  - ai
  - business
downloads:
  monthly: 34
published: "2025-12-17T19:44:45.086Z"
updated: "2026-04-04T20:57:22.053Z"
---

# create-startups

`create-startups` is the fast bootstrap CLI for Startups.Studio.

It turns a startup name or idea into a startup record plus first domain, using the same auth and API client foundations as `startups.studio`.

## What it does

- Creates a startup record with status `ideation`
- Provisions the first domain record for that startup
- Supports interactive idea-first naming flows
- Supports JSON input and JSON output for agents
- Supports multiple startup creations in one command

## Common usage

```bash
create-startups "Acme AI"
create-startups menupriced.hq.com.ai
create-startups "Acme AI" "Beta AI"
create-startups --json '{"name":"Acme AI","zone":"app.net.ai","idea":"AI bookkeeping for SMBs"}'
create-startups --json '{"ideas":[{"name":"Acme AI"},{"name":"Beta AI","idea":"AI ops copilot"}]}' --output json
create-startups --dry-run "Acme AI"
```

Built-in zones today:

- `app.net.ai`
- `hq.com.ai`
- `hq.sb`

## Auth and schema helpers

```bash
create-startups auth status
create-startups auth login
create-startups auth logout
create-startups schema
create-startups schema create
```

## Automation notes

- Prefer `--json` and `--output json` for agents
- Use `--dry-run` before writes
- Set `STARTUPS_STUDIO_API_KEY` for non-interactive auth
- Set `STARTUPS_STUDIO_API_URL` when targeting a non-default admin instance

## Scripts

```bash
pnpm build
pnpm dev
pnpm check-types
pnpm clean
```
