---
name: "@db4/schema"
version: 0.1.2
description: IceType schema compiler for db4 - concise, human-readable schema language with TypeScript inference
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - icetype
  - schema
  - parser
  - cloudflare
  - workers
  - typescript
downloads:
  monthly: 31
published: "2026-01-20T11:32:18.098Z"
updated: "2026-01-23T17:20:44.089Z"
---

# @db4/schema

([GitHub](https://github.com/dot-do/db4/tree/main/packages/schema), [npm](https://www.npmjs.com/package/@db4/schema))

**Your schema is lying to you.**

Types in TypeScript. Migrations in SQL. Validation scattered everywhere. When they disagree, you get runtime errors.

`@db4/schema` ends the chaos. Define once with IceType. Get types, migrations, and validation that never drift.

## The Problem

Every database project follows the same path to pain:

1. Write TypeScript interfaces
2. Write SQL migrations
3. Add validation at API boundaries
4. Watch them slowly diverge
5. Debug 3am production errors because `email` was supposed to be required
6. Repeat forever

Teams make it worse. Someone updates the types, forgets the migration. Someone else edits the database directly. Your "single source of truth" becomes three sources of fiction.

## The Solution: IceType

One schema. Every output. Zero drift.

```typescript
import { parseSchema, defineSchema, InferType } from '@db4/schema'

// Full IceType syntax
const User = parseSchema({
  $type: 'User',
  id: 'uuid!',
  email: 'string! #unique',
  name: 'string!',
  avatar: 'string?',
  createdAt: 'timestamp! = now()',
  posts: '[Post] -> author',
})

// Simple syntax with type inference
const userSchema = defineSchema('User', {
  id: 'uuid',
  email: 'string',
  name: 'string',
  avatar: 'string?',
  age: 'int?',
})

type User = InferType<typeof userSchema>
// { id: string; email: string; name: string; avatar?: string; age?: number }
```

## Quick Start

### 1. Install

```bash
npm install @db4/schema
```

### 2. Define

```typescript
import { parseSchema, defineSchema, SchemaRegistry } from '@db4/schema'

const PostSchema = parseSchema({
  $type: 'Post',
  id: 'uuid!',
  title: 'string!',
  content: 'text!',
  published: 'boolean = false',
  authorId: 'uuid! #index',
  tags: '[string]?',
  viewCount: 'int = 0',
  embedding: 'vector[1536] ~> content',  // AI auto-embed
  createdAt: 'timestamp! = now()',
  $fts: ['title', 'content'],            // Full-text search
})

const TagSchema = defineSchema('Tag', {
  id: 'uuid',
  name: 'string',
  color: 'string?',
})
```

### 3. Validate

```typescript
const registry = new SchemaRegistry()
registry.register(userSchema)

// Throws on invalid data
registry.validate('User', { id: '123', email: 'alice@example.com', name: 'Alice' })

// Or get detailed results
const result = registry.validateWithResult('User', someData)
if (!result.valid) {
  console.log(result.errors)
}
```

## IceType Syntax

Reads like documentation. Compiles to everything.

### Types

| Type | Description | TypeScript |
|------|-------------|------------|
| `string` | Text | `string` |
| `text` | Long text | `string` |
| `int` | Integer | `number` |
| `float` | Decimal | `number` |
| `boolean` | True/false | `boolean` |
| `uuid` | UUID string | `string` |
| `timestamp` | Date/time | `Date` |
| `date` | Date only | `Date` |
| `time` | Time only | `Date` |
| `json` | Any JSON | `unknown` |
| `binary` | Binary data | `ArrayBuffer` |

### Modifiers

```typescript
{
  required: 'string!',       // Required (!)
  optional: 'string?',       // Optional (?)
  indexed: 'string #index',  // Database index
  unique: 'string! #unique', // Unique constraint
  array: '[string]',         // Array
  withDefault: 'int = 0',    // Default value
}
```

### Parametric Types

```typescript
{
  price: 'decimal(10,2)',    // Precision
  code: 'varchar(10)',       // Fixed length
  embedding: 'vector[1536]', // Dimensions
}
```

### Relations

```typescript
{
  comments: '[Comment] -> post',  // Has many
  post: 'Post! <- comments',      // Belongs to
  similar: '~> content',          // AI semantic match
}
```

### Computed Fields

```typescript
{
  firstName: 'string!',
  lastName: 'string!',
  fullName: 'string := firstName ++ " " ++ lastName',
  displayName: 'string := nickname ?? firstName',
}
```

### Directives

```typescript
{
  $type: 'User',                    // Schema name
  $partitionBy: ['tenantId'],       // Partition key
  $fts: ['title', 'content'],       // Full-text search
  $vector: { embedding: 1536 },     // Vector index
  $index: [['email', 'tenantId']],  // Composite indexes
}
```

## Schema Registry

Manages schemas with validation caching and lazy loading:

```typescript
import { SchemaRegistry, defineSchema } from '@db4/schema'

const registry = new SchemaRegistry()

registry.register(userSchema)
registry.register(postSchema)

// Lazy loading for circular dependencies
registry.registerLazy('Comment', () => defineSchema('Comment', {
  id: 'uuid',
  content: 'string',
  authorId: 'uuid',
  postId: 'uuid',
}))

// Full validation details
const result = registry.validateWithResult('User', data)
// { valid: false, errors: [...], fieldsValidated: 5, durationMs: 2 }

// Cached validation (same object = instant)
registry.isValid('User', cachedUser)
```

## Migrations

Generate migrations from schema changes:

```typescript
import { diffSchemas, generateMigration, MigrationRunner } from '@db4/schema'

const diff = diffSchemas(oldSchema, newSchema)

if (diff.hasDestructiveChanges) {
  console.warn('Warning:', diff.warnings)
}

const migration = generateMigration(diff, {
  dialect: 'sqlite',  // or 'postgresql', 'mysql', 'd1'
  safeMode: true,
})

console.log(migration.up)   // ALTER TABLE statements
console.log(migration.down) // Rollback statements

const runner = new MigrationRunner(executor, { dialect: 'sqlite' })
await runner.initialize()
await runner.runPending(migrations)
```

## Type Inference

Full TypeScript types from schema definitions:

```typescript
import { defineSchema, InferType } from '@db4/schema'

const userSchema = defineSchema('User', {
  id: 'uuid',
  email: 'string',
  name: 'string',
  age: 'int?',
  tags: 'string[]',
  metadata: 'json?',
})

type User = InferType<typeof userSchema>
// {
//   id: string
//   email: string
//   name: string
//   age?: number
//   tags: string[]
//   metadata?: unknown
// }
```

## Schema Discovery

Infer schemas from existing data:

```typescript
import { inferType, inferSchema, discoverSchema } from '@db4/schema'

inferType('550e8400-e29b-41d4-a716-446655440000') // 'uuid'
inferType(42)                                      // 'int'
inferType('2024-01-15T10:30:00Z')                 // 'timestamp'

const docs = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob' }, // email missing
]
const schema = inferSchema(docs)
// { id: 'int', name: 'string', email: 'string?' }
```

## Victory

With a unified schema:

- TypeScript catches errors at compile time, not 3am
- Migrations generate automatically
- Validation stays in sync forever
- Teams ship faster with fewer bugs
- Sleep through the night

## Failure

Without one:

- Runtime errors from type mismatches
- Manual migrations that drift from reality
- Validation duplicated and inconsistent
- "Worked yesterday" becomes your morning greeting
- Tech debt compounds with every feature

## API Reference

### Parsing

- `parseField(fieldDef)` - Parse a field definition
- `parseSchema(definition)` - Parse a full schema
- `parseRelation(relDef)` - Parse a relation
- `tokenize(input)` - Tokenize IceType syntax

### Schema Definition

- `defineSchema(name, fields)` - Create a type-safe schema
- `InferType<S>` - Infer TypeScript type from schema

### Validation

- `SchemaRegistry` - Schema management with caching
- `LazySchema` - Deferred schema loading

### Migrations

- `diffSchemas(from, to)` - Compare IceType schemas
- `diffSimpleSchemas(from, to)` - Compare simple schemas
- `generateMigration(diff, options)` - Generate migration SQL
- `MigrationRunner` - Execute and track migrations
- `MigrationTracker` - Track applied migrations

### Computed Fields

- `parseComputedExpression(expr)` - Parse computed syntax
- `extractDependencies(ast)` - Get field dependencies
- `checkDeterministic(ast)` - Check if expression is pure
- `detectCircularDependencies(fields)` - Find cycles
- `getComputationOrder(fields)` - Topological sort
- `validateComputedDependencies(computed, fields)` - Validate dependencies

### Utilities

- `clearParserCaches()` - Clear memoization caches
- `generateMigrationId()` - Generate timestamp-based ID
- `computeChecksum(migration)` - Compute migration checksum
- `generateMigrationTableSQL(dialect)` - Generate tracking table DDL

## License

MIT
