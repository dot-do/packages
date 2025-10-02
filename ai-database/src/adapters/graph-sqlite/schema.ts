/**
 * Graph Database Schema for SQLite
 *
 * Two-table design inspired by PayloadCMS MongoDB adapter:
 * 1. Data table - stores all entities as JSON documents (nodes/vertices)
 * 2. Relationships table - stores all connections (edges)
 *
 * Works identically on D1 and DO SQLite - no migrations needed!
 */

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

/**
 * Data Table (Nodes/Vertices)
 *
 * Stores all entities as JSON documents with id format: "ns:id"
 *
 * Example:
 * id: "onet:15-1254.00"
 * data: { type: "Occupation", name: "Chiropractors", ... }
 */
export const data = sqliteTable(
  'data',
  {
    id: text('id').primaryKey(), // Format: "ns:id"
    data: text('data', { mode: 'json' }).notNull().$type<Record<string, any>>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  table => ({
    // Index for querying by type (extracted from JSON)
    // SQLite supports JSON operators: data->>'type'
    createdAtIdx: index('data_created_at_idx').on(table.createdAt),
    updatedAtIdx: index('data_updated_at_idx').on(table.updatedAt),
  })
)

/**
 * Relationships Table (Edges)
 *
 * Stores all connections between data entities
 *
 * Example:
 * id: "onet:rel-123"
 * type: "requires"
 * fromId: "onet:15-1254.00"
 * toId: "onet:skill-2.A.1.a"
 * data: { level: 5, importance: "high" }
 */
export const relationships = sqliteTable(
  'relationships',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    fromId: text('from_id').notNull(), // References data.id
    toId: text('to_id').notNull(), // References data.id
    data: text('data', { mode: 'json' }).$type<Record<string, any>>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  table => ({
    // Indexes for graph traversal
    typeIdx: index('relationships_type_idx').on(table.type),
    fromIdx: index('relationships_from_idx').on(table.fromId),
    toIdx: index('relationships_to_idx').on(table.toId),
    fromToIdx: index('relationships_from_to_idx').on(table.fromId, table.toId),
    createdAtIdx: index('relationships_created_at_idx').on(table.createdAt),
  })
)

/**
 * Combined schema export
 */
export const schema = {
  data,
  relationships,
}

/**
 * Type exports
 */
export type DataRow = typeof data.$inferSelect
export type DataInsert = typeof data.$inferInsert
export type RelationshipRow = typeof relationships.$inferSelect
export type RelationshipInsert = typeof relationships.$inferInsert
