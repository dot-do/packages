---
name: "@mdxui/text"
version: 0.1.0
description: "The agent face of mdxui: text registers (plain, md, ascii, unicode, ansi) over the Contract, the md register renderer received from mdx.org.ai @mdxui/markdown, Role fixtures for golden snapshots, and the one capability resolver (flag > Accept > agent env "
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdxui
  - text
  - markdown
  - ansi
  - cli
  - agent
  - capabilities
  - content-negotiation
  - terminal
  - unicode
  - plain-text
  - renderer
downloads:
  monthly: 125
published: "2026-09-09T11:37:54.573Z"
updated: "2026-09-09T11:37:54.860Z"
---

# @mdxui/text

The agent face of mdxui: text registers (`plain`, `md`, `ascii`, `unicode`, `ansi`) over the
Contract, and the **one capability resolver** that picks a register exactly once into a frozen
context. This package ships the resolver (`./capabilities`), the interim `md` register renderer
(`./md`, received from mdx.org.ai's `@mdxui/markdown` — that package name is retired, ending the
`@mdxld/markdown` vs `@mdxui/markdown` collision), and the Role fixture corpus every face snapshots
(`./fixtures`), and the one-walk core (`./core`, re-exported from the root): `render`, the Segment /
Strip IR, measure + layout, the register skins as data and the append-only transcript (ui-9ml4.2).

```bash
pnpm add @mdxui/text
```

## `@mdxui/text/capabilities`

```ts
import { resolveFromProcess, resolveCapabilities } from '@mdxui/text/capabilities'

// A CLI: exactly once, before dispatch. Reads process.env + the two TTY bits.
const caps = resolveFromProcess({ format: flags.format, agent: flags.agent, color: flags.color, noColor: flags.noColor })

// An HTTP face (hono, workers): once per request, from Accept alone.
const caps = resolveCapabilities({ accept: c.req.header('Accept') })
```

The result is frozen and carries **only presentation knobs, never data**, so the same inputs
produce the same bytes in every register:

| knob          | meaning                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------- |
| `register`    | `plain` \| `md` \| `ascii` \| `unicode` \| `ansi`                                            |
| `color`       | `0` \| `4` \| `8` \| `24` bits — nonzero only in `ansi`                                       |
| `unicode`     | may use box drawing / `—` / `✓` — true for `unicode`, and for `ansi` on a capable terminal  |
| `width`       | columns for the terminal registers; `Infinity` for `plain` / `md` (never wrap machine output) |
| `interactive` | may prompt — a **confident human only**                                                      |
| `stream`      | may repaint in place — a terminal register on a real stdout TTY, no agent, no CI             |
| `caller`      | `{ kind, harness, detectedBy, interactive }` — who is calling and which rung decided          |

### The ladder

The register is chosen by the first rung that applies:

1. `--format <register>` — an explicit flag wins;
2. `Accept: text/markdown` → `md`, `Accept: text/plain` → `plain` (highest `q` wins; wildcards and
   other types name no register and fall through — 406 is the server's call, never a silent downgrade);
3. an agent — `--agent` or any marker in `AGENT_ENV_MARKERS` / `CODEX_*` — → `md`. **Env beats TTY:
   an agent holding a PTY is still an agent**;
4. CI (`CI_MARKERS`) or a non-TTY stdout → `plain`;
5. the TTY probe → `ansi` when color is on, `unicode` when the locale / `TERM` can, else `ascii`.

Empty input resolves to **plain, no color, non-interactive**: under any ambiguity, behave as if piped.
A wrongly launched TUI blocks a harness forever; a wrong "agent" guess is one flag away from fixed.

### Color

`--no-color` and a **set** `NO_COLOR` (no-color.org: present and not the empty string) beat everything, including
`--color always`. Then `--color never` / `--color always` (at least 4 bits). Then `FORCE_COLOR`:
`0` → 0, `1` → 4, `2` → 8, `3` → 24 bits. Then what `TERM` / `COLORTERM` advertise. Color is
carried only by the `ansi` register; an `ansi` request that would carry no color demotes to
`unicode` / `ascii`, so the ansi renderer always paints and `strip(paint(x)) === x` holds.

### Caller

`resolveCaller` is the same ladder read for **who**: `--agent` → env marker → CI → `--format` →
Accept → TTY probe. `harness` is the marker that fired (`"CLAUDECODE"`, `"GITHUB_ACTIONS"`) or
`null` — never invented. `interactive` is true only when every confident-human clause holds: both
TTYs, no marker, no CI, no flag, no Accept.

### Errors

A bad `--format` or `--color` throws a `CapabilityError` with `code: 'USAGE'` and `exit: 2` before
any output, naming the valid values. `code` strings are stable across releases.

## Provenance

Lifted from kestrel `src/cli/{context,caller,errors}.ts` (ADR-0035 §a/§b, ADR-0052) and extended
for the five text registers, `Accept` negotiation, `FORCE_COLOR` levels and Unicode detection.
Shared by the mdxe CLI and `@mdxe/hono` in mdx.org.ai (mdx-8je.16 / mdx-8je.18) — one implementation.

## `@mdxui/text/md`

The `md` register: an already-parsed MDXLD document → clean markdown, string to string, without going
through HTML. It never imports an MDX parser itself — the body's markdown AST comes from `@mdxld/ast` (`src/no-parse.test.ts` enforces that for every face);
`mdxld` parses upstream and this takes the document it produced.

```ts
import { parse } from 'mdxld'
import { render, renderContent } from '@mdxui/text/md'

const doc = parse(source)          // upstream
const md = render(doc)             // frontmatter (expanded $id/$type/$context) + body
const body = renderContent(doc.content, { bulletChar: '*', jsxHandling: 'placeholder' })
```

Options: `includeFrontmatter`, `jsxHandling` / `expressionHandling` (`'strip' | 'placeholder' | 'raw'`),
`bulletChar`, `setextHeadings`, `thematicBreak`, `emphasisChar`, `strongChar`, `codeFence`.
`renderMarkdown` and `renderMd` alias `render`.

## `@mdxui/text/fixtures`

`ROLES` (`Hero`, `Features`, `Pricing`, `Testimonials`, `CTA`, `FAQ`) and `ROLE_FIXTURES`, one
MDXLD document per Role whose `data` is valid under the Contract's `mdxui/zod` schema (proved by
`src/fixtures/index.test.ts`). `@mdxui/html`, `@mdxui/json`, `@mdxui/slack`, `@mdxui/email` and this
package's `md` register each snapshot the corpus into their own `__snapshots__/` — the Phase 0 slop
gate (ui-3ems.1). Change the fixtures or a renderer and every affected golden must be re-approved
with `vitest run -u`.

### Round-trip identity with `@mdxld/extract`

The md register must be reversible by mdx.org.ai's extractor or bi-directional sync silently breaks
(ui-9ml4.5 / mdx-8je.12). `@mdxui/text/fixtures` publishes the contract between the two so both
repos run the same test — `src/fixtures/round-trip.test.ts` here, against `@mdxld/extract` from npm
(pinned exactly in `devDependencies`; bumping the pin re-runs the identity):

```ts
import { extract } from '@mdxld/extract'
import { render } from '@mdxui/text'
import { ROLE_FIXTURES, ROLE_MD_TEMPLATES, MD_EXTRACTORS, roundTripProps } from '@mdxui/text/fixtures'

const doc = ROLE_FIXTURES.Pricing
const result = extract({ template: ROLE_MD_TEMPLATES.Pricing, rendered: render(doc, 'md'), components: MD_EXTRACTORS })
result.data // deep-equals roundTripProps(doc): { data: props minus variant/columns/showToggle, content }
```

| export              | what it is                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `ROLE_MD_TEMPLATES` | one `@mdxld/extract` template per Role — the md register's exact byte shape; scalars are `{data.x}` slots, lists are component slots, the body is `{content}` |
| `MD_EXTRACTORS`     | the reverse of the four list shapes (`FeatureTable`, `TierSections`, `TestimonialQuotes`, `ItemSections`) — pass as `components`; without them a list is a visible unmatched slot |
| `roundTripProps`    | a fixture's props restricted to what the walk renders (`PRESENTATION_PROPS` removed, body trimmed as `extract` trims) |
| `ROUND_TRIP_GAPS`   | the published gap list below, as data — every entry is witnessed by a test, none absorbed by the identity assertion |

The identity holds for every Role fixture and for a seeded 40-variant property sweep per Role
(lists 0–3 long, optional fields present or absent, unicode / CJK / emoji / inline marks in values).
It is pinned to the renderer: a byte-changing md edit fails the template match, so the template and
the register move in lockstep.

**Known gaps** (`ROUND_TRIP_GAPS`) — what does not round-trip and where it routes:

| kind           | case                                                                                                  | route                          |
| -------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| presentation   | `variant` / `columns` / `showToggle` are not data; the walk never renders them                        | frontmatter — ui-v2xs decides  |
| loop           | a `{list.map(...)}` slot leaves its raw text in extract's regex: nothing matches, scalars included    | component slots + `MD_EXTRACTORS`, else `extractWithAI` |
| null           | an absent scalar renders `- badge: —` and comes back as the string `—`; an empty string fails the match | renderer                       |
| type           | expression slots are strings (`highlighted` is coerced by `TierSections`; a top-level number is not)  | renderer                       |
| reorder        | a moved key/value line or section fails the literal match — every slot unmatched (`matched: false`)   | `extractWithAI`                |
| join           | attribution is `author, title, company` with no labels (ui-l2lb); a comma inside a part shifts the split | renderer                    |
| structure      | `\|` in a cell, a value starting `- ` / `### ` / `> `, or `\n\n---\n\n` inside a value reads as structure (ui-9m4o) | renderer         |
| diff           | extract's `diff` compares lists by `JSON.stringify`, so key order inside list items is significant (`MD_EXTRACTORS` emit Contract order) | extractor — mdx-8je.12 |
| body           | no body → no rule → no match; body whitespace is trimmed                                             | renderer                       |

`extractWithAI` in `@mdxld/extract@1.9.1` is a stub (it flags `aiAssisted` and returns the pattern
result), so the `extractWithAI` route currently resolves nothing — tracked in mdx-8je.12.

## `@mdxui/text/core` — the one walk

One traversal of the Contract Roles feeds every text register (kestrel ADR-0052: one walk, format
adapters; never three hand-kept tree walkers). Borrowed shapes: Rich's measure/render two-pass and
`Segment` IR, Textual's `Strip`, Lip Gloss's border tables per style, Glamour's `notty`, Ink's
`Static` as the append-only transcript.

```ts
import { render, createTranscript, walkRole, tee } from '@mdxui/text'
import { resolveFromProcess } from '@mdxui/text/capabilities'

const caps = resolveFromProcess(flags)       // exactly once
const bytes = render(doc, caps)              // one Role document, or a page: render([hero, cta], caps)

render(doc, 'md')                            // a bare register name takes the register's defaults
render(doc, { register: 'ansi', width: 60, color: 4, unicode: true })

render(doc, 'html')                          // throws CapabilityError { code: 'FORMAT', exit: 2 }
                                             // "...servable registers: plain|md|ascii|unicode|ansi.
                                             //  html is the @mdxui/html face; json is structural output (@mdxui/json), not a register."
```

| piece                          | what it is                                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `walkRole(doc, sink)`          | the ONE walk: `begin → hero \| features \| pricing \| testimonials \| cta \| faq \| unknown → body → end`; every declared field passed, absent as `null` |
| `tee(...sinks)`                | one walk, N sinks — the document is read once no matter how many registers listen                                                                |
| `BlockSink`                    | Roles → register-neutral Blocks (heading, paragraph, key/value, table, quote, list, rule, raw); labels are the Contract's prop names            |
| `Segment` / `Strip` / `Block`  | the IR: a styled run, a rendered line, a structural unit — styles are semantic tones, never marks                                              |
| `cellWidth` / `wrapText`       | the single width/wrap function: CJK and emoji are 2 cells, marks 0, clusters never split; md and ascii tables agree on every column            |
| `layout(blocks, skin, width)`  | measure (max/min per column) → fit → strips; machine skins (`md`, `plain`) never wrap                                                            |
| `SKINS` / `BORDERS`            | every register difference as data: `+-\|` vs box drawing, bullets, heading marks, the unknown glyph (`—`, `-`, `n/a`), inline marks              |
| `stripAnsi` / `paint`          | `ansi` = the unicode (or ascii) bytes + SGR only; `strip(paint(x)) === x` for every fixture                                                      |
| `createTranscript(target)`     | append-only: `append(doc)` returns only the new lines; `text === render(everything appended)`; no `\r`, no cursor movement                     |

Rules the tests pin: a null field renders as the register's explicit unknown glyph after its label,
never blank; an empty list is `features: —`, never a missing section; a non-Role `$type` is surfaced
whole via `unknown`, never skipped; `json` is structural output and `html` is another face — the text
path throws for both, naming the servable set; the core stays ≤ 3k LOC (`src/core/loc.test.ts`).
Goldens: `src/core/__snapshots__/<Role>.<register>.txt`, one per Role per register.

The document body (`content`) passes through verbatim in every register — the faces never parse
MDX. Presentation-only props (`variant`, `columns`, `showToggle`) have no text rendering and are
not visited by the walk.

## `@mdxui/text/comprehension` — the screen is measured, not designed

The instrument behind the registers (ui-9ml4.4; kestrel ADR-0009 / ADR-0044). The typed core holds
every answer, so questions cost nothing to label: `QuestionSink` is the same one walk as the
registers, emitting one Q/A per Contract field the walk visits. Each register's bytes are then asked
every question — one screen, one question per call, exact match after presentation-only
normalization; a refusal scores wrong — and scored per **tokenizer-labelled** token. The primary
axis is comprehension-per-kilotoken: accuracy points per 1k screen tokens.

```ts
import { runComprehension, compare, questionsFor, cachedCounter } from '@mdxui/text/comprehension'
import { roleFixtures } from '@mdxui/text/fixtures'

const report = await runComprehension({ docs: roleFixtures(), model, counter })  // model: any { name, answer(ask) }
report.results.md.comprehensionPerKiloToken                                       // the number a register change is judged on
compare(previousMd, report.results.md).status                                     // 'ok' | 'improved' | 'regression' | 'content-changed' | 'method-changed'
```

| piece                          | what it pins                                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `questionsFor(doc)`            | Q/A from the props by the one walk; no yes/no questions; a null asks nothing; `assertNoLeak` — a question never contains its answer |
| the teeth                      | `measureOracle` (given props) must score 100; `measureBlind` (no screen) must score ≤ 10 — else `runComprehension` throws `TEETH`     |
| `measure(encoding)`            | the five registers at their golden targets, plus two baselines that are not registers: `raw-json` (no walk) and `prose` (the walk as sentences) |
| `TokenCounter` / `CountMethod` | every count is labelled `<tokenizer>:<encoding\|model>`; the committed `tokens.json` cache serves the offline test and a **miss throws** — nothing is ever estimated |
| `compare`                      | lower comprehension-per-kilotoken → `regression`; a changed question count → `content-changed`; a changed tokenizer → `method-changed` — neither is judged |
| `__baselines__/*.json`         | one file per encoding plus `blind` / `oracle`, written by `pnpm --filter @mdxui/text comprehension` with a real model                |

Authority is bounded: comprehension decides encoding knobs (marks, borders, width, color), never
content selection. The harness asks every question the walk labels — there is no filter — and the
baseline test pins the question count, so a register can never score better by showing less.

`src/comprehension/baseline.test.ts` pins the committed baseline to the current bytes: a register
edit that changes any screen fails offline, naming the fix — re-run the nightly
(`.github/workflows/comprehension.yml`, `ANTHROPIC_API_KEY`, `anthropic:count_tokens:<model>`) or
locally with a logged-in `claude` CLI (`claude-cli:usage-delta:<model>`), and commit the JSON. A run
whose comprehension-per-token fell for any register exits 1 and fails review. The two adapters carry
different tokenizer labels by construction, so the first run after switching adapters needs
`--allow-method-change`.

## `@mdxui/text/epoch` — the derived renderer epoch

The epoch that stamps rendering identity is **derived from the shipped adapters' bytes, never
hand-typed** (kestrel ADR-0052 §5):

```ts
import { RENDER_EPOCH } from '@mdxui/text' // 'sha256:<64 hex>'
import { renderCorpus, digestCorpus, compareManifests, RENDER_EPOCH_MANIFEST } from '@mdxui/text/epoch'
```

`renderCorpus()` renders every Role fixture through every shipped adapter — the five registers at the
goldens' targets plus the `md` document face, 36 entries — and `digestCorpus` turns it into a
manifest (one sha256 per `adapter:Role`) whose lines hash to the epoch. `src/epoch/pinned.ts` is
generated:

```bash
pnpm --filter @mdxui/text epoch:check   # CI: recompute, compare, fail with a per-entry line diff
pnpm --filter @mdxui/text epoch:write   # after a DELIBERATE render change: re-pin, then `pnpm changeset`
```

A byte-changing edit to any adapter — even one trailing space in one register — moves an entry
digest, so the epoch moves and the check fails until the pin is regenerated and the version is
bumped. The goldens and the epoch share one target table (`goldenTarget`), so they can never pin
different bytes.
