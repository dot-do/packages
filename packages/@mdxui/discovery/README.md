---
name: "@mdxui/discovery"
version: 6.0.0
description: Directory and listing template components for mdxui - directories, catalogs, and discovery pages
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdxui
  - react
  - directory
  - listing
  - catalog
  - discovery
  - components
downloads:
  monthly: 50
published: "2026-01-24T14:38:22.498Z"
updated: "2026-01-24T14:38:22.773Z"
---

# @mdxui/discovery

Directory and listing template components for mdxui - build directories, catalogs, and discovery pages.

## Installation

```bash
npm install @mdxui/discovery @mdxui/primitives @mdxui/themes mdxui
# or
pnpm add @mdxui/discovery @mdxui/primitives @mdxui/themes mdxui
```

## Quick Start

```tsx
import { DirectoryLayout, DirectoryHero, CardGrid, ListingCard } from '@mdxui/discovery'

const items = [
  { id: '1', title: 'Item 1', description: 'Description 1', href: '/items/1' },
  { id: '2', title: 'Item 2', description: 'Description 2', href: '/items/2' },
]

export default function DirectoryPage() {
  return (
    <DirectoryLayout>
      <DirectoryHero
        title="Browse our Directory"
        description="Find what you're looking for"
      />
      <CardGrid>
        {items.map((item) => (
          <ListingCard key={item.id} {...item} />
        ))}
      </CardGrid>
    </DirectoryLayout>
  )
}
```

## Components

### Directory Index Page

- **DirectoryLayout** - Main layout wrapper for directory pages
- **DirectoryHero** - Hero section with title, description, and optional search
- **DirectoryToolbar** - Toolbar with view toggles, sort options, and filters
- **DirectorySidebar** - Sidebar with filter groups and navigation
- **DirectoryNavbar** - Navigation bar for directory sections
- **DirectoryCTA** - Call-to-action sections (Submit, Sponsor, Newsletter variants)

### Listing Views

- **CardGrid** - Responsive grid of listing cards
- **ListView** - Vertical list of listings with detailed info
- **TableView** - Tabular view with sortable columns
- **ListingCard** - Individual listing card component

### Detail Page

- **DetailHero** - Hero section for individual item pages
- **DetailSection** - Content sections with titles and descriptions
- **DetailActions** - Action buttons (website, GitHub, share, bookmark)
- **HierarchyNav** - Parent/child navigation for hierarchical content
- **RelatedItems** - Grid of related or similar items
- **CodeBlock** - Syntax-highlighted code snippets

### Utilities

- **cn** - Class name merging utility
- **formatNumber** - Number formatting helper
- **truncate** - Text truncation helper
- **slugify** - URL slug generator
- **getInitials** - Extract initials from names

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `@mdxui/primitives` - Required for base UI components
- `@mdxui/themes` - Required for theming
- `mdxui` - Required for type definitions

## Links

- [Documentation](https://mdxui.dev)
- [GitHub](https://github.com/dot-do/ui)
- [npm](https://www.npmjs.com/package/@mdxui/discovery)

## License

MIT
