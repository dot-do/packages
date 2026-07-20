---
name: apps.ax
version: 0.0.1
description: "AX = Agent Experience. The store-residence directory of agent-installable apps, skills, and MCP servers. Name reserved for the live service at https://apps.ax."
license: MIT
keywords:
  - ax
  - agent-experience
  - agents
  - mcp
  - skills
  - directory
  - store
downloads:
  monthly: 123
published: "2026-07-19T11:04:51.992Z"
updated: "2026-07-19T11:04:52.319Z"
---

# apps.ax

**AX = Agent Experience** — what DX was to developers, AX is to agents.

```sh
npx apps.ax      # prints the AX statement + the store-residence framing
```

## What this is

apps.ax is the **store-residence directory**: the estate's own directory
of agent-installable apps, skills, and MCP servers.

Agent-installable software lives in three residences:

- **byo** — you bring the app; the agent runs it where you say
- **hosted** — the app runs on the vendor's estate; the agent connects
- **store** — the app is listed, discovered, and installed from a directory

apps.ax owns the third. Initially a thin index of the estate's own MCP
servers; the directory grows from there.

## What it will do

Every listing is agent-actionable through the standard AX machine
surfaces — `llms.txt`, `/.well-known/agents.json`, `/icp.json`, content
negotiation (curl gets markdown), OpenAPI, MCP, a keyless trial flow,
HTTP 402 with a machine-readable offer, linkset, and attestation. An
agent can discover a listing, self-classify against it, try it without
a signup wall, pay by 402-offer, and verify it by signed evidence.

## Why

The web has a human row and an agent row (B2A, and B2H2A where a human
gate is crossed). Humans get per-venue app stores; the agent row gets
one brand family (`*.ax`) and one directory that serves — never homes —
the software agents install.

## Status

Reserving the name for the live service: **https://apps.ax** (coming).
The agent-row index lives at **https://apis.ax**.
