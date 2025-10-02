/**
 * Graph Database Implementation
 *
 * MongoDB-style adapter for SQLite using two-table graph structure.
 * Works identically on D1 and DO SQLite.
 */

import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, and, sql } from 'drizzle-orm'
import { schema, data as dataTable, relationships as relationshipsTable } from './schema.js'
import type { Database, Thing, Relationship, CreateThingInput, CreateRelationshipInput, ThingFilter, RelationshipFilter, ListOptions, HealthStatusResult, NamespaceCollection, QueryBuilder, Where, DbQuery } from '../../types/index.js'
import { slugify } from '../../core/utils.js'

/**
 * Graph SQLite Database
 *
 * Uses two-table design: data (nodes) + relationships (edges)
 */
export class GraphDatabase implements Database {
  private db: DrizzleD1Database<typeof schema>

  things: GraphThingCollection
  relationships: GraphRelationshipCollection

  constructor(binding: D1Database) {
    this.db = drizzle(binding, { schema })
    this.things = new GraphThingCollection(this.db)
    this.relationships = new GraphRelationshipCollection(this.db)
  }

  namespace(ns: string): NamespaceCollection {
    return new GraphNamespaceCollection(this.db, ns)
  }

  select<T>(): QueryBuilder<T> {
    throw new Error('Use things.where() or relationships.where() instead')
  }

  from(_table: string): QueryBuilder {
    throw new Error('Use things.where() or relationships.where() instead')
  }

  async query<T>(_query: DbQuery): Promise<T[]> {
    throw new Error('Not implemented - use collections')
  }

  async insert(table: string, data: any): Promise<any> {
    if (table === 'things') {
      return this.things.create(data)
    } else if (table === 'relationships') {
      return this.relationships.create(data)
    }
    throw new Error(`Unknown table: ${table}`)
  }

  async update(table: string, data: any, where: Where): Promise<any> {
    const id = where.id as string
    const ns = where.ns as string | undefined

    if (table === 'things') {
      return this.things.update(id, data, ns)
    } else if (table === 'relationships') {
      return this.relationships.update(id, data, ns)
    }
    throw new Error(`Unknown table: ${table}`)
  }

  async delete(table: string, where: Where): Promise<void> {
    const id = where.id as string
    const ns = where.ns as string | undefined

    if (table === 'things') {
      await this.things.delete(id, ns)
    } else if (table === 'relationships') {
      await this.relationships.delete(id, ns)
    } else {
      throw new Error(`Unknown table: ${table}`)
    }
  }

  async getHealthStatus(): Promise<HealthStatusResult> {
    try {
      const start = Date.now()
      await this.db.select().from(dataTable).limit(1)
      const latency = Date.now() - start

      return {
        healthy: true,
        timestamp: new Date().toISOString(),
        latency,
      }
    } catch {
      return {
        healthy: false,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

/**
 * Thing Collection using data table
 */
class GraphThingCollection {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  async find(id: string, ns?: string): Promise<Thing | null> {
    const key = ns ? `${ns}:${id}` : id
    const result = await this.db.select().from(dataTable).where(eq(dataTable.id, key)).limit(1)

    if (!result || result.length === 0) return null

    return this.rowToThing(result[0])
  }

  async create(input: CreateThingInput): Promise<Thing> {
    const id = input.id || slugify(input.type + '-' + Date.now())
    const key = `${input.ns}:${id}`
    const now = new Date()

    const thingData = {
      type: input.type,
      content: input.content,
      code: input.code,
      data: input.data || {},
      visibility: input.visibility || 'public',
      embedding: input.embedding,
    }

    await this.db.insert(dataTable).values({
      id: key,
      data: thingData,
      createdAt: now,
      updatedAt: now,
    })

    return {
      ns: input.ns,
      id,
      ...thingData,
      createdAt: now,
      updatedAt: now,
    }
  }

  async update(id: string, updates: Partial<Thing>, ns?: string): Promise<Thing> {
    const key = ns ? `${ns}:${id}` : id
    const existing = await this.find(id, ns)

    if (!existing) {
      throw new Error(`Thing not found: ${key}`)
    }

    const now = new Date()
    const merged = { ...existing, ...updates, updatedAt: now }

    await this.db
      .update(dataTable)
      .set({
        data: {
          type: merged.type,
          content: merged.content,
          code: merged.code,
          data: merged.data,
          visibility: merged.visibility,
          embedding: merged.embedding,
        },
        updatedAt: now,
      })
      .where(eq(dataTable.id, key))

    return merged
  }

  async delete(id: string, ns?: string): Promise<void> {
    const key = ns ? `${ns}:${id}` : id
    await this.db.delete(dataTable).where(eq(dataTable.id, key))
  }

  where(filter: ThingFilter): QueryBuilder<Thing> {
    return new GraphThingQueryBuilder(this.db, filter, this)
  }

  async list(options?: ListOptions): Promise<Thing[]> {
    let query: any = this.db.select().from(dataTable)

    // Apply namespace filter if provided
    if (options?.ns) {
      query = query.where(sql`id LIKE ${options.ns + ':%'}`)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.offset(options.offset)
    }

    const results = await query
    return results.map((row: any) => this.rowToThing(row))
  }

  private rowToThing(row: any): Thing {
    const [ns, id] = row.id.split(':')
    const data = row.data

    return {
      ns,
      id,
      type: data.type,
      content: data.content,
      code: data.code,
      data: data.data || {},
      visibility: data.visibility,
      embedding: data.embedding,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

/**
 * Query Builder for Things
 */
class GraphThingQueryBuilder implements QueryBuilder<Thing> {
  private filters: ThingFilter
  private _limit?: number
  private _offset?: number
  private _orderBy?: string
  private _orderDirection?: 'asc' | 'desc'

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    filter: ThingFilter,
    private collection: GraphThingCollection
  ) {
    this.filters = filter
  }

  where(filter: Where): this {
    this.filters = { ...this.filters, ...filter }
    return this
  }

  limit(n: number): this {
    this._limit = n
    return this
  }

  offset(n: number): this {
    this._offset = n
    return this
  }

  orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this._orderBy = column
    this._orderDirection = direction
    return this
  }

  async execute(): Promise<Thing[]> {
    let query: any = this.db.select().from(dataTable)

    // Build WHERE conditions using SQL template for JSON queries
    const conditions: any[] = []

    if (this.filters.ns) {
      conditions.push(sql`id LIKE ${this.filters.ns + ':%'}`)
    }

    if (this.filters.type) {
      conditions.push(sql`json_extract(data, '$.type') = ${this.filters.type}`)
    }

    if (this.filters.visibility) {
      conditions.push(sql`json_extract(data, '$.visibility') = ${this.filters.visibility}`)
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Apply ordering
    if (this._orderBy) {
      if (this._orderBy === 'createdAt' || this._orderBy === 'updatedAt') {
        const direction = this._orderDirection === 'desc' ? 'DESC' : 'ASC'
        query = query.orderBy(sql`${dataTable[this._orderBy]} ${sql.raw(direction)}`)
      }
    }

    // Apply pagination
    if (this._limit) {
      query = query.limit(this._limit)
    }
    if (this._offset) {
      query = query.offset(this._offset)
    }

    const results = await query
    return results.map((row: any) => this.collection['rowToThing'](row))
  }

  async first(): Promise<Thing | null> {
    const results = await this.limit(1).execute()
    return results[0] || null
  }

  async count(): Promise<number> {
    let query = this.db.select({ count: sql`COUNT(*)` }).from(dataTable)

    const conditions: any[] = []

    if (this.filters.ns) {
      conditions.push(sql`id LIKE ${this.filters.ns + ':%'}`)
    }

    if (this.filters.type) {
      conditions.push(sql`json_extract(data, '$.type') = ${this.filters.type}`)
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    const result = await query
    return Number((result[0] as any).count)
  }
}

/**
 * Query Builder for Relationships
 */
class GraphRelationshipQueryBuilder implements QueryBuilder<Relationship> {
  private filters: RelationshipFilter
  private _limit?: number
  private _offset?: number
  private _orderBy?: string
  private _orderDirection?: 'asc' | 'desc'

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    filter: RelationshipFilter,
    private collection: GraphRelationshipCollection
  ) {
    this.filters = filter
  }

  where(filter: Where): this {
    this.filters = { ...this.filters, ...filter }
    return this
  }

  limit(n: number): this {
    this._limit = n
    return this
  }

  offset(n: number): this {
    this._offset = n
    return this
  }

  orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this._orderBy = column
    this._orderDirection = direction
    return this
  }

  async execute(): Promise<Relationship[]> {
    let query: any = this.db.select().from(relationshipsTable)

    // Build WHERE conditions
    const conditions: any[] = []

    if (this.filters.ns) {
      conditions.push(sql`id LIKE ${this.filters.ns + ':%'}`)
    }

    if (this.filters.type) {
      conditions.push(eq(relationshipsTable.type, this.filters.type))
    }

    if (this.filters.fromNs && this.filters.fromId) {
      const fromKey = `${this.filters.fromNs}:${this.filters.fromId}`
      conditions.push(eq(relationshipsTable.fromId, fromKey))
    }

    if (this.filters.toNs && this.filters.toId) {
      const toKey = `${this.filters.toNs}:${this.filters.toId}`
      conditions.push(eq(relationshipsTable.toId, toKey))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Apply ordering
    if (this._orderBy) {
      if (this._orderBy === 'createdAt' || this._orderBy === 'updatedAt') {
        const direction = this._orderDirection === 'desc' ? 'DESC' : 'ASC'
        query = query.orderBy(sql`${relationshipsTable[this._orderBy]} ${sql.raw(direction)}`)
      }
    }

    // Apply pagination
    if (this._limit) {
      query = query.limit(this._limit)
    }
    if (this._offset) {
      query = query.offset(this._offset)
    }

    const results = await query
    return results.map((row: any) => this.collection['rowToRelationship'](row))
  }

  async first(): Promise<Relationship | null> {
    const results = await this.limit(1).execute()
    return results[0] || null
  }

  async count(): Promise<number> {
    let query = this.db.select({ count: sql`COUNT(*)` }).from(relationshipsTable)

    const conditions: any[] = []

    if (this.filters.ns) {
      conditions.push(sql`id LIKE ${this.filters.ns + ':%'}`)
    }

    if (this.filters.type) {
      conditions.push(eq(relationshipsTable.type, this.filters.type))
    }

    if (this.filters.fromNs && this.filters.fromId) {
      const fromKey = `${this.filters.fromNs}:${this.filters.fromId}`
      conditions.push(eq(relationshipsTable.fromId, fromKey))
    }

    if (this.filters.toNs && this.filters.toId) {
      const toKey = `${this.filters.toNs}:${this.filters.toId}`
      conditions.push(eq(relationshipsTable.toId, toKey))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    const result = await query
    return Number((result[0] as any).count)
  }
}

/**
 * Relationship Collection
 */
class GraphRelationshipCollection {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  async find(id: string, ns?: string): Promise<Relationship | null> {
    const key = ns ? `${ns}:${id}` : id
    const result = await this.db.select().from(relationshipsTable).where(eq(relationshipsTable.id, key)).limit(1)

    if (!result || result.length === 0) return null

    return this.rowToRelationship(result[0])
  }

  async create(input: CreateRelationshipInput): Promise<Relationship> {
    const id = input.id || slugify(`${input.type}-${input.fromNs}-${input.fromId}-${input.toNs}-${input.toId}`)
    const key = `${input.ns}:${id}`
    const now = new Date()

    await this.db.insert(relationshipsTable).values({
      id: key,
      type: input.type,
      fromId: `${input.fromNs}:${input.fromId}`,
      toId: `${input.toNs}:${input.toId}`,
      data: input.data || {},
      createdAt: now,
      updatedAt: now,
    })

    return {
      ns: input.ns,
      id,
      type: input.type,
      fromNs: input.fromNs,
      fromId: input.fromId,
      toNs: input.toNs,
      toId: input.toId,
      code: input.code,
      data: input.data || {},
      visibility: input.visibility || 'public',
      createdAt: now,
      updatedAt: now,
    }
  }

  async update(id: string, updates: Partial<Relationship>, ns?: string): Promise<Relationship> {
    const key = ns ? `${ns}:${id}` : id
    const existing = await this.find(id, ns)

    if (!existing) {
      throw new Error(`Relationship not found: ${key}`)
    }

    const now = new Date()
    const merged = { ...existing, ...updates, updatedAt: now }

    await this.db
      .update(relationshipsTable)
      .set({
        type: merged.type,
        data: merged.data,
        updatedAt: now,
      })
      .where(eq(relationshipsTable.id, key))

    return merged
  }

  async delete(id: string, ns?: string): Promise<void> {
    const key = ns ? `${ns}:${id}` : id
    await this.db.delete(relationshipsTable).where(eq(relationshipsTable.id, key))
  }

  where(filter: RelationshipFilter): QueryBuilder<Relationship> {
    return new GraphRelationshipQueryBuilder(this.db, filter, this)
  }

  async list(options?: ListOptions): Promise<Relationship[]> {
    let query: any = this.db.select().from(relationshipsTable)

    // Apply namespace filter if provided
    if (options?.ns) {
      query = query.where(sql`id LIKE ${options.ns + ':%'}`)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.offset(options.offset)
    }

    const results = await query
    return results.map((row: any) => this.rowToRelationship(row))
  }

  private rowToRelationship(row: any): Relationship {
    const [ns, id] = row.id.split(':')
    const [fromNs, fromId] = row.fromId.split(':')
    const [toNs, toId] = row.toId.split(':')

    return {
      ns,
      id,
      type: row.type,
      fromNs,
      fromId,
      toNs,
      toId,
      data: row.data || {},
      visibility: 'public', // Not stored in relationships table currently
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

/**
 * Namespace-scoped collection
 */
class GraphNamespaceCollection implements NamespaceCollection {
  things: any
  relationships: any

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    public ns: string
  ) {
    this.things = new GraphThingCollection(db)
    this.relationships = new GraphRelationshipCollection(db)
  }

  async find(id: string): Promise<Thing | Relationship | null> {
    const thing = await this.things.find(id, this.ns)
    if (thing) return thing

    return this.relationships.find(id, this.ns)
  }

  async delete(id: string): Promise<void> {
    const thing = await this.things.find(id, this.ns)
    if (thing) {
      await this.things.delete(id, this.ns)
      return
    }

    const rel = await this.relationships.find(id, this.ns)
    if (rel) {
      await this.relationships.delete(id, this.ns)
      return
    }

    throw new Error(`Entity not found: ${this.ns}:${id}`)
  }

  async types(): Promise<string[]> {
    // Query unique types from data JSON
    const query = sql`
      SELECT DISTINCT json_extract(data, '$.type') as type
      FROM ${dataTable}
      WHERE id LIKE ${this.ns + ':%'}
    `

    const results = await this.db.run(query as any)
    return (results.results as any[]).map(row => row.type).filter(Boolean)
  }
}
