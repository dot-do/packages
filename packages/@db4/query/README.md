---
name: "@db4/query"
version: 0.1.2
description: Query planning, zone map pruning, bloom filter checks, and cost estimation for db4
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - query
  - planner
  - zone-maps
  - bloom-filter
  - pruning
  - cloudflare
  - workers
downloads:
  monthly: 107
published: "2026-01-20T11:31:49.473Z"
updated: "2026-01-23T17:20:33.306Z"
---

# @db4/query

([GitHub](https://github.com/dot-do/db4/tree/main/packages/query), [npm](https://www.npmjs.com/package/@db4/query))

**Your SQL queries are a liability. Every string concatenation is a potential breach. Every typo is a 3am page.**

You've shipped code with "usrs" instead of "users." You've trusted `${userInput}` in a query string. Your IDE offered nothing - no warnings, no autocomplete, no help.

`@db4/query` makes these problems impossible. Type-safe queries. Automatic injection prevention. Cost-based optimization. Full IDE support.

## The Problem

String SQL is broken by design:

```typescript
// No autocomplete. No type safety. Runtime errors.
const users = await db.raw(`
  SELECT * FROM usrs WHERE stauts = 'active'  // Two typos. Production will find them.
`)

// SQL injection waiting to happen
const user = await db.raw(`SELECT * FROM users WHERE email = '${userInput}'`)
```

## The Solution

```typescript
import { createParser, createOptimizer, createExecutor } from '@db4/query'
import type { IndexMetadata, TableStats, DOExecutionContext } from '@db4/query'

const parser = createParser()
const optimizer = createOptimizer()
const executor = createExecutor()

// MongoDB-style queries that compile to optimized SQL
const ast = parser.parse({
  collection: 'users',
  select: ['id', 'name', 'email'],
  where: { field: 'status', $eq: 'active' },
  orderBy: { field: 'createdAt', direction: 'desc' },
  limit: 100
})

// Automatic optimization with index selection
const indexes: IndexMetadata[] = [
  { name: 'users_status_idx', columns: ['status'], type: 'btree' }
]
const plan = optimizer.createPlan(ast, indexes, new Map<string, TableStats>(), 'do')

// Execute with full statistics
const context: DOExecutionContext = { engine: 'do', /* ... */ }
const result = await executor.execute(plan, context)
```

## Three Steps to Safe Queries

### 1. Parse

Transform queries into validated ASTs:

```typescript
import { createParser } from '@db4/query'

const parser = createParser()

// Client SDK format with MongoDB-style operators
const ast = parser.parse({
  collection: 'orders',
  select: ['id', 'total', 'status'],
  where: [
    { field: 'status', $in: ['pending', 'processing'] },
    { field: 'total', $gte: 100 }
  ],
  orderBy: { field: 'createdAt', direction: 'desc' },
  limit: 50
})

// Or parse SQL directly (injection-safe)
const sqlAst = parser.parseSQL('SELECT * FROM orders WHERE status = "pending"')
```

### 2. Optimize

Cost-based planning with your index metadata:

```typescript
import { createOptimizer, type IndexMetadata } from '@db4/query'

const optimizer = createOptimizer({
  enablePredicatePushdown: true,
  enableIndexSelection: true,
  enableJoinReordering: true
})

const indexes: IndexMetadata[] = [
  { name: 'orders_status_idx', columns: ['status'], type: 'btree' },
  { name: 'orders_created_idx', columns: ['createdAt'], type: 'btree' }
]

const plan = optimizer.createPlan(ast, indexes, tableStats, 'do')
// plan.optimizations: ['predicate_pushdown', 'index_selection']
```

### 3. Execute

Run with caching, streaming, and full statistics:

```typescript
import { createExecutor } from '@db4/query'

const executor = createExecutor({
  batchSize: 1000,
  timeout: 30000,
  enableCache: true
})

const result = await executor.execute(plan, context)
// result.stats: { planTime: 2, executeTime: 45, rowsScanned: 1000,
//                 rowsReturned: 50, indexUsed: 'orders_status_idx' }
```

## SQL Injection? Impossible.

Every identifier validated. Every value parameterized. Every injection detected:

```typescript
import { createSQLGenerator, createParser } from '@db4/query'

const parser = createParser()
const generator = createSQLGenerator({ dialect: 'sqlite' })

// Parser validates all identifiers automatically
// Invalid inputs throw SqlInjectionError
const ast = parser.parse({
  collection: 'users',
  select: ['id', 'name'],
  where: { field: 'status', $eq: 'active' }
})

// Safe parameterized output
const { sql, params } = generator.generate(ast)
// sql: 'SELECT "id", "name" FROM "users" WHERE "status" = ?'
// params: ['active']
```

## Advanced Features

### Zone Map Pruning

Skip files that can't contain your data:

```typescript
import { pruneWithZoneMaps, type PathWithZoneMaps } from '@db4/query'

const files: PathWithZoneMaps[] = [
  { path: 'data/2024-01.parquet', zoneMaps: new Map([
    ['timestamp', { column: 'timestamp', min: '2024-01-01', max: '2024-01-31', nullCount: 0, rowCount: 10000 }]
  ])},
  { path: 'data/2024-02.parquet', zoneMaps: new Map([
    ['timestamp', { column: 'timestamp', min: '2024-02-01', max: '2024-02-28', nullCount: 0, rowCount: 10000 }]
  ])}
]

// Query for March? Skip both files entirely.
const remaining = pruneWithZoneMaps(files, { field: 'timestamp', $gte: '2024-03-01' })
// remaining: []
```

### Bloom Filter Pruning

Fast existence checks before expensive scans:

```typescript
import { pruneWithBloomFilters, type PathWithBloomFilters } from '@db4/query'

const files: PathWithBloomFilters[] = [
  { path: 'data/users-a-m.parquet', bloomFilters: new Map([
    ['email', { mightContain: (v) => String(v).toLowerCase() < 'n' }]
  ])}
]

// Looking for 'zach@example.com'? Skip files that definitely don't have it.
const remaining = pruneWithBloomFilters(files, { field: 'email', $eq: 'zach@example.com' })
```

### Predicate Pushdown

Push filters to storage, not application:

```typescript
import { createPredicatePushdownManager } from '@db4/query'

const manager = createPredicatePushdownManager()

const analysis = manager.analyze({
  type: 'and',
  children: [
    { type: 'eq', column: 'status', value: 'active' },
    { type: 'gt', column: 'age', value: 18 }
  ]
})

console.log(analysis.fullyPushable) // true - runs at storage layer
```

### Joins

Hash joins, merge joins, nested loops - automatically selected:

```typescript
import { join } from '@db4/query'

const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
const orders = [
  { id: 101, userId: 1, total: 99.99 },
  { id: 102, userId: 1, total: 149.99 },
  { id: 103, userId: 2, total: 49.99 }
]

const result = join(users)
  .left()
  .on('id', 'userId')
  .select('name', 'total')
  .execute(orders)

// Automatically picks hash join for equi-joins
console.log(result.stats.algorithm) // 'hash'
```

### Window Functions

Full SQL window function support:

```typescript
import { applyWindowFunctions } from '@db4/query'

const sales = [
  { region: 'West', month: 'Jan', revenue: 1000 },
  { region: 'West', month: 'Feb', revenue: 1200 },
  { region: 'East', month: 'Jan', revenue: 800 }
]

const result = applyWindowFunctions(sales, [
  {
    function: 'ROW_NUMBER',
    alias: 'rank',
    over: { partitionBy: ['region'], orderBy: [{ column: 'revenue', direction: 'DESC' }] }
  },
  {
    function: 'SUM',
    column: 'revenue',
    alias: 'running_total',
    over: {
      partitionBy: ['region'],
      orderBy: [{ column: 'month' }],
      frame: { type: 'ROWS', start: { type: 'UNBOUNDED_PRECEDING' } }
    }
  }
])
```

### Aggregation Pushdown

Push aggregates to storage for massive speedups:

```typescript
import { createAggregationPushdownManager } from '@db4/query'

const manager = createAggregationPushdownManager()

const analysis = manager.analyze({
  aggregates: [
    { function: 'COUNT', column: '*', alias: 'total' },
    { function: 'SUM', column: 'amount', alias: 'revenue' }
  ],
  groupBy: { columns: ['status'] }
})

// MIN/MAX computed from zone maps - zero rows scanned
const fromZoneMaps = manager.computeFromZoneMaps(
  { function: 'MAX', column: 'timestamp', alias: 'latest' },
  filesWithZoneMaps
)
```

### Optimizer Hints

Override the planner when you know better:

```typescript
import { hints, parseHints } from '@db4/query'

// Fluent API for hint blocks
const hintBlock = hints()
  .useIndex('orders_status_idx')
  .hashJoin('orders', 'customers')
  .parallel(4)
  .noCache()
  .build()
// '/*+ USE_INDEX(orders_status_idx) HASH_JOIN(orders, customers) PARALLEL(4) NO_CACHE */'

// Wrap a query with hints
const sql = hints()
  .forceIndex('users_email_idx')
  .cacheTtl(300)
  .wrapQuery('SELECT * FROM users WHERE email = ?')

// Parse hints from SQL
const parsed = parseHints('SELECT /*+ USE_INDEX(idx) PARALLEL(4) */ * FROM orders')
// parsed.indexHints: [{ operation: 'USE_INDEX', indexNames: ['idx'] }]
// parsed.parallelDegree: 4
```

## With @db4/query

- **IDE Autocomplete**: Every method, field, and option - fully typed
- **Compile-Time Errors**: Catch mistakes before deployment
- **Automatic Optimization**: Index selection, predicate pushdown, join reordering
- **SQL Injection Protection**: Built-in validation and parameterization
- **Three-Tier Execution**: DO (hot) -> Edge Cache (warm) -> R2/Vortex (cold)
- **Query Plan Caching**: Repeated queries skip planning
- **Streaming Results**: Millions of rows without memory crashes

## Without It

- SQL injection vulnerabilities that pass code review
- Runtime errors from column name typos
- No autocomplete, no hints - guessing at syntax
- Manual optimization that's never right
- Memory crashes from unbounded results
- 3am pages for queries that worked in staging

## Installation

```bash
npm install @db4/query
```

## API Reference

### Parser

```typescript
import { createParser } from '@db4/query'

const parser = createParser({ cacheSize: 1000 })
const ast = parser.parse(clientQuery)
const sqlAst = parser.parseSQL(sqlString)
```

### Optimizer

```typescript
import { createOptimizer, DEFAULT_RULES } from '@db4/query'

const optimizer = createOptimizer({
  enablePredicatePushdown: true,
  enableIndexSelection: true,
  enableJoinReordering: true,
  maxIterations: 10
})

const plan = optimizer.createPlan(ast, indexes, tableStats, engine)
```

### Executor

```typescript
import { createExecutor } from '@db4/query'

const executor = createExecutor({
  batchSize: 1000,
  timeout: 30000,
  enableCache: true,
  maxRows: 100000
})

const result = await executor.execute(plan, context)
const stream = executor.stream(plan, context)
```

### SQL Generator

```typescript
import { createSQLGenerator } from '@db4/query'

const generator = createSQLGenerator({
  dialect: 'sqlite',  // 'sqlite' | 'postgres' | 'd1'
  enablePreparedStatements: true,
  includeIndexHints: true
})

const { sql, params, cacheable } = generator.generate(ast)
```

## Exports

```typescript
// Core
export { QueryParser, createParser } from './parser'
export { QueryOptimizer, createOptimizer, DEFAULT_RULES } from './optimizer'
export { QueryExecutor, createExecutor } from './executor'
export { SQLGenerator, createSQLGenerator } from './sql-generator'
export { QueryPlanner, planQueryWithStrategy, estimateQuerySelectivity } from './planner'

// Types
export type { ZoneMap, PathWithZoneMaps, BloomFilter, PathWithBloomFilters } from './types'
export type { IndexMetadata, TableStats, QueryPlan, Predicate } from './types'
export type { ExecutionEngine, DOExecutionContext, VortexExecutionContext } from './types'

// Pruning
export { pruneWithZoneMaps } from './zone-maps'
export { pruneWithBloomFilters } from './bloom-filters'
export { PredicatePushdownManager, createPredicatePushdownManager, analyzePredicate } from './predicate-pushdown'

// Index selection
export { IndexSelectionManager, createIndexSelectionManager, selectIndex, analyzeIndex } from './index-selection'

// Aggregation pushdown
export { AggregationPushdownManager, createAggregationPushdownManager, analyzeAggregation } from './aggregation-pushdown'
export { computeAggregateFromZoneMaps, createPartialAggregate, mergePartialAggregates } from './aggregation-pushdown'

// Joins
export { executeJoin, join, JoinBuilder, analyzeJoinPredicate, optimizeJoinOrder } from './joins'

// Window functions
export { applyWindowFunctions, over, WindowBuilder } from './window-functions'
export { unboundedPreceding, unboundedFollowing, currentRow, preceding, following } from './window-functions'

// Optimizer hints
export { hints, parseHints, validateHints, applyHints, HintBuilder, stripHints } from './optimizer-hints'
export type { ParsedHints, HintValidationResult, IndexHint, ParallelHint } from './optimizer-hints'
```

## Related Packages

- [@db4/core](../core) - Core types and utilities
- [@db4/vortex](../vortex) - Columnar storage with zone maps
- [@db4/do](../do) - Durable Object implementation
- [@db4/schema](../schema) - IceType schema compiler

## License

MIT
