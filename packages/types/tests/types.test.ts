import { describe, it, expect, expectTypeOf } from 'vitest'
import type { Thing, Relationship, User, PaginatedResponse, Prettify, RequireAtLeastOne, DeepPartial } from '../src/index'

describe('@dot-do/types', () => {
  describe('Thing type', () => {
    it('should have correct shape', () => {
      const thing: Thing = {
        id: 'thing_123',
        type: 'document',
        name: 'Test',
        attributes: { key: 'value' },
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      }

      expect(thing.id).toBe('thing_123')
      expect(thing.type).toBe('document')
      expectTypeOf(thing.attributes).toEqualTypeOf<Record<string, unknown>>()
    })

    it('should allow optional embedding', () => {
      const thingWithEmbedding: Thing = {
        id: 'thing_123',
        type: 'document',
        attributes: {},
        embedding: [0.1, 0.2, 0.3],
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      }

      expect(thingWithEmbedding.embedding).toBeDefined()
      expectTypeOf(thingWithEmbedding.embedding).toEqualTypeOf<number[] | undefined>()
    })
  })

  describe('Relationship type', () => {
    it('should have correct shape', () => {
      const rel: Relationship = {
        id: 'rel_123',
        type: 'contains',
        fromId: 'thing_1',
        toId: 'thing_2',
        attributes: {},
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      }

      expect(rel.fromId).toBe('thing_1')
      expect(rel.toId).toBe('thing_2')
    })
  })

  describe('User type', () => {
    it('should have correct shape', () => {
      const user: User = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      }

      expect(user.email).toBe('test@example.com')
      expectTypeOf(user.name).toEqualTypeOf<string | undefined>()
    })
  })

  describe('PaginatedResponse type', () => {
    it('should work with generic data', () => {
      const response: PaginatedResponse<Thing> = {
        data: [
          {
            id: 'thing_1',
            type: 'doc',
            attributes: {},
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z',
          },
        ],
        pagination: {
          total: 100,
          page: 1,
          limit: 10,
          pages: 10,
        },
      }

      expect(response.data.length).toBe(1)
      expect(response.pagination.total).toBe(100)
    })
  })

  describe('Utility types', () => {
    it('Prettify should simplify complex types', () => {
      type Complex = { a: string } & { b: number }
      type Simple = Prettify<Complex>

      const obj: Simple = { a: 'test', b: 123 }
      expect(obj.a).toBe('test')
      expectTypeOf<Simple>().toEqualTypeOf<{ a: string; b: number }>()
    })

    it('RequireAtLeastOne should require at least one field', () => {
      type Options = { a?: string; b?: number; c?: boolean }
      type RequireOne = RequireAtLeastOne<Options, 'a' | 'b'>

      const valid1: RequireOne = { a: 'test' }
      const valid2: RequireOne = { b: 123 }
      const valid3: RequireOne = { a: 'test', b: 123 }

      expect(valid1.a).toBe('test')
      expect(valid2.b).toBe(123)
      expect(valid3.a).toBe('test')
    })

    it('DeepPartial should make all nested properties optional', () => {
      type Nested = { a: { b: { c: string } } }
      type PartialNested = DeepPartial<Nested>

      const partial: PartialNested = { a: { b: {} } }
      expect(partial.a?.b).toBeDefined()
      expectTypeOf<PartialNested>().toMatchTypeOf<{ a?: { b?: { c?: string } } }>()
    })
  })
})
