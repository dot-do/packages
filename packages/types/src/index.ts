/**
 * Shared TypeScript types for dot-do packages
 */

// HTTP Types
export interface HttpResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status: number
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface ApiError {
  code: string
  message: string
  details?: unknown
  stack?: string
}

// Thing Types (from graph database)
export interface Thing {
  id: string
  type: string
  name?: string
  attributes: Record<string, unknown>
  embedding?: number[]
  createdAt: string
  updatedAt: string
}

export interface Relationship {
  id: string
  type: string
  fromId: string
  toId: string
  attributes: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// User Types
export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Utility Types
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export type Awaitable<T> = T | Promise<T>

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export type PickByType<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: T[Key] extends ValueType ? Key : never
  }[keyof T]
>

export type OmitByType<T, ValueType> = Pick<
  T,
  {
    [Key in keyof T]-?: T[Key] extends ValueType ? never : Key
  }[keyof T]
>
