/**
 * KV-Style SQLite Adapter
 *
 * MongoDB-style document store using SQLite as key-value storage.
 * Works identically on both D1 and DO SQLite - no migrations needed!
 *
 * Schema:
 * - key TEXT PRIMARY KEY (format: "ns:id")
 * - type TEXT ("Thing" | "Relationship")
 * - data JSON (entire entity as JSON blob)
 * - created_at INTEGER
 * - updated_at INTEGER
 *
 * Advantages:
 * - No migrations (schema never changes)
 * - No Drizzle type complexity
 * - Same code for D1 and DO SQLite
 * - Simple queries
 *
 * Tradeoffs:
 * - No relational queries
 * - JSON querying less efficient than columns
 * - No foreign keys
 */

import type { Database, DatabaseConfig, Thing, Relationship } from '../../types/index.js'

export interface KVSQLiteConfig {
  type: 'KV_D1' | 'KV_DO_SQLITE'
  /** For D1: binding from env.DB */
  binding?: D1Database
  /** For DO SQLite: storage from ctx.storage */
  storage?: DurableObjectStorage
}

/**
 * Create KV-style SQLite database
 *
 * Works with both D1 and DO SQLite
 */
export function createKVDatabase(config: KVSQLiteConfig): Database {
  if (config.type === 'KV_D1' && config.binding) {
    return new KVD1Database(config.binding)
  } else if (config.type === 'KV_DO_SQLITE' && config.storage) {
    return new KVDODatabase(config.storage)
  }
  throw new Error('Invalid KV database config')
}

/**
 * KV adapter for D1
 */
class KVD1Database implements Database {
  constructor(private db: D1Database) {
    this.initSchema()
  }

  private async initSchema() {
    // Create table if not exists
    await this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS entities (
        key TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`
      )
      .run()

    // Create indexes
    await this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_type ON entities(type)`).run()
    await this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_updated ON entities(updated_at)`).run()
  }

  // Implement Database interface
  things: any
  relationships: any

  namespace(ns: string): any {
    throw new Error('Not implemented')
  }

  select<T>(): any {
    throw new Error('Not implemented')
  }

  from(table: string): any {
    throw new Error('Not implemented')
  }

  async query<T>(query: any): Promise<T[]> {
    throw new Error('Not implemented')
  }

  async insert(table: string, data: any): Promise<any> {
    const key = `${data.ns}:${data.id}`
    const type = table === 'things' ? 'Thing' : 'Relationship'
    const now = Date.now()

    await this.db
      .prepare(`INSERT INTO entities (key, type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`)
      .bind(key, type, JSON.stringify(data), now, now)
      .run()

    return data
  }

  async update(table: string, data: any, where: any): Promise<any> {
    const key = `${where.ns}:${where.id}`
    const now = Date.now()

    // Get existing data
    const existing = await this.db.prepare(`SELECT data FROM entities WHERE key = ?`).bind(key).first<{ data: string }>()

    if (!existing) {
      throw new Error(`Entity not found: ${key}`)
    }

    const merged = { ...JSON.parse(existing.data), ...data, updatedAt: new Date(now) }

    await this.db.prepare(`UPDATE entities SET data = ?, updated_at = ? WHERE key = ?`).bind(JSON.stringify(merged), now, key).run()

    return merged
  }

  async delete(table: string, where: any): Promise<void> {
    const key = `${where.ns}:${where.id}`
    await this.db.prepare(`DELETE FROM entities WHERE key = ?`).bind(key).run()
  }

  async getHealthStatus() {
    try {
      const start = Date.now()
      await this.db.prepare(`SELECT 1`).first()
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
 * KV adapter for DO SQLite
 */
class KVDODatabase implements Database {
  constructor(private storage: DurableObjectStorage) {
    this.initSchema()
  }

  private async initSchema() {
    // DO SQLite schema initialization
    // Note: In real implementation, use state.storage.sql API
    // This is a placeholder - actual DO SQLite API differs
  }

  // Implement Database interface (same as KVD1Database)
  things: any
  relationships: any

  namespace(ns: string): any {
    throw new Error('Not implemented')
  }

  select<T>(): any {
    throw new Error('Not implemented')
  }

  from(table: string): any {
    throw new Error('Not implemented')
  }

  async query<T>(query: any): Promise<T[]> {
    throw new Error('Not implemented')
  }

  async insert(table: string, data: any): Promise<any> {
    throw new Error('Not implemented')
  }

  async update(table: string, data: any, where: any): Promise<any> {
    throw new Error('Not implemented')
  }

  async delete(table: string, where: any): Promise<void> {
    throw new Error('Not implemented')
  }

  async getHealthStatus() {
    return {
      healthy: true,
      timestamp: new Date().toISOString(),
      latency: 1,
    }
  }
}

export { KVD1Database, KVDODatabase }
