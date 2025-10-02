/**
 * D1 Database Adapter
 *
 * Provides database access via Cloudflare D1 (HTTP-based SQLite)
 */

import type { Database, D1Config } from '../../types/index.js'
import { D1Database } from './database.js'

export { D1Database } from './database.js'
export { schema, things, relationships } from './schema.js'
export type { ThingRow, ThingInsert, RelationshipRow, RelationshipInsert } from './schema.js'

/**
 * Create D1 database instance
 *
 * @example
 * ```typescript
 * const db = createD1Database({
 *   type: 'D1',
 *   binding: env.DB,
 *   enableReplicas: true
 * })
 * ```
 */
export function createD1Database(config: D1Config): Database {
  return new D1Database(config)
}
