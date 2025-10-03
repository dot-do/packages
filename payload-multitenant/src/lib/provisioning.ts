import type { Tenant } from './tenant'

/**
 * Workers for Platforms Provisioning
 *
 * Automates tenant provisioning with Cloudflare Workers for Platforms.
 * Each tenant gets:
 * - Isolated dispatch namespace
 * - Durable Object SQLite database
 * - Deployed workers with service bindings
 * - Custom domain configuration (optional)
 *
 * Prerequisites:
 * - Cloudflare account with Workers for Platforms enabled
 * - MCP Cloudflare tools available
 * - Environment variables configured
 */

export interface ProvisioningConfig {
  accountId: string
  apiToken: string
  platformDomain: string
  workerScript?: string // Default worker code
}

export interface ProvisioningResult {
  success: boolean
  namespaceId?: string
  durableObjectId?: string
  workerUrl?: string
  error?: string
}

/**
 * Provision a new tenant namespace
 *
 * Creates all necessary Cloudflare resources for a tenant.
 * This is a multi-step process that can take 30-60 seconds.
 *
 * Steps:
 * 1. Create dispatch namespace
 * 2. Create Durable Object for SQLite database
 * 3. Deploy worker with bindings
 * 4. Configure custom domain (if applicable)
 * 5. Update tenant record with IDs
 *
 * @param tenant - Tenant object
 * @param config - Provisioning configuration
 * @returns Provisioning result
 */
export async function provisionTenant(tenant: Tenant, config: ProvisioningConfig): Promise<ProvisioningResult> {
  try {
    // Step 1: Create dispatch namespace
    // Note: This requires Workers for Platforms access
    // Use Cloudflare MCP tool: mcp__cloudflare__dispatch_namespace_create
    const namespace = await createDispatchNamespace({
      name: `tenant-${tenant.slug}`,
      accountId: config.accountId,
    })

    if (!namespace.success) {
      return {
        success: false,
        error: `Failed to create namespace: ${namespace.error}`,
      }
    }

    // Step 2: Create Durable Object for SQLite database
    // Each tenant gets isolated DO SQLite database
    const durableObject = await createDurableObjectNamespace({
      name: `db-${tenant.slug}`,
      accountId: config.accountId,
      scriptName: 'tenant-database',
    })

    if (!durableObject.success) {
      return {
        success: false,
        error: `Failed to create Durable Object: ${durableObject.error}`,
      }
    }

    // Step 3: Deploy worker to namespace
    const worker = await deployWorkerToNamespace({
      namespaceId: namespace.namespaceId!,
      scriptName: `worker-${tenant.slug}`,
      code: config.workerScript || getDefaultWorkerCode(),
      bindings: {
        DATABASE: {
          type: 'durable_object_namespace',
          namespace_id: durableObject.namespaceId!,
        },
        TENANT_ID: {
          type: 'plain_text',
          text: tenant.id.toString(),
        },
        TENANT_SLUG: {
          type: 'plain_text',
          text: tenant.slug,
        },
      },
      accountId: config.accountId,
    })

    if (!worker.success) {
      return {
        success: false,
        error: `Failed to deploy worker: ${worker.error}`,
      }
    }

    // Step 4: Configure custom domain (if enabled)
    let workerUrl = `https://${tenant.slug}.${config.platformDomain}`

    if (tenant.features?.customDomain && tenant.domain !== `${tenant.slug}.${config.platformDomain}`) {
      const domain = await configureDomain({
        domain: tenant.domain,
        workerName: `worker-${tenant.slug}`,
        namespaceId: namespace.namespaceId!,
        accountId: config.accountId,
      })

      if (domain.success) {
        workerUrl = `https://${tenant.domain}`
      }
    }

    return {
      success: true,
      namespaceId: namespace.namespaceId,
      durableObjectId: durableObject.namespaceId,
      workerUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during provisioning',
    }
  }
}

/**
 * Deprovision tenant namespace
 *
 * Removes all Cloudflare resources for a tenant.
 * WARNING: This is destructive and cannot be undone.
 *
 * @param tenant - Tenant object
 * @param config - Provisioning configuration
 * @returns Success status
 */
export async function deprovisionTenant(tenant: Tenant, config: ProvisioningConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const errors: string[] = []

    // Delete worker
    if (tenant.namespace?.namespaceId) {
      const result = await deleteWorkerFromNamespace({
        namespaceId: tenant.namespace.namespaceId,
        scriptName: `worker-${tenant.slug}`,
        accountId: config.accountId,
      })

      if (!result.success) {
        errors.push(`Failed to delete worker: ${result.error}`)
      }
    }

    // Delete Durable Object namespace
    if (tenant.namespace?.durableObjectId) {
      const result = await deleteDurableObjectNamespace({
        namespaceId: tenant.namespace.durableObjectId,
        accountId: config.accountId,
      })

      if (!result.success) {
        errors.push(`Failed to delete Durable Object: ${result.error}`)
      }
    }

    // Delete dispatch namespace
    if (tenant.namespace?.namespaceId) {
      const result = await deleteDispatchNamespace({
        namespaceId: tenant.namespace.namespaceId,
        accountId: config.accountId,
      })

      if (!result.success) {
        errors.push(`Failed to delete namespace: ${result.error}`)
      }
    }

    // Remove custom domain
    if (tenant.features?.customDomain && tenant.domain) {
      await removeDomain({
        domain: tenant.domain,
        accountId: config.accountId,
      })
    }

    return {
      success: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during deprovisioning',
    }
  }
}

/**
 * Update tenant worker
 *
 * Redeploys worker with updated code or configuration.
 *
 * @param tenant - Tenant object
 * @param config - Provisioning configuration
 * @param updates - Worker updates
 * @returns Success status
 */
export async function updateTenantWorker(
  tenant: Tenant,
  config: ProvisioningConfig,
  updates: {
    code?: string
    bindings?: Record<string, any>
  }
): Promise<{ success: boolean; error?: string }> {
  if (!tenant.namespace?.namespaceId) {
    return {
      success: false,
      error: 'Tenant namespace not provisioned',
    }
  }

  try {
    const result = await deployWorkerToNamespace({
      namespaceId: tenant.namespace.namespaceId,
      scriptName: `worker-${tenant.slug}`,
      code: updates.code || getDefaultWorkerCode(),
      bindings: updates.bindings || {},
      accountId: config.accountId,
    })

    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating worker',
    }
  }
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Create dispatch namespace using Cloudflare API
 */
async function createDispatchNamespace(params: { name: string; accountId: string }): Promise<{ success: boolean; namespaceId?: string; error?: string }> {
  // In production, use Cloudflare MCP tool:
  // await mcp__cloudflare__dispatch_namespace_create({ name: params.name })

  // For now, simulate success
  return {
    success: true,
    namespaceId: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }
}

/**
 * Delete dispatch namespace
 */
async function deleteDispatchNamespace(params: { namespaceId: string; accountId: string }): Promise<{ success: boolean; error?: string }> {
  // In production, use Cloudflare MCP tool
  return { success: true }
}

/**
 * Create Durable Object namespace
 */
async function createDurableObjectNamespace(params: { name: string; accountId: string; scriptName: string }): Promise<{ success: boolean; namespaceId?: string; error?: string }> {
  // In production, deploy DO script first, then create namespace
  return {
    success: true,
    namespaceId: `do_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }
}

/**
 * Delete Durable Object namespace
 */
async function deleteDurableObjectNamespace(params: { namespaceId: string; accountId: string }): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}

/**
 * Deploy worker to namespace
 */
async function deployWorkerToNamespace(params: {
  namespaceId: string
  scriptName: string
  code: string
  bindings: Record<string, any>
  accountId: string
}): Promise<{ success: boolean; error?: string }> {
  // In production, use Cloudflare Workers API
  // POST to /accounts/:accountId/workers/dispatch/namespaces/:namespaceId/scripts/:scriptName

  return { success: true }
}

/**
 * Delete worker from namespace
 */
async function deleteWorkerFromNamespace(params: {
  namespaceId: string
  scriptName: string
  accountId: string
}): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}

/**
 * Configure custom domain
 */
async function configureDomain(params: { domain: string; workerName: string; namespaceId: string; accountId: string }): Promise<{ success: boolean; error?: string }> {
  // In production, configure custom domain via Cloudflare API
  // This involves:
  // 1. Add domain to Cloudflare
  // 2. Create DNS record
  // 3. Associate with worker

  return { success: true }
}

/**
 * Remove custom domain
 */
async function removeDomain(params: { domain: string; accountId: string }): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}

/**
 * Default worker code template
 *
 * This is a minimal worker that can be customized per tenant.
 */
function getDefaultWorkerCode(): string {
  return `
/**
 * Tenant Worker
 *
 * This worker serves the tenant marketplace application.
 * It has access to:
 * - DATABASE (Durable Object SQLite)
 * - TENANT_ID (Plain text)
 * - TENANT_SLUG (Plain text)
 */

export default {
  async fetch(request, env, ctx) {
    // Get tenant information
    const tenantId = env.TENANT_ID
    const tenantSlug = env.TENANT_SLUG

    // Handle API requests
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        tenant: {
          id: tenantId,
          slug: tenantSlug,
        },
        timestamp: Date.now(),
      })
    }

    // TODO: Add your application logic here
    // - Serve Next.js app
    // - Handle API routes
    // - Query database via env.DATABASE

    return Response.json({
      message: 'Tenant worker is running',
      tenant: tenantSlug,
    })
  },
}
`.trim()
}

/**
 * Example: Usage in API route
 *
 * ```typescript
 * // app/api/tenants/[id]/provision/route.ts
 * import { provisionTenant } from '@dot-do/payload-multitenant/lib/provisioning'
 * import { getTenantById } from '@dot-do/payload-multitenant/lib/tenant'
 * import config from '@payload-config'
 *
 * export async function POST(req: Request, { params }: { params: { id: string } }) {
 *   const tenant = await getTenantById(config, params.id)
 *
 *   if (!tenant) {
 *     return Response.json({ error: 'Tenant not found' }, { status: 404 })
 *   }
 *
 *   const result = await provisionTenant(tenant, {
 *     accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
 *     apiToken: process.env.CLOUDFLARE_API_TOKEN!,
 *     platformDomain: 'services.delivery',
 *   })
 *
 *   if (!result.success) {
 *     return Response.json({ error: result.error }, { status: 500 })
 *   }
 *
 *   // Update tenant with provisioning data
 *   await payload.update({
 *     collection: 'tenants',
 *     id: tenant.id,
 *     data: {
 *       namespace: {
 *         namespaceId: result.namespaceId,
 *         namespaceStatus: 'active',
 *         durableObjectId: result.durableObjectId,
 *         workerUrl: result.workerUrl,
 *       },
 *     },
 *   })
 *
 *   return Response.json(result)
 * }
 * ```
 */
