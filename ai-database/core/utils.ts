/**
 * Shared utilities for database operations
 */

import type { Where } from '../types/index.js'

/**
 * Build WHERE clause conditions for Drizzle queries
 */
export function buildWhereConditions(where: Where): any[] {
  const conditions: any[] = []

  for (const [key, value] of Object.entries(where)) {
    if (value === null) {
      // SQL: column IS NULL
      conditions.push({ type: 'isNull', column: key })
    } else if (value === undefined) {
      continue
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle operators like { $gt: 10, $lt: 20 }
      for (const [op, opValue] of Object.entries(value)) {
        conditions.push({
          type: 'operator',
          column: key,
          operator: op,
          value: opValue,
        })
      }
    } else {
      // SQL: column = value
      conditions.push({
        type: 'equals',
        column: key,
        value,
      })
    }
  }

  return conditions
}

/**
 * Extract table name from SQL query
 */
export function extractTableName(sql: string): string {
  const match = sql.match(/(?:FROM|INTO|UPDATE|TABLE)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i)
  return match ? match[1] : 'unknown'
}

/**
 * Generate unique ID for Durable Object routing
 */
export function generateDOId(context?: {
  userId?: string
  namespace?: string
  domain?: string
}): string {
  if (context?.userId) {
    return `database-do:user:${context.userId}`
  } else if (context?.namespace) {
    return `database-do:ns:${context.namespace}`
  } else if (context?.domain) {
    return `database-do:domain:${context.domain}`
  }

  return 'database-do:global'
}

/**
 * Slugify string for use as ID
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Parse JSON safely
 */
export function parseJSON<T = any>(text: string, fallback?: T): T {
  try {
    return JSON.parse(text)
  } catch {
    return (fallback ?? {}) as T
  }
}

/**
 * Stringify JSON safely
 */
export function stringifyJSON(data: any): string {
  try {
    return JSON.stringify(data)
  } catch {
    return '{}'
  }
}

/**
 * Measure query execution time
 */
export async function measureQuery<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start

  return { result, duration }
}
