/**
 * @dot-do/payload-multitenant
 *
 * Multi-tenant marketplace platform with Workers for Platforms integration.
 *
 * Features:
 * - Domain-based tenant detection
 * - Custom branding per tenant
 * - Stripe Connect billing
 * - Workers for Platforms provisioning
 * - DO SQLite per tenant
 * - Feature flags and limits
 *
 * @example
 * ```typescript
 * // payload.config.ts
 * import { Tenants } from '@dot-do/payload-multitenant'
 * import { buildConfig } from 'payload'
 *
 * export default buildConfig({
 *   collections: [
 *     Tenants,
 *     // ... your collections
 *   ],
 * })
 * ```
 *
 * @example
 * ```typescript
 * // middleware.ts
 * export { middleware, config } from '@dot-do/payload-multitenant/middleware'
 * ```
 *
 * @example
 * ```typescript
 * // app/page.tsx
 * import { getCurrentTenant } from '@dot-do/payload-multitenant/lib'
 * import config from '@payload-config'
 *
 * export default async function Page() {
 *   const tenant = await getCurrentTenant(config)
 *   return <div>{tenant?.name}</div>
 * }
 * ```
 */

// Collections
export { Tenants } from './collections/Tenants'

// Middleware
export { middleware, config as middlewareConfig, isCustomDomain, getSubdomain, createAdvancedMiddleware, createRedirectMiddleware } from './middleware'

// Tenant utilities
export {
  getCurrentTenant,
  getTenantById,
  getTenantBySlug,
  getTenantContent,
  hasTenantFeature,
  isWithinTenantLimit,
  getTenantBranding,
  getTenantMetadata,
  isValidDomain,
  type Tenant,
} from './lib/tenant'

// Provisioning
export {
  provisionTenant,
  deprovisionTenant,
  updateTenantWorker,
  type ProvisioningConfig,
  type ProvisioningResult,
} from './lib/provisioning'

// Billing
export {
  createConnectAccount,
  getConnectAccountStatus,
  processMarketplacePayment,
  chargeMonthlyPlatformFee,
  trackUsage,
  getBillingAnalytics,
  type BillingConfig,
  type ConnectAccountResult,
  type PaymentResult,
} from './lib/billing'

/**
 * Configuration types
 */
export interface MultiTenantConfig {
  platformDomain: string
  cloudflare?: {
    accountId: string
    apiToken: string
  }
  stripe?: {
    secretKey: string
    platformAccountId?: string
  }
  defaults?: {
    platformFee?: number
    monthlyFee?: number
    plan?: 'starter' | 'professional' | 'enterprise'
  }
}

/**
 * Initialize multi-tenant configuration
 *
 * Helper function to validate and set up multi-tenant configuration.
 */
export function createMultiTenantConfig(config: MultiTenantConfig): MultiTenantConfig {
  // Validate required fields
  if (!config.platformDomain) {
    throw new Error('platformDomain is required')
  }

  return {
    ...config,
    defaults: {
      platformFee: 15,
      monthlyFee: 500,
      plan: 'starter',
      ...config.defaults,
    },
  }
}

/**
 * Package version
 */
export const VERSION = '0.1.0'
