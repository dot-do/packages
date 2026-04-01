---
name: "@mdxui/primitives"
version: 6.0.0
description: "> Low-level UI components for the mdxui ecosystem."
license: MIT
downloads:
  monthly: 286
published: "2025-12-23T12:36:34.211Z"
updated: "2026-01-24T14:38:00.359Z"
---

# @mdxui/primitives

> Low-level UI components for the mdxui ecosystem.

## Overview

@mdxui/primitives provides the foundational UI components used by all mdxui template packages. Built on Radix UI primitives with Tailwind CSS styling, these components are:

- **Accessible** - WCAG compliant, keyboard navigable
- **Composable** - Small, focused components that combine well
- **Themeable** - Works with @mdxui/themes color schemes
- **Headless-compatible** - Radix primitives under the hood

## Installation

```bash
npm install @mdxui/primitives
# or
pnpm add @mdxui/primitives
```

## Components

### Layout

| Component | Description |
|-----------|-------------|
| `Card` | Container with border and shadow |
| `Sheet` | Slide-out panel (mobile nav, details) |
| `Dialog` | Modal dialog |
| `Popover` | Floating content panel |
| `Tabs` | Tabbed interface |
| `Accordion` | Collapsible sections |
| `ScrollArea` | Custom scrollbar container |
| `Separator` | Visual divider |
| `AspectRatio` | Fixed aspect ratio container |

### Forms

| Component | Description |
|-----------|-------------|
| `Button` | Primary action button |
| `Input` | Text input field |
| `Textarea` | Multi-line text input |
| `Select` | Dropdown selection |
| `Checkbox` | Boolean toggle (checkbox) |
| `Switch` | Boolean toggle (switch) |
| `RadioGroup` | Single selection from options |
| `Slider` | Range input |
| `Label` | Form field label |

### Navigation

| Component | Description |
|-----------|-------------|
| `Sidebar` | Collapsible navigation sidebar |
| `NavigationMenu` | Horizontal navigation with dropdowns |
| `Breadcrumb` | Breadcrumb trail |
| `DropdownMenu` | Action dropdown |
| `ContextMenu` | Right-click menu |
| `Command` | Command palette (⌘K) |

### Data Display

| Component | Description |
|-----------|-------------|
| `Table` | Data table |
| `Badge` | Status/category badge |
| `Avatar` | User avatar |
| `Tooltip` | Hover tooltip |
| `Progress` | Progress indicator |
| `Skeleton` | Loading placeholder |

### Feedback

| Component | Description |
|-----------|-------------|
| `Alert` | Inline alert message |
| `AlertDialog` | Confirmation dialog |
| `Toast` | Temporary notification |

### Animated Effects

| Component | Description |
|-----------|-------------|
| `Orbital` | Orbiting elements in a circle |
| `ShineBorder` | Animated shimmering border |
| `BorderBeam` | Moving beam border effect |
| `Spotlight` | Cursor-following spotlight |
| `Particles` | Floating particle background |
| `TextReveal` | Scroll-triggered text reveal |
| `AnimatedCard` | Interactive tilt card |

## Usage

```tsx
import { Button, Card, Input, Badge } from '@mdxui/primitives'

function Example() {
  return (
    <Card>
      <Input placeholder="Enter your email" />
      <Button>Subscribe</Button>
      <Badge variant="success">Active</Badge>
    </Card>
  )
}
```

### With Animated Effects

```tsx
import { ShineBorder, Orbital } from '@mdxui/primitives'

// Shine border around any element
<div className="relative rounded-lg p-1">
  <ShineBorder colors={['var(--primary)']} />
  <div className="bg-background rounded-md p-4">Content</div>
</div>

// Orbiting icons
<Orbital radius={150} speed={2}>
  <IconOne />
  <IconTwo />
  <IconThree />
</Orbital>
```

## Styling

Components use CSS variables for theming. Configure via @mdxui/themes or your own CSS:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}
```

Override individual components via `className`:

```tsx
<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  Custom Button
</Button>
```

## Architecture

@mdxui/primitives sits at the **foundation layer** - providing raw UI components that all other packages build upon.

```
┌─────────────────────────────────────────────────────────────────┐
│                      mdxui (interfaces)                          │
│   Type contracts and Zod schemas                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ implements
┌─────────────────────────────────────────────────────────────────┐
│          ★ @mdxui/primitives (raw UI) ← YOU ARE HERE             │
│   Button, Card, Dialog, Input, Table, Sidebar, etc.              │
│   Pure presentational components with no data layer              │
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
```

### Who Uses @mdxui/primitives

| Package | Uses For |
|---------|----------|
| `@mdxui/beacon` | Hero buttons, feature cards, pricing tables |
| `@mdxui/cockpit` | Dashboard widgets, form inputs, navigation |
| `@mdxui/admin` | Data tables, form fields, action buttons |
| `@mdxui/app` | App shell, sidebar, navigation |
| `@mdxui/blocks` | Marketing section components |

### Key Principle

@mdxui/primitives has **zero data layer dependencies**. Components are pure UI - they receive props and render. No data fetching, no state management beyond local component state.

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0

## Links

- [Documentation](https://mdxui.dev)
- [GitHub](https://github.com/dot-do/ui)
- [Storybook](https://storybook.mdxui.dev)

## License

MIT
