---
name: "@mdxui/app"
version: 6.0.1
description: "Abstract application framework layer for building admin interfaces and SaaS applications with React. Provides a \"Bring Your Own Backend\" architecture where you implement the data and auth providers while the framework handles UI composition, navigation, t"
license: MIT
downloads:
  monthly: 324
published: "2026-01-12T15:42:46.260Z"
updated: "2026-06-10T17:01:50.945Z"
---

# @mdxui/app

Abstract application framework layer for building admin interfaces and SaaS applications with React. Provides a "Bring Your Own Backend" architecture where you implement the data and auth providers while the framework handles UI composition, navigation, theming, and resource management.

## Installation

```bash
npm install @mdxui/app @mdxui/primitives
# or
pnpm add @mdxui/app @mdxui/primitives
# or
yarn add @mdxui/app @mdxui/primitives
```

## Quick Start

```tsx
import { App, AppShell, NavMain, NavUser, Resource } from '@mdxui/app'
import type { DataProvider, AuthProvider } from '@mdxui/app'
import { Users, Package } from 'lucide-react'

// 1. Implement your data provider
const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const response = await fetch(`/api/${resource}`)
    const data = await response.json()
    return { data: data.items, total: data.total }
  },
  getOne: async (resource, { id }) => {
    const response = await fetch(`/api/${resource}/${id}`)
    return { data: await response.json() }
  },
  getMany: async (resource, { ids }) => {
    const response = await fetch(`/api/${resource}?ids=${ids.join(',')}`)
    return { data: await response.json() }
  },
  create: async (resource, { data }) => {
    const response = await fetch(`/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return { data: await response.json() }
  },
  update: async (resource, { id, data }) => {
    const response = await fetch(`/api/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return { data: await response.json() }
  },
  delete: async (resource, { id }) => {
    const response = await fetch(`/api/${resource}/${id}`, { method: 'DELETE' })
    return { data: await response.json() }
  },
}

// 2. Implement your auth provider
const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
  },
  checkAuth: async () => {
    const response = await fetch('/api/auth/me')
    if (!response.ok) throw new Error('Not authenticated')
  },
  checkError: async (error) => {
    if (error.message === 'Unauthorized') throw error
  },
  getIdentity: async () => {
    const response = await fetch('/api/auth/me')
    return response.json()
  },
  getPermissions: async () => {
    const response = await fetch('/api/auth/permissions')
    return response.json()
  },
}

// 3. Define your resources
const resources = [
  { name: 'users', label: 'Users', icon: Users, list: UsersList, edit: UserEdit },
  { name: 'products', label: 'Products', icon: Package, list: ProductsList },
]

// 4. Build your app
function MyAdmin() {
  return (
    <App
      config={{ name: 'My Admin', basePath: '/admin' }}
      dataProvider={dataProvider}
      authProvider={authProvider}
      resources={resources}
    >
      <AppShell
        config={{ name: 'My Admin' }}
        nav={<NavMain />}
        footer={<NavUser />}
      >
        {/* Your routes/content here */}
      </AppShell>
    </App>
  )
}
```

## Core Concepts

### Bring Your Own Backend

`@mdxui/app` doesn't dictate your backend. You implement two interfaces:

- **DataProvider**: 6-method interface for CRUD operations
- **AuthProvider**: 6-method interface for authentication

This lets you connect to any API, database, or backend service.

### Resources

Resources are the core building blocks. Each resource represents an entity (users, products, orders) that can be listed, created, edited, and deleted.

```tsx
const usersResource: ResourceDefinition = {
  name: 'users',           // Used in URLs and data provider calls
  label: 'User',           // Singular label
  labelPlural: 'Users',    // Plural label
  icon: Users,             // Lucide icon for navigation
  list: UsersList,         // List view component
  show: UserShow,          // Detail view component
  create: UserCreate,      // Create form component
  edit: UserEdit,          // Edit form component
}
```

### Provider Composition

The `App` component composes all necessary providers in the correct order:

```
ThemeProvider
  └─ NavigationProvider
       └─ DataProviderProvider
            └─ AuthProvider
                 └─ ResourcesProvider
                      └─ AppProvider
                           └─ Your Content
```

## API Reference

### Providers

#### DataProviderProvider & useDataProvider

Provides data access throughout your application.

```tsx
import { DataProviderProvider, useDataProvider } from '@mdxui/app'

// Wrap your app
<DataProviderProvider dataProvider={myDataProvider}>
  <App />
</DataProviderProvider>

// Use in components
function UsersList() {
  const dataProvider = useDataProvider()

  useEffect(() => {
    dataProvider.getList('users', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'name', order: 'ASC' },
      filter: { status: 'active' },
    }).then(({ data, total }) => {
      // Handle data
    })
  }, [])
}
```

**DataProvider Interface:**

| Method | Params | Returns |
|--------|--------|---------|
| `getList` | `{ pagination?, sort?, filter? }` | `{ data: T[], total?, pageInfo? }` |
| `getOne` | `{ id }` | `{ data: T }` |
| `getMany` | `{ ids }` | `{ data: T[] }` |
| `create` | `{ data }` | `{ data: T }` |
| `update` | `{ id, data, previousData? }` | `{ data: T }` |
| `delete` | `{ id, previousData? }` | `{ data: T }` |

#### AuthProvider & useAuth

Manages authentication state and operations.

```tsx
import { AuthProvider, useAuth } from '@mdxui/app'

// Wrap your app
<AuthProvider authProvider={myAuthProvider}>
  <App />
</AuthProvider>

// Use in components
function LoginPage() {
  const { login, isLoading } = useAuth()

  const handleSubmit = async (data) => {
    await login({ username: data.email, password: data.password })
  }
}

function Dashboard() {
  const { isAuthenticated, identity, logout, permissions } = useAuth()

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  return <div>Welcome, {identity?.fullName}!</div>
}
```

**AuthProvider Interface:**

| Method | Purpose |
|--------|---------|
| `login(params)` | Authenticate user with credentials |
| `logout()` | End user session |
| `checkAuth()` | Verify current auth state (throws if not authenticated) |
| `checkError(error)` | Handle auth errors (e.g., 401 responses) |
| `getIdentity()` | Get current user info |
| `getPermissions()` | Get user permissions/roles |

**useAuth Return Value:**

```tsx
interface AuthContextValue {
  isAuthenticated: boolean
  identity?: UserIdentity
  permissions?: string[]
  isLoading: boolean
  login: (params: LoginParams) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}
```

#### NavigationProvider & useNavigation

Integrates with your routing library (react-router, Next.js, etc.).

```tsx
import { NavigationProvider, useNavigation } from '@mdxui/app'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'

// Create adapter for react-router
const navigationProvider = {
  navigate: (to, options) => navigate(to, options),
  getCurrentPath: () => location.pathname,
  LinkComponent: ({ href, children, className }) => (
    <RouterLink to={href} className={className}>{children}</RouterLink>
  ),
}

<NavigationProvider navigationProvider={navigationProvider}>
  <App />
</NavigationProvider>

// Use in components
function MyComponent() {
  const { navigate, getCurrentPath, Link } = useNavigation()

  return (
    <div>
      <Link href="/dashboard">Go to Dashboard</Link>
      <button onClick={() => navigate('/settings')}>Settings</button>
    </div>
  )
}
```

**Default Behavior:** If no `navigationProvider` is passed, uses `window.location` for navigation and plain `<a>` tags for links.

#### ThemeProvider & useTheme

Manages light/dark theme with system preference detection.

```tsx
import { ThemeProvider, useTheme } from '@mdxui/app'

<ThemeProvider defaultTheme="system" storageKey="my-app-theme">
  <App />
</ThemeProvider>

// Use in components
function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      {resolvedTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  )
}
```

**Theme Options:** `'light' | 'dark' | 'system'`

**useTheme Return Value:**

```tsx
interface ThemeContextValue {
  theme: Theme                    // Current setting (may be 'system')
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark' // Actual applied theme
  toggleTheme: () => void
}
```

#### ResourcesProvider & useResources

Global registry of all resources in the application.

```tsx
import { ResourcesProvider, useResources } from '@mdxui/app'

<ResourcesProvider resources={[usersResource, productsResource]}>
  <App />
</ResourcesProvider>

// Use in components
function ResourceNav() {
  const { resources, getResource } = useResources()

  return (
    <nav>
      {resources.map(r => (
        <Link key={r.name} href={`/${r.name}`}>
          {r.icon && <r.icon />}
          {r.labelPlural ?? r.name}
        </Link>
      ))}
    </nav>
  )
}
```

**useResources Return Value:**

```tsx
interface ResourcesContextValue {
  resources: ResourceDefinition[]
  getResource: (name: string) => ResourceDefinition | undefined
  registerResource: (resource: ResourceDefinition) => void
  unregisterResource: (name: string) => void
}
```

#### ResourceProvider & useResource

Context for a single resource view (list, show, edit, create).

```tsx
import { ResourceProvider, useResource } from '@mdxui/app'

<ResourceProvider resource="users" definition={usersResource} id={userId}>
  <UserEdit />
</ResourceProvider>

// Use in components
function UserEdit() {
  const { resource, id, hasEdit, definition } = useResource()

  // resource = 'users'
  // id = userId
  // hasEdit = true (if edit component defined)
}
```

**useResource Return Value:**

```tsx
interface ResourceContextValue {
  resource: string
  definition?: ResourceDefinition
  id?: Identifier
  hasList: boolean
  hasCreate: boolean
  hasEdit: boolean
  hasShow: boolean
}
```

### Components

#### App

Root component that composes all providers. Use this as the outermost wrapper.

```tsx
import { App } from '@mdxui/app'

<App
  config={{ name: 'Admin', basePath: '/admin', logo: <Logo /> }}
  dataProvider={dataProvider}
  authProvider={authProvider}
  resources={resources}
  navigationProvider={routerAdapter}  // Optional
  defaultTheme="system"               // Optional
  layout={CustomLayout}               // Optional wrapper
>
  {children}
</App>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `AppConfig` | Yes | App name, basePath, logo, description |
| `dataProvider` | `DataProvider` | Yes | Your data provider implementation |
| `authProvider` | `AuthProvider` | Yes | Your auth provider implementation |
| `resources` | `ResourceDefinition[]` | No | Resource definitions |
| `navigationProvider` | `NavigationProvider` | No | Router integration |
| `defaultTheme` | `Theme` | No | Default theme (`'light'`, `'dark'`, `'system'`) |
| `themeStorageKey` | `string` | No | localStorage key for theme |
| `layout` | `ComponentType` | No | Custom layout wrapper |

#### Resource

Declarative resource registration. Can be used instead of or alongside the `resources` prop on `App`.

```tsx
import { Resource } from '@mdxui/app'

<App dataProvider={dp} authProvider={ap} config={config}>
  <Resource
    name="users"
    label="User"
    labelPlural="Users"
    icon={Users}
    list={UsersList}
    show={UserShow}
    create={UserCreate}
    edit={UserEdit}
  />
  <Resource
    name="products"
    label="Product"
    labelPlural="Products"
    icon={Package}
    list={ProductsList}
  />
</App>
```

Resources are automatically registered on mount and unregistered on unmount.

#### AppShell

Main layout component with sidebar navigation.

```tsx
import { AppShell, NavMain, NavUser, AppBreadcrumbs } from '@mdxui/app'

<AppShell
  config={{ name: 'Admin' }}
  navigation={navGroups}
  user={currentUser}
  header={<TeamSwitcher />}
  nav={<NavMain />}
  footer={<NavUser />}
  pageHeader={<AppBreadcrumbs basePath="/admin" />}
  collapsible="icon"     // 'offcanvas' | 'icon' | 'none'
  variant="inset"        // 'sidebar' | 'floating' | 'inset'
>
  {children}
</AppShell>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `AppConfig` | - | App configuration |
| `navigation` | `NavGroup[]` | `[]` | Navigation groups |
| `user` | `UserIdentity` | - | Current user |
| `header` | `ReactNode` | - | Sidebar header content |
| `nav` | `ReactNode` | - | Sidebar navigation content |
| `footer` | `ReactNode` | - | Sidebar footer content |
| `pageHeader` | `ReactNode` | - | Page header (breadcrumbs) |
| `collapsible` | `string` | `'icon'` | Collapse behavior |
| `variant` | `string` | `'inset'` | Sidebar style variant |

#### NavMain

Renders navigation groups in the sidebar.

```tsx
import { NavMain } from '@mdxui/app'

// Single group
<NavMain
  label="Platform"
  items={[
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: Settings,
      items: [
        { title: 'General', url: '/admin/settings/general' },
        { title: 'Team', url: '/admin/settings/team' },
      ],
    },
  ]}
/>

// Multiple groups
<NavMain
  groups={[
    { label: 'Main', items: [...] },
    { label: 'Settings', items: [...] },
  ]}
/>
```

#### NavUser

User menu in the sidebar footer with dropdown actions.

```tsx
import { NavUser } from '@mdxui/app'

<NavUser
  accountPath="/admin/settings"
  billingPath="/admin/settings/billing"
  showThemeToggle
  showNotifications
  actions={[
    { label: 'API Keys', icon: Key, href: '/admin/settings/api-keys' },
    { label: 'Support', icon: HelpCircle, onClick: openSupport },
  ]}
/>
```

#### PageHeader

Header area for pages with breadcrumbs, title, and actions.

```tsx
import { PageHeader } from '@mdxui/app'

<PageHeader
  breadcrumbs={<AppBreadcrumbs />}
  title="Users"
  description="Manage user accounts"
  actions={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add User
    </Button>
  }
/>
```

#### AppBreadcrumbs

Auto-generates breadcrumbs from the current URL path.

```tsx
import { AppBreadcrumbs } from '@mdxui/app'

// Auto-generate from path
<AppBreadcrumbs basePath="/admin" />

// With custom labels
<AppBreadcrumbs
  basePath="/admin"
  labels={{ 'api-keys': 'API Keys', team: 'Team Members' }}
/>

// Custom items
<AppBreadcrumbs
  items={[
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'John Doe' },
  ]}
/>
```

## TypeScript Types

All types are exported for use in your application:

```tsx
import type {
  // Core
  Identifier,
  RaRecord,

  // Auth
  UserIdentity,
  AuthProvider,
  LoginParams,

  // Navigation
  NavItem,
  NavGroup,
  BreadcrumbItemData,
  UserMenuAction,
  LinkProps,
  NavigationProvider,

  // Data
  DataProvider,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
  GetManyParams,
  GetManyResult,
  CreateParams,
  CreateResult,
  UpdateParams,
  UpdateResult,
  DeleteParams,
  DeleteResult,

  // Resources
  ResourceDefinition,
  ResourceContextValue,

  // Config
  AppConfig,
  Theme,
} from '@mdxui/app'
```

## Integration with @mdxui/admin

`@mdxui/app` provides the abstract framework layer. `@mdxui/admin` extends it with concrete UI components for admin interfaces:

```tsx
import { App } from '@mdxui/app'
import { List, Datagrid, TextField, EditButton } from '@mdxui/admin'

function UsersList() {
  return (
    <List>
      <Datagrid>
        <TextField source="name" />
        <TextField source="email" />
        <EditButton />
      </Datagrid>
    </List>
  )
}

<App dataProvider={dp} authProvider={ap} config={config}>
  <Resource name="users" list={UsersList} />
</App>
```

## Integration with @mdxui/do

For applications using `.do` domains and worker-based backends:

```tsx
import { App } from '@mdxui/app'
import { createDoDataProvider, DoProvider } from '@mdxui/do'

const doDataProvider = createDoDataProvider({
  apiUrl: 'https://api.example.do',
})

<DoProvider>
  <App
    dataProvider={doDataProvider}
    authProvider={doAuthProvider}
    config={{ name: 'My App' }}
  >
    {children}
  </App>
</DoProvider>
```

## Package Exports

The package provides subpath exports for tree-shaking:

```tsx
// Main entry (all exports)
import { App, useAuth, useDataProvider } from '@mdxui/app'

// Individual components
import { App } from '@mdxui/app/app'
import { Resource } from '@mdxui/app/resource'
import { AppShell } from '@mdxui/app/shell'
import { NavMain } from '@mdxui/app/nav-main'
import { NavUser } from '@mdxui/app/nav-user'
import { PageHeader } from '@mdxui/app/page-header'
import { AppBreadcrumbs } from '@mdxui/app/breadcrumbs'

// Context providers and hooks
import { useAuth, useDataProvider, useNavigation } from '@mdxui/app/context'

// Type definitions only
import type { DataProvider, AuthProvider } from '@mdxui/app/types'
```

## License

MIT
