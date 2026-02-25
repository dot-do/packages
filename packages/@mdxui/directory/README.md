---
name: "@mdxui/directory"
version: 6.0.0
description: A flexible directory/catalog component package for displaying collections of items with search, filtering, and navigation capabilities.
license: MIT
downloads:
  monthly: 32
published: "2026-01-24T14:37:50.991Z"
updated: "2026-01-24T14:37:51.237Z"
---

# @mdxui/directory

A flexible directory/catalog component package for displaying collections of items with search, filtering, and navigation capabilities.

## Components

### Directory

Main component that orchestrates the entire directory experience with search, navigation, and item display.

```tsx
import { Directory } from '@mdxui/directory'

<Directory
  items={items}
  categories={categories}
  collections={collections}
  onSearch={(query) => console.log(query)}
  onFilter={(filters) => console.log(filters)}
  onItemClick={(item) => console.log(item)}
  layout="grid"
/>
```

### DirectoryItem

Card component for displaying individual directory items with image, title, description, category badge, and tags.

```tsx
import { DirectoryItem } from '@mdxui/directory/directory-item'

<DirectoryItem
  name="Item Name"
  slug="item-slug"
  description="Item description"
  category="Category"
  image="/path/to/image.jpg"
  tags={['tag1', 'tag2']}
  onClick={() => {}}
/>
```

### DirectoryNav

Sidebar navigation component for browsing collections and categories.

```tsx
import { DirectoryNav } from '@mdxui/directory/directory-nav'

<DirectoryNav
  categories={[
    { label: 'All', value: '', count: 100 },
    { label: 'Category 1', value: 'cat1', count: 25 }
  ]}
  collections={[
    { label: 'Industries', value: 'industries' },
    { label: 'Apps', value: 'apps' }
  ]}
  activeCategory="cat1"
  onCategoryChange={(category) => {}}
  onCollectionChange={(collection) => {}}
/>
```

### DirectorySearch

Search input with filter badges for advanced filtering.

```tsx
import { DirectorySearch } from '@mdxui/directory/directory-search'

<DirectorySearch
  value={searchQuery}
  onChange={(value) => setSearchQuery(value)}
  placeholder="Search..."
  filters={[
    { label: 'Featured', value: 'featured', active: true },
    { label: 'New', value: 'new', active: false }
  ]}
  onFilterToggle={(filterValue) => {}}
/>
```

## Props

### DirectoryProps

- `items`: Array of directory items to display
- `categories`: Array of category filters
- `collections`: Array of collection types (e.g., industries, apps, models)
- `onSearch`: Callback when search query changes
- `onFilter`: Callback when filters are toggled
- `onCategoryChange`: Callback when category is selected
- `onCollectionChange`: Callback when collection is selected
- `onItemClick`: Callback when item is clicked
- `searchPlaceholder`: Placeholder text for search input
- `showSearch`: Whether to show search bar (default: true)
- `showNav`: Whether to show navigation sidebar (default: true)
- `layout`: Display layout - "grid" or "list" (default: "grid")
- `searchFilters`: Array of filter options for search

### DirectoryItem Interface

```typescript
interface DirectoryItem {
  name: string
  slug: string
  description?: string
  category?: string
  image?: string
  tags?: string[]
  [key: string]: any
}
```

## Usage with Payload CMS

The directory components are designed to work seamlessly with Payload CMS collections:

```tsx
import { Directory } from '@mdxui/directory'

// Fetch data from Payload
const items = await payload.find({
  collection: 'apps',
  depth: 1
})

<Directory
  items={items.docs}
  collections={[
    { label: 'Industries', value: 'industries' },
    { label: 'Apps', value: 'apps' },
    { label: 'Models', value: 'models' }
  ]}
  onCollectionChange={async (collection) => {
    // Fetch new collection data
    const newItems = await payload.find({ collection })
  }}
/>
```

## Styling

Components use Tailwind CSS and inherit styles from `@mdxui/primitives`. All components support `className` prop for custom styling.

## TypeScript

Full TypeScript support with exported types:
- `DirectoryProps`
- `DirectoryItemProps`
- `DirectoryNavProps`
- `DirectorySearchProps`
- `DirectoryItem`
- `CategoryItem`
- `CollectionItem`
