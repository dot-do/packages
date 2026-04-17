---
name: "@mdxui/admin"
version: 6.0.1
description: Pure UI components for admin dashboards - bring your own data layer
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://github.com/dot-do/ui#readme"
downloads:
  monthly: 20
published: "2026-01-11T12:25:44.416Z"
updated: "2026-01-29T23:14:06.097Z"
---

# @mdxui/admin

> Pure UI components for admin dashboards. API-compatible with ra-ui-materialui.

## When to Use This Package

**Choose @mdxui/admin if you are:**

- **Starting a new project** without an existing react-admin codebase
- Building a **custom admin UI** with your own data layer (TanStack Query, SWR, etc.)
- Want **zero react-admin dependencies** in your bundle
- Building on the **dotdo platform** with `@dotdo/react/tanstack`
- Need **maximum flexibility** - bring your own routing, state management, and data fetching

**Choose [shadmin](../shadmin) instead if you are:**

- **Migrating an existing react-admin application** to modern styling
- Need **drop-in compatibility** with react-admin hooks (`useRecordContext`, `useListContext`)
- Want to **preserve existing business logic** while upgrading the UI
- Require react-admin's **DataProvider/AuthProvider** abstractions

```
┌─────────────────────────────────────────────────────────────────┐
│                    "Which package do I use?"                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Do you have an existing react-admin app?                       │
│                                                                  │
│   YES ──────────► Use shadmin (drop-in replacement)              │
│                   • Keep ra-core hooks                           │
│                   • Replace Material UI with ShadCN              │
│                                                                  │
│   NO ───────────► Use @mdxui/admin (this package)                │
│                   • Zero ra-core dependency                      │
│                   • Wire to any data layer                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Overview

@mdxui/admin provides admin-specific UI components with zero data-fetching opinions. Built on @mdxui/primitives (Radix + Tailwind), it serves as the shared UI layer for both `saaskit` and `shadmin`.

## Installation

```bash
npm install @mdxui/admin
```

## Components

### Table Editor

Supabase-style spreadsheet grid with full keyboard navigation.

```tsx
import { TableEditor } from '@mdxui/admin'

<TableEditor
  columns={[
    { accessorKey: 'id', header: 'ID', dataType: 'text' },
    { accessorKey: 'name', header: 'Name', dataType: 'text', editable: true },
    { accessorKey: 'email', header: 'Email', dataType: 'email', editable: true },
    { accessorKey: 'status', header: 'Status', dataType: 'enum', enumValues: ['active', 'inactive'] },
    { accessorKey: 'createdAt', header: 'Created', dataType: 'date' },
  ]}
  data={rows}
  onCellChange={(rowIndex, columnId, value) => updateCell(rowIndex, columnId, value)}
  onRowCreate={(row) => createRow(row)}
  onRowDelete={(ids) => deleteRows(ids)}
  editable
  filterable
  sortable
  selectable
/>
```

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| Arrow keys | Navigate cells |
| Enter / F2 | Edit cell |
| Tab / Shift+Tab | Next/prev cell |
| Escape | Cancel edit |
| Delete | Clear cell (NULL) |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+C | Copy |
| Home/End | First/last column |

### Fields (Display Components)

Read-only components for displaying data in lists and show views.

```tsx
import { TextField, NumberField, DateField, BooleanField, EmailField, UrlField, ImageField, BadgeField, ReferenceField, ArrayField, ChipField } from '@mdxui/admin'

<TextField source="name" />
<NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
<DateField source="createdAt" showTime />
<BooleanField source="isActive" />
<EmailField source="email" />
<UrlField source="website" />
<ImageField source="avatar" />
<BadgeField source="status" variants={{ active: 'success', inactive: 'secondary' }} />
<ReferenceField source="userId" reference="users">
  <TextField source="name" />
</ReferenceField>
<ArrayField source="tags">
  <ChipField source="name" />
</ArrayField>
```

### Inputs (Form Components)

Form inputs for create/edit views. Integrate with react-hook-form.

```tsx
import { TextInput, NumberInput, SelectInput, BooleanInput, DateInput, TextareaInput, PasswordInput, ReferenceInput } from '@mdxui/admin'

<TextInput source="name" label="Full Name" />
<TextInput source="email" type="email" />
<NumberInput source="price" min={0} step={0.01} />
<SelectInput source="status" choices={[
  { id: 'active', name: 'Active' },
  { id: 'inactive', name: 'Inactive' },
]} />
<BooleanInput source="isPublished" />
<DateInput source="publishedAt" />
<TextareaInput source="description" rows={4} />
<PasswordInput source="password" />
<ReferenceInput source="categoryId" reference="categories" />
```

### Layout Components

Admin shell components for building dashboard layouts.

```tsx
import { AdminLayout, Sidebar, SidebarItem, SidebarGroup, AppBar, Breadcrumbs, PageHeader } from '@mdxui/admin'

<AdminLayout
  sidebar={
    <Sidebar>
      <SidebarGroup label="Main">
        <SidebarItem to="/dashboard" icon={<HomeIcon />}>Dashboard</SidebarItem>
        <SidebarItem to="/users" icon={<UsersIcon />}>Users</SidebarItem>
      </SidebarGroup>
      <SidebarGroup label="Settings">
        <SidebarItem to="/settings" icon={<SettingsIcon />}>Settings</SidebarItem>
      </SidebarGroup>
    </Sidebar>
  }
  appBar={<AppBar />}
>
  <PageHeader title="Users" actions={<CreateButton />} />
  <Breadcrumbs />
  {children}
</AdminLayout>
```

## Type Compatibility

All components are type-compatible with ra-ui-materialui, enabling gradual migration from react-admin.

```tsx
// These props interfaces match react-admin
import type { TextFieldProps, TextInputProps, ListProps, DatagridProps } from '@mdxui/admin'
```

## Styling

Components use Tailwind CSS via @mdxui/primitives. Override styles via className or CSS variables.

```tsx
<TextField source="name" className="text-lg font-bold" />
```

Theme variables in your `globals.css`:
```css
:root {
  --admin-sidebar-width: 280px;
  --admin-header-height: 64px;
}
```

## Bring Your Own Data

@mdxui/admin is purely presentational with **zero data-fetching dependencies**. You wire it to your data layer:

```tsx
// 1. Create your data provider (implements DataProvider interface from mdxui)
const dataProvider = createMyDataProvider()

// 2. Wire up your components with your state management
function UserList() {
  const { data, isLoading } = useMyDataHook('users') // TanStack Query, SWR, etc.

  return (
    <ListView
      data={data}
      loading={isLoading}
      columns={columns}
    />
  )
}
```

**Popular integrations:**
- **TanStack Query** - Use `@tanstack/react-query` for data fetching
- **SWR** - Use `swr` for data fetching
- **Zustand/Redux** - Manage state externally
- **react-admin** - Compatible with react-admin's DataProvider

## Architecture

@mdxui/admin sits at the **admin patterns layer** - extending @mdxui/app with CRUD and data management components for operators and admins.

```
┌─────────────────────────────────────────────────────────────────┐
│                      mdxui (interfaces)                          │
│   DataProvider, AuthProvider, AdminComponents                    │
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
│            ★ @mdxui/admin (admin patterns) ← YOU ARE HERE        │
│   <Admin/>, <Resource/>, CRUD views, DatabaseGrid, DataBrowser   │
│   For: Operators, admins, internal teams                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓ used by
┌─────────────────────────────────────────────────────────────────┐
│                Your Application (data layer)                     │
│   TanStack Query, SWR, Zustand, or any data fetching solution    │
└─────────────────────────────────────────────────────────────────┘
```

### What @mdxui/admin Adds

| Component Type | Examples | Purpose |
|----------------|----------|---------|
| **CRUD Views** | ListView, EditView, CreateView, ShowView | Standard admin pages |
| **Resources** | `<Resource/>`, `<Admin/>` | Declarative resource management |
| **Data Display** | Fields, DataGrid, DataBrowser | Read-only data presentation |
| **Data Entry** | Inputs, Forms | Create/edit functionality |
| **Editors** | TableEditor, DocumentEditor, CodeEditor | Advanced editing interfaces |

### Key Principle

@mdxui/admin is **purely presentational** with no data-fetching dependencies. Data binding is your application's responsibility - use TanStack Query, SWR, or any other solution.

## Related Packages

| Package | Relationship |
|---------|--------------|
| `@mdxui/primitives` | Base UI components (dependency) |
| `@mdxui/app` | App framework (extends this) |
| `mdxui` | Type definitions and interfaces |

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `react-router-dom` ^6.0.0 (optional, for routing components)

## Links

- [Documentation](https://mdxui.dev)
- [GitHub](https://github.com/dot-do/ui)
- [Storybook](https://storybook.mdxui.dev)

## License

MIT
