---
name: "@dotdo/pg-lake"
version: 0.1.1
description: "pg_lake: Distributed Sharding & Unified Iceberg Architecture for PostgreSQL on Cloudflare Workers"
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - postgres
  - postgresql
  - pglite
  - pglake
  - distributed
  - sharding
  - iceberg
  - parquet
  - analytics
  - cloudflare
  - workers
  - durable-objects
  - pglite
  - cdc
  - time-travel
downloads:
  monthly: 26
published: "2026-01-22T15:58:53.930Z"
updated: "2026-01-24T15:49:14.403Z"
---

# @dotdo/pg-lake

**Turn your PostgreSQL into a data lakehouse.**

```typescript
import { PGLake } from '@dotdo/pg-lake'

const lake = new PGLake({
  bucket: env.ICEBERG_BUCKET,
  database: 'analytics'
})

// Your PostgreSQL changes automatically become Iceberg tables
await lake.sync('SELECT * FROM orders WHERE created_at > NOW() - INTERVAL 1 DAY')

// Query petabytes with PGLite - time travel included
const lastWeek = await lake.query(
  'SELECT * FROM orders',
  { asOf: Date.now() - 7 * 24 * 60 * 60 * 1000 }
)
```

## Why pglake?

You're building analytics. You've got PostgreSQL for your app, but now you need:

- Historical data analysis (time travel queries)
- Petabyte-scale analytics without killing your production DB
- Data warehouse capabilities without managing Snowflake/BigQuery
- Schema evolution without rewriting terabytes of data

**The old way:** Maintain separate ETL pipelines, data warehouses, and sync jobs. Debug why your analytics are 3 hours stale at 2 AM.

**The pglake way:** Your PostgreSQL WAL becomes Apache Iceberg tables on R2. Query with PGLite. Time travel built-in. Zero ETL.

## What You Get

- **WAL to Iceberg** - Every INSERT/UPDATE/DELETE streams to your data lake
- **Time Travel** - Query any point in history via Iceberg snapshots
- **Horizontal Sharding** - Scale PostgreSQL across Durable Objects
- **PGLite Analytics** - Run OLAP queries without touching your OLTP database
- **Schema Evolution** - Change schemas without rewriting data
- **Zero ETL** - No pipelines to maintain, no sync jobs to debug

## Installation

```bash
npm install @dotdo/pg-lake
```

## Quick Start

### 1. Configure Your Worker

```typescript
// src/index.ts
import { worker } from '@dotdo/pg-lake'

export default worker
export { ShardDO, IngestDO, CatalogDO } from '@dotdo/pg-lake'
```

### 2. Set Up Bindings

```jsonc
// wrangler.jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "SHARD_DO", "class_name": "ShardDO" },
      { "name": "INGEST_DO", "class_name": "IngestDO" },
      { "name": "CATALOG_DO", "class_name": "CatalogDO" }
    ]
  },
  "r2_buckets": [
    { "binding": "ICEBERG_BUCKET", "bucket_name": "my-data-lake" }
  ]
}
```

### 3. Create a Sharded Table

```typescript
const catalog = env.CATALOG_DO.get(env.CATALOG_DO.idFromName('primary'))

await catalog.createTable({
  name: 'events',
  sharding: {
    strategy: 'hash',
    shardKeyColumns: ['user_id'],
    shardCount: 8
  }
})

// Inserts automatically route to the correct shard
// CDC streams to IngestDO -> Parquet -> R2
```

### 4. Query Across Time

```typescript
import { QueryPlanner, QueryExecutor } from '@dotdo/pg-lake/query'

const planner = new QueryPlanner({ catalogStub })
const executor = new QueryExecutor({ env })

// Query current data
const now = await executor.execute(
  await planner.plan({ sql: 'SELECT COUNT(*) FROM events' })
)

// Query last week's data
const lastWeek = await executor.execute(
  await planner.plan({
    sql: 'SELECT COUNT(*) FROM events',
    context: { asOfTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 }
  })
)
```

## Architecture

```
                    +------------------+
                    |    Your App      |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |   ShardDO (N)     |         |   QueryWorker     |
    |   PGLite + VFS    |         |   PGLite Engine   |
    +--------+----------+         +---------+---------+
             |                              |
             | CDC Stream                   | Iceberg Read
             v                              v
    +-----------------+          +--------------------+
    |   IngestDO      |          |   R2 Data Lake     |
    |   Batch + Write |--------->|   Parquet + Meta   |
    +-----------------+          +--------------------+
             ^
             |
    +-----------------+
    |   CatalogDO     |
    |   Coordination  |
    +-----------------+
```

**ShardDO** - Isolated PGLite instances with hot page caching. Each shard handles writes and streams CDC events.

**IngestDO** - Batches CDC events, writes Parquet files to R2, maintains Iceberg manifests.

**CatalogDO** - Tracks table metadata, manages shard routing, coordinates rebalancing.

**QueryWorker** - Runs PGLite over Iceberg tables for analytics queries.

## Sharding Strategies

### Hash Sharding (Recommended)
```typescript
{ strategy: 'hash', shardKeyColumns: ['user_id'], shardCount: 8 }
```
Even distribution. Best for general workloads.

### Range Sharding
```typescript
{ strategy: 'range', shardKeyColumns: ['created_at'], shardCount: 12 }
```
Time-series data. Efficient range queries.

### Tenant Sharding
```typescript
{ strategy: 'tenant', shardKeyColumns: ['tenant_id'], shardCount: 100 }
```
Multi-tenant isolation. Each tenant gets dedicated resources.

### Geographic Sharding
```typescript
{ strategy: 'geographic', shardKeyColumns: ['region'], shardCount: 5 }
```
Data locality. Deploy shards near your users.

## CDC (Change Data Capture)

Every write streams to your data lake automatically:

```typescript
// Configure CDC per shard
await shard.initialize({
  cdcIncludeTables: ['orders', 'events'],  // What to capture
  cdcBufferSize: 1000,                      // Events before flush
  cdcFlushIntervalMs: 1000                  // Max wait time
})

// Writes generate CDC events
await shard.query({
  sql: 'INSERT INTO orders (id, amount) VALUES ($1, $2)',
  params: ['order-123', 99.99]
})
// -> CDC event: { operation: 'INSERT', table: 'orders', newRow: {...} }
// -> Batched by IngestDO
// -> Written as Parquet to R2
// -> Queryable via PGLite
```

## Time Travel Queries

Query any point in history:

```typescript
// Current state
const now = await lake.query('SELECT * FROM users WHERE id = $1', ['user-123'])

// Yesterday
const yesterday = await lake.query('SELECT * FROM users WHERE id = $1', ['user-123'], {
  asOfTimestamp: Date.now() - 24 * 60 * 60 * 1000
})

// Incremental reads (for sync)
const changes = await lake.query('SELECT * FROM users', [], {
  fromSnapshot: 12345,
  toSnapshot: 12350
})
```

## Cross-Shard Queries

Query all your data, regardless of where it lives:

```typescript
// Federated - same query on all shards, aggregate results
const plan = await planner.plan({
  sql: 'SELECT region, SUM(amount) FROM orders GROUP BY region',
  context: { strategy: 'federated' }
})

// Hybrid - recent from shards, historical from Iceberg
const plan = await planner.plan({
  sql: 'SELECT * FROM orders WHERE created_at > $1',
  params: [lastMonth],
  context: { strategy: 'hybrid', hybridCutoffMs: 24 * 60 * 60 * 1000 }
})
```

## Integration with @dotdo/postgres

pglake extends postgres.do naturally:

```typescript
import { Postgres } from '@dotdo/postgres'
import { PGLake } from '@dotdo/pg-lake'

// Your postgres.do database
const db = new Postgres({ url: 'https://db.postgres.do/mydb' })

// Add lakehouse capabilities
const lake = new PGLake({
  postgres: db,
  bucket: env.ICEBERG_BUCKET
})

// Regular queries hit postgres.do
await db.query('INSERT INTO orders VALUES ($1, $2)', [id, amount])

// Analytics queries hit the data lake
const analytics = await lake.query(`
  SELECT DATE(created_at), SUM(amount)
  FROM orders
  WHERE created_at > NOW() - INTERVAL '90 days'
  GROUP BY 1
`)
```

## Performance Tips

1. **Partition by time** - Query only the data you need
2. **Use shard keys** - Target specific shards when possible
3. **Enable compression** - Snappy or Zstd for Parquet files
4. **Tune batch size** - Balance latency vs throughput

## Cost Model

| Operation | Cost |
|-----------|------|
| Shard writes | Durable Object request |
| CDC streaming | Included (WebSocket) |
| Parquet writes | R2 PUT (Class A) |
| Analytics queries | R2 GET (Class B) + compute |
| Time travel | Same as analytics |

R2 has no egress fees. Query your data lake without budget surprises.

## Links

- [Documentation](https://postgres.do/docs/pglake)
- [GitHub](https://github.com/dot-do/postgres)
- [Apache Iceberg](https://iceberg.apache.org)
- [PGLite](https://pglite.org)

## Related Packages

- [`@dotdo/postgres`](../postgres) - PostgreSQL on Cloudflare Workers
- [`@dotdo/electric`](../electric) - Real-time sync
- [`@dotdo/tanstack`](../tanstack) - TanStack integration

## License

MIT
