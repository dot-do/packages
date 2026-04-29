---
name: mdxui
version: 6.1.0
description: Higher-order abstractions for Business-as-Code. Type-safe components that abstract entire business domains.
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdx
  - react
  - typescript
  - components
  - ui
  - design-system
  - platform-do
  - zod
  - site
  - app
  - saas
  - dashboard
downloads:
  monthly: 265
published: "2025-05-20T20:13:24.684Z"
updated: "2026-01-29T20:32:26.721Z"
---

# mdxui

> **Vibe Code Your One-Person Unicorn Into Reality**

Stop wiring primitives. Start declaring businesses.

Traditional components are buttons, forms, and cards. But your business isn't made of buttons—it's made of **Agents**, **Services**, **Workflows**, and **Integrations**.

**mdxui lifts the abstraction to where your business actually lives.**

```tsx
<Startup name="Acme Analytics" domain="acme.analytics" />
<Agent name="DataAnalyst" role="Analyze metrics and generate insights" />
<Service name="Analytics API" endpoints={[track, identify, query]} />
<Dashboard metrics={[mrr, churn, nps]} />
```

Each component deploys real infrastructure. **Type-safe. Auto-wired. Production-ready.**

## Installation

```bash
npm install mdxui
```

## Why mdxui?

### Build at the Speed of Thought

Write what you mean, not how to build it:

```tsx
// Instead of wiring auth, billing, dashboards, APIs...
<SaaS
  name="My Product"
  pricing={[free, pro, enterprise]}
  features={[analytics, exports, integrations]}
/>

// Instead of building agent frameworks from scratch...
<Agent
  name="CustomerSuccess"
  role="Handle support tickets and escalate when needed"
  tools={[searchDocs, createTicket, escalateToHuman]}
/>
```

### One Interface, Many Implementations

mdxui defines the **what**. Template packages provide the **how**:

- `@mdxui/beacon` — Marketing sites, landing pages, docs
- `@mdxui/cockpit` — SaaS dashboards, admin panels, developer portals

Same props. Different designs. Swap templates without changing content.

### AI-Native by Design

Every schema includes `.describe()` for AI consumption. LLMs understand your components:

```tsx
// AI can generate valid props from natural language
const heroProps = await ai.generate(HeroPropsSchema, "A bold hero for a developer tool")
```

## Component Types

### Domain Components

Components that represent entire business models, not UI widgets:

```tsx
<Startup />     // Venture-backed company with billing, auth, dashboards
<Agency />      // Service business with clients and projects
<Marketplace /> // Multi-sided platform with buyers and sellers
<SaaS />        // Software-as-a-Service with subscriptions
<Platform />    // Developer platform with APIs and SDKs
```

### Agent Components

AI-native primitives that execute business logic autonomously:

```tsx
<Agent />       // AI agent with tools and capabilities
<Workflow />    // Multi-step automated process
<Function />    // Serverless function execution
<Trigger />     // Event-driven automation
```

### Service Components

Services-as-Software that connect and compose seamlessly:

```tsx
<API />         // REST/GraphQL API endpoint
<Integration /> // Third-party service connection
<Webhook />     // Event-driven notification
<MCP />         // Model Context Protocol server
```

## Site Components

Build marketing sites, landing pages, blogs, and documentation:

```tsx
import type { SiteComponents } from 'mdxui'

const components: SiteComponents = {
  // Layout
  Site, Header, Footer, LandingPage, Page,

  // Sections
  Hero, Features, Pricing, Testimonials, CTA, FAQ,

  // Content
  Blog, BlogPost, Docs, DocsPage,
}
```

**14 site types** optimized for specific use cases: Marketing, Docs, Blog, Directory, Marketplace, Community, Portfolio, Personal, Event, Story, API, Agent, Agency, Platform.

## App Components

Build SaaS dashboards, admin panels, and developer portals:

```tsx
import type { AppComponents } from 'mdxui'

const components: AppComponents = {
  // Layout
  App, Shell, Sidebar, Header, Dashboard, Settings,

  // Developer features (auto-wire to Platform.do collections)
  APIKeys, Webhooks, Usage, Team, Billing,
}
```

**17 app types** with pre-configured views: Dashboard, Developer, Admin, SaaS, Data, Headless, CRM, Booking, Support, Agency, Ops, Agent, Workflow, Infra, Platform, ClientPortal, VibeCode.

## Auto-Wiring

Components marked with `@autowire` automatically query Platform.do collections:

```tsx
// Blog component auto-fetches from 'posts' collection
<Blog />

// APIKeys component auto-fetches from 'apiKeys' collection
<APIKeys />
```

No manual data fetching. No prop drilling. Just declare what you need.

## Runtime Validation

Every component has a Zod schema for runtime validation:

```tsx
import { HeroPropsSchema, DashboardPropsSchema } from 'mdxui/zod'

// Validate props at runtime
const result = HeroPropsSchema.safeParse(props)
if (!result.success) {
  console.error(result.error)
}

// Generate TypeScript types
type HeroProps = z.infer<typeof HeroPropsSchema>
```

## Exports

```tsx
// Type interfaces
import type { SiteComponents, AppComponents } from 'mdxui'

// Component props
import type { HeroProps, DashboardProps, AgentProps } from 'mdxui'

// Common types
import type { Component, CTA, NavItem, ThemeMode } from 'mdxui'

// Zod schemas for validation
import { HeroPropsSchema, DashboardPropsSchema } from 'mdxui/zod'

// Auto-wiring configuration
import { siteAutoWiring, appAutoWiring } from 'mdxui'
```

## MDXLiveRenderer

Real-time MDX preview for live editing experiences:

```tsx
import { MDXLiveRenderer } from 'mdxui'

<MDXLiveRenderer
  content={mdxContent}
  components={siteComponents}
  debounceMs={300}
  loadingComponent={<Spinner />}
  errorComponent={({ error }) => <ErrorMessage error={error} />}
/>
```

### Security Note

`MDXLiveRenderer` uses dynamic code evaluation for real-time preview. Safe for admin panels and development tools. Not recommended for user-submitted content without sandboxing. See [Security Considerations](#security-considerations) below.

## Ecosystem

mdxui is the foundation for building one-person unicorns:

| Tool | Purpose |
|------|---------|
| [mdxui.dev](https://mdxui.dev) | Documentation and playground |
| [schema.org.ai](https://schema.org.ai) | Define your domain with semantic schemas |
| [Platform.do](https://platform.do) | Deploy business logic as code |
| [Agents.do](https://agents.do) | Hire AI agents |
| [Services.Studio](https://services.studio) | Design AI services |
| [SaaS.Studio](https://saas.studio) | Build your SaaS |
| [Startups.Studio](https://startups.studio) | Launch your unicorn |

## Security Considerations

The `MDXLiveRenderer` component uses `new Function()` for real-time MDX preview.

**Safe for:**
- Admin panels with authenticated users (e.g., Platform.do)
- Development tools and local preview
- Internal applications with trusted content

**Not safe for:**
- User-submitted content without sandboxing
- Public-facing applications rendering untrusted MDX
- Environments with strict CSP (requires `script-src 'unsafe-eval'`)

## Content/Actions Pattern

mdxui separates **what to display** (content) from **what to do** (actions) because they're authored by different actors:

- **Content** → AI/LLM, MDX authors, CMS editors
- **Actions** → Developers wiring behavior

### The Pattern

```typescript
type ComponentProps = {
  // Content (root level) - AI/MDX-generatable
  title: ReactNode
  subtitle?: ReactNode
  callToAction: ReactNode
  variant?: 'default' | 'centered' | 'split'

  // Behavior (grouped) - Developer-wired
  actions?: {
    primary?: string | { href: string, onClick?: () => void }
    secondary?: string | { href: string, onClick?: () => void }
  }
}
```

### Why This Matters

**Safe spreading**: AI-generated content can be spread without overriding behavior:
```tsx
<Hero {...aiContent} actions={{ primary: '/signup' }} />
```

**Two schemas**: Components export both TypeScript types (full) and Zod schemas (content-only):
```tsx
import type { HeroProps } from 'mdxui'
import { HeroContentSchema } from 'mdxui/zod'

// AI generates content only
const content = await ai.generate(HeroContentSchema, prompt)

// Developer wires behavior
<Hero {...content} actions={{ primary: '/signup' }} />
```

### Naming Rules

**Content props** (root level):
- Use full words: `callToAction` not `cta`
- Use semantic names: `title`, `subtitle`, `description`
- Accept `ReactNode` (strings, JSX, icons, formatted text)

**Action props** (grouped):
- Grouped in `actions` object
- Accept `string | ActionConfig`
- Always optional with sensible defaults

**Variants**:
- Describe content structure: `code-below`, `video-beside`, `image-split`
- NOT positional: avoid `variant-1`, `split-left`, `two-column`

See the [Component Design Guide](/docs/guides/component-design) for wrapping/transforming components.

## Component Patterns

When adapting external components to the mdxui interface, use one of two patterns:

### Wrap Pattern

Use when the underlying component has similar props and minimal transformation is needed. The wrapper accepts mdxui props and delegates directly to the underlying component.

**When to use:**
- Props are structurally similar between mdxui and the target component
- Little to no business logic required
- Simple prop renaming or defaulting

**Example: Wrapping a Button**

```tsx
import type { ButtonProps } from 'mdxui'
import { Button as ShadcnButton } from '@/components/ui/button'

export function Button({ variant, size, children, ...props }: ButtonProps) {
  return (
    <ShadcnButton variant={variant} size={size} {...props}>
      {children}
    </ShadcnButton>
  )
}
```

### Transform Pattern

Use when significant prop mapping, variant selection, or business logic is needed. Separates mapping logic into a dedicated `mappers.ts` file.

**When to use:**
- Props require structural transformation (e.g., `title` -> `headline`)
- Multiple underlying components selected by variant
- Complex business logic for prop derivation
- Action objects need URL resolution

**Example: Transforming Hero Props**

```tsx
// mappers.ts
import type { HeroProps } from 'mdxui'

export const HERO_VARIANT_MAP = {
  default: 'HeroSimpleCentered',
  centered: 'HeroCenteredWithPhoto',
  split: 'HeroTwoColumnWithPhoto',
} as const

export function mapHeroProps(props: HeroProps) {
  const { title, subtitle, callToAction, actions, variant = 'default' } = props

  return {
    variant: HERO_VARIANT_MAP[variant],
    props: {
      headline: title,              // Renamed prop
      subheadline: subtitle,        // Renamed prop
      primaryButton: callToAction ? {
        text: callToAction,
        url: resolveActionUrl(actions?.primary),  // Derived prop
      } : undefined,
    },
  }
}

// hero.tsx
import { mapHeroProps } from './mappers'
import { HeroSimpleCentered, HeroCenteredWithPhoto } from './components'

export function Hero(props: HeroProps) {
  const { variant, props: heroProps } = mapHeroProps(props)

  switch (variant) {
    case 'HeroCenteredWithPhoto':
      return <HeroCenteredWithPhoto {...heroProps} />
    default:
      return <HeroSimpleCentered {...heroProps} />
  }
}
```

### Decision Guide

| Scenario | Pattern | Rationale |
|----------|---------|-----------|
| Props match 1:1 | Wrap | No transformation needed |
| Simple renames (2-3 props) | Wrap | Inline mapping is readable |
| Complex prop derivation | Transform | Separate mapper keeps component clean |
| Multiple variant components | Transform | Variant map centralizes selection logic |
| Action URL resolution | Transform | Business logic belongs in mapper |
| Testable mapping logic | Transform | Mappers can be unit tested in isolation |

### File Organization

For the Transform pattern, organize files as:

```
adapters/
  hero/
    index.ts          # Re-exports
    hero.tsx          # Component (uses mappers)
    mappers.ts        # Pure transformation functions
    mappers.test.ts   # Unit tests for mappers
    hero.stories.tsx  # Storybook stories
```

## Type Validation Notes

Some Zod schemas use `z.any()` for React-specific types (children, components, event handlers) that cannot be validated at runtime. Type safety for these fields is enforced at compile time via TypeScript.

## Documentation

Full documentation at [mdxui.dev](https://mdxui.dev)

## Architecture

mdxui sits at the **interface layer** of the stack - it defines type contracts that other packages implement.

```
┌─────────────────────────────────────────────────────────────────┐
│              ★ mdxui (interfaces) ← YOU ARE HERE                 │
│   DataProvider, AuthProvider, SiteComponents, AppComponents,     │
│   AdminComponents - Type contracts and Zod schemas               │
└─────────────────────────────────────────────────────────────────┘
                              ↓ implements
┌─────────────────────────────────────────────────────────────────┐
│                  @mdxui/primitives (raw UI)                      │
│   Button, Card, Dialog, Input, Table, Sidebar, etc.              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│                   @mdxui/app (app framework)                     │
│   <App/>, Shell, Sidebar, useDataProvider(), useAuth()           │
└─────────────────────────────────────────────────────────────────┘
                              ↓ extends
┌─────────────────────────────────────────────────────────────────┐
│                  @mdxui/admin (admin patterns)                   │
│   <Admin/>, <Resource/>, CRUD views, DatabaseGrid                │
└─────────────────────────────────────────────────────────────────┘
                              ↓ implements
┌─────────────────────────────────────────────────────────────────┐
│                   mdxui/do (dotdo embedded)                      │
│   @mdxui/admin + @dotdo/react/tanstack pre-wired                 │
└─────────────────────────────────────────────────────────────────┘
```

### What mdxui Provides

| Export | Purpose |
|--------|---------|
| `SiteComponents` | Interface for marketing sites (@mdxui/beacon implements) |
| `AppComponents` | Interface for user-facing apps |
| `AdminComponents` | Interface for admin dashboards |
| `DataProvider` | Interface for data fetching (platform adapters implement) |
| `mdxui/zod` | Zod schemas for runtime validation and AI generation |

### Key Principle

mdxui contains **zero runtime code**. It's purely types, interfaces, and schemas. This ensures:
- No bundle size impact for consumers who only need types
- Clean separation between contracts and implementations
- Platform-agnostic interfaces that any backend can implement

## License

MIT © [MDX.org.ai](https://mdx.org.ai)
