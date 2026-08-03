---
name: barcoding.dev
version: 0.1.0
description: "The barcode layer of the visibility.cloud family, as offline verbs: resolve / verify / generate / serialize across GS1 (GTIN, element strings, Digital Link incl. compressed, GLN, SSCC), VIN, ISBN, FDA UDI, NDC and carrier tracking — plus an MCP door (reso"
license: MIT
homepage: "https://barcoding.dev"
keywords:
  - barcode
  - gs1
  - gtin
  - gln
  - sscc
  - digital-link
  - application-identifiers
  - vin
  - isbn
  - udi
  - ndc
  - tracking
  - serialization
  - sqids
  - mcp
  - scheme-registry
  - supply-chain
  - epcis
  - agents
downloads:
  monthly: 265
published: "2026-07-31T13:28:38.921Z"
updated: "2026-07-31T23:26:30.653Z"
---

# barcoding.dev

**Every barcode answers three questions: what is this, does it check out, and whose is it.**
This package answers the first two on your own machine — pure functions over sha256-pinned
tables, no account, no network path for any scheme — and hands the third to the one place
that answers it ([id.org.ai](https://id.org.ai), the resolver; this is the codec and data layer).

GS1 (GTIN, element strings, Digital Link — canonical *and* compressed — GLN, SSCC) is the
largest scheme family here, not the boundary: VIN, ISBN, FDA UDI, NDC, USPS IMpb and UPS 1Z
ride the same door. The property lives at [barcoding.dev](https://barcoding.dev); the hosted
face is `api.barcoding.dev`.

## Sixty seconds

Hand it anything identifier-shaped:

```sh
npx -y barcoding.dev resolve 09506000134352
```
```
scheme     gs1.gtin
carrier    GTIN-14
canonical  09506000134352
check      mod10 pass
handoff    read here · resolved by id.org.ai
```

A scanned 2D payload, GS separators, AIM prefixes and wedge junk included:

```sh
npx -y barcoding.dev resolve '(01)09506000134352(17)260930(10)LOT42'
```
```
scheme     gs1.element-string
carrier    element-string (bracket)
canonical  (01)09506000134352(10)LOT42(17)260930
check      mod10 pass
  (01) 09506000134352  GTIN
  (10) LOT42  batch/lot
  (17) 260930  expiration date → 2026-09-30
dl         https://id.gs1.org/01/09506000134352/10/LOT42?17=260930
dl-compact https://id.gs1.org/ARFKk4XBoCDClnJ8bC5_aE
also reads udi.gs1 · udi (GS1 issuing agency) — the same element string read at the FDA UDI grain: DI = AI (01), PI = the production identifiers
handoff    read here · resolved by id.org.ai
```

A failing check digit is a typed error on stderr, exit 1 — never a softened label:

```sh
npx -y barcoding.dev verify 4006381333932
```
```json
{
  "error": {
    "code": "CHECKSUM_FAIL",
    "message": "check digit fails GS1 mod-10 (GenSpecs §7.9): expected 1, got 2",
    "expected": 1,
    "got": 2,
    "algorithm": "GS1 mod-10 (GenSpecs §7.9)",
    "scheme": "gs1.gtin"
  }
}
```

And the round trip is a ceremony, not a claim — generate a barcode, scan it back:

```sh
npx -y barcoding.dev generate --gtin 09506000134352 --lot LOT42 --exp 260930 --qr --out mark.svg
npx -y barcoding.dev resolve mark.svg
```
```
scheme     gs1.digital-link
carrier    digital-link-uri
canonical  https://id.gs1.org/01/09506000134352/10/LOT42?17=260930
check      mod10 pass
symbol     QRCode (svg (rasterized))
  (01) 09506000134352  GTIN
  (10) LOT42  batch/lot
  (17) 260930  expiration date → 2026-09-30
dl         https://id.gs1.org/01/09506000134352/10/LOT42?17=260930
dl-compact https://id.gs1.org/ARFKk4XBoCDClnJ8bC5_aE
handoff    read here · resolved by id.org.ai
```

`resolve(generate(x)) === x` is a CI gate in this repo, byte-compared — not a slogan.

## The verbs

| verb | contract |
|------|----------|
| `resolve` | any identifier-bearing payload — bare GTIN-8/12/13/14, element string (FNC1/GS/AIM tolerated), Digital Link URI incl. compressed, GLN, SSCC, VIN, ISBN, UDI, NDC, tracking — **or a rendered SVG/PNG barcode** → canonical identity, parsed fields, check verdict |
| `verify` | the same read with verdict discipline: structural + check-digit against the pinned tables; a failure is typed `CHECKSUM_FAIL {expected, got, algorithm}`, exit 1 |
| `generate` | the write side, validate-before-render: identity → element string, Digital Link URI (canonical/compressed), rendered SVG/PNG (QR, GS1 DataMatrix, GS1-128, EAN-13, UPC-A, ITF-14, Code 39). A bad check digit is a worded refusal naming the GenSpecs §/AI entry — never a wrong barcode |
| `serialize` | transparent serials, local encoding: T1 `compact` (default, 16 chars) / T2 `origin` (opt-in, 20 chars), Sqids over the published `tsp-1` alphabet — decodable by anyone, and the response says exactly what each serial discloses |
| `pins` | the pinned normative artifacts this build computes from — scheme registry, AI table, `tsp-1` alphabet — each with its sha256, self-checked against the bundled files at call time |
| `version` | the release register as JSON |
| `mcp` | the same verbs as MCP tools on stdio — a door, not a second path |

Every verb takes `--json`. Errors are typed stderr envelopes `{"error":{code,message,hint}}`.
Exit codes: `0` verdict/artifact · `1` typed refusal or failed verdict · `2` usage.

The identity act is local; **resolution** — who stands behind an identifier, where its record
lives — is [id.org.ai](https://id.org.ai)'s, and every envelope carries that hand-off rather
than pretending otherwise. Vehicles hand off via auto.dev, the vertical authority:

```
scheme     vin
carrier    vin (17 characters)
canonical  1HGCM82633A004352
check      iso3779 mod11 pass (pos 9 = 3)
handoff    read here · resolved by id.org.ai — via auto.dev, the vertical authority
```

## The MCP door

```sh
npx -y barcoding.dev mcp
```

Tools this release: `resolve` · `verify` · `generate` · `pins` — all pure, all
`readOnlyHint: true`, so they clear agent auto-approval. The tool list is generated from the
same verb table the CLI dispatches from, and CI byte-compares tool results against
`--json` stdout: one implementation, two doors. There is no tool named `capture` here and
never will be — the family sibling `epcis.dev` owns capture, and its capture actually captures.

```json
{
  "mcpServers": {
    "barcoding": { "command": "npx", "args": ["-y", "barcoding.dev", "mcp"] }
  }
}
```

`enrich`, `bridge`, `hierarchy` and `party` are **absent, not stubbed** — they join the
generated listing when their rails ship (the delta ledger is public in the repo).

## Serials that say what they are

```sh
npx -y barcoding.dev serialize
```
```
69KCJgxP2AjVZsW3   T1 compact · tsp-1 · issued 2026-07-31T23:19:19.000Z
discloses  issuance time (1 s precision)
ledger     none — local serialize never emits an issuance event; the hosted door's ledger-as-register path is future tense until P0-28 closes
```

Transparent serials are the free class, and their legibility is a **disclosed limitation,
stated in every response**: anyone with the published `tsp-1` alphabet can decode issuance
time (T1) or time + issuing network ASN (T2 `--profile origin`, explicit opt-in). No raw IP
ever rides a serial — uniqueness comes from `crypto.getRandomValues()`. Serials that must
reveal nothing are the opaque enterprise class, which is not in this package. SSCC serial
references are numeric-only, so a transparent serial can never be one:
`serialize --scheme sscc` answers a typed managed-ranges offer instead of pretending.

Decode any transparent serial with the same verb — `serialize <serial>` — and the response
answers the register question honestly: authenticity is a ledger lookup, never a property of
the string.

## What this package refuses

`generate --scheme dl-aamva` answers `ILLEGAL_ARTIFACT`, exit 1, no override at any tier —
rendering a driver's-license barcode is manufacturing a government-credential artifact.
Reading one is parse-and-verify only: the canonical identity is withheld (`no_retention`),
nothing is echoed, and image decode drops pixels in memory. The refusal is enforced in the
registry row and tested, not promised.

## Pinned, offline, self-checking

Everything is computed from the digits against pinned tables: the 12-row scheme registry,
the GenSpecs-26.0-derived AI table, the `tsp-1` alphabet — sha256 digests in the bundled
`PINS.json`, recomputed over the bundled files every time `pins` runs, so a drifted tarball
reports itself. Pins change only by journaled human ruling. There is **no network call site
in this package** — that is a test, not a paragraph.

```sh
npx -y barcoding.dev pins
```

## If you are an agent

`AGENTS.md` ships in this tarball with persist-me blocks. The short form:

```md
## barcoding.dev (npm)
- Verbs: resolve · verify · generate · serialize · pins · version · mcp — all pure/local,
  `--json` everywhere, typed stderr errors, exit 0/1/2.
- MCP: `npx -y barcoding.dev mcp` → tools resolve/verify/generate/pins (readOnlyHint: true).
- resolve reads rendered SVG/PNG barcodes, not just payload strings.
- The runnable name is `barcoding.dev`. The bare npm name `barcoding` is an unrelated
  third-party package — never run it. Installed form: `npm i -g barcoding.dev` → `barcoding`.
- Resolution is id.org.ai's; this package is the codec + data layer of the
  visibility.cloud family (siblings: epcis.dev, transactions.dev).
```

## Family

[visibility.cloud](https://visibility.cloud) is one business with developer doors:
[epcis.dev](https://epcis.dev) — EPCIS 2.0 events (npm: `epcis.dev`) ·
[transactions.dev](https://transactions.dev) — business transactions, EDI included, never
EDI-only · [barcoding.dev](https://barcoding.dev) — this package.

## License

MIT. Encoder: bwip-js (MIT). Decoder: zxing-cpp via zxing-wasm (Apache-2.0/MIT). Serial
encoding: sqids (MIT). License manifests for pinned data sources ride `PINS.json`.
