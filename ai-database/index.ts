/**
 * @dot-do/ai-database
 *
 * Unified database abstraction layer for Cloudflare D1 and Durable Objects SQLite
 */

// Main factory
export { createDatabase } from './core/factory.js'

// Types
export type {
  Database,
  DatabaseConfig,
  DatabaseType,
  D1Config,
  DOSQLiteConfig,
  DatabaseAdapter,
  Thing,
  Relationship,
  CreateThingInput,
  CreateRelationshipInput,
  ThingFilter,
  RelationshipFilter,
  ThingCollection,
  RelationshipCollection,
  NamespaceCollection,
  QueryBuilder,
  Where,
  DbQuery,
  ListOptions,
  Visibility,
  HealthStatusResult,
  DatabaseStats,
} from './types/index.js'

// Utilities
export {
  buildWhereConditions,
  extractTableName,
  generateDOId,
  slugify,
  parseJSON,
  stringifyJSON,
  measureQuery,
} from './core/utils.js'

// Adapters (for direct access if needed)
export { createD1Database } from './adapters/d1/index.js'
export { createDODatabase } from './adapters/do-sqlite/index.js'
