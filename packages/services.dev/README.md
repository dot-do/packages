---
name: services.dev
version: 0.3.0
description: "The Services-as-Software framework: write one Service(), AI delivers every job, and people or their agents pay when it's done. A person is one more line, wherever you want or need one."
license: UNLICENSED
homepage: "https://services.dev"
downloads:
  monthly: 823
published: "2026-10-24T18:45:48.436Z"
updated: "2026-10-27T12:30:30.160Z"
---

# services.dev

Write one `Service()`. AI delivers every job, and people or their agents pay when it's done. A person is one more line, wherever you want or need one.

```ts
import { Service } from 'services.dev'

export default Service({
  name: 'Translation',
  input: { document: 'file', to: 'language: a BCP 47 tag, such as fr-CA' },
  output: { document: 'file' },
  price: 49,
})
```

That file is a Site, an API, an MCP server and an app for your buyers.

## Try it

In an empty folder, `npx services.dev` writes that file and serves it, and an agent orders the first job. In a second terminal, accept it.

<!-- captured:walk -->
```
$ mkdir lingua && cd lingua
$ npx services.dev
  wrote   package.json · services/translation.ts · services/translation.md · AGENTS.md
lingua · AI delivers every job.
  site    http://localhost:8787/translation
  api     POST http://localhost:8787/jobs {"service":"translation"}
  key     sk_test_7Hq2 · a call with no key uses it, on localhost only
  mcp     http://localhost:8787/mcp · stdio: npx services.dev mcp
  cli     npx services.dev translation k=v …
  sdk     connect({ origin: 'http://localhost:8787' }).translation.order(input)
  docs    http://localhost:8787/llms.txt
  buyers  http://localhost:8787/portal
  you     http://localhost:8787/console
  AI and money are simulated until you wire them. $0.42 a call is an example.

an agent ordered Translation at $49
job_7Hq2 · delivered · document.fr-CA.pdf · $49.00 charged
  record  draft · ai | review · ai · pass
  ledger  +$49.00 · AI $0.84 · you $48.16
  next    npx services.dev accept job_7Hq2

$ npx services.dev accept job_7Hq2
job_7Hq2 · accepted · document.fr-CA.pdf · $49.00 final

$ npx services.dev check
services/translation.ts · 4 lines · $49 per job, within 48 hours, charged on delivery.
  who     AI delivers every job.
  steps   draft · ai → review · ai · adversarial
  agent   order_translation · 24 of 30 words · bought job_7Hq2 · $49.00 · no person
  ledger  +$49.00 · AI $0.84 (example) · you $48.16
  margin  at least $39.20 a job (80%) · a job that stops costs you at most $9.80
  apps    customer portal · owner console

mcp     13 buyer tools · 4,482 of 8,000 tokens · 4 more with ?toolset=sandbox
✓ ready to sell · 1 Service · AI delivers it alone · it keeps at least 80% of every job
  next    npx services.dev dev

AI and money are simulated until you wire them. $0.42 a call is an example.

(an empty folder to a delivered job: 0.6 s)
```

## Agents

An agent reads this in `tools/list`, orders, waits and accepts with no person on either side.

<!-- captured:transcript -->
```
→ GET /.well-known/agents.json
← 200 · lingua · mcp http://localhost:8787/mcp
→ initialize
← lingua · "Without max_usd you get an OFFER: send its next call unchanged to order."
→ tools/list
← order_translation  "Translation: send a document and a language; get a document back. $49 per job, within 48 hours, charged on delivery. AI delivers every job."
  get_job · accept_job · send_back_job · cancel_job · and 8 more
→ order_translation {document: document.pdf, to: "fr-CA", key: "lease-fr-CA"}
← OFFER · $49 per job, within 48 hours, charged on delivery.
  next: order_translation {document: document.pdf, to: "fr-CA", max_usd: 49, key: "lease-fr-CA"}
→ order_translation {document: document.pdf, to: "fr-CA", max_usd: 49, key: "lease-fr-CA"}
← job_7Hq2 · working · $49.00 held
→ get_job {id: "job_7Hq2", wait: 50}
← job_7Hq2 · delivered · document.fr-CA.pdf · $49.00 charged
  stage: review · payment: charged $49
→ accept_job {id: "job_7Hq2"}
← job_7Hq2 · accepted · document.fr-CA.pdf · $49.00 final
```

## Commands

```txt
You                        npx services.dev · init · dev · check
A buyer, or their agent    order · accept · send-back · cancel
Where you wrote human      approve
```

Simulated AI and money on localhost · Node 22.18+
