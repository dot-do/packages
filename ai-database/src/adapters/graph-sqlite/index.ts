/**
 * Graph SQLite Adapter
 *
 * MongoDB-style adapter using two-table graph structure.
 * Works identically on D1 and DO SQLite.
 */

export { GraphDatabase } from './database.js'
export { schema, data, relationships } from './schema.js'
export type { DataRow, DataInsert, RelationshipRow, RelationshipInsert } from './schema.js'
