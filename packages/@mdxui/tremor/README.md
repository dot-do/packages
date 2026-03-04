---
name: "@mdxui/tremor"
version: 7.0.0
description: Tremor template wrappers implementing the mdxui interface - analytics dashboards, landing pages, and marketing sites
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdxui
  - tremor
  - react
  - dashboard
  - analytics
  - charts
  - components
downloads:
  monthly: 135
published: "2026-01-24T14:38:33.282Z"
updated: "2026-02-12T20:57:30.280Z"
---

# @mdxui/tremor

Tremor template wrappers implementing the mdxui interface. This package provides adapters that wrap [Tremor](https://www.tremor.so/) template components to conform to the `SiteComponents` and `AppComponents` interfaces defined by mdxui.

## What's Included

This package exports five template modules, each implementing specific use cases:

### Dashboard Template (`@mdxui/tremor/dashboard`)

A general-purpose SaaS dashboard implementing the `AppComponents` interface. Features flexible shell layouts with sidebar navigation, workspace switchers, and settings pages.

**Use for:** Admin dashboards, internal tools, SaaS applications

**Key Components:**
- `Shell` - Main layout container
- `ShellSidebarLeft` - Left sidebar navigation variant
- `ShellTopNav` - Top navigation variant
- `Sidebar` - Navigation sidebar with workspace/user management
- `Settings` - Settings page layout
- `AppComponents` - Pre-configured interface object

```typescript
import { AppComponents, Shell, Sidebar } from '@mdxui/tremor/dashboard'

// Use AppComponents interface with MDX
<MDXProvider components={AppComponents}>
  <App>
    <Shell>
      <Dashboard title="Analytics">
        {content}
      </Dashboard>
    </Shell>
  </App>
</MDXProvider>
```

### Insights Template (`@mdxui/tremor/insights`)

Analytics dashboard with charts, KPIs, and data tables. Optimized for displaying metrics, trends, and transaction data.

**Use for:** Analytics dashboards, reporting, business intelligence

**Key Components:**
- `Shell` - Analytics dashboard container
- `Sidebar` - Navigation for analytics sections
- `KPICard` - Metric/KPI display
- `AreaChart`, `BarChart`, `DonutChart`, `BarChartVariant`, `TransactionChart` - Data visualization
- `TransactionsTable` - Data table with sorting/filtering
- `components` - Pre-configured interface object

```typescript
import { components, Shell, Sidebar, KPICard } from '@mdxui/tremor/insights'

// Use with MDX
<MDXProvider components={components}>
  <Shell sidebar={<Sidebar items={navItems} />}>
    <KPICard title="Revenue" value="$25.5M" />
    <AreaChart data={chartData} />
    <TransactionsTable transactions={data} />
  </Shell>
</MDXProvider>
```

### Overview Template (`@mdxui/tremor/overview`)

Multi-section dashboard for cross-functional views like Support, Retention, Workflow, and Agents. Implementing the `AppComponents` interface with specialized section components.

**Use for:** Multi-team dashboards, operational overview, support platforms

**Key Components:**
- `Shell` - Top navigation shell layout
- `Sidebar` - Secondary navigation
- `Header` - Header bar
- `Dashboard` - Dashboard page layout
- `Settings` - Settings page
- `AgentsSection`, `RetentionSection`, `SupportSection`, `WorkflowSection` - Specialized dashboard sections
- `AppComponents` - Pre-configured interface object

```typescript
import { AppComponents } from '@mdxui/tremor/overview'

// Use with mdxui
<MDXProvider components={AppComponents}>
  <App>
    <Shell>
      <Dashboard title="Support">
        <SupportSection tickets={data} />
      </Dashboard>
    </Shell>
  </App>
</MDXProvider>
```

### Solar Template (`@mdxui/tremor/solar`)

Minimal landing page template implementing the `SiteComponents` interface. Focused on marketing sites and landing pages with hero sections, features, and CTA components.

**Use for:** Marketing sites, landing pages, product pages

**Key Components:**
- `Site` - Root site wrapper
- `Header` - Navigation header
- `Footer` - Site footer
- `LandingPage` - Landing page layout
- `Hero`, `HeroMinimal`, `HeroGradient` - Hero section variants
- `Features` - Features section
- `CTA` - Call-to-action section
- `components` - Pre-configured interface object

```typescript
import { components, Site, Hero, Features } from '@mdxui/tremor/solar'

// Use with mdxui
<MDXProvider components={components}>
  <Site name="My Product">
    <Hero
      headline="Build faster"
      subheadline="Ship with confidence"
      cta={{ primary: 'Get Started', primaryAction: '/signup' }}
    />
    <Features features={featureList} />
  </Site>
</MDXProvider>
```

### Database Template (`@mdxui/tremor/database`)

Marketing site template implementing the `SiteComponents` interface. Provides core layout components for content-heavy marketing sites.

**Use for:** Marketing sites, documentation, content sites, product homepages

**Key Components:**
- `Site` - Root site wrapper
- `Header` - Navigation header
- `Footer` - Site footer
- `LandingPage` - Landing page layout
- `Page` - Generic page layout
- `components` - Pre-configured interface object

```typescript
import { components, Site, Page } from '@mdxui/tremor/database'

// Use with mdxui
<MDXProvider components={components}>
  <Site name="My Product">
    <Page title="About Us">
      {content}
    </Page>
  </Site>
</MDXProvider>
```

## Installation

```bash
npm install @mdxui/tremor @mdxui/primitives @tremor/react
```

## Usage

### Basic Setup

Import the template you need and use it with MDX:

```typescript
import { AppComponents } from '@mdxui/tremor/dashboard'
import { MDXProvider } from '@mdx-js/react'

export function App() {
  return (
    <MDXProvider components={AppComponents}>
      {/* Your content */}
    </MDXProvider>
  )
}
```

### Per-Template Imports

Each template is exported as a separate entry point to avoid conflicts:

```typescript
// App templates (AppComponents interface)
import { AppComponents as DashboardComponents } from '@mdxui/tremor/dashboard'
import { AppComponents as OverviewComponents } from '@mdxui/tremor/overview'

// Site templates (SiteComponents interface)
import { components as SolarComponents } from '@mdxui/tremor/solar'
import { components as DatabaseComponents } from '@mdxui/tremor/database'

// Analytics template
import { components as InsightsComponents } from '@mdxui/tremor/insights'
```

### Shared Utilities

The `shared` export provides utilities available across all templates:

```typescript
import { /* shared utilities */ } from '@mdxui/tremor/shared'
```

## Component Variants

Many components offer multiple visual variants. Check individual component stories in the package for variant examples and usage patterns.

## Testing

This package uses test-driven development (TDD) with:
- **Unit tests** - Component behavior validation
- **Visual tests** - Playwright snapshot testing
- **Type checking** - TypeScript for prop validation

Run tests with:

```bash
pnpm --filter @mdxui/tremor test          # Unit tests
pnpm --filter @mdxui/tremor test:watch    # Watch mode
pnpm --filter @mdxui/tremor test:visual   # Visual tests
```

## Architecture

All templates in this package:

1. **Wrap Tremor components** - Use Tremor's pre-built template patterns as the foundation
2. **Implement mdxui interfaces** - Conform to `AppComponents` (for dashboards) or `SiteComponents` (for sites)
3. **Provide type-safe props** - Use TypeScript for IDE autocomplete and compile-time validation
4. **Support variant patterns** - Offer multiple visual and behavioral configurations
5. **Maintain Tremor compatibility** - Work seamlessly with Tremor's ecosystem and styling

## Type Safety

The package provides full TypeScript support with exported prop types:

```typescript
import type {
  ShellProps as DashboardShellProps,
  SidebarProps as DashboardSidebarProps,
  DashboardComponents
} from '@mdxui/tremor/dashboard'
```

## Related Packages

- [`mdxui`](https://github.com/dot-do/ui/tree/main/packages/mdxui) - Core interfaces and type contracts
- [`@mdxui/primitives`](https://github.com/dot-do/ui/tree/main/packages/primitives) - Low-level UI components
- [`@mdxui/widgets`](https://github.com/dot-do/ui/tree/main/packages/widgets) - Complex interactive widgets
- [`@mdxui/beacon`](https://github.com/dot-do/ui/tree/main/packages/beacon) - Marketing site templates
- [`@mdxui/cockpit`](https://github.com/dot-do/ui/tree/main/packages/cockpit) - Developer dashboard templates

## License

MIT
