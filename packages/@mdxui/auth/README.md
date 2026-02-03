---
name: "@mdxui/auth"
version: 1.1.1
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
  monthly: 25
published: "2026-01-24T14:38:23.898Z"
updated: "2026-01-25T12:00:58.888Z"
---

# @mdxui/auth

Authentication components and WorkOS AuthKit wrappers for mdxui applications. Provides a complete authentication solution with type-safe Zod schemas that extend mdxui's type system.

## Installation

```bash
pnpm add @mdxui/auth
```

## Quick Start

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
