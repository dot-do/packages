/**
 * Database factory - creates appropriate adapter based on config
 */

import type { Database, DatabaseConfig } from '../types/index.js'
import { createD1Database } from '../adapters/d1/index.js'
import { createDODatabase } from '../adapters/do-sqlite/index.js'

/**
 * Create a database instance with the appropriate backend
 *
 * @example
 * ```typescript
 * // D1 Backend
 * const db = createDatabase({
 *   type: 'D1',
 *   binding: env.DB
 * })
 *
 * // DO SQLite Backend
 * const db = createDatabase({
 *   type: 'DO_SQLITE',
 *   storage: state.storage
 * })
 * ```
 */
export function createDatabase(config: DatabaseConfig): Database {
  if (config.type === 'D1') {
    return createD1Database(config)
  } else if (config.type === 'DO_SQLITE') {
    return createDODatabase(config)
  }

  throw new Error(`Invalid database type: ${(config as any).type}`)
}
