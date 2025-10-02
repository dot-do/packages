/**
 * D1 Query Builder Implementation
 *
 * General-purpose query builder for D1 database
 */

import { eq, and, like, inArray, gt, gte, lt, lte, ne, desc, asc, SQL } from 'drizzle-orm'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { schema, things, relationships } from './schema.js'
import type { QueryBuilder, Where } from '../../types/index.js'

/**
 * D1 Query Builder
 *
 * Chainable query builder for arbitrary tables
 */
export class D1QueryBuilder<T = any> implements QueryBuilder<T> {
  private tableName?: string
  private columns?: string[]
  private filters: Where[] = []
  private sortByField?: string
  private sortDirection: 'asc' | 'desc' = 'desc'
  private limitValue?: number
  private offsetValue?: number

  constructor(private db: DrizzleD1Database<typeof schema>) {}

  /**
   * Specify table to query
   */
  from(table: string): this {
    this.tableName = table
    return this
  }

  /**
   * Select specific columns (optional, defaults to all)
   */
  select(...columns: string[]): this {
    this.columns = columns
    return this
  }

  /**
   * Add WHERE conditions
   *
   * Can be called multiple times, conditions are ANDed together
   */
  where(filter: Where): this {
    this.filters.push(filter)
    return this
  }

  /**
   * Order results by field
   */
  orderBy(field: string, direction: 'asc' | 'desc' = 'desc'): this {
    this.sortByField = field
    this.sortDirection = direction
    return this
  }

  /**
   * Limit number of results
   */
  limit(count: number): this {
    this.limitValue = count
    return this
  }

  /**
   * Skip number of results
   */
  offset(count: number): this {
    this.offsetValue = count
    return this
  }

  /**
   * Execute the query and return results
   */
  async execute(): Promise<T[]> {
    if (!this.tableName) {
      throw new Error('Table name not specified. Call from(table) before execute()')
    }

    // Get table reference
    const table = this.getTable(this.tableName)
    if (!table) {
      throw new Error(`Unknown table: ${this.tableName}`)
    }

    // Build base query
    let query = this.db.select().from(table)

    // Apply filters
    if (this.filters.length > 0) {
      const conditions = this.filters.flatMap(filter => this.buildConditions(filter, table))
      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }
    }

    // Apply sorting
    if (this.sortByField) {
      const column = (table as any)[this.sortByField]
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

    // Execute and return results
    const results = await query

    return results as T[]
  }

  /**
   * Get table reference by name
   */
  private getTable(name: string) {
    switch (name) {
      case 'things':
        return things
      case 'relationships':
        return relationships
      default:
        return null
    }
  }

  /**
   * Build WHERE conditions from filter object
   */
  private buildConditions(filter: Where, table: any): SQL[] {
    const conditions: SQL[] = []

    for (const [key, value] of Object.entries(filter)) {
      const column = table[key]
      if (!column) continue

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Handle operators
        if ('$gt' in value && value.$gt !== undefined) {
          conditions.push(gt(column, value.$gt))
        }
        if ('$gte' in value && value.$gte !== undefined) {
          conditions.push(gte(column, value.$gte))
        }
        if ('$lt' in value && value.$lt !== undefined) {
          conditions.push(lt(column, value.$lt))
        }
        if ('$lte' in value && value.$lte !== undefined) {
          conditions.push(lte(column, value.$lte))
        }
        if ('$ne' in value && value.$ne !== undefined) {
          conditions.push(ne(column, value.$ne))
        }
        if ('$in' in value && Array.isArray(value.$in)) {
          conditions.push(inArray(column, value.$in))
        }
        if ('$like' in value && typeof value.$like === 'string') {
          conditions.push(like(column, value.$like))
        }
      } else {
        // Direct equality
        conditions.push(eq(column, value))
      }
    }

    return conditions
  }
}
