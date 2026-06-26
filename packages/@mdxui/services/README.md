---
name: "@mdxui/services"
version: 0.6.0
description: "Services site template — the Services dialect of the @mdxui template family. Higher-order, outcome-led landing components (ServiceHero, Problem, WhatYouGet, HowItWorks, Defensibility, ReportPricing, Faq, FinalCta) that expose Services-semantic props and c"
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdxui
  - react
  - landing-page
  - services
  - ai
  - marketing
  - components
  - templates
downloads:
  monthly: 1080
published: "2026-05-29T12:50:14.249Z"
updated: "2026-06-23T18:11:54.332Z"
---

# @mdxui/services

The **Services dialect** of the `@mdxui` template family ([ADR 0003](https://github.com/dot-do/startup-sites/blob/main/docs/adr/0003-template-dialects-and-per-archetype-packages.md) §3).

Higher-order, **outcome-led** landing components that expose Services-semantic
props and compose `@mdxui/neo`'s design language — **not** thin neo re-exports.
A probate valuation has no SDK, no `npm install`, no MCP nav; this dialect speaks
the Services grammar (eyebrow → headline → outcome predicate, a Defensibility
two-up, "per report, no subscription" pricing, an intake funnel) instead of
neo's dev-first rulebook.

Extracted from [carriage](https://github.com/dot-do/carriage)'s battle-tested
`src/chassis/` — proven across 7 products + 4 example services + 26 snapshot
baselines. The Zod schemas in `./schemas` **are** the dialect's prop contract;
they were authored in carriage's `mdxui-bridge/extensions` and promoted here
verbatim (every `upstream-proposal` comment documents why the Services shape
differs from neo/mdxui's).

## Usage

```tsx
import { ServicesLandingView } from '@mdxui/services'

// The host keeps its derive layer; the package owns the narrative arc.
const content = deriveCatalog(svc) // → ServicesLandingContent
return <ServicesLandingView content={content} />
```

`ServicesLandingView` renders the full arc from one validated content bag:

```
masthead → hero → problem → what-you-get → how-it-works → defensibility
        → pricing → faq → final-cta → footer
```

Individual blocks (`Hero`/`ServiceHero`, `Problem`, `WhatYouGet`, `HowItWorks`,
`Defensibility`, `Pricing`/`ReportPricing`, `Faq`, `FinalCta`, `Masthead`,
`Footer`, `ScrollHeader`) are exported from `./components` for bespoke layouts.

## Subpath exports

- `@mdxui/services` — the view + all components + `parseProps` + `schemas`
- `@mdxui/services/components` — the higher-order Services blocks
- `@mdxui/services/schemas` — the Zod prop contract (no runtime/React imports)
- `@mdxui/services/shared` — `ScrollReveal`, `SectionEyebrow`, `SvgInline`

## Theming

Components read the same CSS-variable contract `@mdxui/themes` emits
(`--ink`/`--accent`/`--cta-*`/`--font-*`, the Tailwind tokens `text-ink`,
`bg-cta`, `border-line`, …), so a host's per-service theme propagates unchanged.

## Endpoints stay in the host

The package ships UI + the prop contract. Checkout/upload/connect endpoints
(`/api/checkout`, `/api/upload-logo`, `/api/connect/*`) are platform concerns —
the form components accept them as props/callbacks so the package deploys in any
host.
