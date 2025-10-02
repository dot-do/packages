/**
 * D1 Database Schema Definitions
 *
 * Drizzle ORM schema for SQLite (D1)
 */

import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core'

/**
 * Things table - Core entity storage
 *
 * Composite primary key: (ns, id)
 * Indexes: type, visibility, createdAt for common queries
 */
export const things = sqliteTable(
  'things',
  {
    ns: text('ns').notNull(),
    id: text('id').notNull(),
    type: text('type').notNull(),
    content: text('content'),
    code: text('code'),
    data: text('data', { mode: 'json' }).notNull().$default(() => ({})),
    visibility: text('visibility', { enum: ['public', 'private', 'unlisted'] })
      .notNull()
      .default('public'),
    embedding: text('embedding'), // JSON array of numbers
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.ns, table.id] }),
    typeIdx: index('things_type_idx').on(table.type),
    visibilityIdx: index('things_visibility_idx').on(table.visibility),
    createdAtIdx: index('things_created_at_idx').on(table.createdAt),
    nsTypeIdx: index('things_ns_type_idx').on(table.ns, table.type),
  })
)

/**
 * Relationships table - Graph edges between things
 *
 * Composite primary key: (ns, id)
 * Indexes: type, fromNs/fromId, toNs/toId for graph traversal
 */
export const relationships = sqliteTable(
  'relationships',
  {
    ns: text('ns').notNull(),
    id: text('id').notNull(),
    type: text('type').notNull(),
    fromNs: text('from_ns').notNull(),
    fromId: text('from_id').notNull(),
    toNs: text('to_ns').notNull(),
    toId: text('to_id').notNull(),
    code: text('code'),
    data: text('data', { mode: 'json' }).notNull().$default(() => ({})),
    visibility: text('visibility', { enum: ['public', 'private', 'unlisted'] })
      .notNull()
      .default('public'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.ns, table.id] }),
    typeIdx: index('relationships_type_idx').on(table.type),
    fromIdx: index('relationships_from_idx').on(table.fromNs, table.fromId),
    toIdx: index('relationships_to_idx').on(table.toNs, table.toId),
    visibilityIdx: index('relationships_visibility_idx').on(table.visibility),
    nsTypeIdx: index('relationships_ns_type_idx').on(table.ns, table.type),
    fromToIdx: index('relationships_from_to_idx').on(table.fromNs, table.fromId, table.toNs, table.toId),
  })
)

/**
 * Combined schema export
 */
export const schema = {
  things,
  relationships,
}

/**
 * Type exports for type-safe queries
 */
export type ThingRow = typeof things.$inferSelect
export type ThingInsert = typeof things.$inferInsert
export type RelationshipRow = typeof relationships.$inferSelect
export type RelationshipInsert = typeof relationships.$inferInsert
