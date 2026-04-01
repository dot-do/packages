---
name: "@mdxui/cockpit"
version: 7.0.5
description: App template components for mdxui - developer dashboards, auth flows, and SaaS patterns
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdxui
  - react
  - dashboard
  - developer-portal
  - saas
  - auth
  - components
downloads:
  monthly: 60
published: "2025-12-23T12:36:54.044Z"
updated: "2026-01-29T23:13:36.160Z"
---

# @mdxui/cockpit

App template components for mdxui - developer dashboards, auth flows, and SaaS patterns.

## Installation

```bash
npm install @mdxui/cockpit @mdxui/primitives @mdxui/themes mdxui
# or
pnpm add @mdxui/cockpit @mdxui/primitives @mdxui/themes mdxui
```

## Quick Start

```tsx
import { DeveloperDashboard } from '@mdxui/cockpit'

export default function Dashboard() {
  return (
    <DeveloperDashboard
      branding={{ name: 'My App', logo: <Logo /> }}
      theme="default"
    />
  )
}
```

## Composability

DeveloperDashboard is fully composable - you can add custom routes, hide built-in routes, and customize branding.

### Adding Custom Routes

```tsx
<DeveloperDashboard
  customRoutes={[
    {
      path: '/analytics',
      label: 'Analytics',
      icon: 'BarChart3',  // Lucide icon name
      element: <AnalyticsPage />,
      group: 'main',
    },
    {
      path: '/integrations',
      label: 'Integrations',
      icon: 'Plug',
      element: <IntegrationsPage />,
      group: 'settings',
    },
  ]}
/>
```

### Hiding Built-in Routes

```tsx
<DeveloperDashboard
  routes={{
    overview: true,
    apiKeys: true,
    webhooks: true,
    usage: false,      // Hide usage page
    billing: false,    // Hide billing page
    team: true,
    settings: true,
  }}
/>
```

### Full Configuration

```tsx
<DeveloperDashboard
  // Branding
  branding={{
    name: 'Acme API',
    logo: <AcmeLogo />,
  }}

  // Theme
  theme="stripe"

  // Route visibility
  routes={{
    overview: true,
    apiKeys: true,
    webhooks: true,
    usage: true,
    billing: true,
    team: true,
    settings: true,
  }}

  // Custom pages
  customRoutes={[
    { path: '/logs', label: 'Logs', icon: 'ScrollText', element: <LogsPage /> },
  ]}

  // Auth integration (WorkOS)
  identity={{
    provider: 'workos',
    clientId: process.env.WORKOS_CLIENT_ID,
  }}
/>
```

## Standalone Components

Use standalone components to embed individual pages in your own app shell without the full dashboard.

```tsx
import {
  StandaloneProvider,
  StandaloneAPIKeys,
  StandaloneWebhooks,
  StandaloneBilling,
  StandaloneTeam,
} from '@mdxui/cockpit'

function MySettings() {
  return (
    <StandaloneProvider config={{ theme: { preset: 'stripe' } }}>
      <Tabs>
        <TabsContent value="keys">
          <StandaloneAPIKeys />
        </TabsContent>
        <TabsContent value="webhooks">
          <StandaloneWebhooks />
        </TabsContent>
      </Tabs>
    </StandaloneProvider>
  )
}
```

### With Backend Integration

Standalone components accept data and callbacks for real backend integration:

```tsx
import { StandaloneAPIKeys, type ApiKey } from '@mdxui/cockpit'

function APIKeysSettings() {
  const [keys, setKeys] = useState<ApiKey[]>([])

  return (
    <StandaloneAPIKeys
      keys={keys}
      onCreateKey={async (name) => {
        const result = await api.createKey(name)
        setKeys([...keys, result])
        return { id: result.id, key: result.key }
      }}
      onRevokeKey={async (id) => {
        await api.revokeKey(id)
        setKeys(keys.filter(k => k.id !== id))
      }}
      onRenameKey={async (id, name) => {
        await api.renameKey(id, name)
        setKeys(keys.map(k => k.id === id ? { ...k, name } : k))
      }}
    />
  )
}
```

### Available Standalone Components

| Component | Data Prop | Callbacks |
|-----------|-----------|-----------|
| `StandaloneAPIKeys` | `keys: ApiKey[]` | `onCreateKey`, `onRevokeKey`, `onRenameKey` |
| `StandaloneWebhooks` | `endpoints: WebhookEndpoint[]` | `onCreateEndpoint`, `onUpdateEndpoint`, `onDeleteEndpoint` |
| `StandaloneBilling` | `billingData: BillingData` | `onManagePlan`, `onUpdatePaymentMethod`, `onDownloadInvoice`, `onToggleAlerts` |
| `StandaloneTeam` | — | `useMockWidgets` (uses WorkOS widgets) |

All standalone components support `hideHeader` (default: true) and `className` props.

## Auth Pages

```tsx
import { LoginPage, SignupPage, OTPPage } from '@mdxui/cockpit/auth'

// Login page with all options
<LoginPage
  logo={<Logo />}
  title="Welcome back"
  onSubmit={handleLogin}
  providers={['google', 'github']}
/>

// Signup with onboarding
<SignupPage
  logo={<Logo />}
  onSubmit={handleSignup}
/>

// OTP verification
<OTPPage
  logo={<Logo />}
  email="user@example.com.ai"
  onVerify={handleVerify}
/>
```

## Components

### Main Dashboard
- `App` / `DeveloperDashboard` - Full dashboard wrapper with routing
- `DashboardLayout` - Layout with sidebar navigation
- `DashboardGrid` - Responsive grid for dashboard widgets

### Auth Components
- `AuthLayout` - Shared auth page layout
- `LoginPage` - Login with social providers
- `SignupPage` - Registration flow
- `PasswordResetPage` - Password recovery
- `OTPPage` - One-time password verification
- `OnboardingPage` - User onboarding wizard

### Dashboard Widgets
- `KPICard` - Key performance indicator cards
- `AreaChart` - Area chart visualization
- `BarChart` - Bar chart visualization
- `LineChart` - Line chart visualization
- `DataTable` - Sortable, filterable data table
- `ActivityFeed` - Recent activity timeline

### App Features
- `APIKeyManager` - API key creation and management
- `TeamManager` - Team member management
- `Billing` - Subscription and billing UI
- `UserProfile` - User profile settings
- `SettingsPage` - App settings

### Navigation
- `NavMain` - Main navigation menu
- `NavUser` - User menu dropdown
- `TeamSwitcher` - Workspace/team switcher
- `CommandPalette` - Keyboard-driven command palette

### Theme System
```tsx
import { useThemeStore, ThemeScript } from '@mdxui/cockpit/themes'

// In your root layout
<ThemeScript />

// Toggle theme
const { theme, setTheme } = useThemeStore()
```

## Exports

```tsx
// Main export
import { DeveloperDashboard } from '@mdxui/cockpit'

// Standalone components (embed in your own shell)
import {
  StandaloneProvider,
  StandaloneAPIKeys,
  StandaloneWebhooks,
  StandaloneBilling,
  StandaloneTeam,
  type ApiKey,
  type WebhookEndpoint,
  type BillingData,
} from '@mdxui/cockpit'

// Developer components
import { KPICard, DataTable } from '@mdxui/cockpit/developer'

// Auth pages
import { LoginPage, SignupPage } from '@mdxui/cockpit/auth'

// Theme utilities
import { useThemeStore, ThemeScript } from '@mdxui/cockpit/themes'
```

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `@mdxui/primitives` - Base UI components
- `@mdxui/themes` - Theme system
- `mdxui` - Core types and contracts

## Links

- [Documentation](https://mdxui.dev)
- [GitHub](https://github.com/dot-do/ui)
- [npm](https://www.npmjs.com/package/@mdxui/cockpit)

## Architecture

@mdxui/cockpit sits at the **template layer** - implementing the `AppComponents` interface from mdxui for developer dashboards and SaaS apps.

```
┌─────────────────────────────────────────────────────────────────┐
│                      mdxui (interfaces)                          │
│   AppComponents interface defines: Dashboard, APIKeys, Billing   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ implements
┌─────────────────────────────────────────────────────────────────┐
│                  @mdxui/primitives (raw UI)                      │
│   Button, Card, Dialog - base building blocks                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│            ★ @mdxui/cockpit (app templates) ← YOU ARE HERE       │
│   DeveloperDashboard, APIKeys, Webhooks, Billing, Team...        │
│   Implements AppComponents for end-user apps                     │
└─────────────────────────────────────────────────────────────────┘
```

### Relationship to Other Packages

| Package | Relationship |
|---------|--------------|
| `mdxui` | Implements `AppComponents` interface |
| `@mdxui/primitives` | Uses for base UI components |
| `@mdxui/themes` | Uses for theming |
| `@mdxui/admin` | Admin-focused components (operators) |
| `saaskit` | Generates apps using cockpit components |

### Key Distinction: cockpit vs admin

| Package | For | Focus |
|---------|-----|-------|
| `@mdxui/cockpit` | End users, customers | Product experience, developer tools |
| `@mdxui/admin` | Operators, admins | CRUD, data management, internal tools |

## License

MIT
