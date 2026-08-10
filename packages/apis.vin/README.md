---
name: apis.vin
version: 1.0.0
description: "apis.vin — the vehicle estate API as one package: a typed SDK over the live surface (data / buy / fi / credit / keys as client namespaces), the `vin` CLI, and an MCP stdio bridge to the estate MCP server. Typed OK/EMPTY/BLOCKED/OFFER envelopes; sandbox-fi"
license: MIT
repository: "https://github.com/drivly/vin"
homepage: "https://apis.vin"
keywords:
  - vin
  - vehicle
  - automotive
  - api
  - sdk
  - cli
  - agents
  - sandbox
  - deals
  - fi
  - credit
  - mcp
  - axp
downloads:
  monthly: 117
published: "2026-08-09T09:20:15.312Z"
updated: "2026-08-09T09:20:15.686Z"
---

# apis.vin

The vehicle estate API as **one package**: the `vin` CLI, a typed SDK with the
pillars as client namespaces (`data` · `buy` · `fi` · `credit` · `keys`), and
an MCP stdio bridge to the estate's MCP server. All three faces are generated
from a single surface table (`SDK_SURFACE`), so they cannot drift from each
other — or from the live API at **https://apis.vin**.

Every answer is a typed envelope — `OK` / `EMPTY` / `BLOCKED` / `OFFER` — and
the sandbox is the default environment: deterministic counterparties, every
simulated payload labeled `{ environment: "sandbox", simulated: true }`.

## Install

```console
$ npm i -g apis.vin        # the vin CLI, the SDK, and the MCP bridge — one package
$ npx -y apis.vin help     # or zero-install
```

**Zero runtime dependencies** — the tarball is the whole install. Node ≥ 20.

## 60 seconds to a first answer

Registration is fully self-service: `POST /keys` is anonymous — no email, no
approval — and mints a `vk_sandbox_…` key instantly.

```console
$ vin keys create
sandbox key minted — account agent_anon_k7f2…
key: vk_sandbox_…
stored at ~/.config/vin/config.json — the API shows it exactly once and keeps only a sha256 hash

$ vin decode 1HGCM82633A004352
{
  "type": "OK",
  "decode": {
    "vin": "1HGCM82633A004352",
    "year": 2003,
    "make": "Honda",
    "model": "Accord Cpe",
    …
  },
  …
}
```

The reads answer keyless too — the key adds account context (deals, contracts,
the event stream), it never gates discovery.

## The CLI

One example per verb. Everything dispatches through the same surface table the
SDK uses; `--json` answers the typed envelope verbatim for agent callers.

### Data

```console
$ vin decode 1HGCM82633A004352                # decode a VIN
$ vin listings --make Jeep                    # the live listings collection
$ vin listing 1C4HJXEN5MW592818               # one listing by VIN
$ vin record 1C4HJXEN5MW592818                # the estate record face
```

### Buy — open a deal and walk the checklist

```console
$ vin buy 1C4HJXEN5MW592818                   # the buy composition for a VIN
$ vin deal open --data '{"vin":"1C4HJXEN5MW592818","buyer":{"zip":"90210"}}'
$ vin deal get deal_…                         # deal state
$ vin deal desk deal_… --data '{"salesPrice":30000,"downPayment":3000,"term":60,"zip":"90210"}'
$ vin deal checklist deal_…                   # the 8-step checklist
$ vin deal events deal_…                      # the own-scope event stream
$ vin deal esign deal_… --data '{"signer":{"name":"Alex Doe"}}'
$ vin deal notarize deal_… --data '{"signer":{"name":"Alex Doe"}}'
$ vin deal stips deal_… --data '{"stips":["proof-of-income"]}'
$ vin deal insurance deal_… --data '{"policy":{"policyNumber":"POL-123"}}'
$ vin deal checkout deal_…                    # 402 OFFER — see "the OFFER rail" below
$ vin deal settle deal_…                      # sandbox settle relay
$ vin deal transport-book deal_… --data '{"pickupZip":"90210","dropZip":"10001"}'
$ vin deal transport-track deal_…
$ vin deal transport-delivered deal_…
```

### F&I

```console
$ vin fi quote --data '{"vin":"1C4HJXEN5MW592818","desked":{"salesPrice":"30000.00","amountFinanced":"27000.00","monthlyPayment":"520.00","financeType":"Loan","term":60,"zip":"90210","vehicleMSRP":"34000.00"}}'
$ vin fi deal deal_…                          # F&I deal state
$ vin fi menu deal_…                          # package the menu
$ vin fi menu-present deal_…
$ vin fi menu-select deal_… --data '{"package":"Better","disclosuresAcknowledged":true}'
$ vin fi menu-decline deal_…
$ vin fi stage deal_…                         # stage the contract
$ vin fi approve deal_…
$ vin fi capture deal_… --data '{"fiManager":{"name":"Jordan","licenseNumber":"FI-12345"}}'
$ vin fi void contract_…
$ vin fi inforce 1HGCM82633A004352            # in-force contracts for a VIN
$ vin fi extract --data '{"kind":"generic","content":"…"}'
$ vin fi cancel-quote --data '{"contract":{…},"cancellationDate":"2026-08-08"}'
$ vin fi renew --data '{"vin":"1HGCM82633A004352"}'
```

### Credit

```console
$ vin credit prequal --data '{"applicant":{"firstName":"Alex","lastName":"Doe",…},"consent":{…}}'
$ vin credit apply --data '{"dealId":"deal_…","applicant":{…},"consent":{…}}'
$ vin credit simulate --data '{"dealJacketId":"dealjacket_…","decision":"approved"}'
```

The transaction bodies are rich; you never have to guess them. A short body
refuses `BLOCKED` naming **every** missing field with its expected form — the
refusal is the documentation. `/openapi.json` carries the full schemas.

### Keys, the escape hatch, and the bridge

```console
$ vin keys create --label my-agent            # anonymous sandbox key, stored 0600
$ vin keys me                                 # introspect the stored key
$ vin api                                     # list every surface verb
$ vin api fi.inforce vin=1HGCM82633A004352    # generic dispatch — any namespace.method
$ vin mcp                                     # MCP over stdio → https://apis.vin/mcp
```

### Flags and exit codes

| Flag | Meaning |
| --- | --- |
| `--json` | answer the typed envelope verbatim (agents; implies `--no-browser`, no settle poll) |
| `--no-browser` | never attempt a browser open (CI) — URLs are always printed regardless |
| `--data <json>` | JSON body/query args for the verb |
| `--base <url>` | API origin (default `https://apis.vin`; also `VIN_BASE_URL`) |
| `--key <key>` | key for this call (also `VIN_API_KEY`; else the stored config) |
| `--origin <url>` | `vin mcp` only — the MCP origin (also `VIN_MCP_ORIGIN`) |

Exit codes: `OK`/`EMPTY` **0** · `BLOCKED` **2** (the API's reason on stderr) ·
`OFFER` polls interactively — settled **0**, unsettled after the poll **1**;
under `--json` no poll runs and the OFFER envelope itself is the answer
(exit 0).

### The OFFER rail and the browser doctrine

At every human-authority moment the CLI does all three, every time: **prints
the URL**, **attempts the default browser** (the vercel/wrangler/gh device
pattern; failure degrades silently — the printed URL works from any device),
and **polls**. `vin deal checkout` prints the checkout URL, opens it, and
polls the deal's event stream for `Payment.paid@1`.

`vin login` and `vin mandate grant` ride auth.vin's device rail the same way.
**That rail is live** (2026-08-08): `POST /device/code` + `/device/token` and
the `/mandates/device/*` pair answer on auth.vin. The rail is sandbox-honest —
approval mints an `id_sandbox_…` identity token, and the mandate page's
human-set ceiling / per-action cap / time-box / tripwires mint a
`mandate_sandbox_…` token, every one labeled `environment: sandbox`; no
production identity is asserted and no production money moves. No package
update was required — the same verbs simply started completing.

## The SDK

```ts
import { createVinClient, originFetcher } from 'apis.vin'

const vin = createVinClient(originFetcher('https://apis.vin'), {
  authorization: 'Bearer vk_sandbox_…',
})
```

One calling convention, both forms — a positional scalar binds the door's
first path parameter, a named object spells it out; they are the same call:

```ts
const a = await vin.data.decode('1HGCM82633A004352')          // Answer — discriminate on a.type
const b = await vin.data.decode({ vin: '1HGCM82633A004352' }) // identical

const deal = await vin.buy.openDeal({ vin: '1C4HJXEN5MW592818', buyer: { zip: '90210' } })
const offer = await vin.buy.checkout('deal_…')                 // 402 OFFER envelope
const raw = await vin.get('/listings?make=Jeep')               // raw door access
```

Every method answers the typed envelope **verbatim** —
`Answer<T> = Ok | Empty | Blocked | Offer`, discriminated on `type`, money as
decimal strings, provenance blocks intact. The HTTP status rides a non-wire
`$http` member that never serializes (`JSON.stringify` always restores pure
wire data), and an OFFER-class answer that carries the `handoff: {kind, url}`
affordance lifts it into an invokable — `await offer.handoff?.({ openBrowser:
true })` — while still serializing as data. The client never pre-judges:
validation and refusals belong to the API, and a `BLOCKED` answer arrives as
data, not as a thrown error.

Stateful nouns also answer as **handles** — a view over the same surface
table (the `SDK_WORKFLOWS` data), never a second path spelling:

```ts
const d = vin.deal('deal_…')                    // stateless handle: id + client
await d.desk({ salesPrice: '31500.00', downPayment: '3000.00', term: 60, zip: '90210' })
await d.fi.select({ package: 'Better', disclosuresAcknowledged: true })
for await (const ev of d.events.stream()) { /* own-scope events, polled */ }
```

**Workers-safe**: the SDK's import graph closes over zero node built-ins
(test-enforced), so the same import works in Node ≥ 20, Cloudflare Workers,
and edge runtimes. Bring your own fetch if the ambient one won't do:

```ts
// inside a Cloudflare Worker, a service binding as the transport
const vin = createVinClient((path, init) => env.APIS_VIN.fetch(`https://apis.vin${path}`, init))
```

The surface table itself is exported — `SDK_SURFACE` maps every
`namespace.method` to its `{ method, path }`, and `resolveCall` applies the
calling convention to any op.

## MCP

The estate runs **one MCP server** at `POST https://apis.vin/mcp` (JSON-RPC
2.0 over streamable HTTP, keyless). Tools: `search` (find a capability across
the estate catalog) and `fetch` (dereference an address, answer the typed
envelope verbatim) — plus `exec` (agent-written JavaScript against the bound
SDK in a sandboxed dynamic worker) on deployments where that rail is armed;
where it isn't, exec is not declared and never faked.

`vin mcp` is the stdio bridge: any local agent runtime that speaks MCP over
stdio gets the live server through this package with zero config. It is an
honest passthrough — tool lists and results come from the server; the bridge
reimplements nothing, and connection failures surface as typed JSON-RPC
errors (`-32000`), never crashes.

**Claude Code**

```console
$ claude mcp add vin -- vin mcp
```

**Claude Desktop** (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "vin": { "command": "vin", "args": ["mcp"] }
  }
}
```

**Any runtime, no global install**

```json
{
  "mcpServers": {
    "vin": { "command": "npx", "args": ["-y", "apis.vin", "mcp"] }
  }
}
```

Point the bridge elsewhere with `vin mcp --origin <url>` or `VIN_MCP_ORIGIN`
(default `https://apis.vin`). A stored sandbox key forwards as the bearer, so
keyed reads through the `fetch` tool answer with your account context.

## The envelope vocabulary

| Envelope | Meaning |
| --- | --- |
| `OK` | the answer, whole — plus provenance where the data has a source |
| `EMPTY` | the door is live and holds nothing for this address — with the API's own words |
| `BLOCKED` | refused, with the reason (validation, state, or policy — stated, never euphemized) |
| `OFFER` | HTTP 402 — a payment stands between you and the state change; the envelope carries the checkout URL |

## Sandbox realism

The sandbox is not a mock: deals persist, checklists gate, contracts date
from their own deals, and refusals are the port laws verbatim. Deterministic
**triggers** are documented per door — e.g. a malformed VIN refuses
`invalid-vin`; omitting `vehicleMSRP` while GAP is in the product set refuses
`missing-msrp`; an aged VIN deterministically shows lapsed coverage. Every
simulated payload says so: `{ environment: "sandbox", simulated: true }`.

Trigger tables and pillar guides: https://docs-vin.dotdo.workers.dev — and
the one-page agent front door at https://apis.vin/llms.txt.

## Verify it yourself

The estate's public contract is verified by a third party — **api.qa** runs
the suite against the live surface and signs the verdict. Fetch it right now,
no install:

```console
$ curl https://api.qa/apis.vin
```

The report carries the AX checklist verdicts, the evidence digest, and an
Ed25519-signed report digest — the attestation, not a marketing claim.

The suite itself ships in this package: the two `api.qa/vitest@1` modules in
`verify/` — `index.mjs` (the public-contract green core) and
`acceptance.mjs` (the vision acceptance ratchet, red by design until the
product satisfies it) — combine deterministically into the exact `tests`
member the live `/suite.json` serves, sha-256 pinned: what api.qa executes
and what you hold are the same bytes. The modules run under the
`api.qa/vitest@1` harness (which supplies the `suite:env` binding); the
hosted run above is the zero-setup way to see them executed.

## Links

- **API**: https://apis.vin — `/llms.txt` · `/openapi.json` ·
  `/.well-known/agents.json` · `/pricing` · `/suite.json`
- **Docs**: https://docs-vin.dotdo.workers.dev (preview origin)
- **Verdict**: https://api.qa/apis.vin
- **Source**: https://github.com/drivly/vin (`apis/`)

## Development (this repo)

- Spec: `context.md` + ADR `docs/architecture/2026-08-08-apis-vin-the-estate-api.md`
- Gates (run from `apis/`): `pnpm typecheck` (worker-typed + node-typed
  programs) · `pnpm test` · `pnpm build` (SDK/CLI dist) ·
  `npx wrangler deploy --dry-run` · `pnpm axp:vendor:check`
- `autonomous-qa` is a file-linked devDep (`file:../../api.qa`) until 0.3.x
  publishes; `src/axp/` is vendored axp-faces (refresh with `pnpm axp:vendor`,
  never hand-edit); `src/kernel/` is ported verbatim from
  drivly/autodev-business-as-code — keep byte-diffable.
- Publishing: the `private: true` publish gate was lifted 2026-08-09 after
  the adversarial publish gate APPROVEd. Publish only via
  `scripts/publish.mjs` (TouchID/web-auth rail — no lifecycle hook runs it),
  under the founder's in-browser authorization.

## License

MIT © Nathan Clevenger
