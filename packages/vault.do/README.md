---
name: vault.do
version: 0.1.0
description: Managed encrypted secrets storage for the .do platform
license: MIT
repository: "https://github.com/dot-do/vault"
homepage: "https://github.com/dot-do/vault#readme"
keywords:
  - vault
  - secrets
  - encryption
  - workos
  - dotdo
  - key-management
downloads:
  monthly: 18
published: "2026-01-25T11:31:14.561Z"
updated: "2026-01-25T11:31:14.825Z"
---

# vault.do

Managed encrypted secrets storage for the .do platform, powered by [WorkOS Vault](https://workos.com/vault).

## Packages

| Package | Description |
|---------|-------------|
| `vault.do` | Managed SDK with .do platform integration |
| `@dotdo/vault` | Core vault client (leaf package, minimal dependencies) |

## Installation

```bash
# Install the managed package
pnpm add vault.do

# Or install just the core package
pnpm add @dotdo/vault
```

## Quick Start

```typescript
import { set, get, del } from 'vault.do'

// Store a secret
await set('api:stripe', 'sk_live_...')

// Retrieve a secret
const stripeKey = await get('api:stripe')

// Delete a secret
await del('api:stripe')
```

## Configuration

Set your WorkOS API key via environment variable:

```bash
export WORKOS_API_KEY=sk_...
```

Or configure programmatically:

```typescript
import { configure } from 'vault.do'

configure({
  apiKey: 'sk_...',
  clientId: 'client_...',
  organizationId: 'org_...',
})
```

## Multi-Tenant Usage

### Organization-Scoped Vault

```typescript
import { createOrgVault } from 'vault.do'

const vault = createOrgVault('org_123')
await vault.set('config:feature-flags', JSON.stringify({ newUI: true }))
```

### User-Scoped Vault

```typescript
import { createUserVault } from 'vault.do'

const vault = createUserVault('user_456', 'org_123')
await vault.set('preference:theme', 'dark')
```

## Hono Middleware (Cloudflare Workers)

```typescript
import { Hono } from 'hono'
import { vault, injectSecret, type VaultVariables } from 'vault.do/hono'

const app = new Hono<{ Variables: VaultVariables }>()

// Add vault client to all requests
app.use('*', vault({
  getContext: (c) => ({
    organizationId: c.get('organizationId'),
  })
}))

// Inject secrets into context
app.use('/api/*', injectSecret('api:stripe', 'stripeApiKey'))

app.post('/charge', async (c) => {
  const stripeKey = c.get('stripeApiKey')
  // Use the decrypted Stripe API key
})
```

## React Integration

Use vault.do with React via `vault.do/react`:

```tsx
import {
  VaultDoProvider,
  useVaultDo,
  useSecret,
  useSecrets,
} from 'vault.do/react'

function App() {
  return (
    <VaultDoProvider config={{ organizationId: 'org_123' }}>
      <SecretsPage />
    </VaultDoProvider>
  )
}

function SecretsPage() {
  const { client, isReady } = useVaultDo()
  const { secrets, isLoading, refresh } = useSecrets()

  if (!isReady || isLoading) return <Spinner />

  return (
    <ul>
      {secrets.map((secret) => (
        <li key={secret.id}>{secret.name}</li>
      ))}
    </ul>
  )
}
```

### useSecret Hook

Get or set a specific secret:

```tsx
function ApiKeyDisplay() {
  const { value, isLoading, error, set, refresh } = useSecret('api:stripe')

  if (isLoading) return <Spinner />
  if (error) return <Error message={error} />

  return (
    <div>
      <code>{value ? '••••••••' : 'Not set'}</code>
      <button onClick={() => set('sk_live_...')}>Update</button>
    </div>
  )
}
```

### useSecrets Hook

List and manage multiple secrets:

```tsx
function SecretsList() {
  const {
    secrets,      // Array of secrets
    isLoading,    // Loading state
    error,        // Error if any
    refresh,      // Refresh the list
    pagination,   // { hasMore, loadMore }
  } = useSecrets({ context: { organizationId: 'org_123' } })

  return (
    <>
      <ul>
        {secrets.map((s) => <li key={s.id}>{s.name}</li>)}
      </ul>
      {pagination.hasMore && (
        <button onClick={pagination.loadMore}>Load More</button>
      )}
    </>
  )
}
```

### With @mdxui/auth Vault Components

Combine with @mdxui/auth for a complete UI:

```tsx
import { VaultDoProvider, useVaultDo } from 'vault.do/react'
import { VaultProvider, SecretsManager } from '@mdxui/auth'

function App() {
  return (
    <VaultDoProvider config={{ organizationId: 'org_123' }}>
      <VaultWrapper>
        <SecretsManager />
      </VaultWrapper>
    </VaultDoProvider>
  )
}

function VaultWrapper({ children }) {
  const { client } = useVaultDo()
  return <VaultProvider client={client}>{children}</VaultProvider>
}
```

## itty-router Middleware

Use vault.do with itty-router:

```typescript
import { Router } from 'itty-router'
import { withVault, withSecret, requireSecret } from 'vault.do/itty'

const router = Router()

// Add vault client to all requests
router.all('*', withVault({
  getContext: (request, env) => ({
    organizationId: request.headers.get('x-org-id'),
  }),
}))

// Inject a specific secret
router.get('/api/payments', withSecret('stripe:api_key', 'stripeKey'), (request) => {
  const stripeKey = request.stripeKey
  // Use the decrypted key
})

// Require a secret (404 if not found)
router.post('/api/charge', requireSecret('stripe:api_key', 'stripeKey'), (request) => {
  // stripeKey is guaranteed to exist
})

export default router
```

## OAuth Token Storage

Use Vault as encrypted token storage for oauth.do:

```typescript
import { createVaultTokenStorage } from 'vault.do/oauth'
import { configure } from 'oauth.do'

const storage = createVaultTokenStorage({
  organizationId: 'org_123',
  userId: 'user_456',
})

configure({ storage })
```

### Multi-User Token Management

```typescript
import { createTokenStorageManager } from 'vault.do/oauth'

const manager = createTokenStorageManager({ organizationId: 'org_123' })

// Get storage for specific users
const user1Storage = manager.forUser('user_1')
const user2Storage = manager.forUser('user_2')

// Or shared org storage
const orgStorage = manager.forOrg()
```

## Core Package (@dotdo/vault)

The core package provides low-level vault operations without .do platform dependencies:

```typescript
import { createVaultClient, MemoryVaultStorage } from '@dotdo/vault'

// Production usage
const vault = createVaultClient({
  apiKey: 'sk_...',
  defaultContext: { organizationId: 'org_123' },
})

// Testing
const testVault = createVaultClient({
  storage: new MemoryVaultStorage(),
})
```

### Encryption Utilities

```typescript
import {
  generateKey,
  encrypt,
  decrypt,
  deriveKey,
  generateSalt,
} from '@dotdo/vault'

// Generate a random key
const key = await generateKey()

// Encrypt data
const encrypted = await encrypt('sensitive data', key)

// Decrypt data
const decrypted = await decrypt(encrypted, key)

// Derive key from password
const salt = generateSalt()
const derivedKey = await deriveKey('user-password', salt)
```

## API Reference

### vault.do

| Function | Description |
|----------|-------------|
| `set(name, value, context?)` | Store a secret |
| `get(name, context?)` | Retrieve a secret value |
| `getWithMetadata(name, context?)` | Retrieve a secret with metadata |
| `exists(name, context?)` | Check if a secret exists |
| `update(name, value, context?)` | Update or create a secret |
| `del(name, context?)` | Delete a secret |
| `list(options?)` | List all secrets |
| `getAll(context?)` | Get all secrets as key-value map |
| `createVault(config?)` | Create a new vault client |
| `createOrgVault(orgId, config?)` | Create org-scoped vault |
| `createUserVault(userId, orgId?, config?)` | Create user-scoped vault |
| `createTestVault(context?)` | Create in-memory vault for testing |

### @dotdo/vault

| Export | Description |
|--------|-------------|
| `VaultClient` | Main vault client class |
| `createVaultClient(config)` | Create WorkOS-backed client |
| `createMemoryVaultClient(context?)` | Create in-memory client |
| `WorkOSVaultStorage` | WorkOS storage implementation |
| `MemoryVaultStorage` | In-memory storage for testing |
| `VaultError` | Error class with codes |
| Encryption utilities | `encrypt`, `decrypt`, `generateKey`, etc. |

### vault.do/react

| Export | Description |
|--------|-------------|
| `VaultDoProvider` | React provider with .do configuration |
| `useVaultDo()` | Access configured vault client |
| `useSecret(name, options?)` | Get/set a specific secret |
| `useSecrets(options?)` | List secrets with pagination |

### vault.do/itty

| Export | Description |
|--------|-------------|
| `withVault(options?)` | Add vault client to requests |
| `withSecret(name, varName, options?)` | Inject secret into request |
| `requireSecret(name, varName, options?)` | Require secret (404 if missing) |
| `vaultMiddleware(options?)` | Configurable vault middleware |

## License

MIT
