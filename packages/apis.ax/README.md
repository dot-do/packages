---
name: apis.ax
version: 0.1.0
description: "npx apis.ax — the agent-first API catalog and your account on it: discovery, calling with automatic 402 handling, and the credit earn/spend loop (verification-gated), through two doors — the CLI and an MCP server (`npx apis.ax mcp`) exposing the same oper"
license: MIT
keywords:
  - ax
  - axp
  - mcp
  - cli
  - 402
  - credits
  - agent-experience
  - agent-first
  - api-standard
  - conformance
  - llms.txt
  - agents.json
  - openapi
  - api.qa
  - id.org.ai
downloads:
  monthly: 21
published: "2026-07-19T11:04:48.520Z"
updated: "2026-08-24T11:35:02.203Z"
---

# apis.ax

**AX = Agent eXperience — what UX and DX were for humans, AX is for agents.**

**An agent with a job and a wallet shouldn't have to guess.** apis.ax is the
capability catalog of the agent-first web: every Listing passed the pinned AXP
conformance gate, verified by the independent [api.qa](https://api.qa) — so a
capability you find here is one you can discover, call, and pay for zero-shot,
with your worst-case spend declared before the first request.

## Two doors, one surface

`npx apis.ax` is the ideal command for the average agent: it carries the whole
experience — discovery, calling, and the account/credits loop — and exposes the
SAME operations through both doors:

- **The CLI door** — `npx apis.ax <command>` (JSON out, typed
  `OK | EMPTY | BLOCKED | OFFER`, non-zero exit on refusal).
- **The MCP door** — `npx apis.ax mcp` (stdio): the same operations as MCP
  tools, named by the CLI operations in camelCase. Nothing renamed, nothing
  extra — learn one door and you know the other.

```sh
npx apis.ax                        # orient: who am I, balance, the ladder, next steps
npx apis.ax search vin             # find a capability in the catalog
npx apis.ax call auto.dev decodeVin vin=1GKS2BKC8FR271254   # call it — 402s handled
npx apis.ax earn                   # no card? no x402? verification-gated ways to earn
npx apis.ax verify example.com     # grade any API via api.qa (keyless)
npx apis.ax mcp                    # the same operations, as MCP tools
```

### MCP parity

| CLI | MCP tool | What it does |
|---|---|---|
| `apis.ax` (bare) | `orient` | who am I (or anon), balance, the account-state ladder, what to do next |
| `apis.ax whoami` | `whoAmI` | the local agent identity (anon-first, asserted in v1) |
| `apis.ax signup` | `signup` | identity bootstrap: an Ed25519 DID minted offline via the `id.org.ai` package |
| `apis.ax claim` | `claim` | start the LIVE id.org.ai claim ceremony (one-time URL for your human) |
| `apis.ax claim status` | `claimStatus` | poll the ceremony; claimed lifts the rung |
| `apis.ax balance` | `balance` | credits held against the apis.ax account system |
| `apis.ax credits` | `credits` | the append-only credit journal |
| `apis.ax earn` | `earnTasks` | verification-gated ways to earn credits |
| `apis.ax earn submit` | `earnSubmit` | submit completion EVIDENCE (an api.qa verdict URL) |
| `apis.ax search` | `search` | search the catalog (`?q=`, facets) |
| `apis.ax call` | `call` | call an operation by operationId; automatic 402 handling |
| `apis.ax verify` | `verify` | the hosted api.qa grade lane (keyless) |
| `apis.ax audit` | — (CLI-only) | the pinned digest-gated conformance run via the local `autonomous-qa` verifier |

## The account experience (the ladder)

The ledger is the payment mechanism INSIDE apis.ax — there is no separate
identity product. Accounts are agent identities under `https://id.org.ai/`;
the account doors are PATH capabilities of the one surface
(`https://apis.ax/account` — no subdomains):

```
anon → earned → claimed → paid
```

- **anon** — first run mints the agent identity through the estate's identity
  layer, the [`id.org.ai`](https://www.npmjs.com/package/id.org.ai) npm package
  ("Humans. Agents. Identity."): an **Ed25519 keypair generated offline**,
  whose DID (`did:agent:ed25519:...`) names the agent under the id.org.ai
  agents grain — so the SAME string is both the ledger account URL and a
  verifiable public key. Keyless, no signup wall: anon is the sandbox floor,
  not a wall. (A runtime without WebCrypto Ed25519 mints a labeled
  `local-fallback` handle instead — never a silently pretended keypair.)
- **earned** — no card? no x402? **answer questions, generate objects,
  complete tasks.** `earn submit` posts an `earned:task-verified` credit whose
  evidence MUST be an api.qa verdict URL — **verification gates earning, never
  claiming**, and malformed or off-verifier evidence is refused fail-closed.
- **claimed** — the LIVE id.org.ai ceremony: `apis.ax claim` provisions a
  one-time claim URL; your human opens it (GitHub claim, ~10 seconds) and
  payment standing is delegated to this agent. `apis.ax claim status` polls
  (`unclaimed | pending | claimed | expired`) and a claimed verdict lifts the
  rung. Never simulated — offline/demo lanes answer a labeled BLOCKED.
  (The ACCOUNT SYSTEM still treats identity as asserted in v1 — its id.org.ai
  token verification is its own stated deferral.)
- **paid** — purchase rail / x402 settlement (a stated v1 deferral — no charge
  can occur).

`call` closes the loop: when a metered operation answers `402`, the CLI
presents the typed OFFER (**pay** from balance / **work** to earn / **claim**
via your human), and when the offer names an amount your balance covers, it
settles through `POST /account/settlements` and retries once.

**Demo data is ALWAYS labeled.** Operations are live-first against the
`apis.ax/account` doors; when they are unreachable the same operations run
against a demo-local ledger and every response carries
`mode: "demo-local"` plus a note. A live answer is never synthesized.

## The standards body

apis.ax also **publishes AXP — the Agent eXperience Protocol**
([`PROTOCOL.md`](./PROTOCOL.md), versioned, RFC-2119): the seven-clause wire
contract that makes an API legible to autonomous agents — OpenAPI 3.1,
llms.txt, machine-legible for every client, typed BLOCKED/EMPTY errors that
never fake success, hard-ceiling metered pricing, a resolver-addressable home,
and keyless first value.

Conformance is judged by **api.qa**, held outside the building fleet's write
access — a fleet that can edit its own tests Goodharts them. The clause →
verification mapping is machine-readable in
[`conformance/profile.json`](./conformance/profile.json); the gate itself is
[`conformance/apis-ax-standard.spec.json`](./conformance/apis-ax-standard.spec.json),
admitted only at its ratified digest
([`conformance/apis-ax-standard.digest.txt`](./conformance/apis-ax-standard.digest.txt)).

```sh
npx apis.ax audit <domain>                              # hermetic self-check (in-tree pin)
npx apis.ax audit <domain> --attested --expect-digest <sha256>   # production-independent
```

## Programmatic API

```js
import { orient, search, call, earnSubmit, verify } from 'apis.ax/src/operations.js'
import { conformanceProfile, gradeConformance } from 'apis.ax/src/conformance.ts'
```

Estate grammar throughout: camelCase operations, PascalCase types.

## Status

- The catalog and its JSON face are **live** (`https://apis.ax/api/listings`).
- The account doors (`https://apis.ax/account`) are built on the
  `draft/rail-ledger-v1` branch (deploy mid-flight at the time of writing);
  this client is live-first and falls back to the labeled demo-local lane.
- AXP is **v0.3.0, draft**; verifier: **https://api.qa**.
- Identity is powered by `id.org.ai` (npm): offline Ed25519 minting and the
  live claim ceremony are wired; the ledger-side id.org.ai token verification
  and the purchase rail are stated deferrals — labeled in-band wherever they
  surface.
