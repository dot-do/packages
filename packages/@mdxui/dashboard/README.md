---
name: "@mdxui/dashboard"
version: 1.0.2
description: Application dashboard shells and components for MDXUI
license: MIT
repository: "https://github.com/ai-primitives/mdxui"
homepage: "https://github.com/ai-primitives/mdxui#readme"
keywords:
  - mdx
  - dashboard
  - admin
  - react
  - components
downloads:
  monthly: 9
published: "2024-12-24T13:33:30.946Z"
updated: "2024-12-27T17:38:24.271Z"
---

# @mdxui/dashboard

Application dashboard shells and components for MDXUI, designed for creating modern admin interfaces and data dashboards with MDX and YAML-LD frontmatter.

## Installation

```bash
pnpm add @mdxui/dashboard
```

## Features

- Dashboard layouts and shells
- Data visualization components
- Admin interface components
- Navigation systems
- Data tables and grids
- Stats cards and widgets
- Real-time data support
- User management interfaces
- Dark/light mode support

## Usage

```tsx
import { 
  DashboardLayout, 
  DataGrid, 
  StatsCard,
  Chart 
} from '@mdxui/dashboard'

// In your MDX file
---
$type: DashboardPage
title: Analytics Dashboard
---

export default function Dashboard({ children }) {
  return (
    <DashboardLayout>
      <StatsGrid>
        <StatsCard 
          title="Total Users"
          value={1234}
          trend="+12%"
        />
        {/* More stats cards */}
      </StatsGrid>
      <Chart 
        data={analyticsData}
        type="line"
      />
      <DataGrid 
        data={userData}
        columns={columns}
      />
      {children}
    </DashboardLayout>
  )
}
```

## Components

- `DashboardLayout` - Main dashboard layout
- `Sidebar` - Dashboard navigation sidebar
- `TopBar` - Dashboard header with actions
- `StatsCard` - Metric display cards
- `DataGrid` - Data tables with sorting/filtering
- `Chart` - Data visualization charts
- `UserMenu` - User profile and settings
- `NotificationCenter` - Alerts and notifications

## Integration

- Works with Tremor charts
- Compatible with shadcn/ui components
- Real-time data support
- REST/GraphQL integration
- WebSocket support

## Related Packages

- `@mdxui/types` - TypeScript type definitions
- `@mdxui/shared` - Shared components and utilities
- `@mdxui/tremor` - Tremor chart components
- `@mdxui/widgets` - Interactive components

## License

MIT © 2024 [Drivly](https://driv.ly) 