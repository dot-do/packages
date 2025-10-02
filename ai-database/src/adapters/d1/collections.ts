/**
 * D1 Collections Implementation
 *
 * Thing and Relationship collection implementations for D1
 */

import { eq, and, or, like, inArray, gt, gte, lt, lte, ne, desc, asc } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { things as thingsTable, relationships as relationshipsTable, schema } from './schema.js'
import type { ThingCollection, RelationshipCollection, Thing, Relationship, CreateThingInput, CreateRelationshipInput, ThingFilter, RelationshipFilter, ListOptions } from '../../types/index.js'
import type { QueryBuilder } from '../../types/index.js'
import { buildWhereConditions, slugify } from '../../core/utils.js'

/**
 * D1 Thing Collection Implementation
 */
export class D1ThingCollection implements ThingCollection {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  async find(id: string, ns?: string): Promise<Thing | null> {
    const conditions = ns ? [eq(thingsTable.id, id), eq(thingsTable.ns, ns)] : [eq(thingsTable.id, id)]

    const result = await this.db.select().from(thingsTable).where(and(...conditions)).limit(1)

    if (!result || result.length === 0) return null

    return this.mapRowToThing(result[0])
  }

  async create(input: CreateThingInput): Promise<Thing> {
    const id = input.id || slugify(input.type + '-' + Date.now())
    const now = new Date()

    const insert = {
      ns: input.ns,
      id,
      type: input.type,
      content: input.content,
      code: input.code,
      data: input.data || {},
      visibility: input.visibility || 'public',
      embedding: input.embedding ? JSON.stringify(input.embedding) : undefined,
      createdAt: now,
      updatedAt: now,
    }

    await this.db.insert(thingsTable).values(insert)

    return this.mapRowToThing({ ...insert, embedding: insert.embedding || null })
  }

  async update(id: string, data: Partial<Thing>, ns?: string): Promise<Thing> {
    const existing = await this.find(id, ns)
    if (!existing) {
      throw new Error(`Thing not found: ${ns ? `${ns}:` : ''}${id}`)
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // Handle embedding array serialization
    if (data.embedding) {
      updateData.embedding = JSON.stringify(data.embedding)
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const conditions = ns ? [eq(thingsTable.id, id), eq(thingsTable.ns, ns)] : [eq(thingsTable.id, id)]

    await this.db.update(thingsTable).set(updateData).where(and(...conditions))

    return this.find(id, ns) as Promise<Thing>
  }

  async delete(id: string, ns?: string): Promise<void> {
    const conditions = ns ? [eq(thingsTable.id, id), eq(thingsTable.ns, ns)] : [eq(thingsTable.id, id)]

    await this.db.delete(thingsTable).where(and(...conditions))
  }

  where(filter: ThingFilter): QueryBuilder<Thing> {
    return new D1ThingQueryBuilder(this.db, filter)
  }

  async list(options?: ListOptions): Promise<Thing[]> {
    let query = this.db.select().from(thingsTable)

    // Apply sorting
    if (options?.sortBy) {
      const column = thingsTable[options.sortBy as keyof typeof thingsTable]
      if (column) {
        query = options.sortOrder === 'asc' ? query.orderBy(asc(column)) : query.orderBy(desc(column))
      }
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.offset(options.offset)
    }

    const results = await query

    return results.map(row => this.mapRowToThing(row))
  }

  private mapRowToThing(row: any): Thing {
    return {
      ns: row.ns,
      id: row.id,
      type: row.type,
      content: row.content || undefined,
      code: row.code || undefined,
      data: row.data || {},
      visibility: row.visibility,
      embedding: row.embedding ? JSON.parse(row.embedding) : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

/**
 * D1 Relationship Collection Implementation
 */
export class D1RelationshipCollection implements RelationshipCollection {
  constructor(private db: DrizzleD1Database<typeof schema>) {}

  async find(id: string, ns?: string): Promise<Relationship | null> {
    const conditions = ns ? [eq(relationshipsTable.id, id), eq(relationshipsTable.ns, ns)] : [eq(relationshipsTable.id, id)]

    const result = await this.db.select().from(relationshipsTable).where(and(...conditions)).limit(1)

    if (!result || result.length === 0) return null

    return this.mapRowToRelationship(result[0])
  }

  async create(input: CreateRelationshipInput): Promise<Relationship> {
    const id = input.id || slugify(`${input.type}-${input.fromNs}-${input.fromId}-${input.toNs}-${input.toId}`)
    const now = new Date()

    const insert = {
      ns: input.ns,
      id,
      type: input.type,
      fromNs: input.fromNs,
      fromId: input.fromId,
      toNs: input.toNs,
      toId: input.toId,
      code: input.code || null,
      data: input.data || {},
      visibility: input.visibility || 'public',
      createdAt: now,
      updatedAt: now,
    }

    await this.db.insert(relationshipsTable).values(insert)

    return this.mapRowToRelationship(insert)
  }

  async update(id: string, data: Partial<Relationship>, ns?: string): Promise<Relationship> {
    const existing = await this.find(id, ns)
    if (!existing) {
      throw new Error(`Relationship not found: ${ns ? `${ns}:` : ''}${id}`)
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const conditions = ns ? [eq(relationshipsTable.id, id), eq(relationshipsTable.ns, ns)] : [eq(relationshipsTable.id, id)]

    await this.db.update(relationshipsTable).set(updateData).where(and(...conditions))

    return this.find(id, ns) as Promise<Relationship>
  }

  async delete(id: string, ns?: string): Promise<void> {
    const conditions = ns ? [eq(relationshipsTable.id, id), eq(relationshipsTable.ns, ns)] : [eq(relationshipsTable.id, id)]

    await this.db.delete(relationshipsTable).where(and(...conditions))
  }

  where(filter: RelationshipFilter): QueryBuilder<Relationship> {
    return new D1RelationshipQueryBuilder(this.db, filter)
  }

  async list(options?: ListOptions): Promise<Relationship[]> {
    let query = this.db.select().from(relationshipsTable)

    // Apply sorting
    if (options?.sortBy) {
      const column = relationshipsTable[options.sortBy as keyof typeof relationshipsTable]
      if (column) {
        query = options.sortOrder === 'asc' ? query.orderBy(asc(column)) : query.orderBy(desc(column))
      }
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.offset(options.offset)
    }

    const results = await query

    return results.map(row => this.mapRowToRelationship(row))
  }

  private mapRowToRelationship(row: any): Relationship {
    return {
      ns: row.ns,
      id: row.id,
      type: row.type,
      fromNs: row.fromNs,
      fromId: row.fromId,
      toNs: row.toNs,
      toId: row.toId,
      code: row.code || undefined,
      data: row.data || {},
      visibility: row.visibility,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}

/**
 * D1 Thing Query Builder
 */
class D1ThingQueryBuilder implements QueryBuilder<Thing> {
  private filters: any[] = []
  private sortByField?: string
  private sortDirection: 'asc' | 'desc' = 'desc'
  private limitValue?: number
  private offsetValue?: number

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    initialFilter?: ThingFilter
  ) {
    if (initialFilter) {
      this.filters.push(initialFilter)
    }
  }

  where(filter: any): this {
    this.filters.push(filter)
    return this
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'desc'): this {
    this.sortByField = field
    this.sortDirection = direction
    return this
  }

  limit(count: number): this {
    this.limitValue = count
    return this
  }

  offset(count: number): this {
    this.offsetValue = count
    return this
  }

  async execute(): Promise<Thing[]> {
    let query = this.db.select().from(thingsTable)

    // Apply filters
    if (this.filters.length > 0) {
      const conditions = this.filters.flatMap(filter => this.buildConditions(filter))
      query = query.where(and(...conditions))
    }

    // Apply sorting
    if (this.sortByField) {
      const column = thingsTable[this.sortByField as keyof typeof thingsTable]
      if (column) {
        query = this.sortDirection === 'asc' ? query.orderBy(asc(column)) : query.orderBy(desc(column))
      }
    }

    // Apply pagination
    if (this.limitValue) {
      query = query.limit(this.limitValue)
    }
    if (this.offsetValue) {
      query = query.offset(this.offsetValue)
    }

    const results = await query

    return results.map(row => ({
      ns: row.ns,
      id: row.id,
      type: row.type,
      content: row.content || undefined,
      code: row.code || undefined,
      data: row.data || {},
      visibility: row.visibility,
      embedding: row.embedding ? JSON.parse(row.embedding) : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  private buildConditions(filter: any): any[] {
    const conditions: any[] = []

    for (const [key, value] of Object.entries(filter)) {
      const column = thingsTable[key as keyof typeof thingsTable]
      if (!column) continue

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Handle operators
        if ('$gt' in value) conditions.push(gt(column, value.$gt))
        if ('$gte' in value) conditions.push(gte(column, value.$gte))
        if ('$lt' in value) conditions.push(lt(column, value.$lt))
        if ('$lte' in value) conditions.push(lte(column, value.$lte))
        if ('$ne' in value) conditions.push(ne(column, value.$ne))
        if ('$in' in value) conditions.push(inArray(column, value.$in))
        if ('$like' in value) conditions.push(like(column, value.$like))
      } else {
        // Direct equality
        conditions.push(eq(column, value))
      }
    }

    return conditions
  }
}

/**
 * D1 Relationship Query Builder
 */
class D1RelationshipQueryBuilder implements QueryBuilder<Relationship> {
  private filters: any[] = []
  private sortByField?: string
  private sortDirection: 'asc' | 'desc' = 'desc'
  private limitValue?: number
  private offsetValue?: number

  constructor(
    private db: DrizzleD1Database<typeof schema>,
    initialFilter?: RelationshipFilter
  ) {
    if (initialFilter) {
      this.filters.push(initialFilter)
    }
  }

  where(filter: any): this {
    this.filters.push(filter)
    return this
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'desc'): this {
    this.sortByField = field
    this.sortDirection = direction
    return this
  }

  limit(count: number): this {
    this.limitValue = count
    return this
  }

  offset(count: number): this {
    this.offsetValue = count
    return this
  }

  async execute(): Promise<Relationship[]> {
    let query = this.db.select().from(relationshipsTable)

    // Apply filters
    if (this.filters.length > 0) {
      const conditions = this.filters.flatMap(filter => this.buildConditions(filter))
      query = query.where(and(...conditions))
    }

    // Apply sorting
    if (this.sortByField) {
      const column = relationshipsTable[this.sortByField as keyof typeof relationshipsTable]
      if (column) {
        query = this.sortDirection === 'asc' ? query.orderBy(asc(column)) : query.orderBy(desc(column))
      }
    }

    // Apply pagination
    if (this.limitValue) {
      query = query.limit(this.limitValue)
    }
    if (this.offsetValue) {
      query = query.offset(this.offsetValue)
    }

    const results = await query

    return results.map(row => ({
      ns: row.ns,
      id: row.id,
      type: row.type,
      fromNs: row.fromNs,
      fromId: row.fromId,
      toNs: row.toNs,
      toId: row.toId,
      code: row.code || undefined,
      data: row.data || {},
      visibility: row.visibility,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  private buildConditions(filter: any): any[] {
    const conditions: any[] = []

    for (const [key, value] of Object.entries(filter)) {
      const column = relationshipsTable[key as keyof typeof relationshipsTable]
      if (!column) continue

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Handle operators
        if ('$gt' in value) conditions.push(gt(column, value.$gt))
        if ('$gte' in value) conditions.push(gte(column, value.$gte))
        if ('$lt' in value) conditions.push(lt(column, value.$lt))
        if ('$lte' in value) conditions.push(lte(column, value.$lte))
        if ('$ne' in value) conditions.push(ne(column, value.$ne))
        if ('$in' in value) conditions.push(inArray(column, value.$in))
        if ('$like' in value) conditions.push(like(column, value.$like))
      } else {
        // Direct equality
        conditions.push(eq(column, value))
      }
    }

    return conditions
  }
}
