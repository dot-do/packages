---
name: "@mdxui/do"
version: 4.0.8
description: Admin interface for .do platform - manage Durable Objects via RPC
license: MIT
downloads:
  monthly: 151
published: "2026-01-12T15:43:25.583Z"
updated: "2026-01-29T23:15:07.936Z"
---

# @mdxui/do

[![npm version](https://img.shields.io/npm/v/@mdxui/do.svg)](https://www.npmjs.com/package/@mdxui/do)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

React components and hooks for building admin interfaces for .do Durable Objects.

## Installation

```bash
pnpm add @mdxui/do
```

## Quick Start

### Full Admin Dashboard

Use `DOApp` for a complete admin experience with routing and authentication:

```tsx
import { DOApp } from '@mdxui/do/app'

function App() {
  return (
    <DOApp
      config={{
        do: {
          apiEndpoint: 'https://api.example.do',
          authMethod: 'jwt',
          bindings: [],
          realTimeUpdates: false,
        },
        identity: {
          clientId: 'client_xxx', // WorkOS client ID
          devMode: true,
        },
      }}
    />
  )
}
```

### Custom UI with Provider

For custom UIs, use `DOProvider` directly:

```tsx
import { DOProvider, useThings } from '@mdxui/do'

function App() {
  return (
    <DOProvider
      config={{
        apiEndpoint: 'https://api.example.do',
        authMethod: 'none',
        bindings: [],
        realTimeUpdates: false,
      }}
    >
      <TaskList />
    </DOProvider>
  )
}

function TaskList() {
  const { data, isLoading } = useThings({ type: 'Task' })

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {data?.data.map((task) => (
        <li key={task.id}>{task.name}</li>
      ))}
    </ul>
  )
}
```

## Views

Four view components for managing Things:

```tsx
import {
  DataBrowserView,   // Browse/search with filtering
  DataGridView,      // Spreadsheet-style editing
  DocumentEditorView, // Form-based editing
  FunctionEditorView  // Execute functions
} from '@mdxui/do/views'
```

## Hooks

### Data Fetching

```tsx
import { useThings, useThing, useCreateThing } from '@mdxui/do'

// List things
const { data } = useThings({ type: 'Task' })

// Get single thing
const { data } = useThing({ ns: 'default', type: 'Task', id: 'task-1' })

// Create thing
const create = useCreateThing()
create.mutate({ ns: 'default', type: 'Task', name: 'New Task', data: {} })
```

### Discovery

```tsx
import { useNamespaces, useTypes, useSchema } from '@mdxui/do'

const { data: namespaces } = useNamespaces()
const { data: types } = useTypes()
const { data: schema } = useSchema('Task')
```

### State Management

Endpoint and namespace state is managed via TanStack Query with localStorage persistence:

```tsx
import { useDOState, useEndpoint, useSetEndpoint } from '@mdxui/do'

// Combined hook for all state
const { endpoint, setEndpoint, namespace, setNamespace, recentEndpoints } = useDOState({
  endpoint: 'https://api.example.do', // Required: fallback from config
})

// Or use individual hooks
const endpoint = useEndpoint('https://api.example.do')
const { mutate: setEndpoint } = useSetEndpoint()
```

State persists across sessions via localStorage and automatically invalidates data queries when the endpoint changes.

## Architecture

`DOApp` provides a complete admin dashboard with:

- **TanStack Router** for client-side navigation
- **WorkOS AuthKit** for authentication
- **TanStack Query** for data fetching/caching
- **capnweb** for WebSocket RPC to Durable Objects

The auth flow:
1. User signs in via WorkOS
2. Access token is passed to `DOProvider`
3. RPC calls include token as `?token=` query param
4. Backend validates JWT

## Configuration

### DOAdminConfig (for DOProvider)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `apiEndpoint` | `string` | Yes | Base URL for API |
| `authMethod` | `'none' \| 'jwt' \| 'api-key'` | Yes | Auth method |
| `authToken` | `string` | No | JWT or API key |
| `bindings` | `DOBinding[]` | Yes | DO bindings |
| `realTimeUpdates` | `boolean` | Yes | Enable subscriptions |
| `clientType` | `'capnweb' \| 'json-rpc'` | No | RPC client type |

### DOShellConfig (for DOApp)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `do` | `DOAdminConfig` | Yes | API config |
| `identity` | `DOIdentity` | Yes | WorkOS auth config |
| `branding` | `{ name?, logo? }` | No | Branding |
| `basePath` | `string` | No | URL base path |

## Exports

```tsx
// Main
import { DOProvider, useThings, DOApp } from '@mdxui/do'

// App (routing, shell, auth)
import { DOApp, DOShell, AuthGate } from '@mdxui/do/app'

// Providers
import { DOProvider, useDO } from '@mdxui/do/providers'

// Hooks
import { useThings, useCreateThing } from '@mdxui/do/hooks'

// State (TanStack Query-based)
import { useDOState, useEndpoint, useSetEndpoint, useNamespace } from '@mdxui/do'

// Views
import { DataBrowserView, DataGridView } from '@mdxui/do/views'

// Types
import type { Thing, DOAdminConfig } from '@mdxui/do/types'
```

## License

MIT
