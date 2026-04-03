---
name: "@db4/drizzle"
version: 0.1.2
description: Drizzle ORM adapter for db4 document database
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - drizzle
  - orm
  - sqlite
  - cloudflare
  - workers
  - durable-objects
downloads:
  monthly: 7
published: "2026-01-23T17:20:20.282Z"
updated: "2026-01-23T17:20:20.553Z"
---

# @db4/drizzle

[![npm version](https://img.shields.io/npm/v/@db4/drizzle.svg)](https://www.npmjs.com/package/@db4/drizzle)
[![license](https://img.shields.io/npm/l/@db4/drizzle.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/drizzle), [npm](https://www.npmjs.com/package/@db4/drizzle))

## Description

Drizzle ORM adapter for db4 document database. This package provides a Drizzle ORM-compatible interface that lets you use familiar Drizzle syntax for schema definition, queries, and migrations while leveraging db4's distributed Durable Object architecture under the hood.

Define your tables with type-safe column builders, query with the fluent Drizzle API, and run migrations seamlessly against your db4 database.

## Installation

```bash
npm install @db4/drizzle drizzle-orm
```

Or with pnpm:

```bash
pnpm add @db4/drizzle drizzle-orm
```

## Usage

```typescript
import { sqliteTable, integer, text, boolean, timestamp } from '@db4/drizzle';
import { relations } from '@db4/drizzle';

// Define tables
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  publishedAt: timestamp('published_at'),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### Database Connection

```typescript
import { drizzle } from '@db4/drizzle';
import { createClient } from '@db4/client';

// Create db4 client
const client = createClient({
  baseUrl: 'https://my-app.db4.io',
  apiKey: 'db4_live_key_12345',
});

// Create Drizzle database instance
const db = drizzle(client);
```

### Queries

```typescript
import { eq, gt, and, or, like, desc } from '@db4/drizzle';

// Select all users
const allUsers = await db.select().from(users);

// Select with conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.isActive, true));

// Complex queries
const recentPosts = await db
  .select({
    id: posts.id,
    title: posts.title,
    authorName: users.name,
  })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(
    and(
      gt(posts.publishedAt, new Date('2024-01-01')),
      like(posts.title, '%TypeScript%')
    )
  )
  .orderBy(desc(posts.publishedAt))
  .limit(10);

// Aggregations
const postCounts = await db
  .select({
    authorId: posts.authorId,
    count: count(posts.id),
  })
  .from(posts)
  .groupBy(posts.authorId);
```

### Inserts

```typescript
import { insert } from '@db4/drizzle';

// Single insert
const newUser = await db
  .insert(users)
  .values({
    name: 'Alice',
    email: 'alice@myapp.com/api',
  })
  .returning();

// Bulk insert
await db.insert(posts).values([
  { title: 'First Post', authorId: 1 },
  { title: 'Second Post', authorId: 1 },
  { title: 'Third Post', authorId: 2 },
]);

// Insert with conflict handling
await db
  .insert(users)
  .values({ id: 1, name: 'Alice', email: 'alice@myapp.com/api' })
  .onConflictDoUpdate({
    target: users.id,
    set: { name: 'Alice Updated' },
  });
```

### Updates and Deletes

```typescript
import { update, eq, lt } from '@db4/drizzle';

// Update records
await db
  .update(users)
  .set({ isActive: false })
  .where(lt(users.lastLoginAt, new Date('2023-01-01')));

// Delete records
await db.delete(posts).where(eq(posts.authorId, 123));
```

### Transactions

```typescript
const result = await db.transaction(async (tx) => {
  const user = await tx
    .insert(users)
    .values({ name: 'Bob', email: 'bob@myapp.com/api' })
    .returning();

  await tx
    .insert(posts)
    .values({ title: 'Welcome Post', authorId: user[0].id });

  return user[0];
});
```

### Migrations

```typescript
import { MigrationRunner, generateMigrationSQL, diffSchemas } from '@db4/drizzle';

// Generate migration from schema diff
const changes = diffSchemas(oldSchema, newSchema);
const sql = generateMigrationSQL(changes);

// Run migrations
const runner = new MigrationRunner(db);
await runner.up();

// Check migration status
const status = await runner.status();
console.log('Applied:', status.applied);
console.log('Pending:', status.pending);
```

## API

Drizzle ORM integration for db4:

```typescript
function sqliteTable(name: string, columns: SchemaColumns): SQLiteTable;
function drizzle(db: DB4Database, schema: Schema): DrizzleDatabase;
```

### Schema Functions

```typescript
function sqliteTable(name: string, columns: SchemaColumns): SQLiteTable;
function integer(name: string): IntegerColumn;
function text(name: string): TextColumn;
function boolean(name: string): BooleanColumn;
function timestamp(name: string): TimestampColumn;
function blob(name: string): BlobColumn;
function real(name: string): RealColumn;
function relations(table: SQLiteTable, fn: RelationsFn): Relations;
```

### Query Operators

| Operator | Description |
|----------|-------------|
| `eq(col, value)` | Equal |
| `ne(col, value)` | Not equal |
| `gt(col, value)` | Greater than |
| `gte(col, value)` | Greater than or equal |
| `lt(col, value)` | Less than |
| `lte(col, value)` | Less than or equal |
| `like(col, pattern)` | LIKE pattern match |
| `ilike(col, pattern)` | Case-insensitive LIKE |
| `inArray(col, values)` | IN array |
| `between(col, min, max)` | BETWEEN range |
| `isNull(col)` | IS NULL |
| `isNotNull(col)` | IS NOT NULL |
| `and(...conditions)` | AND conditions |
| `or(...conditions)` | OR conditions |
| `not(condition)` | NOT condition |

### Aggregate Functions

```typescript
function count(column?: AnyColumn): AggregateFunction;
function sum(column: AnyColumn): AggregateFunction;
function avg(column: AnyColumn): AggregateFunction;
function min(column: AnyColumn): AggregateFunction;
function max(column: AnyColumn): AggregateFunction;
```

## Related Packages

- [@db4/core](../core) - Core types and utilities
- [@db4/client](../client) - Client SDK

## See Also

- [@db4/compat](../compat) - Other database compatibility layers
- [@db4/schema](../schema) - Native IceType schema compiler

## License

MIT
