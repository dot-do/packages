import { headers } from 'next/headers'
import { getPayload } from 'payload'
import type { Config } from 'payload'

/**
 * Tenant Utilities
 *
 * Helper functions for working with tenants in multi-tenant applications.
 * All functions are server-side only (use Next.js server components or API routes).
 */

export type Tenant = {
  id: string | number
  name: string
  slug: string
  domain: string
  additionalDomains?: Array<{ domain: string; verified: boolean }>
  status: 'active' | 'suspended' | 'maintenance' | 'cancelled'
  plan: 'starter' | 'professional' | 'enterprise'
  branding?: {
    logo?: string | { url: string }
    favicon?: string | { url: string }
    primaryColor?: string
    secondaryColor?: string
    font?: string
    customCSS?: string
  }
  siteSettings?: {
    siteTitle?: string
    siteDescription?: string
    socialImage?: string | { url: string }
    supportEmail?: string
    privacyPolicyUrl?: string
    termsOfServiceUrl?: string
  }
  billing?: {
    stripeAccountId?: string
    stripeStatus?: string
    platformFee?: number
    monthlyFee?: number
    currency?: string
  }
  features?: {
    customDomain?: boolean
    sso?: boolean
    apiAccess?: boolean
    analytics?: boolean
    whiteLabel?: boolean
  }
  namespace?: {
    namespaceId?: string
    namespaceStatus?: string
    durableObjectId?: string
    workerUrl?: string
  }
  limits?: {
    maxUsers?: number
    maxServices?: number
    maxStorageGB?: number
    maxApiCallsPerDay?: number
  }
}

/**
 * Get current tenant from hostname
 *
 * Reads x-tenant-hostname header set by middleware and queries database
 * to find matching tenant by domain.
 *
 * @param config - Payload config object
 * @returns Tenant object or null if not found
 */
export async function getCurrentTenant(config: Config): Promise<Tenant | null> {
  const headersList = await headers()
  const hostname = headersList.get('x-tenant-hostname') || 'localhost:3000'

  // Remove port for matching
  const domain = hostname.split(':')[0]

  const payload = await getPayload({ config })

  // Find tenant by primary domain or additional domains
  const tenants = await payload.find({
    collection: 'tenants',
    where: {
      or: [
        {
          domain: {
            equals: domain,
          },
        },
        {
          'additionalDomains.domain': {
            equals: domain,
          },
        },
      ],
    },
    limit: 1,
  })

  if (tenants.docs.length === 0) {
    return null
  }

  return tenants.docs[0] as unknown as Tenant
}

/**
 * Get tenant by ID
 *
 * @param config - Payload config
 * @param tenantId - Tenant ID
 * @returns Tenant object or null
 */
export async function getTenantById(config: Config, tenantId: string | number): Promise<Tenant | null> {
  const payload = await getPayload({ config })

  try {
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })
    return tenant as unknown as Tenant
  } catch {
    return null
  }
}

/**
 * Get tenant by slug
 *
 * @param config - Payload config
 * @param slug - Tenant slug
 * @returns Tenant object or null
 */
export async function getTenantBySlug(config: Config, slug: string): Promise<Tenant | null> {
  const payload = await getPayload({ config })

  const tenants = await payload.find({
    collection: 'tenants',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  if (tenants.docs.length === 0) {
    return null
  }

  return tenants.docs[0] as unknown as Tenant
}

/**
 * Get tenant content
 *
 * Helper to query collection items filtered by tenant.
 * Use this for content collections like pages, posts, services, etc.
 *
 * @param config - Payload config
 * @param collection - Collection slug
 * @param tenantId - Tenant ID
 * @param options - Additional query options
 * @returns Collection items
 */
export async function getTenantContent<T = any>(
  config: Config,
  collection: string,
  tenantId: string | number,
  options: {
    where?: any
    limit?: number
    page?: number
    sort?: string
  } = {}
) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection,
    where: {
      tenant: {
        equals: tenantId,
      },
      ...options.where,
    },
    limit: options.limit,
    page: options.page,
    sort: options.sort,
  })

  return result.docs as T[]
}

/**
 * Check if tenant has feature enabled
 *
 * @param tenant - Tenant object
 * @param feature - Feature key
 * @returns True if feature is enabled
 */
export function hasTenantFeature(tenant: Tenant | null, feature: keyof NonNullable<Tenant['features']>): boolean {
  if (!tenant || !tenant.features) return false
  return tenant.features[feature] === true
}

/**
 * Check if tenant is within limits
 *
 * @param tenant - Tenant object
 * @param limitKey - Limit key to check
 * @param currentValue - Current usage value
 * @returns True if within limits
 */
export function isWithinTenantLimit(
  tenant: Tenant | null,
  limitKey: keyof NonNullable<Tenant['limits']>,
  currentValue: number
): boolean {
  if (!tenant || !tenant.limits) return true
  const limit = tenant.limits[limitKey]
  if (typeof limit !== 'number') return true
  return currentValue < limit
}

/**
 * Get tenant branding for use in UI
 *
 * @param tenant - Tenant object
 * @returns Branding configuration with defaults
 */
export function getTenantBranding(tenant: Tenant | null) {
  const defaults = {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    font: 'inter',
  }

  if (!tenant || !tenant.branding) {
    return defaults
  }

  return {
    logo: typeof tenant.branding.logo === 'object' ? tenant.branding.logo?.url : tenant.branding.logo,
    favicon: typeof tenant.branding.favicon === 'object' ? tenant.branding.favicon?.url : tenant.branding.favicon,
    primaryColor: tenant.branding.primaryColor || defaults.primaryColor,
    secondaryColor: tenant.branding.secondaryColor || defaults.secondaryColor,
    font: tenant.branding.font || defaults.font,
    customCSS: tenant.branding.customCSS,
  }
}

/**
 * Get tenant metadata for SEO
 *
 * @param tenant - Tenant object
 * @returns Metadata object for Next.js Metadata API
 */
export function getTenantMetadata(tenant: Tenant | null, page?: { title?: string; description?: string }) {
  const siteTitle = tenant?.siteSettings?.siteTitle || 'Services Marketplace'
  const siteDescription = tenant?.siteSettings?.siteDescription || 'Discover and purchase services'

  return {
    title: page?.title ? `${page.title} | ${siteTitle}` : siteTitle,
    description: page?.description || siteDescription,
    openGraph: {
      title: page?.title || siteTitle,
      description: page?.description || siteDescription,
      images: tenant?.siteSettings?.socialImage
        ? [
            {
              url:
                typeof tenant.siteSettings.socialImage === 'object'
                  ? tenant.siteSettings.socialImage.url
                  : tenant.siteSettings.socialImage,
            },
          ]
        : undefined,
    },
  }
}

/**
 * Validate domain format
 *
 * @param domain - Domain string
 * @returns True if valid domain
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i
  return domainRegex.test(domain)
}

/**
 * Example: Usage in server component
 *
 * ```typescript
 * import { getCurrentTenant } from '@dot-do/payload-multitenant/lib'
 * import config from '@payload-config'
 *
 * export default async function Page() {
 *   const tenant = await getCurrentTenant(config)
 *
 *   if (!tenant) {
 *     return <div>Tenant not found</div>
 *   }
 *
 *   return (
 *     <div>
 *       <h1>{tenant.name}</h1>
 *       <p>{tenant.siteSettings?.siteDescription}</p>
 *     </div>
 *   )
 * }
 * ```
 */
