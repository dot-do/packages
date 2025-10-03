# @dot-do/payload-multitenant

Multi-tenant marketplace platform with Workers for Platforms integration for PayloadCMS.

## Features

✅ **Domain-Based Tenant Detection** - Automatic tenant routing via middleware
✅ **Custom Branding** - Logo, colors, fonts, custom CSS per tenant
✅ **Stripe Connect Billing** - Automated revenue sharing and monthly fees
✅ **Workers for Platforms** - Isolated deployments with DO SQLite per tenant
✅ **Feature Flags** - SSO, API access, analytics, white-label
✅ **Limits & Quotas** - Users, services, storage, API calls per tenant
✅ **Production Ready** - TypeScript, tested, documented

## Installation

```bash
pnpm add @dot-do/payload-multitenant
```

## Quick Start

### 1. Add Tenants Collection

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { Tenants } from '@dot-do/payload-multitenant'

export default buildConfig({
  collections: [
    Tenants,
    // ... your other collections
  ],
  // ... other config
})
```

### 2. Add Middleware

```typescript
// middleware.ts
export { middleware, config } from '@dot-do/payload-multitenant/middleware'
```

### 3. Use in Server Components

```typescript
// app/page.tsx
import { getCurrentTenant, getTenantBranding } from '@dot-do/payload-multitenant'
import config from '@payload-config'

export default async function Page() {
  const tenant = await getCurrentTenant(config)

  if (!tenant) {
    return <div>Tenant not found</div>
  }

  const branding = getTenantBranding(tenant)

  return (
    <div style={{ color: branding.primaryColor }}>
      <h1>{tenant.name}</h1>
      <p>{tenant.siteSettings?.siteDescription}</p>
    </div>
  )
}
```

## Configuration

### Environment Variables

```bash
# Required
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
STRIPE_SECRET_KEY=sk_test_xxx

# Optional
PLATFORM_DOMAIN=services.delivery
DEFAULT_PLATFORM_FEE=15
DEFAULT_MONTHLY_FEE=500
```

### TypeScript Configuration

```typescript
// lib/config.ts
import { createMultiTenantConfig } from '@dot-do/payload-multitenant'

export const multiTenantConfig = createMultiTenantConfig({
  platformDomain: process.env.PLATFORM_DOMAIN!,
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
  },
  defaults: {
    platformFee: 15, // 15%
    monthlyFee: 500, // $500/month
    plan: 'starter',
  },
})
```

## Usage

### Tenant Detection

The middleware automatically detects tenants from the hostname:

```
Request: https://acme.services.delivery
         ↓
Middleware: Sets x-tenant-hostname header
         ↓
getCurrentTenant(): Queries database for tenant with domain "acme.services.delivery"
         ↓
Returns: Tenant object
```

### Custom Domains

Tenants can use custom domains:

```typescript
// Tenant configuration in admin
{
  domain: "marketplace.acme.com", // Custom domain
  features: {
    customDomain: true
  }
}
```

The middleware handles both platform subdomains and custom domains automatically.

### Tenant Content

Filter collections by tenant:

```typescript
import { getTenantContent } from '@dot-do/payload-multitenant'
import config from '@payload-config'

// Get all services for current tenant
const services = await getTenantContent(config, 'services', tenant.id, {
  where: {
    status: { equals: 'published' },
  },
  limit: 20,
  sort: '-createdAt',
})
```

### Feature Flags

Check if tenant has feature enabled:

```typescript
import { hasTenantFeature } from '@dot-do/payload-multitenant'

if (hasTenantFeature(tenant, 'sso')) {
  // Show SSO login button
}

if (hasTenantFeature(tenant, 'apiAccess')) {
  // Show API documentation
}
```

### Limits & Quotas

Check if tenant is within limits:

```typescript
import { isWithinTenantLimit } from '@dot-do/payload-multitenant'

const currentUsers = await payload.count({ collection: 'users', where: { tenant: { equals: tenant.id } } })

if (!isWithinTenantLimit(tenant, 'maxUsers', currentUsers)) {
  return Response.json({ error: 'User limit reached' }, { status: 403 })
}
```

## Workers for Platforms

### Provisioning a Tenant

```typescript
// app/api/tenants/[id]/provision/route.ts
import { provisionTenant } from '@dot-do/payload-multitenant'
import { getTenantById } from '@dot-do/payload-multitenant'
import config from '@payload-config'
import { multiTenantConfig } from '@/lib/config'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const tenant = await getTenantById(config, params.id)

  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // Provision namespace, DO, and worker
  const result = await provisionTenant(tenant, {
    accountId: multiTenantConfig.cloudflare!.accountId,
    apiToken: multiTenantConfig.cloudflare!.apiToken,
    platformDomain: multiTenantConfig.platformDomain,
  })

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 })
  }

  // Update tenant with provisioning data
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'tenants',
    id: tenant.id,
    data: {
      namespace: {
        namespaceId: result.namespaceId,
        namespaceStatus: 'active',
        durableObjectId: result.durableObjectId,
        workerUrl: result.workerUrl,
      },
    },
  })

  return Response.json(result)
}
```

### Custom Worker Code

Deploy custom worker for each tenant:

```typescript
import { updateTenantWorker } from '@dot-do/payload-multitenant'

const customWorkerCode = `
export default {
  async fetch(request, env, ctx) {
    const tenantId = env.TENANT_ID
    const database = env.DATABASE

    // Your custom logic here
    return Response.json({ tenant: tenantId })
  }
}
`

await updateTenantWorker(tenant, multiTenantConfig, {
  code: customWorkerCode,
  bindings: {
    DATABASE: {
      type: 'durable_object_namespace',
      namespace_id: tenant.namespace?.durableObjectId,
    },
  },
})
```

## Stripe Connect Billing

### Setup Stripe Connect

```typescript
// app/api/billing/connect/route.ts
import { createConnectAccount } from '@dot-do/payload-multitenant'
import { getCurrentTenant } from '@dot-do/payload-multitenant'
import config from '@payload-config'
import { multiTenantConfig } from '@/lib/config'

export async function POST(req: Request) {
  const tenant = await getCurrentTenant(config)

  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const result = await createConnectAccount(
    tenant,
    {
      stripeSecretKey: multiTenantConfig.stripe!.secretKey,
    },
    {
      email: tenant.siteSettings?.supportEmail,
      country: 'US',
    }
  )

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 })
  }

  // Update tenant
  const payload = await getPayload({ config })
  await payload.update({
    collection: 'tenants',
    id: tenant.id,
    data: {
      billing: {
        stripeAccountId: result.accountId,
        stripeStatus: 'pending',
      },
    },
  })

  // Redirect to Stripe onboarding
  return Response.json({ onboardingUrl: result.onboardingUrl })
}
```

### Process Marketplace Payment

```typescript
import { processMarketplacePayment } from '@dot-do/payload-multitenant'

// Charge customer for service
const result = await processMarketplacePayment(
  tenant,
  { stripeSecretKey: process.env.STRIPE_SECRET_KEY! },
  {
    amount: 5000, // $50.00
    currency: 'usd',
    customerId: 'cus_xxx',
    description: 'Service purchase',
    metadata: {
      service_id: '123',
      order_id: '456',
    },
  }
)

if (result.success) {
  console.log('Platform fee:', result.platformFee) // $7.50 (15%)
  console.log('Net to tenant:', result.netAmount) // $42.50
}
```

### Monthly Platform Fee

```typescript
import { chargeMonthlyPlatformFee } from '@dot-do/payload-multitenant'

// Run this monthly via cron or scheduled worker
const result = await chargeMonthlyPlatformFee(tenant, {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
})

if (result.success) {
  console.log('Charged:', result.platformFee) // $500
}
```

### Usage Tracking

```typescript
import { trackUsage } from '@dot-do/payload-multitenant'

// Track API calls
await trackUsage(
  tenant,
  { stripeSecretKey: process.env.STRIPE_SECRET_KEY! },
  {
    type: 'api_calls',
    quantity: 1000,
    timestamp: Date.now(),
    metadata: {
      endpoint: '/api/services',
    },
  }
)
```

### Billing Analytics

```typescript
import { getBillingAnalytics } from '@dot-do/payload-multitenant'

const analytics = await getBillingAnalytics(
  tenant,
  { stripeSecretKey: process.env.STRIPE_SECRET_KEY! },
  'month' // day, week, month, year
)

console.log(analytics)
// {
//   totalRevenue: 10000,
//   platformFees: 1500,
//   netRevenue: 8500,
//   transactionCount: 42,
//   averageTransactionValue: 238.10
// }
```

## Advanced Features

### Custom Middleware

Create advanced middleware with validation:

```typescript
import { createAdvancedMiddleware } from '@dot-do/payload-multitenant/middleware'

export const middleware = createAdvancedMiddleware({
  platformDomain: 'services.delivery',
  redirectToDefaultOnNotFound: true,
  defaultTenant: 'demo',
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
```

### Tenant Metadata

Generate SEO metadata:

```typescript
import { getTenantMetadata } from '@dot-do/payload-multitenant'

export async function generateMetadata() {
  const tenant = await getCurrentTenant(config)

  return getTenantMetadata(tenant, {
    title: 'Services',
    description: 'Browse our marketplace',
  })
}
```

### Branding

Apply tenant branding:

```typescript
import { getTenantBranding } from '@dot-do/payload-multitenant'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant(config)
  const branding = getTenantBranding(tenant)

  return (
    <html>
      <head>
        <style>{`
          :root {
            --primary-color: ${branding.primaryColor};
            --secondary-color: ${branding.secondaryColor};
            --font-family: ${branding.font};
          }
          ${branding.customCSS || ''}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Testing

### Local Development

Edit `/etc/hosts` to test multiple domains:

```
127.0.0.1 tenant1.local
127.0.0.1 tenant2.local
```

Create tenants in admin with domains:
- `tenant1.local`
- `tenant2.local`

Visit:
- http://tenant1.local:3000
- http://tenant2.local:3000

### Production Testing

Deploy to Cloudflare Pages:

```bash
pnpm build
pnpm deploy
```

Configure DNS:
- `acme.services.delivery` → CNAME to platform
- `marketplace.acme.com` → CNAME to platform (custom domain)

## Architecture

```
┌─────────────────────────────────────────┐
│  services.delivery (Platform)           │
│   • Multi-tenant router                 │
│   • Shared marketplace infrastructure   │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┬───────────┐
    │          │          │           │
    ▼          ▼          ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Customer│ │Customer│ │Customer│ │Customer│
│  Acme  │ │Globex  │ │Initech│ │Hooli   │
│        │ │        │ │        │ │        │
│DO SQLit│ │DO SQLit│ │DO SQLit│ │DO SQLit│
│Isolated│ │Isolated│ │Isolated│ │Isolated│
└────────┘ └────────┘ └────────┘ └────────┘
```

## Performance

- **<100ms p99 latency** - DO SQLite for fast reads
- **Independent scaling** - Each tenant scales separately
- **True isolation** - Failures don't cascade
- **Global distribution** - Cloudflare edge network

## Security

- **Tenant isolation** - DO SQLite per tenant
- **Feature flags** - Control access per tenant
- **Limits & quotas** - Prevent abuse
- **Stripe Connect** - Secure payment processing

## Pricing

Recommended pricing tiers:

### Starter - $500/month
- 10 users
- 50 services
- 10GB storage
- 10K API calls/day
- Standard support

### Professional - $2,000/month
- 50 users
- 200 services
- 50GB storage
- 100K API calls/day
- Priority support
- Custom domain

### Enterprise - $5,000/month
- Unlimited users
- Unlimited services
- 500GB storage
- 1M API calls/day
- 24/7 support
- SSO
- White-label
- Custom domain

## Roadmap

- [ ] Multi-region deployment
- [ ] Tenant analytics dashboard
- [ ] Automated backups
- [ ] Migration tools
- [ ] Admin UI improvements
- [ ] GraphQL support

## License

MIT

## Support

- **Documentation**: https://docs.api.services
- **Issues**: https://github.com/dot-do/packages/issues
- **Email**: support@api.services

## Credits

Built by the .do Platform team.

Powered by:
- [PayloadCMS](https://payloadcms.com)
- [Cloudflare Workers for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/)
- [Stripe Connect](https://stripe.com/connect)
