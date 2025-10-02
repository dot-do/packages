# @dot-do/types

Shared TypeScript types for dot-do packages.

## Installation

```bash
npm install @dot-do/types
# or
pnpm add @dot-do/types
# or
yarn add @dot-do/types
```

## Usage

```typescript
import type { Thing, Relationship, User, PaginatedResponse } from '@dot-do/types'

// Use Thing type
const thing: Thing = {
  id: 'thing_123',
  type: 'document',
  name: 'Example',
  attributes: { title: 'Hello World' },
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
}

// Use PaginatedResponse type
function getThings(page: number): PaginatedResponse<Thing> {
  return {
    data: [thing],
    pagination: {
      total: 100,
      page: 1,
      limit: 10,
      pages: 10,
    },
  }
}
```

## Exported Types

### HTTP Types

- `HttpResponse<T>` - Standard HTTP response wrapper
- `HttpMethod` - HTTP method literals
- `ApiError` - Error response shape

### Domain Types

- `Thing` - Graph database entity
- `Relationship` - Graph database relationship
- `User` - User entity
- `Session` - Session entity

### Pagination Types

- `PaginationParams` - Pagination query parameters
- `PaginatedResponse<T>` - Paginated API response

### Utility Types

- `Prettify<T>` - Simplify complex intersections
- `RequireAtLeastOne<T, Keys>` - Require at least one of the specified keys
- `RequireOnlyOne<T, Keys>` - Require exactly one of the specified keys
- `DeepPartial<T>` - Make all nested properties optional
- `Awaitable<T>` - Union of T and Promise<T>
- `NonNullableFields<T>` - Make all fields non-nullable
- `PickByType<T, ValueType>` - Pick fields of specific type
- `OmitByType<T, ValueType>` - Omit fields of specific type

## Utility Type Examples

### Prettify

Simplifies complex type intersections:

```typescript
type Complex = { a: string } & { b: number }
type Simple = Prettify<Complex>
// Result: { a: string; b: number }
```

### RequireAtLeastOne

Requires at least one of the specified keys:

```typescript
type Options = { a?: string; b?: number; c?: boolean }
type RequireOne = RequireAtLeastOne<Options, 'a' | 'b'>

const valid: RequireOne = { a: 'test' } // ✅
const invalid: RequireOne = { c: true } // ❌ Must have 'a' or 'b'
```

### DeepPartial

Makes all nested properties optional:

```typescript
type Nested = { a: { b: { c: string } } }
type PartialNested = DeepPartial<Nested>

const partial: PartialNested = { a: { b: {} } } // ✅
```

### PickByType / OmitByType

Select or exclude fields by type:

```typescript
type Mixed = { a: string; b: number; c: string; d: boolean }

type OnlyStrings = PickByType<Mixed, string>
// Result: { a: string; c: string }

type NoStrings = OmitByType<Mixed, string>
// Result: { b: number; d: boolean }
```

## License

MIT
