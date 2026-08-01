---
name: agent-experience
version: 0.1.0
description: "AX = Agent eXperience — what UX and DX were for humans, AX is for agents. The base toolkit for consuming and implementing agent-first (.ax) surfaces per AXP, the Agent eXperience Protocol (https://apis.ax/axp): markdown-first content negotiation, typed BL"
license: MIT
homepage: "https://apis.ax/axp"
keywords:
  - ax
  - axp
  - agent-experience
  - agent-first
  - agent-experience-protocol-axp
  - llms.txt
  - agents.json
  - content-negotiation
  - typed-errors
  - x402
  - 402
  - openapi
  - mcp
downloads:
  monthly: 129
published: "2026-07-21T16:04:52.499Z"
updated: "2026-07-21T16:04:52.809Z"
---

# agent-experience

**AX = Agent eXperience. What UX and DX were for humans, AX is for agents — and
AXP, the Agent eXperience Protocol, is its wire contract.**

Your API has two kinds of customers now, and the faster-growing kind can't
read your docs site. An autonomous agent arrives with a job, a wallet, and one
context window: it must discover your surface, understand it, and transact
with it **zero-shot, on first contact** — no human reading docs in the loop.
The human-first web makes it guess: walls of HTML, key-gated signups, faked
`200`s, prices discovered after the bill.

`agent-experience` is the base toolkit for the other way — **consuming** and
**implementing** agent-first surfaces per
**[AXP — the Agent eXperience Protocol](https://apis.ax/axp)**:

1. **OpenAPI 3.1** — a machine-readable contract
2. **llms.txt** — the agent-actionable markdown front door
3. **markdown-first content negotiation** — agents get markdown, never a wall of HTML
4. **typed BLOCKED/EMPTY errors** — outcomes are typed, never a faked `200`
5. **hard-ceiling metered pricing** — structured `402` offers with bounded worst-case spend
6. a **resolver-addressable home** — `/.well-known/agents.json`
7. **keyless first value** — real value before any key, signup, or account

```sh
npx agent-experience                    # the thesis + the seven clauses
npx agent-experience discover <origin>  # probe an origin's agent surfaces
```

## Consume an agent-first surface

```js
import { fetchAsAgent, discover, readOutcome } from 'agent-experience'

// Where are the machine surfaces? (presence probe, not a grade)
const report = await discover('example.com')
// { origin, card, surfaces: { agentsJson, openapi, llmsTxt, markdownFirst }, axp }

// Call in the agent register: markdown-first Accept, so a conforming
// surface answers with markdown/JSON — never HTML built for eyes.
const res = await fetchAsAgent('https://example.com/records?filter=none')

// Act on typed outcomes, deterministically (AXP clauses 4–5):
const outcome = await readOutcome(res)
switch (outcome.kind) {
  case 'OK':      /* real data */ break
  case 'EMPTY':   /* truly no results — not a faked success */ break
  case 'BLOCKED': /* re-plan or escalate: outcome.reason */ break
  case 'OFFER':   /* pay to proceed: outcome.offer (id/title/price, bounded) */ break
}
```

## Implement one

```js
import { negotiate, empty, blocked, offer } from 'agent-experience'

// Clause 3 — one URL, two registers, always `Vary: Accept`:
const { body, headers } = negotiate(req.headers.accept, { markdown, html })

// Clause 4 — never fake success:
if (results.length === 0) return send(empty({ message: 'no records match' }))
if (!permitted) return send(blocked('not permitted for your agent class'))

// Clause 5 — payment boundaries are structured offers, ceilings are hard:
if (!paid) return send(offer({ id: 'metered-access', title: 'Metered access',
  price: { model: 'metered', unit: 'usd-per-call' }, checkoutUrl: '/checkout' }))
if (overCeiling) return send(blocked('hard-ceiling exceeded; new authorization required',
  { status: 402, reauth: '/checkout' }))
```

The emitted shapes match what the independent verifier probes for, so building
with these helpers is building toward the gate.

## What this package is — and is not

- **It is** the umbrella toolkit for the AX thesis and the `.ax` surfaces:
  [apis.ax](https://apis.ax) (where agents get capabilities — every Listing
  passed the AXP gate), [page.ax](https://page.ax) (gist for agents: one
  command from artifact to canonical URL), and [apps.ax](https://apps.ax)
  (where apps live for agents).
- **It is not** the standards body. The normative text of AXP lives at
  **[apis.ax/axp](https://apis.ax/axp)** (versioned, RFC-2119,
  content-negotiated), published by apis.ax. Conformance is judged only by
  **[api.qa](https://api.qa)**, the independent verifier — this package never
  grades, and `npx agent-experience audit` will simply point you at
  `npx apis.ax audit <domain>`.
- **Disambiguation:** the npm packages `axp` and `agent-experience-protocol`
  are unrelated third-party projects. The protocol this package implements is
  **AXP — the Agent eXperience Protocol, canonical at
  [apis.ax/axp](https://apis.ax/axp)**.

Zero dependencies. Node ≥ 18. MIT.
