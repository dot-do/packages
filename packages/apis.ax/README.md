---
name: apis.ax
version: 0.0.1
description: "AX = Agent Experience. The agent-row machine-surface index and AX conventions reference. Name reserved for the live service at https://apis.ax."
license: MIT
keywords:
  - ax
  - agent-experience
  - agents
  - llms.txt
  - agents.json
  - mcp
  - x402
downloads:
  monthly: 31
published: "2026-07-19T11:04:48.520Z"
updated: "2026-07-19T11:04:48.816Z"
---

# apis.ax

**AX = Agent Experience** — what DX was to developers, AX is to agents.
The term for the era where the primary consumer of an API is an agent,
not a human reading docs.

```sh
npx apis.ax      # prints the AX statement + the machine-surface conventions
```

## What this is

apis.ax is the agent-row **machine-surface index** and reference
implementation: the estate-wide agent front door
(`discover -> /icp.json self-classify -> prove -> 402-offer -> settle`),
the linkset over every venue's `agents.json`, and the AX manifesto.

## The AX conventions

An agent-first API publishes machine surfaces an agent can act on one
command deep:

1. `llms.txt` — what this is, for language models
2. `/.well-known/agents.json` — the agent-facing capability manifest
3. `/icp.json` — self-classification: who this serves
4. Content negotiation — `curl` gets markdown, browsers get HTML
5. OpenAPI — the published, verifiable contract
6. MCP — tools mounted for agent runtimes
7. Keyless trial flow — usable without a signup wall
8. HTTP 402 with a machine-readable offer — agent-wallet payments
9. Linkset — the index across venues
10. Attestation — signed, replayable evidence

These ten are the **AX score**; a grader CLI (`npx apis.ax audit <domain>`)
is planned — graders spread the term with the brand attached.

## Why

The web has a human row and an agent row (B2A, and B2H2A where a human
gate is crossed). Humans see per-venue brands; agents see one machine
brand family (`*.ax`). apis.ax indexes those surfaces — it serves, it
never homes.

## Status

Reserving the name for the live service. Index + manifesto:
**https://apis.ax** (coming).
