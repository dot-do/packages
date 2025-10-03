/**
 * Services.Delivery Multi-Tenant Setup Example
 *
 * This file demonstrates how to integrate @dot-do/payload-multitenant
 * into a Services.Delivery marketplace application.
 */

// ============================================================================
// Step 1: Payload Configuration
// ============================================================================

// payload.config.ts
import { buildConfig } from 'payload'
import { Tenants } from '@dot-do/payload-multitenant'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  collections: [
    // Platform collections
    Tenants,

    // Marketplace collections (all should have tenant field)
    {
      slug: 'services',
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          index: true,
          admin: {
            position: 'sidebar',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' },
          ],
          defaultValue: 'draft',
        },
      ],
    },
    {
      slug: 'orders',
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          index: true,
        },
        {
          name: 'service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
        },
        {
          name: 'customer',
          type: 'email',
          required: true,
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          defaultValue: 'pending',
        },
      ],
    },
  ],
  // ... other config
})

// ============================================================================
// Step 2: Middleware Setup
// ============================================================================

// middleware.ts
export { middleware, config } from '@dot-do/payload-multitenant/middleware'

// Or with custom configuration:
// import { createAdvancedMiddleware } from '@dot-do/payload-multitenant/middleware'
//
// export const middleware = createAdvancedMiddleware({
//   platformDomain: 'services.delivery',
//   redirectToDefaultOnNotFound: true,
//   defaultTenant: 'demo',
// })

// ============================================================================
// Step 3: Server Component - Homepage
// ============================================================================

// app/page.tsx
import { getCurrentTenant, getTenantContent, getTenantBranding } from '@dot-do/payload-multitenant'
import config from '@payload-config'

export default async function HomePage() {
  const tenant = await getCurrentTenant(config)

  if (!tenant) {
    return <div>Tenant not found</div>
  }

  // Get tenant services
  const services = await getTenantContent(config, 'services', tenant.id, {
    where: {
      status: { equals: 'published' },
    },
    limit: 12,
    sort: '-createdAt',
  })

  const branding = getTenantBranding(tenant)

  return (
    <div>
      <header style={{ backgroundColor: branding.primaryColor }}>
        {branding.logo && <img src={branding.logo} alt={tenant.name} />}
        <h1>{tenant.name}</h1>
        <p>{tenant.siteSettings?.siteDescription}</p>
      </header>

      <main>
        <h2>Available Services</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <p className="price">${service.price}</p>
              <a href={`/services/${service.id}`}>View Details</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ============================================================================
// Step 4: API Route - Create Order
// ============================================================================

// app/api/orders/route.ts
import { getCurrentTenant } from '@dot-do/payload-multitenant'
import { processMarketplacePayment } from '@dot-do/payload-multitenant'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  const tenant = await getCurrentTenant(config)

  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const body = await req.json()
  const { serviceId, customerId, paymentMethodId } = body

  // Get service details
  const payload = await getPayload({ config })
  const service = await payload.findByID({
    collection: 'services',
    id: serviceId,
  })

  if (!service || service.tenant !== tenant.id) {
    return Response.json({ error: 'Service not found' }, { status: 404 })
  }

  // Process payment via Stripe Connect
  const paymentResult = await processMarketplacePayment(
    tenant,
    { stripeSecretKey: process.env.STRIPE_SECRET_KEY! },
    {
      amount: service.price * 100, // Convert to cents
      currency: tenant.billing?.currency || 'usd',
      customerId,
      paymentMethodId,
      description: `Service: ${service.name}`,
      metadata: {
        service_id: serviceId,
        tenant_id: tenant.id.toString(),
      },
    }
  )

  if (!paymentResult.success) {
    return Response.json({ error: paymentResult.error }, { status: 500 })
  }

  // Create order record
  const order = await payload.create({
    collection: 'orders',
    data: {
      tenant: tenant.id,
      service: serviceId,
      customer: body.customerEmail,
      amount: service.price,
      status: 'completed',
    },
  })

  return Response.json({
    success: true,
    orderId: order.id,
    platformFee: paymentResult.platformFee,
    netAmount: paymentResult.netAmount,
  })
}

// ============================================================================
// Step 5: API Route - Provision Tenant
// ============================================================================

// app/api/admin/tenants/[id]/provision/route.ts
import { provisionTenant, getTenantById } from '@dot-do/payload-multitenant'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Verify admin access
  // ...

  const tenant = await getTenantById(config, params.id)

  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // Provision Workers for Platforms namespace
  const result = await provisionTenant(tenant, {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    platformDomain: process.env.PLATFORM_DOMAIN || 'services.delivery',
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

// ============================================================================
// Step 6: API Route - Stripe Connect Setup
// ============================================================================

// app/api/admin/billing/connect/route.ts
import { createConnectAccount, getCurrentTenant } from '@dot-do/payload-multitenant'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  const tenant = await getCurrentTenant(config)

  if (!tenant) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  if (tenant.billing?.stripeAccountId) {
    return Response.json({ error: 'Stripe account already connected' }, { status: 400 })
  }

  // Create Stripe Connect account
  const result = await createConnectAccount(
    tenant,
    { stripeSecretKey: process.env.STRIPE_SECRET_KEY! },
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

  return Response.json({
    onboardingUrl: result.onboardingUrl,
  })
}

// ============================================================================
// Step 7: Layout with Branding
// ============================================================================

// app/layout.tsx
import { getCurrentTenant, getTenantBranding, getTenantMetadata } from '@dot-do/payload-multitenant'
import config from '@payload-config'

export async function generateMetadata() {
  const tenant = await getCurrentTenant(config)
  return getTenantMetadata(tenant)
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant(config)
  const branding = getTenantBranding(tenant)

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={branding.favicon} />
        <style>{`
          :root {
            --primary-color: ${branding.primaryColor};
            --secondary-color: ${branding.secondaryColor};
            --font-family: ${branding.font}, sans-serif;
          }
          body {
            font-family: var(--font-family);
          }
          ${branding.customCSS || ''}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}

// ============================================================================
// Step 8: Environment Variables
// ============================================================================

/*
# .env.local

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx

# Platform
PLATFORM_DOMAIN=services.delivery
PAYLOAD_PUBLIC_SERVER_URL=https://services.delivery

# Database
DATABASE_URL=postgresql://...
*/

// ============================================================================
// Step 9: Scheduled Jobs (Cron)
// ============================================================================

// Use Cloudflare Workers Cron or schedule worker
// Run monthly to charge platform fees

/*
// workers/schedule/src/index.ts
import { chargeMonthlyPlatformFee } from '@dot-do/payload-multitenant'

export default {
  async scheduled(event, env, ctx) {
    // Get all active tenants
    const tenants = await env.DB_SERVICE.find({
      collection: 'tenants',
      where: { status: { equals: 'active' } },
    })

    // Charge each tenant
    for (const tenant of tenants.docs) {
      await chargeMonthlyPlatformFee(
        tenant,
        { stripeSecretKey: env.STRIPE_SECRET_KEY }
      )
    }
  },
}
*/

// ============================================================================
// Step 10: Testing
// ============================================================================

/*
// Test multi-tenancy locally

1. Edit /etc/hosts:
   127.0.0.1 tenant1.local
   127.0.0.1 tenant2.local

2. Create tenants in admin:
   - Tenant 1: domain = tenant1.local
   - Tenant 2: domain = tenant2.local

3. Visit:
   http://tenant1.local:3000
   http://tenant2.local:3000

4. Verify isolated content

// Test Workers for Platforms provisioning

1. Set environment variables
2. Create tenant in admin
3. Call POST /api/admin/tenants/{id}/provision
4. Check namespace created in Cloudflare dashboard
5. Visit worker URL

// Test Stripe Connect

1. Set STRIPE_SECRET_KEY
2. Create tenant in admin
3. Call POST /api/admin/billing/connect
4. Complete Stripe onboarding
5. Test payment processing
*/

export {}
