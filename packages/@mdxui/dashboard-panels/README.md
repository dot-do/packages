---
name: "@mdxui/dashboard-panels"
version: 6.0.0
description: Dashboard component library for screenshot generation and marketing visuals.
downloads:
  monthly: 181
published: "2026-01-24T14:38:06.289Z"
updated: "2026-01-24T14:38:06.569Z"
---

# @mdxui/screenshots

Dashboard component library for screenshot generation and marketing visuals.

> **Note**: This package is in active development. Core components (grids, KPIs, charts, tables) are currently being migrated from `apps/screenshots`. See [Component Status](#component-status) below.

## Features

- **90+ dashboard components** - KPIs, charts, tables, lists, and more
- **35+ grid layouts** - From simple columns to complex bento grids
- **Multiple variants** - 9 sidebars, 4 headers, browser frames
- **Type-safe** - Full TypeScript with mdxui prop types
- **Visual regression tested** - Pixel-perfect consistency guaranteed
- **Theme-ready** - Compatible with shadcn/ui CSS variables

## Installation

```bash
pnpm add @mdxui/screenshots @mdxui/primitives
# or
npm install @mdxui/screenshots @mdxui/primitives
```

### Peer Dependencies

```json
{
  "@mdxui/primitives": "^0.0.0 || ^1.0.0",
  "react": "^18.0.0 || ^19.0.0"
}
```

## Quick Start

```tsx
import { DashboardShell, BrowserFrame } from '@mdxui/screenshots'
import { BreadcrumbHeader } from '@mdxui/screenshots/headers'
import { FullSidebar } from '@mdxui/screenshots/sidebars'

export function DashboardDemo() {
  return (
    <BrowserFrame url="app.example.com.ai">
      <DashboardShell
        sidebar={<FullSidebar />}
        header={<BreadcrumbHeader items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Analytics' }
        ]} />}
      >
        <div className="p-4">
          {/* Your dashboard content */}
        </div>
      </DashboardShell>
    </BrowserFrame>
  )
}
```

## Component Catalog

### Layout Components

#### Shell & Frames
```tsx
import { DashboardShell } from '@mdxui/screenshots/shell'
import { BrowserFrame } from '@mdxui/screenshots/frames'
```

- **DashboardShell** - Complete dashboard layout with sidebar, header, and content
- **BrowserFrame** - Browser window chrome for screenshots

#### Grid Layouts (35+)

> **Status**: Coming soon - Currently in `apps/screenshots`, migration in progress

| Pattern | Component | Slots | Description |
|---------|-----------|-------|-------------|
| Single row | `Grid1`, `Grid2`, `Grid3`, `Grid4` | 1-4 | Horizontal layouts |
| Square | `Grid2x2`, `Grid3x3`, `Grid4x4` | 4-16 | Symmetric grids |
| Asymmetric | `Grid1x2`, `Grid2x1`, `Grid3x1` | 2-4 | Multi-row layouts |
| Complex | `Grid1x2x1`, `Grid2x2x1`, `Grid3x2x1` | 4-6 | Mixed rows |
| Special | `GridBento`, `GridSplit13`, `GridSplit23` | 2-5 | Bento/sidebar layouts |

### Header Variants

```tsx
import {
  BreadcrumbHeader,
  TabsHeader,
  SearchHeader,
  MinimalHeader
} from '@mdxui/screenshots/headers'
```

- **BreadcrumbHeader** - Navigation breadcrumbs with optional actions
- **TabsHeader** - Tab-based page navigation
- **SearchHeader** - Search-focused header with global search
- **MinimalHeader** - Clean, minimal header

Example:
```tsx
<BreadcrumbHeader
  items={[
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics' }
  ]}
/>

<TabsHeader
  tabs={[
    { value: 'overview', label: 'Overview' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'reports', label: 'Reports' }
  ]}
  defaultValue="overview"
/>
```

### Sidebar Variants

> **Status**: Coming soon - Currently in `apps/screenshots`, migration in progress

```tsx
import {
  FullSidebar,
  CompactSidebar,
  IconOnlySidebar,
  GroupedSidebar,
  MinimalSidebar,
  DropdownsSidebar,
  FileTreeSidebar,
  WorkspacesSidebar,
  CalendarSidebar
} from '@mdxui/screenshots/sidebars'
```

- **FullSidebar** - Complete navigation with labels, icons, badges
- **CompactSidebar** - Condensed labels, full icons
- **IconOnlySidebar** - Icons only, tooltips on hover
- **GroupedSidebar** - Organized by section groups
- **MinimalSidebar** - Clean, minimal navigation
- **DropdownsSidebar** - Collapsible dropdown sections
- **FileTreeSidebar** - Hierarchical file tree navigation
- **WorkspacesSidebar** - Multi-workspace switcher
- **CalendarSidebar** - Calendar-focused sidebar

### KPI Components

> **Status**: Coming soon - Currently in `apps/screenshots`, migration in progress

```tsx
import {
  KpiCard,
  KpiMini,
  KpiSparkline,
  KpiProgress,
  KpiStatus,
  KpiStats
} from '@mdxui/screenshots/panels/kpi'
```

- **KpiCard** - Standard KPI with icon, value, and change indicator
- **KpiMini** - Compact single-stat display
- **KpiSparkline** - KPI with inline sparkline chart
- **KpiProgress** - KPI with progress bar toward goal
- **KpiStatus** - Health score with color-coded indicator
- **KpiStats** - KPI with area chart background

Example:
```tsx
<KpiCard
  label="Revenue"
  value="$45,231"
  change="+20.1%"
  changeType="positive"
  icon={<DollarSign />}
/>

<KpiSparkline
  label="Active Users"
  value="2,350"
  data={[120, 150, 180, 200, 220, 240]}
  trend="up"
/>
```

### Chart Components

> **Status**: Coming soon - Currently in `apps/screenshots`, migration in progress

```tsx
import {
  ChartLine,
  ChartLineMulti,
  ChartBar,
  ChartBarGrouped,
  ChartBarStacked,
  ChartAreaGradient,
  ChartAreaStacked,
  ChartPie,
  ChartDonut,
  ChartRadial,
  ChartRadar,
  Timeline
} from '@mdxui/screenshots/panels/charts'
```

**Line Charts**
- ChartLine, ChartLineMulti

**Bar Charts**
- ChartBar, ChartBarGrouped, ChartBarStacked
- ChartBarHorizontal, ChartBarLabel, ChartBarMultiple

**Area Charts**
- ChartAreaGradient, ChartAreaStacked, ChartAreaFull

**Circular Charts**
- ChartPie, ChartDonut (ChartDonutFull)
- ChartRadial, ChartRadialStacked

**Other**
- ChartRadar, Timeline, ChartComparisonFull

Built on [Recharts](https://recharts.org/) with responsive sizing and theme integration.

### Table Components

> **Status**: Coming soon - Currently in `apps/screenshots`, migration in progress

```tsx
import { DataTableFull } from '@mdxui/screenshots/panels/tables'
import {
  CellBadge,
  CellProgress,
  CellSparkline,
  CellUser,
  CellStatus,
  // ... 20+ cell types
} from '@mdxui/screenshots/cells'
```

**Table Components**
- DataTableFull - Full-featured data table
- TablePagination - Pagination controls
- TableColumnHeader - Sortable column headers
- ExpandableRow - Expandable row details

**Cell Types** (20+)
- CellText, CellLink, CellBadge, CellStatus, CellPriority
- CellProgress, CellRating, CellDelta, CellTrend
- CellDate, CellDateTime, CellDuration, CellRelativeTime
- CellUser, CellSparkline, CellBarSpark
- CellCheckbox, CellActions, CellSecret, CellTokensBreakdown

### List Components

> **Status**: Coming soon - Currently in `apps/screenshots`, migration in progress

```tsx
import {
  ListSimple,
  ListNotifications,
  ListTasks,
  ListLeaderboard,
  ListWorkStream,
  ListMetrics
} from '@mdxui/screenshots/panels/lists'
```

- **ListSimple** - Basic list layout
- **ListNotifications** - Notification feed with timestamps
- **ListTasks** - Task list with checkboxes and priorities
- **ListLeaderboard** - Ranked list with avatars and scores
- **ListWorkStream** - Activity stream with timeline
- **ListMetrics** - Metric comparison list

## Sub-path Imports

The package uses sub-path exports for tree-shaking:

```tsx
// Specific sub-modules
import { Grid2x2 } from '@mdxui/screenshots/grids'
import { KpiCard } from '@mdxui/screenshots/panels/kpi'
import { ChartLine } from '@mdxui/screenshots/panels/charts'
import { DataTableFull } from '@mdxui/screenshots/panels/tables'
import { ListTasks } from '@mdxui/screenshots/panels/lists'
import { CellBadge } from '@mdxui/screenshots/cells'
import { FullSidebar } from '@mdxui/screenshots/sidebars'
import { BreadcrumbHeader } from '@mdxui/screenshots/headers'
import { BrowserFrame } from '@mdxui/screenshots/frames'
import { DashboardShell } from '@mdxui/screenshots/shell'
import { cn } from '@mdxui/screenshots/utils'
```

## Theming

Uses CSS variables compatible with shadcn/ui themes:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

### Custom Theming

All components use the `cn()` utility for class merging, allowing easy customization:

```tsx
<BrowserFrame className="shadow-2xl border-2 border-primary">
  <DashboardShell className="bg-gradient-to-br from-background to-muted">
    {/* content */}
  </DashboardShell>
</BrowserFrame>
```

## Component Status

| Category | Status | Location |
|----------|--------|----------|
| Headers | ✅ Available | `@mdxui/screenshots/headers` |
| Frames | ✅ Available | `@mdxui/screenshots/frames` |
| Shell | ✅ Available | `@mdxui/screenshots/shell` |
| Grids | 🚧 Migration in progress | `apps/screenshots` |
| KPIs | 🚧 Migration in progress | `apps/screenshots` |
| Charts | 🚧 Migration in progress | `apps/screenshots` |
| Tables | 🚧 Migration in progress | `apps/screenshots` |
| Lists | 🚧 Migration in progress | `apps/screenshots` |
| Cells | 🚧 Migration in progress | `apps/screenshots` |
| Sidebars | 🚧 Migration in progress | `apps/screenshots` |

Components marked as "Migration in progress" are currently available in the `apps/screenshots` demo app and will be migrated to this package in upcoming releases.

## Examples

### Complete Dashboard Screenshot

```tsx
import { BrowserFrame } from '@mdxui/screenshots/frames'
import { DashboardShell } from '@mdxui/screenshots/shell'
import { BreadcrumbHeader } from '@mdxui/screenshots/headers'
// Grid, KPI, and Chart components coming soon

export function DashboardScreenshot() {
  return (
    <BrowserFrame url="analytics.example.com.ai">
      <DashboardShell
        sidebar={<FullSidebar />}
        header={<BreadcrumbHeader items={[
          { label: 'Dashboard' },
          { label: 'Analytics' }
        ]} />}
      >
        {/* Grid layouts and panels will be added here */}
      </DashboardShell>
    </BrowserFrame>
  )
}
```

### Tabbed Dashboard

```tsx
import { TabsHeader } from '@mdxui/screenshots/headers'

<DashboardShell
  sidebar={<CompactSidebar />}
  header={<TabsHeader
    tabs={[
      { value: 'overview', label: 'Overview' },
      { value: 'performance', label: 'Performance' },
      { value: 'users', label: 'Users' }
    ]}
    defaultValue="overview"
  />}
>
  {/* Tab content */}
</DashboardShell>
```

### Minimal Dashboard

```tsx
import { MinimalHeader } from '@mdxui/screenshots/headers'

<DashboardShell
  sidebar={<IconOnlySidebar />}
  header={<MinimalHeader title="Analytics Dashboard" />}
>
  {/* Clean, minimal dashboard */}
</DashboardShell>
```

## Development

```bash
# Build the package
pnpm --filter @mdxui/screenshots build

# Type check
pnpm --filter @mdxui/screenshots typecheck

# Run tests
pnpm --filter @mdxui/screenshots test
```

## API Reference

### DashboardShell

Wrapper component that provides the main dashboard layout structure.

```tsx
interface DashboardShellProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  header: React.ReactNode
  className?: string
}
```

### BrowserFrame

Browser window chrome for creating realistic app screenshots.

```tsx
interface BrowserFrameProps {
  children: React.ReactNode
  url?: string              // Default: 'app.example.com.ai'
  showControls?: boolean    // Default: true
  className?: string
}
```

### BreadcrumbHeader

Header with navigation breadcrumbs.

```tsx
interface BreadcrumbItemType {
  label: string
  href?: string
}

interface BreadcrumbHeaderProps {
  items: BreadcrumbItemType[]
  className?: string
}
```

### TabsHeader

Header with tab navigation.

```tsx
interface TabItem {
  value: string
  label: string
}

interface TabsHeaderProps {
  tabs: TabItem[]
  defaultValue?: string
  className?: string
}
```

### SearchHeader

Header with global search input.

```tsx
interface SearchHeaderProps {
  placeholder?: string
  className?: string
}
```

### MinimalHeader

Simple header with just a title.

```tsx
interface MinimalHeaderProps {
  title?: string
  className?: string
}
```

## Architecture

This package is part of the mdxui ecosystem:

```
mdxui                       # Type contracts
  ↓
@mdxui/primitives          # Core UI primitives
  ↓
@mdxui/screenshots         # Dashboard components for screenshots
```

Components are designed to work with:
- **@mdxui/beacon** - Site template components
- **@mdxui/cockpit** - App template components
- **@mdxui/widgets** - Complex interactive widgets

## Dependencies

- **@mdxui/primitives** - Core UI primitives (Sidebar, etc.)
- **recharts** - Chart library (v2.15.0)
- **lucide-react** - Icon library
- **date-fns** - Date formatting
- **shiki** - Code syntax highlighting
- **clsx** + **tailwind-merge** - Class name utilities

## Contributing

Components are developed and validated in `apps/screenshots` before being migrated to this package. See the [Component Promotion Workflow](../../apps/screenshots/CLAUDE.md#component-promotion-workflow) for details.

## License

MIT

## Related Packages

- [@mdxui/primitives](../primitives) - Core UI primitives
- [@mdxui/beacon](../beacon) - Site template components
- [@mdxui/cockpit](../cockpit) - App template components
- [@mdxui/widgets](../widgets) - Complex widgets
- [mdxui](../mdxui) - Type contracts

## Roadmap

- [ ] Migrate grid layouts (35+ components)
- [ ] Migrate KPI components (6 components)
- [ ] Migrate chart components (20+ components)
- [ ] Migrate table components and cells (25+ components)
- [ ] Migrate list components (6 components)
- [ ] Migrate sidebar variants (9 components)
- [ ] Add Storybook stories for all components
- [ ] Add visual regression tests
- [ ] Create comprehensive documentation site
- [ ] Add screenshot generation utilities
- [ ] Support custom theme presets
