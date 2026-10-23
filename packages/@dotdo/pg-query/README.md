---
name: "@dotdo/pg-query"
version: 0.1.1
description: Shared SQL query builder for postgres.do - common functionality for postgrest, supabase, and documentdb
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - sql
  - query-builder
  - postgres
  - postgresql
  - database
downloads:
  monthly: 0
published: "2026-01-22T16:00:39.172Z"
updated: "2026-01-24T15:49:22.575Z"
---

# @dotdo/pg-query

[![npm version](https://img.shields.io/npm/v/@dotdo/pg-query.svg)](https://www.npmjs.com/package/@dotdo/pg-query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A type-safe SQL query builder for PostgreSQL, designed as the shared foundation for postgres.do packages including `@dotdo/postgrest`, `@dotdo/supabase`, and `@dotdo/documentdb`.

## Features

- **Type-safe**: Full TypeScript support with proper typing for all operations
- **SQL injection prevention**: All values are parameterized, all identifiers are quoted
- **Fluent API**: Chainable methods for building complex queries
- **PostgreSQL-native**: Uses `$1, $2, $3` parameter placeholders (not `?`)
- **Zero dependencies**: Lightweight and portable
- **Complete CRUD**: Support for SELECT, INSERT, UPDATE, and DELETE operations

## Installation

```bash
npm install @dotdo/pg-query
# or
pnpm add @dotdo/pg-query
# or
yarn add @dotdo/pg-query
```

## Quick Start

```typescript
import { select, insert, update, deleteFrom } from '@dotdo/pg-query'

// Simple SELECT
const { sql, params } = select('*').from('users').where('id', '=', 1).build()
// sql: 'SELECT * FROM "users" WHERE "id" = $1'
// params: [1]
```

## Query Builder API

### SELECT Queries

#### Basic SELECT

```typescript
import { select } from '@dotdo/pg-query'

// Select all columns
select('*').from('users').build()
// SELECT * FROM "users"

// Select specific column
select('id').from('users').build()
// SELECT "id" FROM "users"

// Select multiple columns (array)
select(['id', 'name', 'email']).from('users').build()
// SELECT "id", "name", "email" FROM "users"

// Select multiple columns (varargs)
select('id', 'name', 'email').from('users').build()
// SELECT "id", "name", "email" FROM "users"
```

#### Column Aliasing

```typescript
// Using column object with alias
select(['id', { column: 'full_name', as: 'name' }]).from('users').build()
// SELECT "id", "full_name" AS "name" FROM "users"

// Using object map syntax
select({
  id: 'id',
  userName: 'user_name',
  emailAddress: 'email',
}).from('users').build()
// SELECT "id" AS "id", "user_name" AS "userName", "email" AS "emailAddress" FROM "users"
```

#### Schema Support

```typescript
// Using schema() method
select('*').from('users').schema('public').build()
// SELECT * FROM "public"."users"

// Using dot notation
select('*').from('public.users').build()
// SELECT * FROM "public"."users"
```

### WHERE Clauses

#### Basic Conditions

```typescript
// Equality
select('*').from('users').where('id', '=', 1).build()
// SELECT * FROM "users" WHERE "id" = $1
// params: [1]

// String comparison
select('*').from('users').where('name', '=', 'John').build()
// SELECT * FROM "users" WHERE "name" = $1
// params: ['John']
```

#### Comparison Operators

```typescript
// Greater than
select('*').from('users').where('age', '>', 18).build()
// SELECT * FROM "users" WHERE "age" > $1

// Greater than or equal
select('*').from('users').where('age', '>=', 21).build()
// SELECT * FROM "users" WHERE "age" >= $1

// Less than
select('*').from('users').where('age', '<', 65).build()
// SELECT * FROM "users" WHERE "age" < $1

// Less than or equal
select('*').from('users').where('age', '<=', 65).build()
// SELECT * FROM "users" WHERE "age" <= $1

// Not equal
select('*').from('users').where('status', '!=', 'deleted').build()
// SELECT * FROM "users" WHERE "status" != $1

// Not equal (SQL standard)
select('*').from('users').where('status', '<>', 'deleted').build()
// SELECT * FROM "users" WHERE "status" <> $1
```

#### Pattern Matching

```typescript
// LIKE (case-sensitive)
select('*').from('users').where('name', 'like', '%test%').build()
// SELECT * FROM "users" WHERE "name" LIKE $1
// params: ['%test%']

// ILIKE (case-insensitive, PostgreSQL-specific)
select('*').from('users').where('email', 'ilike', '%@example.com').build()
// SELECT * FROM "users" WHERE "email" ILIKE $1
```

#### NULL Checks

```typescript
// IS NULL
select('*').from('users').whereNull('deleted_at').build()
// SELECT * FROM "users" WHERE "deleted_at" IS NULL

// IS NOT NULL
select('*').from('users').whereNotNull('email').build()
// SELECT * FROM "users" WHERE "email" IS NOT NULL
```

#### IN and NOT IN

```typescript
// IN clause
select('*').from('users').whereIn('status', ['active', 'pending']).build()
// SELECT * FROM "users" WHERE "status" IN ($1, $2)
// params: ['active', 'pending']

// NOT IN clause
select('*').from('users').whereNotIn('status', ['deleted', 'banned']).build()
// SELECT * FROM "users" WHERE "status" NOT IN ($1, $2)
```

#### BETWEEN

```typescript
select('*').from('users').whereBetween('age', 18, 65).build()
// SELECT * FROM "users" WHERE "age" BETWEEN $1 AND $2
// params: [18, 65]
```

#### AND/OR Combinations

```typescript
// Multiple AND conditions
select('*')
  .from('users')
  .where('status', '=', 'active')
  .where('age', '>=', 18)
  .build()
// SELECT * FROM "users" WHERE "status" = $1 AND "age" >= $2

// OR conditions
select('*')
  .from('users')
  .where('role', '=', 'admin')
  .orWhere('role', '=', 'moderator')
  .build()
// SELECT * FROM "users" WHERE "role" = $1 OR "role" = $2

// Grouped conditions (parentheses)
select('*')
  .from('users')
  .where('active', '=', true)
  .whereGroup((q) =>
    q.where('role', '=', 'admin')
     .orWhere('role', '=', 'moderator')
  )
  .build()
// SELECT * FROM "users" WHERE "active" = $1 AND ("role" = $2 OR "role" = $3)
```

#### Complex Nested Conditions

```typescript
select('*')
  .from('users')
  .where('status', '=', 'active')
  .whereGroup((q) =>
    q.whereGroup((q2) =>
      q2.where('role', '=', 'admin').orWhere('role', '=', 'moderator')
    )
    .orWhere('is_superuser', '=', true)
  )
  .build()
// SELECT * FROM "users" WHERE "status" = $1 AND (("role" = $2 OR "role" = $3) OR "is_superuser" = $4)
```

### ORDER BY

```typescript
// Ascending order
select('*').from('users').orderBy('created_at', 'asc').build()
// SELECT * FROM "users" ORDER BY "created_at" ASC

// Descending order
select('*').from('users').orderBy('created_at', 'desc').build()
// SELECT * FROM "users" ORDER BY "created_at" DESC

// Multiple columns
select('*')
  .from('users')
  .orderBy('status', 'asc')
  .orderBy('created_at', 'desc')
  .build()
// SELECT * FROM "users" ORDER BY "status" ASC, "created_at" DESC

// NULLS FIRST/LAST
select('*').from('users').orderBy('deleted_at', 'desc', 'nulls last').build()
// SELECT * FROM "users" ORDER BY "deleted_at" DESC NULLS LAST
```

### LIMIT and OFFSET

```typescript
// Pagination
select('*').from('users').limit(10).offset(20).build()
// SELECT * FROM "users" LIMIT 10 OFFSET 20
```

### DISTINCT

```typescript
// SELECT DISTINCT
select('*').distinct().from('users').build()
// SELECT DISTINCT * FROM "users"

// DISTINCT ON (PostgreSQL-specific)
select('*')
  .distinctOn(['email'])
  .from('users')
  .orderBy('email')
  .orderBy('created_at', 'desc')
  .build()
// SELECT DISTINCT ON ("email") * FROM "users" ORDER BY "email", "created_at" DESC
```

### GROUP BY and HAVING (Aggregations)

```typescript
// Basic GROUP BY
select(['status', 'COUNT(*) as count'])
  .from('users')
  .groupBy('status')
  .build()
// SELECT "status", COUNT(*) as count FROM "users" GROUP BY "status"

// GROUP BY multiple columns
select(['status', 'country', 'COUNT(*) as count'])
  .from('users')
  .groupBy(['status', 'country'])
  .build()
// SELECT "status", "country", COUNT(*) as count FROM "users" GROUP BY "status", "country"

// GROUP BY with HAVING
select(['status', 'COUNT(*) as count'])
  .from('users')
  .groupBy('status')
  .having('COUNT(*)', '>', 5)
  .build()
// SELECT "status", COUNT(*) as count FROM "users" GROUP BY "status" HAVING COUNT(*) > $1
// params: [5]
```

### JOINs

#### INNER JOIN

```typescript
// Basic INNER JOIN
select(['users.id', 'posts.title'])
  .from('users')
  .join('posts', 'users.id', 'posts.user_id')
  .build()
// SELECT "users"."id", "posts"."title" FROM "users" INNER JOIN "posts" ON "users"."id" = "posts"."user_id"

// Object syntax
select('*')
  .from('users')
  .join('posts', { left: 'users.id', right: 'posts.user_id' })
  .build()
// SELECT * FROM "users" INNER JOIN "posts" ON "users"."id" = "posts"."user_id"
```

#### LEFT JOIN

```typescript
select('*')
  .from('users')
  .leftJoin('posts', 'users.id', 'posts.user_id')
  .build()
// SELECT * FROM "users" LEFT JOIN "posts" ON "users"."id" = "posts"."user_id"
```

#### RIGHT JOIN

```typescript
select('*')
  .from('users')
  .rightJoin('posts', 'users.id', 'posts.user_id')
  .build()
// SELECT * FROM "users" RIGHT JOIN "posts" ON "users"."id" = "posts"."user_id"
```

#### FULL OUTER JOIN

```typescript
select('*')
  .from('users')
  .fullJoin('posts', 'users.id', 'posts.user_id')
  .build()
// SELECT * FROM "users" FULL OUTER JOIN "posts" ON "users"."id" = "posts"."user_id"
```

#### Multiple JOINs

```typescript
select(['users.name', 'posts.title', 'comments.content'])
  .from('users')
  .join('posts', 'users.id', 'posts.user_id')
  .leftJoin('comments', 'posts.id', 'comments.post_id')
  .build()
// SELECT "users"."name", "posts"."title", "comments"."content" FROM "users"
//   INNER JOIN "posts" ON "users"."id" = "posts"."user_id"
//   LEFT JOIN "comments" ON "posts"."id" = "comments"."post_id"
```

#### JOIN with Table Aliases

```typescript
select(['u.name', 'p.title'])
  .from('users', 'u')
  .join('posts', 'p', 'u.id', 'p.user_id')
  .build()
// SELECT "u"."name", "p"."title" FROM "users" AS "u"
//   INNER JOIN "posts" AS "p" ON "u"."id" = "p"."user_id"
```

### INSERT Queries

#### Basic INSERT

```typescript
import { insert } from '@dotdo/pg-query'

// Single row
insert('users')
  .values({ name: 'John', email: 'john@example.com' })
  .build()
// INSERT INTO "users" ("name", "email") VALUES ($1, $2)
// params: ['John', 'john@example.com']

// Multiple rows
insert('users')
  .values([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ])
  .build()
// INSERT INTO "users" ("name", "email") VALUES ($1, $2), ($3, $4)
// params: ['John', 'john@example.com', 'Jane', 'jane@example.com']
```

#### INSERT with RETURNING

```typescript
// Return all columns
insert('users')
  .values({ name: 'John' })
  .returning('*')
  .build()
// INSERT INTO "users" ("name") VALUES ($1) RETURNING *

// Return specific columns
insert('users')
  .values({ name: 'John' })
  .returning(['id', 'created_at'])
  .build()
// INSERT INTO "users" ("name") VALUES ($1) RETURNING "id", "created_at"
```

#### INSERT ON CONFLICT (Upsert)

```typescript
// ON CONFLICT DO NOTHING
insert('users')
  .values({ id: 1, name: 'John' })
  .onConflict('id')
  .doNothing()
  .build()
// INSERT INTO "users" ("id", "name") VALUES ($1, $2) ON CONFLICT ("id") DO NOTHING

// ON CONFLICT DO UPDATE with explicit values
insert('users')
  .values({ id: 1, name: 'John', email: 'john@example.com' })
  .onConflict('id')
  .doUpdate({ name: 'Updated', email: 'updated@example.com' })
  .build()
// INSERT INTO "users" ("id", "name", "email") VALUES ($1, $2, $3)
//   ON CONFLICT ("id") DO UPDATE SET "name" = $4, "email" = $5

// ON CONFLICT DO UPDATE using EXCLUDED
insert('users')
  .values({ id: 1, name: 'John' })
  .onConflict('id')
  .doUpdateExcluded(['name'])
  .build()
// INSERT INTO "users" ("id", "name") VALUES ($1, $2)
//   ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name"
```

### UPDATE Queries

```typescript
import { update } from '@dotdo/pg-query'

// Basic UPDATE
update('users')
  .set({ name: 'New Name' })
  .where('id', '=', 1)
  .build()
// UPDATE "users" SET "name" = $1 WHERE "id" = $2
// params: ['New Name', 1]

// Multiple columns
update('users')
  .set({ name: 'New Name', email: 'new@example.com' })
  .where('id', '=', 1)
  .build()
// UPDATE "users" SET "name" = $1, "email" = $2 WHERE "id" = $3

// With RETURNING
update('users')
  .set({ name: 'Updated' })
  .where('id', '=', 1)
  .returning('*')
  .build()
// UPDATE "users" SET "name" = $1 WHERE "id" = $2 RETURNING *

// Complex WHERE
update('users')
  .set({ status: 'inactive' })
  .where('status', '=', 'active')
  .where('last_login', '<', '2023-01-01')
  .build()
// UPDATE "users" SET "status" = $1 WHERE "status" = $2 AND "last_login" < $3
```

### DELETE Queries

```typescript
import { deleteFrom } from '@dotdo/pg-query'

// Basic DELETE
deleteFrom('users')
  .where('id', '=', 1)
  .build()
// DELETE FROM "users" WHERE "id" = $1

// Multiple conditions
deleteFrom('users')
  .where('status', '=', 'deleted')
  .where('deleted_at', '<', '2023-01-01')
  .build()
// DELETE FROM "users" WHERE "status" = $1 AND "deleted_at" < $2

// With RETURNING
deleteFrom('users')
  .where('id', '=', 1)
  .returning(['id', 'name'])
  .build()
// DELETE FROM "users" WHERE "id" = $1 RETURNING "id", "name"
```

### Raw SQL Support

For cases where you need to use raw SQL expressions:

```typescript
import { select, raw } from '@dotdo/pg-query'

// Raw SQL in SELECT
select(['id', raw('NOW() as current_time')])
  .from('users')
  .build()
// SELECT "id", NOW() as current_time FROM "users"

// Raw SQL in WHERE
select('*')
  .from('users')
  .whereRaw('EXTRACT(YEAR FROM created_at) = $1', [2023])
  .build()
// SELECT * FROM "users" WHERE EXTRACT(YEAR FROM created_at) = $1
// params: [2023]
```

## SQL Injection Prevention

`@dotdo/pg-query` implements multiple layers of protection against SQL injection:

### 1. Parameterized Values

All user-provided values are passed as parameters, never interpolated into the SQL string:

```typescript
// Untrusted input is safely parameterized
select('*')
  .from('users')
  .where('name', '=', userInput)
  .build()
// sql: 'SELECT * FROM "users" WHERE "name" = $1'
// params: [userInput]
// User input is always treated as a literal string value, never as SQL
```

### 2. Identifier Quoting

All table names, column names, and aliases are properly quoted with double quotes:

```typescript
// Column names are safely quoted
select('*')
  .from('users')
  .where('user-name', '=', 1)
  .build()
// sql: 'SELECT * FROM "users" WHERE "user-name" = $1'
// Special characters in identifiers are safely handled
```

### 3. Sequential Parameter Numbering

Parameters use PostgreSQL's `$1, $2, $3` syntax with proper sequential numbering:

```typescript
select('*')
  .from('users')
  .whereIn('status', ['active', 'pending'])
  .where('age', '>=', 18)
  .whereBetween('created_at', '2023-01-01', '2023-12-31')
  .build()
// sql: 'SELECT * FROM "users" WHERE "status" IN ($1, $2) AND "age" >= $3 AND "created_at" BETWEEN $4 AND $5'
// params: ['active', 'pending', 18, '2023-01-01', '2023-12-31']
```

## Complex Query Patterns

This section demonstrates advanced query patterns commonly used in production applications.

### Subqueries

#### IN Subquery

```typescript
select(['id', 'name'])
  .from('users')
  .whereRaw('"id" IN (SELECT user_id FROM orders WHERE total > $1)', [1000])
  .build()
// SELECT "id", "name" FROM "users" WHERE "id" IN (SELECT user_id FROM orders WHERE total > $1)
// params: [1000]
```

#### EXISTS Subquery

```typescript
select('*')
  .from('users')
  .whereRaw('EXISTS (SELECT 1 FROM posts WHERE posts.author_id = "users"."id" AND posts.published = $1)', [true])
  .build()
// params: [true]
```

#### Correlated Subquery

```typescript
// Get each user's most recent order date
select(['id', 'name', raw('(SELECT MAX(created_at) FROM orders WHERE orders.user_id = "users"."id") as last_order_date')])
  .from('users')
  .where('status', '=', 'active')
  .build()
```

### Full-Text Search

#### Basic Full-Text Search

```typescript
select('*')
  .from('posts')
  .whereRaw("to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)", ['search term'])
  .build()
// params: ['search term']
```

#### Full-Text Search with Ranking

```typescript
select([
  'id',
  'title',
### Cursor-Based Pagination (Performance Optimized)

For large datasets, cursor-based pagination is more efficient than offset-based:

```typescript
// Initial request (no cursor)
select('*')
  .from('posts')
  .where('status', '=', 'published')
  .orderBy('created_at', 'desc')
  .orderBy('id', 'desc')  // Tie-breaker for consistent ordering
  .limit(20)
  .build()

// Subsequent requests with cursor (last seen id and timestamp)
const lastSeenId = 12345
const lastSeenTimestamp = '2024-01-15T10:30:00Z'

select('*')
  .from('posts')
  .where('status', '=', 'published')
  .whereRaw('("created_at", "id") < ($1, $2)', [lastSeenTimestamp, lastSeenId])
  .orderBy('created_at', 'desc')
  .orderBy('id', 'desc')
  .limit(20)
  .build()
```

### Multi-Table Queries with Aggregations

```typescript
select([
  'u.id',
  'u.name',
  raw('COUNT(DISTINCT o.id) as order_count'),
  raw('COALESCE(SUM(o.total), 0) as total_spent'),
  raw('MAX(o.created_at) as last_order_date')
])
  .from('users', 'u')
  .leftJoin('orders', 'o', 'u.id', 'o.user_id')
  .leftJoin('order_items', 'oi', 'o.id', 'oi.order_id')
  .where('u.status', '=', 'active')
  .groupBy(['u.id', 'u.name'])
  .having('COUNT(DISTINCT o.id)', '>', 0)
  .orderBy('total_spent', 'desc')
  .limit(100)
  .build()
```

### Conditional Logic with CASE WHEN

```typescript
select([
  'id',
  'name',
  'total',
  raw(\`CASE
    WHEN total >= 1000 THEN 'premium'
    WHEN total >= 100 THEN 'standard'
    ELSE 'basic'
  END as tier\`)
])
  .from('customers')
  .build()

// Dynamic status calculation
select([
  'id',
  'title',
  raw(\`CASE
    WHEN due_date < NOW() AND status != 'completed' THEN 'overdue'
    WHEN due_date < NOW() + INTERVAL '1 day' THEN 'due_soon'
    ELSE status
  END as computed_status\`)
])
  .from('tasks')
  .where('user_id', '=', userId)
  .build()
```

### JSON/JSONB Operations

PostgreSQL has powerful JSON support:

```typescript
// Query JSON field
select(['id', 'name'])
  .from('users')
  .whereRaw("metadata->>'role' = $1", ['admin'])
  .build()

// JSON containment
select('*')
  .from('products')
  .whereRaw("tags @> $1::jsonb", [JSON.stringify(['featured', 'sale'])])
  .build()

// Extract nested JSON values
select([
  'id',
  raw("settings->'notifications'->>'email' as email_notifications"),
  raw("settings->'preferences'->'theme' as theme")
])
  .from('users')
  .build()

// JSON aggregation
select([
  'category',
  raw("json_agg(json_build_object('id', id, 'name', name)) as products")
])
  .from('products')
  .groupBy('category')
  .build()
```

### Upsert with Conditional Updates

```typescript
// Basic upsert - update all on conflict
insert('products')
  .values({ sku: 'ABC123', name: 'Widget', price: 29.99, stock: 100 })
  .onConflict('sku')
  .doUpdateExcluded(['name', 'price', 'stock'])
  .returning('*')
  .build()

// Upsert with conditional update (only update if new value is different)
insert('products')
  .values({ sku: 'ABC123', name: 'Widget', price: 29.99 })
  .onConflict('sku')
  .doUpdate({ name: 'Widget', price: 29.99, updated_at: new Date().toISOString() })
  .returning('*')
  .build()

// Upsert with multiple conflict columns
insert('user_preferences')
  .values({ user_id: 1, preference_key: 'theme', preference_value: 'dark' })
  .onConflict(['user_id', 'preference_key'])
  .doUpdateExcluded(['preference_value'])
  .build()
```

### Soft Delete Pattern

```typescript
// "Delete" by setting deleted_at
update('posts')
  .set({ deleted_at: new Date().toISOString() })
  .where('id', '=', postId)
  .returning('*')
  .build()

// Query only active records
select('*')
  .from('posts')
  .whereNull('deleted_at')
  .where('user_id', '=', userId)
  .orderBy('created_at', 'desc')
  .build()

// Include soft-deleted in admin queries
select('*')
  .from('posts')
  .where('user_id', '=', userId)
  .orderBy('deleted_at', 'desc', 'nulls first')  // Active first, then deleted
  .build()

// Hard delete old soft-deleted records
deleteFrom('posts')
  .whereNotNull('deleted_at')
  .whereRaw('"deleted_at" < NOW() - INTERVAL \'30 days\'')
  .build()
```

### Batch Operations

```typescript
// Batch insert
const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
]

insert('users')
  .values(users)
  .returning(['id', 'email'])
  .build()

// Batch update with different values per row (via raw SQL)
// Note: For complex batch updates, consider using raw SQL or transactions
select('*')
  .from('products')
  .whereIn('id', [1, 2, 3])
  .build()
// Then update individually in a transaction

// Batch delete
deleteFrom('sessions')
  .whereIn('user_id', inactiveUserIds)
  .whereRaw('"created_at" < NOW() - INTERVAL \'7 days\'')
  .build()
```

### Recursive CTEs (via Raw SQL)

For hierarchical data like org charts or category trees:

```typescript
// Find all descendants of a category
const { sql, params } = {
  sql: \`
    WITH RECURSIVE category_tree AS (
      -- Base case: start with the specified category
      SELECT id, name, parent_id, 0 as depth
      FROM categories
      WHERE id = $1

      UNION ALL

      -- Recursive case: find all children
      SELECT c.id, c.name, c.parent_id, ct.depth + 1
      FROM categories c
      INNER JOIN category_tree ct ON c.parent_id = ct.id
      WHERE ct.depth < 10  -- Prevent infinite recursion
    )
    SELECT * FROM category_tree ORDER BY depth, name
  \`,
  params: [rootCategoryId]
}

// For simpler recursive queries, combine with pgquery
select(['id', 'name', 'manager_id'])
  .from('employees')
  .whereRaw('"id" IN (SELECT id FROM employee_hierarchy WHERE root_id = $1)', [managerId])
  .orderBy('name')
  .build()
```

### Window Functions

```typescript
// Row numbers for pagination verification
select([
  raw('ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num'),
  'id',
  'title',
  'created_at'
])
  .from('posts')
  .where('status', '=', 'published')
  .limit(20)
  .build()

// Running totals
select([
  'date',
  'amount',
  raw('SUM(amount) OVER (ORDER BY date) as running_total')
])
  .from('transactions')
  .where('account_id', '=', accountId)
  .orderBy('date')
  .build()

// Rank within groups
select([
  'category',
  'product_name',
  'sales',
  raw('RANK() OVER (PARTITION BY category ORDER BY sales DESC) as rank')
])
  .from('products')
  .build()
```

### Date Range Queries

```typescript
// Last 30 days
select('*')
  .from('events')
  .whereRaw('"created_at" >= NOW() - INTERVAL \'30 days\'')
  .orderBy('created_at', 'desc')
  .build()

// Specific date range with timezone
select('*')
  .from('bookings')
  .whereBetween('start_date', '2024-01-01', '2024-12-31')
  .orderBy('start_date')
  .build()

// Group by date (daily aggregation)
select([
  raw("DATE_TRUNC('day', created_at) as date"),
  raw('COUNT(*) as count'),
  raw('SUM(amount) as total')
])
  .from('orders')
  .whereRaw('"created_at" >= NOW() - INTERVAL \'30 days\'')
  .groupBy(raw("DATE_TRUNC('day', created_at)"))
  .orderBy(raw("DATE_TRUNC('day', created_at)"))
  .build()
```

### Existence Checks

```typescript
// Check if user has any orders
select([raw('EXISTS (SELECT 1 FROM orders WHERE user_id = $1) as has_orders')])
  .from(raw('(SELECT 1) as dummy'))
  .build()
// Note: Use whereRaw with EXISTS subquery, params: [userId]

// Find users without orders
select(['id', 'name'])
  .from('users')
  .whereRaw('NOT EXISTS (SELECT 1 FROM orders WHERE orders.user_id = users.id)')
  .build()

// Alternative using LEFT JOIN
select(['u.id', 'u.name'])
  .from('users', 'u')
  .leftJoin('orders', 'o', 'u.id', 'o.user_id')
  .whereNull('o.id')
  .build()
```

### Optimized COUNT Queries

```typescript
// Exact count (can be slow on large tables)
select([raw('COUNT(*) as total')])
  .from('posts')
  .where('status', '=', 'published')
  .build()

// Count with limit check (faster for "has more than N")
select([raw('COUNT(*) as count')])
  .from(
    raw(\`(SELECT 1 FROM posts WHERE status = 'published' LIMIT 101) as limited\`)
  )
  .build()

// Count distinct
select([raw('COUNT(DISTINCT user_id) as unique_users')])
  .from('events')
  .where('event_type', '=', 'page_view')
  .build()
```
  raw("ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as rank")
])
  .from('posts')
  .whereRaw("to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)", ['database'])
  .where('published', '=', true)
  .orderBy(raw('rank'), 'desc')
  .limit(20)
  .build()
```

#### Prefix Search (Autocomplete)

```typescript
select(['id', 'name'])
  .from('products')
  .whereRaw("name ILIKE $1 || '%'", ['lap'])
  .orderBy('name', 'asc')
  .limit(10)
  .build()
// params: ['lap'] - matches "laptop", "lapel", etc.
```

### Aggregation and Reporting

#### Basic Aggregation

```typescript
select([
  'department',
  raw('COUNT(*) as employee_count'),
  raw('AVG(salary) as avg_salary'),
  raw('MAX(hire_date) as latest_hire')
])
  .from('employees')
  .leftJoin('departments', 'employees.department_id', 'departments.id')
  .where('status', '=', 'active')
  .whereNotNull('department_id')
  .groupBy('department')
  .having('COUNT(*)', '>', 5)
  .orderBy(raw('employee_count'), 'desc')
  .limit(10)
  .build()
```

#### Time-Series Aggregation

```typescript
select([
  raw("DATE_TRUNC('day', created_at) as day"),
  raw('COUNT(*) as order_count'),
  raw('SUM(total) as daily_total')
])
  .from('orders')
  .whereRaw("created_at >= NOW() - INTERVAL '30 days'")
  .groupBy(raw("DATE_TRUNC('day', created_at)"))
  .orderBy(raw('day'), 'asc')
  .build()
```

#### Window Functions

```typescript
select([
  'id',
  'amount',
  raw('SUM(amount) OVER (ORDER BY created_at) as running_total'),
  raw('ROW_NUMBER() OVER (PARTITION BY category ORDER BY amount DESC) as rank_in_category')
])
  .from('transactions')
  .where('status', '=', 'completed')
  .orderBy('created_at', 'asc')
  .build()
```

### Pagination Patterns

#### Offset-Based Pagination

```typescript
const page = 3
const pageSize = 20

select('*')
  .from('users')
  .where('status', '=', 'active')
  .orderBy('created_at', 'desc')
  .limit(pageSize)
  .offset((page - 1) * pageSize)
  .build()
// LIMIT 20 OFFSET 40
```

#### Cursor-Based Pagination (Keyset)

```typescript
// More efficient for large datasets
const lastSeenId = 1000
const lastSeenDate = '2024-01-15T10:30:00Z'

select('*')
  .from('posts')
  .where('published', '=', true)
  .whereRaw('(created_at, id) < ($1, $2)', [lastSeenDate, lastSeenId])
  .orderBy('created_at', 'desc')
  .orderBy('id', 'desc')
  .limit(20)
  .build()
```

#### Pagination with Total Count

```typescript
select([
  '*',
  raw('COUNT(*) OVER() as total_count')
])
  .from('products')
  .where('category', '=', 'electronics')
  .orderBy('price', 'asc')
  .limit(10)
  .offset(0)
  .build()
```

### Multi-Table Queries

#### Self-Join for Hierarchical Data

```typescript
select([
  { column: 'e.name', as: 'employee_name' },
  { column: 'm.name', as: 'manager_name' }
])
  .from('employees', 'e')
  .leftJoin('employees', 'm', 'e.manager_id', 'm.id')
  .where('e.department', '=', 'Engineering')
  .build()
```

#### Complex Multi-Table Join

```typescript
select([
  'orders.id',
  'customers.name',
  raw('ARRAY_AGG(products.name) as product_names'),
  raw('SUM(order_items.quantity * order_items.unit_price) as subtotal')
])
  .from('orders')
  .join('customers', 'orders.customer_id', 'customers.id')
  .join('order_items', 'orders.id', 'order_items.order_id')
  .join('products', 'order_items.product_id', 'products.id')
  .where('orders.status', '=', 'completed')
  .groupBy(['orders.id', 'customers.name'])
  .having('SUM(order_items.quantity * order_items.unit_price)', '>', 100)
  .orderBy('orders.id', 'desc')
  .limit(50)
  .build()
```

### Conditional Logic

#### CASE Expressions

```typescript
select([
  'id',
  'name',
  raw(\`CASE
    WHEN age < 18 THEN 'minor'
    WHEN age < 65 THEN 'adult'
    ELSE 'senior'
  END as age_group\`)
])
  .from('users')
  .orderBy('name', 'asc')
  .build()
```

#### COALESCE for Default Values

```typescript
select([
  'id',
  raw("COALESCE(nickname, first_name, 'Anonymous') as display_name")
])
  .from('users')
  .where('active', '=', true)
  .build()
```

### JSON/JSONB Operations

#### Extracting JSON Fields

```typescript
select([
  'id',
  raw("metadata->>'name' as meta_name"),
  raw("metadata->'settings'->'theme' as theme")
])
  .from('configurations')
  .whereRaw("metadata->>'type' = $1", ['user'])
  .build()
```

#### JSON Array Operations

```typescript
// Find items where tags array contains a value
select('*')
  .from('posts')
  .whereRaw('tags @> $1::jsonb', [JSON.stringify(['javascript'])])
  .build()
```

### Upsert Patterns

#### Upsert with Conflict Resolution

```typescript
insert('user_preferences')
  .values({
    user_id: 123,
    preference_key: 'theme',
    preference_value: 'dark'
  })
  .onConflict(['user_id', 'preference_key'])
  .doUpdate({ preference_value: 'dark' })
  .returning('*')
  .build()
```

#### Bulk Upsert

```typescript
const items = [
  { sku: 'ABC123', quantity: 10, price: 29.99 },
  { sku: 'DEF456', quantity: 5, price: 49.99 }
]

insert('inventory')
  .values(items)
  .onConflict('sku')
  .doUpdateExcluded(['quantity', 'price'])
  .returning(['sku', 'quantity'])
  .build()
```

### Soft Delete Pattern

```typescript
// "Delete" by setting deleted_at
update('users')
  .set({ deleted_at: new Date().toISOString() })
  .where('id', '=', userId)
  .whereNull('deleted_at')
  .returning('id')
  .build()

// Query non-deleted records
select('*')
  .from('users')
  .whereNull('deleted_at')
  .where('status', '=', 'active')
  .build()
```

### Batch Operations

#### Batch Update

```typescript
const userIds = [1, 2, 3, 4, 5]

update('users')
  .set({ notification_sent: true })
  .whereIn('id', userIds)
  .returning(['id', 'email'])
  .build()
```

#### Batch Delete

```typescript
deleteFrom('sessions')
  .whereRaw("expires_at < NOW() - INTERVAL '7 days'")
  .whereIn('user_id', inactiveUserIds)
  .returning('id')
  .build()
```

### Recursive Queries (CTEs)

```typescript
// Get all descendants in an org chart
select('*')
  .from('employees')
  .whereRaw(\`"id" IN (
    WITH RECURSIVE subordinates AS (
      SELECT id FROM employees WHERE manager_id = $1
      UNION ALL
      SELECT e.id FROM employees e
      INNER JOIN subordinates s ON e.manager_id = s.id
    )
    SELECT id FROM subordinates
  )\`, [managerId])
  .orderBy('name', 'asc')
  .build()
```

### Performance Optimization

#### Select Only Needed Columns

```typescript
// Reduces data transfer and uses covering indexes
select(['id', 'name', 'email'])
  .from('users')
  .where('active', '=', true)
  .build()
```

#### EXISTS vs IN for Large Sets

```typescript
// More efficient than whereIn for large subqueries
select('*')
  .from('orders')
  .whereRaw(\`EXISTS (
    SELECT 1 FROM premium_customers
    WHERE premium_customers.id = "orders"."customer_id"
  )\`)
  .build()
```

## TypeScript Support

The package is written in TypeScript and provides full type definitions:

```typescript
import {
  QueryBuilder,
  select,
  insert,
  update,
  deleteFrom,
  raw,
  type BuiltQuery,
  type ColumnWithAlias,
  type JoinCondition,
  type RawSQL
} from '@dotdo/pg-query'

// BuiltQuery type
const query: BuiltQuery = select('*').from('users').build()
// { sql: string; params: unknown[] }

// Type-safe operators
select('*').from('users').where('age', '>=', 18)  // Valid
select('*').from('users').where('age', 'gte', 18) // TypeScript error

// Type-safe order direction
select('*').from('users').orderBy('name', 'asc')   // Valid
select('*').from('users').orderBy('name', 'up')    // TypeScript error
```

## API Reference

### Factory Functions

| Function | Description |
|----------|-------------|
| `select(columns?)` | Create a SELECT query builder |
| `insert(table)` | Create an INSERT query builder |
| `update(table)` | Create an UPDATE query builder |
| `deleteFrom(table)` | Create a DELETE query builder |
| `raw(sql)` | Create a raw SQL expression |

### QueryBuilder Methods

#### Query Setup
| Method | Description |
|--------|-------------|
| `.from(table, alias?)` | Set the FROM table |
| `.schema(name)` | Set the schema name |
| `.distinct()` | Add DISTINCT |
| `.distinctOn(columns)` | Add DISTINCT ON |

#### WHERE Conditions
| Method | Description |
|--------|-------------|
| `.where(column, operator, value)` | Add AND WHERE condition |
| `.orWhere(column, operator, value)` | Add OR WHERE condition |
| `.whereNull(column)` | Add WHERE IS NULL |
| `.whereNotNull(column)` | Add WHERE IS NOT NULL |
| `.whereIn(column, values)` | Add WHERE IN |
| `.whereNotIn(column, values)` | Add WHERE NOT IN |
| `.whereBetween(column, min, max)` | Add WHERE BETWEEN |
| `.whereGroup(fn)` | Add grouped conditions |
| `.whereRaw(sql, params?)` | Add raw WHERE clause |

#### JOINs
| Method | Description |
|--------|-------------|
| `.join(table, leftCol, rightCol)` | Add INNER JOIN |
| `.leftJoin(table, leftCol, rightCol)` | Add LEFT JOIN |
| `.rightJoin(table, leftCol, rightCol)` | Add RIGHT JOIN |
| `.fullJoin(table, leftCol, rightCol)` | Add FULL OUTER JOIN |

#### Ordering and Pagination
| Method | Description |
|--------|-------------|
| `.orderBy(column, direction?, nulls?)` | Add ORDER BY |
| `.limit(n)` | Set LIMIT |
| `.offset(n)` | Set OFFSET |

#### Grouping and Aggregation
| Method | Description |
|--------|-------------|
| `.groupBy(columns)` | Add GROUP BY |
| `.having(expression, operator, value)` | Add HAVING |

#### INSERT Specific
| Method | Description |
|--------|-------------|
| `.values(data)` | Set INSERT values |
| `.onConflict(column)` | Set ON CONFLICT column |
| `.doNothing()` | Add DO NOTHING |
| `.doUpdate(values)` | Add DO UPDATE SET |
| `.doUpdateExcluded(columns)` | Add DO UPDATE SET using EXCLUDED |

#### UPDATE Specific
| Method | Description |
|--------|-------------|
| `.set(data)` | Set UPDATE values |

#### Output
| Method | Description |
|--------|-------------|
| `.returning(columns)` | Add RETURNING clause |
| `.build()` | Build the query |
| `.toSQL()` | Alias for `.build()` |

## Integration with postgres.do

`@dotdo/pg-query` is designed as the foundational query builder for the postgres.do ecosystem. Here's how it integrates with the main `postgres.do` client.

### Using with postgres.do Client

The queries built with `@dotdo/pg-query` can be executed directly with the postgres.do client using the `unsafe()` method:

```typescript
import postgres from 'postgres.do'
import { select, insert, update, deleteFrom } from '@dotdo/pg-query'

// Create postgres.do client
const sql = postgres('postgres://db.postgres.do/mydb')

// Build a query with pgquery
const { sql: querySql, params } = select(['id', 'name', 'email'])
  .from('users')
  .where('status', '=', 'active')
  .orderBy('created_at', 'desc')
  .limit(10)
  .build()

// Execute with postgres.do
const users = await sql.unsafe(querySql, params)
```

### Helper Function Pattern

Create a helper to streamline query execution:

```typescript
import postgres from 'postgres.do'
import { select, insert, update, deleteFrom, type BuiltQuery } from '@dotdo/pg-query'

const sql = postgres('postgres://db.postgres.do/mydb')

// Helper function to execute built queries
async function execute<T = unknown>(query: BuiltQuery): Promise<T[]> {
  return sql.unsafe<T>(query.sql, query.params)
}

// Usage
const users = await execute<{ id: number; name: string }>(
  select(['id', 'name'])
    .from('users')
    .where('active', '=', true)
    .build()
)
```

### Combining with Tagged Template Queries

You can use `@dotdo/pg-query` alongside postgres.do's native tagged template queries:

```typescript
import postgres from 'postgres.do'
import { select } from '@dotdo/pg-query'

const sql = postgres('postgres://db.postgres.do/mydb')

// Native tagged template (simple queries)
const user = await sql`SELECT * FROM users WHERE id = ${userId}`

// Query builder (complex queries)
const { sql: complexSql, params } = select(['u.id', 'u.name', 'p.title'])
  .from('users', 'u')
  .join('posts', 'p', 'u.id', 'p.user_id')
  .where('u.status', '=', 'active')
  .whereIn('p.category', ['tech', 'design'])
  .orderBy('p.created_at', 'desc')
  .limit(20)
  .build()

const results = await sql.unsafe(complexSql, params)
```

### Transaction Support

Using pgquery within postgres.do transactions:

```typescript
import postgres from 'postgres.do'
import { insert, update } from '@dotdo/pg-query'

const sql = postgres('postgres://db.postgres.do/mydb')

await sql.begin(async (tx) => {
  // Build insert query
  const insertQuery = insert('orders')
    .values({ user_id: 1, total: 99.99 })
    .returning('id')
    .build()

  const [order] = await tx.unsafe(insertQuery.sql, insertQuery.params)

  // Build update query
  const updateQuery = update('users')
    .set({ last_order_at: new Date().toISOString() })
    .where('id', '=', 1)
    .build()

  await tx.unsafe(updateQuery.sql, updateQuery.params)

  return order
})
```

### Type-Safe Query Builder (postgres.do/query-builder)

For more advanced type inference, postgres.do also provides a built-in type-safe query builder that works with schema definitions:

```typescript
import postgres from 'postgres.do'
import { createQueryBuilder, defineTable, serial, text, eq } from 'postgres.do/query-builder'

// Define typed schema
const users = defineTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
})

// Create client and query builder
const sql = postgres('postgres://db.postgres.do/mydb')
const qb = createQueryBuilder(sql)

// Fully type-inferred queries
const allUsers = await qb.select().from(users).execute()
// typeof allUsers = { id: number; name: string; email: string }[]

const filtered = await qb
  .select({ email: users.columns.email })
  .from(users)
  .where(eq(col('users', 'id'), 1))
  .execute()
// typeof filtered = { email: string }[]
```

### Ecosystem Packages

`@dotdo/pg-query` serves as the shared SQL building foundation for several postgres.do compatibility packages:

| Package | Description |
|---------|-------------|
| `@dotdo/postgrest` | PostgREST-compatible REST API for postgres.do |
| `@dotdo/supabase` | Supabase client API compatibility layer |
| `@dotdo/documentdb` | MongoDB-style document API for postgres.do |

Each package uses `@dotdo/pg-query` internally to generate parameterized SQL queries, ensuring consistent SQL injection protection across the ecosystem.

## Troubleshooting

### Common Issues

#### "No values provided for INSERT"

Make sure to call `.values()` before `.build()`:

```typescript
// Wrong
insert('users').build()

// Correct
insert('users').values({ name: 'John' }).build()
```

#### Parameter numbering seems wrong

Parameters are numbered sequentially across all conditions. Use the returned `params` array in the same order:

```typescript
const { sql, params } = query.build()
// Pass params to your database driver
await db.query(sql, params)
```

#### Need to use database functions

Use `raw()` for database-specific functions:

```typescript
select([raw('NOW()'), raw('uuid_generate_v4()')])
```

### Getting Help

- [GitHub Issues](https://github.com/dot-do/postgres/issues)
- [Documentation](https://postgres.do/docs)

## License

MIT License - see [LICENSE](LICENSE) for details.
