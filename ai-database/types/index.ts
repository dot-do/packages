/**
 * Core type definitions for @dot-do/ai-database
 *
 * Unified types supporting both D1 and Durable Objects SQLite backends
 */

// ============================================================================
// Database Configuration
// ============================================================================

export type DatabaseType = 'D1' | 'DO_SQLITE'

export interface D1Config {
  type: 'D1'
  /** D1 database binding from env */
  binding: D1Database
  /** Enable read replicas via D1 Sessions API */
  enableReplicas?: boolean
}

export interface DOSQLiteConfig {
  type: 'DO_SQLITE'
  /** Durable Object storage from ctx.storage */
  storage: DurableObjectStorage
  /** Enable WebSocket real-time updates */
  enableRealtime?: boolean
  /** Enable Analytics Engine integration */
  enableAnalytics?: boolean
  /** Context for routing (user, namespace, domain) */
  context?: {
    userId?: string
    namespace?: string
    domain?: string
  }
}

export type DatabaseConfig = D1Config | DOSQLiteConfig

// ============================================================================
// Query Types
// ============================================================================

export interface Where {
  [key: string]: any | {
    $gt?: any
    $gte?: any
    $lt?: any
    $lte?: any
    $ne?: any
    $in?: any[]
    $like?: string
  }
}

export interface DbQuery {
  select?: {
    from: string
    where?: Where
    limit?: number
    offset?: number
    orderBy?: string
    direction?: 'asc' | 'desc'
  }
  insert?: {
    into: string
    values: any | any[]
  }
  update?: {
    table: string
    set: any
    where?: Where
  }
  delete?: {
    from: string
    where?: Where
  }
  sql?: {
    query: string
    params?: any[]
  }
}

export interface ListOptions {
  ns?: string
  limit?: number
  offset?: number
  orderBy?: string
  direction?: 'asc' | 'desc'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// Entity Types (Thing/Relationship Model)
// ============================================================================

export type Visibility = 'public' | 'private' | 'unlisted'

export interface Thing {
  ns: string
  id: string
  type: string
  content?: string | null
  code?: string | null
  data: Record<string, any>
  visibility: Visibility
  embedding?: number[] | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateThingInput {
  ns: string
  id?: string
  type: string
  content?: string
  code?: string
  data?: Record<string, any>
  visibility?: Visibility
  embedding?: number[]
}

export interface ThingFilter {
  ns?: string
  type?: string
  visibility?: Visibility
}

export interface Relationship {
  ns: string
  id: string
  type: string
  fromNs: string
  fromId: string
  toNs: string
  toId: string
  data: Record<string, any>
  code?: string | null
  visibility: Visibility
  createdAt: Date
  updatedAt: Date
}

export interface CreateRelationshipInput {
  ns: string
  id?: string
  type: string
  fromNs: string
  fromId: string
  toNs: string
  toId: string
  data?: Record<string, any>
  code?: string
  visibility?: Visibility
}

export interface RelationshipFilter {
  ns?: string
  type?: string
  fromNs?: string
  fromId?: string
  toNs?: string
  toId?: string
  visibility?: Visibility
}

// ============================================================================
// Query Builder
// ============================================================================

export interface QueryBuilder<T = any> {
  from?(table: string): this
  where(filter: Where): this
  limit(n: number): this
  offset(n: number): this
  orderBy(column: string, direction?: 'asc' | 'desc'): this
  execute(): Promise<T[]>
  first?(): Promise<T | null>
  count?(): Promise<number>
}

// ============================================================================
// Collections
// ============================================================================

export interface ThingCollection {
  find(id: string, ns?: string): Promise<Thing | null>
  where(filter: ThingFilter): QueryBuilder<Thing>
  create(thing: CreateThingInput): Promise<Thing>
  update(id: string, updates: Partial<Thing>, ns?: string): Promise<Thing>
  delete(id: string, ns?: string): Promise<void>
  list?(options?: ListOptions): Promise<Thing[]>
}

export interface RelationshipCollection {
  find(id: string, ns?: string): Promise<Relationship | null>
  where(filter: RelationshipFilter): QueryBuilder<Relationship>
  create(relationship: CreateRelationshipInput): Promise<Relationship>
  update(id: string, updates: Partial<Relationship>, ns?: string): Promise<Relationship>
  delete(id: string, ns?: string): Promise<void>
  list?(options?: ListOptions): Promise<Relationship[]>
}

export interface NamespaceCollection {
  things: ThingCollection
  relationships: RelationshipCollection
  types(): Promise<string[]>
}

// ============================================================================
// Health & Stats
// ============================================================================

export interface HealthStatusResult {
  healthy: boolean
  timestamp: string
  latency?: number
}

export interface DatabaseStats {
  tables: number
  totalRows: number
  storageBytes: number
  lastQuery: number
  queryCount: number
  createdAt: number
}

// ============================================================================
// Main Database Interface
// ============================================================================

export interface Database {
  // Collections
  things: ThingCollection
  relationships: RelationshipCollection

  // Namespace access
  namespace(ns: string): NamespaceCollection

  // Query builders
  select<T = any>(): QueryBuilder<T>
  from(table: string): QueryBuilder

  // Direct operations
  query<T = any>(query: DbQuery): Promise<T[]>
  insert(table: string, data: any): Promise<any>
  update(table: string, data: any, where: Where): Promise<any>
  delete(table: string, where: Where): Promise<void>

  // Utility
  getHealthStatus(): Promise<HealthStatusResult>

  // Backend-specific (optional)
  getStats?(): Promise<DatabaseStats>
  subscribe?(table: string, callback: (data: any) => void): Promise<void>
  unsubscribe?(table: string): Promise<void>
  restore?(timestamp: Date): Promise<void>
  withSession?(type: 'fast' | 'fresh'): Database
}

// ============================================================================
// Adapter Interface
// ============================================================================

export interface DatabaseAdapter {
  connect(): Promise<void>
  disconnect?(): Promise<void>
  getDatabase(): Database
}

// ============================================================================
// Re-exports
// ============================================================================

export type {
  D1Database,
  DurableObjectStorage,
} from '@cloudflare/workers-types'
