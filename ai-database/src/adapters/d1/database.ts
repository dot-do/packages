/**
 * D1 Database Implementation
 *
 * Main database class for Cloudflare D1
 */

import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import { eq, and, inArray } from 'drizzle-orm'
import { schema, things as thingsTable, relationships as relationshipsTable } from './schema.js'
import { D1ThingCollection, D1RelationshipCollection } from './collections.js'
import { D1QueryBuilder } from './query-builder.js'
import type {
  Database,
  D1Config,
  NamespaceCollection,
  QueryBuilder,
  DbQuery,
  Where,
  HealthStatusResult,
  Thing,
  Relationship,
} from '../../types/index.js'

/**
 * D1 Database Implementation
 *
 * Provides database access via Cloudflare D1 with optional read replica support
 */
export class D1Database implements Database {
  private db: DrizzleD1Database<typeof schema>
  private readDb: DrizzleD1Database<typeof schema>
  private enableReplicas: boolean

  things: D1ThingCollection
  relationships: D1RelationshipCollection

  constructor(private config: D1Config) {
    this.enableReplicas = config.enableReplicas ?? false

    // Initialize Drizzle with D1 binding
    this.db = drizzle(config.binding, { schema })
    this.readDb = this.db // Default to write db

    // Set up read replica if enabled
    if (this.enableReplicas) {
      this.readDb = this.getSessionDb('fast')
    }

    // Initialize collections
    this.things = new D1ThingCollection(this.readDb)
    this.relationships = new D1RelationshipCollection(this.readDb)
  }

  /**
   * Get namespace-scoped database access
   */
  namespace(ns: string): NamespaceCollection {
    return new D1NamespaceCollection(this.db, this.readDb, ns)
  }

  /**
   * Create a query builder for type-safe queries
   */
  select<T = any>(): QueryBuilder<T> {
    return new D1QueryBuilder<T>(this.readDb)
  }

  /**
   * Start a query from a specific table
   */
  from(table: string): QueryBuilder {
    return new D1QueryBuilder(this.readDb).from(table)
  }

  /**
   * Execute a raw query
   *
   * Supports both SQL strings and Drizzle query objects
   */
  async query<T = any>(query: DbQuery): Promise<T[]> {
    if (typeof query === 'string') {
      // Raw SQL query
      const result = await this.readDb.run(query as any)
      return result.results as T[]
    } else if ('execute' in query) {
      // Drizzle query builder
      return (await query.execute()) as T[]
    } else {
      // Drizzle query object
      return (await this.readDb.execute(query as any)) as T[]
    }
  }

  /**
   * Insert records into a table
   */
  async insert(table: string, data: any | any[]): Promise<any> {
    const tableRef = this.getTable(table)
    if (!tableRef) {
      throw new Error(`Unknown table: ${table}`)
    }

    const values = Array.isArray(data) ? data : [data]

    await this.db.insert(tableRef).values(values)

    // Return inserted data
    return Array.isArray(data) ? values : values[0]
  }

  /**
   * Update records in a table
   */
  async update(table: string, data: any, where: Where): Promise<any> {
    const tableRef = this.getTable(table)
    if (!tableRef) {
      throw new Error(`Unknown table: ${table}`)
    }

    const conditions = this.buildWhereConditions(where, tableRef)

    await this.db.update(tableRef).set(data).where(and(...conditions))

    return data
  }

  /**
   * Delete records from a table
   */
  async delete(table: string, where: Where): Promise<void> {
    const tableRef = this.getTable(table)
    if (!tableRef) {
      throw new Error(`Unknown table: ${table}`)
    }

    const conditions = this.buildWhereConditions(where, tableRef)

    await this.db.delete(tableRef).where(and(...conditions))
  }

  /**
   * Get database health status
   */
  async getHealthStatus(): Promise<HealthStatusResult> {
    try {
      // Test basic query
      const start = Date.now()
      await this.db.select().from(thingsTable).limit(1)
      const latency = Date.now() - start

      return {
        healthy: true,
        timestamp: new Date().toISOString(),
        latency,
      }
    } catch (error) {
      return {
        healthy: false,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Create a new database instance with a specific session type
   *
   * D1 Sessions API for read replica routing:
   * - 'fast' → 'first-unconstrained' (may read from replica)
   * - 'fresh' → 'first-primary' (always reads from primary)
   */
  withSession(type: 'fast' | 'fresh'): Database {
    const sessionType = type === 'fresh' ? 'first-primary' : 'first-unconstrained'
    const sessionBinding = (this.config.binding as any).withSession(sessionType)

    return new D1Database({
      ...this.config,
      binding: sessionBinding as D1Database,
    })
  }

  /**
   * Get D1 binding with session (internal helper)
   */
  private getSessionDb(type: 'fast' | 'fresh'): DrizzleD1Database<typeof schema> {
    if (!this.enableReplicas) return this.db

    const sessionType = type === 'fresh' ? 'first-primary' : 'first-unconstrained'
    const session = (this.config.binding as any).withSession(sessionType)

    return drizzle(session as D1Database, { schema })
  }

  /**
   * Get table reference by name
   */
  private getTable(name: string) {
    switch (name) {
      case 'things':
        return thingsTable
      case 'relationships':
        return relationshipsTable
      default:
        return null
    }
  }

  /**
   * Build WHERE conditions from filter object
   */
  private buildWhereConditions(filter: Where, table: any): any[] {
    const conditions: any[] = []

    for (const [key, value] of Object.entries(filter)) {
      const column = table[key]
      if (!column) continue

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Operator-based conditions handled by query builder
        conditions.push(eq(column, value))
      } else {
        conditions.push(eq(column, value))
      }
    }

    return conditions
  }
}

/**
 * Namespace-scoped collection implementation
 */
class D1NamespaceCollection implements NamespaceCollection {
  things: D1NamespacedThingCollection
  relationships: D1NamespacedRelationshipCollection

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    private readDb: DrizzleD1Database<typeof schema>,
    public ns: string
  ) {
    this.things = new D1NamespacedThingCollection(this.db, this.readDb, ns)
    this.relationships = new D1NamespacedRelationshipCollection(this.db, this.readDb, ns)
  }

  async find(id: string): Promise<Thing | Relationship | null> {
    // Try finding as thing first
    const thing = await this.things.find(id)
    if (thing) return thing

    // Try finding as relationship
    return this.relationships.find(id)
  }

  async delete(id: string): Promise<void> {
    // Try deleting from things
    const thing = await this.things.find(id)
    if (thing) {
      await this.things.delete(id)
      return
    }

    // Try deleting from relationships
    const relationship = await this.relationships.find(id)
    if (relationship) {
      await this.relationships.delete(id)
      return
    }

    throw new Error(`Entity not found: ${this.ns}:${id}`)
  }

  async types(): Promise<string[]> {
    // Get unique types from things in this namespace
    const query = await this.db
      .select({ type: thingsTable.type })
      .from(thingsTable)
      .where(eq(thingsTable.ns, this.ns))

    // Extract unique types
    const uniqueTypes = [...new Set(query.map(row => row.type))]
    return uniqueTypes
  }
}

/**
 * Namespace-scoped thing collection
 */
class D1NamespacedThingCollection {
  private collection: D1ThingCollection

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    readDb: DrizzleD1Database<typeof schema>,
    private ns: string
  ) {
    this.collection = new D1ThingCollection(readDb)
  }

  async find(id: string): Promise<Thing | null> {
    return this.collection.find(id, this.ns)
  }

  async create(input: Omit<Parameters<D1ThingCollection['create']>[0], 'ns'>): Promise<Thing> {
    return this.collection.create({ ...input, ns: this.ns })
  }

  async update(id: string, data: Partial<Thing>): Promise<Thing> {
    return this.collection.update(id, data, this.ns)
  }

  async delete(id: string): Promise<void> {
    return this.collection.delete(id, this.ns)
  }

  where(filter: Omit<Parameters<D1ThingCollection['where']>[0], 'ns'>) {
    return this.collection.where({ ...filter, ns: this.ns })
  }

  async list(options?: Parameters<D1ThingCollection['list']>[0]): Promise<Thing[]> {
    const query = this.collection.where({ ns: this.ns })
    if (options?.sortBy) {
      query.orderBy(options.sortBy, options.sortOrder)
    }
    if (options?.limit) {
      query.limit(options.limit)
    }
    if (options?.offset) {
      query.offset(options.offset)
    }
    return query.execute()
  }
}

/**
 * Namespace-scoped relationship collection
 */
class D1NamespacedRelationshipCollection {
  private collection: D1RelationshipCollection

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    readDb: DrizzleD1Database<typeof schema>,
    private ns: string
  ) {
    this.collection = new D1RelationshipCollection(readDb)
  }

  async find(id: string): Promise<Relationship | null> {
    return this.collection.find(id, this.ns)
  }

  async create(input: Omit<Parameters<D1RelationshipCollection['create']>[0], 'ns'>): Promise<Relationship> {
    return this.collection.create({ ...input, ns: this.ns })
  }

  async update(id: string, data: Partial<Relationship>): Promise<Relationship> {
    return this.collection.update(id, data, this.ns)
  }

  async delete(id: string): Promise<void> {
    return this.collection.delete(id, this.ns)
  }

  where(filter: Omit<Parameters<D1RelationshipCollection['where']>[0], 'ns'>) {
    return this.collection.where({ ...filter, ns: this.ns })
  }

  async list(options?: Parameters<D1RelationshipCollection['list']>[0]): Promise<Relationship[]> {
    const query = this.collection.where({ ns: this.ns })
    if (options?.sortBy) {
      query.orderBy(options.sortBy, options.sortOrder)
    }
    if (options?.limit) {
      query.limit(options.limit)
    }
    if (options?.offset) {
      query.offset(options.offset)
    }
    return query.execute()
  }
}
