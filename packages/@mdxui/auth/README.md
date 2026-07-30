---
name: "@mdxui/auth"
version: 1.5.3
description: Authentication components and WorkOS AuthKit wrappers for mdxui
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdxui
  - react
  - auth
  - authentication
  - workos
  - authkit
  - identity
downloads:
  monthly: 76
published: "2026-01-24T14:38:23.898Z"
updated: "2026-06-10T17:00:47.201Z"
---

# @mdxui/auth

Authentication components and WorkOS AuthKit wrappers for mdxui applications. Provides a complete authentication solution with type-safe Zod schemas that extend mdxui's type system.

## Installation

```bash
pnpm add @mdxui/auth
```

## Quick Start

### Zero-Config AuthApp (Recommended)

The easiest way to get started - just set environment variables:

```bash
# .env
VITE_WORKOS_CLIENT_ID=client_xxx
VITE_APP_NAME=My App
```

```tsx
import { AuthApp } from '@mdxui/auth/shell'

function App() {
  return <AuthApp />
}
```

That's it! You get a complete authenticated app with:
- Sidebar navigation with org switcher
- Profile, Security, Sessions, API Keys, Team, and Integrations pages
- Error boundaries with friendly messages
- Theme support

### With Explicit Config

```tsx
import { AuthApp } from '@mdxui/auth/shell'

function App() {
  return (
    <AuthApp
      config={{
        branding: { name: 'My App' },
        identity: {
          clientId: 'client_xxx',
          redirectUri: 'https://myapp.com/callback',
        },
      }}
    />
  )
}
```

### Custom Routes

```tsx
import { AuthApp, accountRoutes, developerRoutes } from '@mdxui/auth/shell'
import { FileText } from 'lucide-react'
import { DocsPage } from './pages/DocsPage'

function App() {
  return (
    <AuthApp
      config={{
        branding: { name: 'My App' },
        identity: { clientId: 'client_xxx' },
        routes: [
          ...accountRoutes,      // Profile, Security, Sessions
          ...developerRoutes,    // API Keys
          {
            key: 'docs',
            path: '/docs',
            label: 'Documentation',
            icon: FileText,
            component: DocsPage,
            group: 'developer',
          },
        ],
      }}
    />
  )
}
```

### Prebuilt Static App (Cloudflare Workers / Static Hosting)

For deployments where you don't want a build step, use the prebuilt app. The package includes a complete SPA in the `app/` directory with all CSS (Tailwind), React, and routing bundled.

#### Option A: Serve with Hono (Recommended)

Use Hono to serve the prebuilt app with config injection from environment variables:

**wrangler.toml:**
```toml
name = "my-auth-app"
main = "src/index.ts"

[assets]
directory = "node_modules/@mdxui/auth/app"

[vars]
WORKOS_CLIENT_ID = "client_01EXAMPLE"
APP_NAME = "My App"
```

**src/index.ts:**
```ts
import { Hono } from 'hono'

type Bindings = {
  ASSETS: Fetcher
  WORKOS_CLIENT_ID: string
  APP_NAME?: string
  APP_TAGLINE?: string
  LOGO_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Serve config from environment variables
app.get('/auth-config.json', (c) => {
  return c.json({
    clientId: c.env.WORKOS_CLIENT_ID,
    appName: c.env.APP_NAME ?? 'App',
    tagline: c.env.APP_TAGLINE,
    logoUrl: c.env.LOGO_URL,
  })
})

// Serve static assets (SPA fallback handled by assets)
app.all('*', async (c) => {
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
```

#### Option B: Vanilla Worker

If you're not using Hono, use the standard Worker API:

**src/index.ts:**
```ts
export interface Env {
  ASSETS: Fetcher
  WORKOS_CLIENT_ID: string
  APP_NAME?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Serve config from environment variables
    if (url.pathname === '/auth-config.json') {
      return Response.json({
        clientId: env.WORKOS_CLIENT_ID,
        appName: env.APP_NAME ?? 'App',
      })
    }

    // Serve static assets
    return env.ASSETS.fetch(request)
  }
}
```

Both approaches:
- No copying files needed
- Config comes from secure environment variables
- Easy to update by bumping the package version

#### Option C: Copy to Static Directory

Copy the prebuilt app and add your config file:

**1. Install and copy:**
```bash
pnpm add @mdxui/auth
cp -r node_modules/@mdxui/auth/app/* public/
```

**2. Create `public/auth-config.json`:**
```json
{
  "clientId": "client_01EXAMPLE",
  "appName": "My App"
}
```

**3. Configure wrangler.toml:**
```toml
name = "my-auth-app"

[assets]
directory = "public"
```

This approach:
- Works with any static hosting (Netlify, Vercel, S3, etc.)
- Config is a static file in your repo
- Requires re-copying after package updates

#### Config Options

| Field | Required | Description |
|-------|----------|-------------|
| `clientId` | Yes | WorkOS client ID |
| `appName` | No | App name (default: "App") |
| `tagline` | No | Subtitle shown in sidebar |
| `redirectUri` | No | OAuth redirect URI |
| `apiHostname` | No | WorkOS API hostname |
| `devMode` | No | Enable dev mode (default: false) |
| `logoUrl` | No | URL to logo image |

### Traditional Setup (Without Shell)

```tsx
import {
  IdentityProvider,
  AuthGate,
  useAuth,
  UserProfile,
} from '@mdxui/auth'

function App() {
  return (
    <IdentityProvider clientId="client_xxx">
      <AuthGate>
        <Dashboard />
      </AuthGate>
    </IdentityProvider>
  )
}

function Dashboard() {
  const { user, getAccessToken } = useAuth()

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <UserProfile authToken={getAccessToken} />
    </div>
  )
}
```

## Features

- **Zero-Config AuthApp** - Complete authenticated app shell with environment variable support
- **Pre-built Pages** - Profile, Security, Sessions, API Keys, Team, and Integrations pages
- **Route Presets** - Composable route groups (`accountRoutes`, `developerRoutes`, `adminRoutes`)
- **SidebarOrgSwitcher** - Auto-wired org switcher with branding fallback
- **WidgetErrorBoundary** - Friendly, contextual error messages for widget failures
- **Authentication Providers** - `IdentityProvider` and `AuthGate` for managing auth state
- **WorkOS Widgets** - Pre-built components for user management (profile, security, API keys)
- **Vault Components** - UI for managing encrypted secrets with `VaultProvider`
- **Secrets Manager** - Full-featured secrets management widget
- **Type-Safe Schemas** - Zod schemas extending mdxui's `UserIdentity` and `Session` types
- **React Hooks** - `useAuth`, `useWidgetToken`, and `useVault` for accessing state
- **UI Components** - Sign in/out buttons, user menu, team switcher

## Exports

### Main Entry (`@mdxui/auth`)

Everything you need for most use cases:

```tsx
import {
  // Providers
  IdentityProvider,
  IdentityProviderMinimal,
  AuthGate,
  WidgetsProvider,
  VaultProvider,

  // Widgets
  UserProfile,
  UserSecurity,
  UserSessions,
  ApiKeys,
  UsersManagement,
  OrganizationSwitcher,

  // Vault Components
  VaultList,
  VaultItemCard,
  VaultInputModal,
  VaultDeleteDialog,
  VaultEmptyState,
  SecretsManager,

  // Components
  SignInButton,
  SignOutButton,
  UserMenu,
  TeamSwitcher,

  // Hooks
  useAuth,
  useWidgetToken,
  useVault,
  useVaultContext,

  // Schemas
  AuthUserSchema,
  AuthSessionSchema,
  AuthOrganizationSchema,
} from '@mdxui/auth'

// Types
import type {
  AuthUser,
  AuthSession,
  AuthOrganization,
  AuthToken,
  VaultClient,
  VaultItem,
  VaultField,
} from '@mdxui/auth'
```

### Shell Exports (`@mdxui/auth/shell`)

Complete authenticated app shell with routing:

```tsx
import {
  // App Components
  AuthApp,              // Zero-config app with built-in routing
  AuthAppWithChildren,  // App shell without routing (bring your own)
  AuthAppProvider,      // Providers only (for custom layouts)
  AuthShell,            // Shell layout component
  AuthShellNav,         // Navigation component

  // Shell Components
  SidebarOrgSwitcher,   // Org switcher with branding fallback
  WidgetErrorBoundary,  // Error boundary with friendly messages
  Breadcrumbs,          // Breadcrumb navigation

  // Pre-built Pages
  ProfilePage,          // User profile management
  SecurityPage,         // Password and MFA settings
  SessionsPage,         // Active sessions management
  ApiKeysPage,          // API key management
  TeamPage,             // Team member management (requires org)
  IntegrationsPage,     // Third-party integrations

  // Route Presets
  defaultRoutes,        // All default routes
  defaultGroups,        // Default route groups
  accountRoutes,        // Profile, Security, Sessions
  developerRoutes,      // API Keys
  adminRoutes,          // Team management
  integrationRoutes,    // Integrations

  // Config Hooks
  useAuthShellConfig,
  useAuthShellRoutes,
  useAuthShellBranding,
} from '@mdxui/auth/shell'

// Types
import type {
  AuthAppConfig,
  AuthAppProps,
  AuthAppRoute,
  AuthShellBranding,
  AuthShellIdentity,
} from '@mdxui/auth/shell'
```

### Subpath Exports

For more granular imports:

```tsx
// Only providers
import { IdentityProvider, AuthGate } from '@mdxui/auth/providers'

// Only widgets
import { UserProfile, ApiKeys } from '@mdxui/auth/widgets'

// Only components
import { SignInButton, UserMenu } from '@mdxui/auth/components'

// Only hooks
import { useAuth, useWidgetToken } from '@mdxui/auth/hooks'

// Only schemas (for runtime validation)
import { AuthUserSchema, AuthSessionSchema } from '@mdxui/auth/schemas'

// Only types
import type { AuthUser, AuthGateProps } from '@mdxui/auth/types'
```

## Type System

### AuthUser extends UserIdentity

`AuthUser` extends mdxui's `UserIdentity` with WorkOS-specific fields:

```tsx
import type { UserIdentity } from 'mdxui/admin'
import type { AuthUser } from '@mdxui/auth'

// AuthUser includes all UserIdentity fields plus WorkOS extras
const user: AuthUser = {
  // From UserIdentity
  id: 'user_123',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: ['admin'],
  permissions: ['users:read', 'users:write'],
  organizationId: 'org_123',

  // WorkOS-specific
  emailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
}

// AuthUser is assignable to UserIdentity
const identity: UserIdentity = user // Works!
```

### Runtime Validation with Zod

Use schemas for validating API responses:

```tsx
import { AuthUserSchema, AuthSessionSchema } from '@mdxui/auth/schemas'

// Validate user data
const result = AuthUserSchema.safeParse(apiResponse)
if (result.success) {
  console.log('Valid user:', result.data.email)
} else {
  console.error('Invalid user:', result.error)
}

// Session with impersonation support
const sessionResult = AuthSessionSchema.safeParse({
  id: 'session_123',
  userId: 'user_123',
  createdAt: '2024-01-01T00:00:00Z',
  expiresAt: '2024-01-02T00:00:00Z',
  impersonator: {
    email: 'admin@example.com',
    reason: 'Customer support',
  },
})
```

## AuthApp (Shell)

### Zero-Config with Environment Variables

AuthApp can read configuration from environment variables, perfect for Cloudflare Workers Static Assets:

```bash
# .env
VITE_WORKOS_CLIENT_ID=client_xxx        # Required
VITE_WORKOS_REDIRECT_URI=https://...    # Optional
VITE_WORKOS_API_HOSTNAME=auth.apis.do   # Optional
VITE_WORKOS_DEV_MODE=true               # Optional
VITE_APP_NAME=My App                    # Optional (defaults to "App")
VITE_APP_TAGLINE=Best app ever          # Optional
```

```tsx
import { AuthApp } from '@mdxui/auth/shell'

// That's it - reads config from env vars
function App() {
  return <AuthApp />
}
```

### Route Presets

Compose routes from presets:

```tsx
import {
  AuthApp,
  accountRoutes,      // Profile, Security, Sessions
  developerRoutes,    // API Keys
  adminRoutes,        // Team
  integrationRoutes,  // Integrations
  defaultGroups,
} from '@mdxui/auth/shell'

function App() {
  return (
    <AuthApp
      config={{
        branding: { name: 'My App' },
        identity: { clientId: 'client_xxx' },
        groups: defaultGroups,
        routes: [
          ...accountRoutes,
          ...developerRoutes,
          // Exclude adminRoutes if you don't need team management
        ],
      }}
    />
  )
}
```

### WidgetErrorBoundary

Wraps WorkOS widgets with friendly error handling:

```tsx
import { WidgetErrorBoundary } from '@mdxui/auth/shell'
import { UserProfile } from '@mdxui/auth/widgets'

function ProfilePage() {
  return (
    <WidgetErrorBoundary widgetName="profile">
      <UserProfile authToken={getAccessToken} />
    </WidgetErrorBoundary>
  )
}
// On error: "Your profile is camera shy right now..."
// Unknown widgets: "Something went wrong loading your API Keys..."
```

### Custom Sidebar Header

```tsx
import { AuthApp, SidebarOrgSwitcher } from '@mdxui/auth/shell'

// Default: SidebarOrgSwitcher is included automatically
<AuthApp config={config} />

// Custom header content
<AuthApp
  config={config}
  sidebarHeaderContent={<MyCustomHeader />}
/>
```

## Components

### IdentityProvider

Wraps your app with authentication context:

```tsx
<IdentityProvider
  clientId="client_xxx"
  devMode={process.env.NODE_ENV === 'development'}
  redirectUri="http://localhost:3000/callback"
>
  <App />
</IdentityProvider>
```

### AuthGate

Protects routes requiring authentication:

```tsx
// Redirect unauthenticated users
<AuthGate onUnauthenticated="redirect" redirectUrl="/login">
  <ProtectedContent />
</AuthGate>

// Show landing page for unauthenticated users
<AuthGate
  onUnauthenticated="landing"
  landingComponent={<LandingPage />}
  loadingComponent={<LoadingSpinner />}
>
  <Dashboard />
</AuthGate>

// Allow access but with different content
<AuthGate onUnauthenticated="allow">
  {({ user }) => user ? <Dashboard /> : <PublicView />}
</AuthGate>
```

### Widgets

Pre-built WorkOS widgets for user management:

```tsx
function SettingsPage() {
  const { getAccessToken } = useAuth()

  return (
    <WidgetsProvider appearance="dark">
      <Tabs>
        <TabPanel label="Profile">
          <UserProfile authToken={getAccessToken} />
        </TabPanel>
        <TabPanel label="Security">
          <UserSecurity authToken={getAccessToken} />
        </TabPanel>
        <TabPanel label="Sessions">
          <UserSessions authToken={getAccessToken} />
        </TabPanel>
        <TabPanel label="API Keys">
          <ApiKeys authToken={getAccessToken} />
        </TabPanel>
      </Tabs>
    </WidgetsProvider>
  )
}
```

### Hooks

#### useAuth

Access authentication state and methods:

```tsx
function ProfileButton() {
  const {
    user,           // Current user or null
    isLoading,      // Loading state
    isAuthenticated,// Boolean auth status
    signIn,         // Sign in method
    signOut,        // Sign out method
    getAccessToken, // Get access token for API calls
  } = useAuth()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <SignInButton />

  return <UserMenu user={user} onSignOut={signOut} />
}
```

#### useWidgetToken

Fetch tokens for WorkOS widgets:

```tsx
function ApiKeysWidget() {
  const { token, loading, error, refetch } = useWidgetToken({
    widget: 'api-keys',
    organizationId: 'org_123',
    endpoint: '/api/workos/widget-token', // default
  })

  if (loading) return <Spinner />
  if (error) return <Error message={error} onRetry={refetch} />

  return <ApiKeys authToken={token} />
}
```

## Vault Components

@mdxui/auth includes components for managing encrypted secrets via WorkOS Vault.

### VaultProvider

Wrap your app with `VaultProvider` to enable vault functionality:

```tsx
import { VaultProvider, useVault } from '@mdxui/auth'

function App() {
  const vaultClient = useMyVaultClient() // Your vault client implementation

  return (
    <VaultProvider client={vaultClient}>
      <SecretsPage />
    </VaultProvider>
  )
}
```

### useVault Hook

Access vault state and operations:

```tsx
function SecretsPage() {
  const {
    items,        // Array of vault items
    isLoading,    // Loading state
    error,        // Error message if any
    createItem,   // Create new secret
    updateItem,   // Update existing secret
    deleteItem,   // Delete a secret
    refresh,      // Refresh the list
  } = useVault()

  return <VaultList items={items} onRefresh={refresh} />
}
```

### Vault UI Components

Pre-built components for secrets management:

```tsx
import {
  VaultList,
  VaultItemCard,
  VaultInputModal,
  VaultDeleteDialog,
  VaultEmptyState,
} from '@mdxui/auth'

function SecretsManager() {
  const { items, isLoading, createItem, deleteItem } = useVault()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  if (isLoading) return <Spinner />
  if (items.length === 0) return <VaultEmptyState onCreate={() => setShowCreate(true)} />

  return (
    <>
      <VaultList
        items={items}
        onItemClick={(item) => console.log('View', item)}
        onItemDelete={(item) => setDeleteTarget(item)}
      />

      <VaultInputModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (data) => {
          await createItem(data)
          setShowCreate(false)
        }}
      />

      <VaultDeleteDialog
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteItem(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />
    </>
  )
}
```

### SecretsManager Widget

A complete, ready-to-use secrets management interface:

```tsx
import { SecretsManager } from '@mdxui/auth'

function SettingsPage() {
  return (
    <SecretsManager
      context={{ organizationId: 'org_123' }}
      onSecretChange={(secret) => console.log('Changed:', secret)}
    />
  )
}
```

## API Reference

### Schemas

| Schema | Extends | Description |
|--------|---------|-------------|
| `AuthUserSchema` | `UserIdentitySchema` | User with WorkOS fields |
| `AuthSessionSchema` | `SessionSchema` | Session with impersonation |
| `AuthOrganizationSchema` | - | WorkOS organization |
| `ImpersonatorSchema` | - | Admin impersonation info |
| `AuthGatePropsSchema` | - | AuthGate component props |
| `WidgetsProviderPropsSchema` | - | WidgetsProvider props |

### Types

| Type | Description |
|------|-------------|
| `AuthUser` | Inferred from `AuthUserSchema` |
| `AuthSession` | Inferred from `AuthSessionSchema` |
| `AuthOrganization` | WorkOS organization |
| `AuthToken` | `string \| (() => Promise<string>)` |
| `Impersonator` | Admin performing impersonation |

## License

MIT
