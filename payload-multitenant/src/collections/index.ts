/**
 * PayloadCMS Collections for Multi-Tenant Platform
 *
 * Export all collections that can be imported into Payload config.
 */

export { Tenants } from './Tenants'

/**
 * Usage:
 * ```typescript
 * // payload.config.ts
 * import { Tenants } from '@dot-do/payload-multitenant/collections'
 * import { buildConfig } from 'payload'
 *
 * export default buildConfig({
 *   collections: [
 *     Tenants,
 *     // ... your other collections
 *   ],
 * })
 * ```
 */
