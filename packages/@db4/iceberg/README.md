---
name: "@db4/iceberg"
version: 0.1.2
description: CDC to Iceberg streaming for db4 - Change Data Capture and Parquet file generation
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - iceberg
  - cdc
  - change-data-capture
  - parquet
  - streaming
  - cloudflare
  - workers
  - r2
downloads:
  monthly: 44
published: "2026-01-20T11:29:15.327Z"
updated: "2026-01-23T17:20:24.666Z"
---

# @db4/iceberg

([GitHub](https://github.com/dot-do/db4/tree/main/packages/iceberg), [npm](https://www.npmjs.com/package/@db4/iceberg))

**Your edge data is trapped. Analytics waits. Stakeholders wonder why dashboards show yesterday's numbers.**

Every Durable Object write creates valuable data your analytics team cannot touch. You maintain fragile ETL pipelines, run nightly batch jobs, and apologize for stale dashboards. Schema changes break everything downstream.

`@db4/iceberg` streams CDC events directly to Apache Iceberg on R2. Query your edge data in real-time from Spark, Snowflake, BigQuery, or any Iceberg-compatible engine.

## The Problem

Durable Objects deliver sub-10ms writes but create data silos:

- **Analytics blackout** - Data locked inside individual DOs
- **Stale dashboards** - Batch ETL means hours or days of lag
- **Pipeline fragility** - Custom ETL that breaks, drifts, demands constant fixes
- **Schema chaos** - App changes shatter downstream consumers

## The Plan

### 1. Configure CDC

```typescript
import { createCDCPipeline } from '@db4/iceberg'

const pipeline = createCDCPipeline({
  shardId: 'shard-001',
  r2Bucket: env.ICEBERG_BUCKET,
  r2Prefix: 'warehouse/events/',
  compression: 'SNAPPY',
  batchSize: 100,
  flushIntervalMs: 60000,
})
```

### 2. Stream Changes

```typescript
// Inside your Durable Object
async write(doc: Document) {
  const before = await this.get(doc.$id)
  await this.storage.put(doc.$id, doc)

  pipeline.createEntry(
    before ? 'UPDATE' : 'INSERT',
    doc.$type,
    doc.$id,
    before,
    doc
  )
}
```

### 3. Query Anywhere

```sql
-- Spark SQL: real-time edge data
SELECT * FROM iceberg.warehouse.events
WHERE $type = 'order' AND $createdAt > current_date - 7

-- Time travel: last week's state
SELECT * FROM iceberg.warehouse.events
  FOR TIMESTAMP AS OF '2024-01-01 00:00:00'
```

## Features

### CDC Pipeline

Full change capture with before/after states:

```typescript
import { CDCPipeline } from '@db4/iceberg'

const pipeline = new CDCPipeline({
  shardId: 'shard-001',
  r2Bucket: env.BUCKET,
  batchSize: 100,
  flushIntervalMs: 60000,
  compression: 'ZSTD',
})

// Entries batch automatically
pipeline.createEntry('INSERT', 'users', 'user-123', undefined, newUser)
pipeline.createEntry('UPDATE', 'users', 'user-123', oldUser, updatedUser)
pipeline.createEntry('DELETE', 'users', 'user-123', deletedUser, undefined)

// Flush when needed
const result = await pipeline.flush()
// { entriesProcessed: 100, parquetFilePath: 'cdc/shard-001-...parquet', bytesWritten: 45000 }
```

### Partitioning

Intelligent partitioning for fast queries:

```typescript
import { PartitionSpecBuilder, createPartitionPruner } from '@db4/iceberg'

const spec = new PartitionSpecBuilder(schema)
  .day('created_at')
  .identity('region')
  .bucket('user_id', 16)
  .build()

// Prune irrelevant partitions
const pruner = createPartitionPruner(spec, schema)
const relevantFiles = pruner.pruneFiles(allFiles, [
  { field: 'created_at_day', operator: 'gte', value: 19750 },
  { field: 'region', operator: 'eq', value: 'us-west' }
])
```

### Schema Evolution

Schema changes that do not break analytics:

```typescript
import { SchemaEvolutionManager } from '@db4/iceberg'

const manager = new SchemaEvolutionManager(tableMetadata)

// Add columns (existing queries unaffected)
await manager.addColumn({
  name: 'email_verified',
  type: 'boolean',
  required: false,
})

// Rename columns (preserves field IDs)
await manager.renameColumn({
  currentName: 'old_field',
  newName: 'new_field'
})

// Type promotions: int -> long, float -> double
await manager.promoteType({
  fieldName: 'counter',
  newType: 'long'
})
```

### Time Travel

Query any point in history:

```typescript
import { TimeTravelQuery } from '@db4/iceberg'

const timeTravel = new TimeTravelQuery(tableMetadata)

// Query by timestamp, snapshot ID, or ref
const lastWeek = timeTravel.queryByTimestamp(Date.now() - 7 * 24 * 60 * 60 * 1000)
const snapshot = timeTravel.queryBySnapshotId(12345678)
const v1 = timeTravel.queryByRef('v1.0')

// Compare two points in time
const diff = timeTravel.diff(oldSnapshotId, newSnapshotId)
```

### Snapshot Management

Atomic commits with manifest tracking:

```typescript
import { SnapshotManager } from '@db4/iceberg'

const manager = new SnapshotManager(tableMetadata)

// Create snapshot
const snapshot = await manager.createSnapshot({
  manifestListPath: 'metadata/snap-123.avro',
  summary: { operation: 'append', 'added-records': '10000' }
})

// Tag and branch
manager.createRef('v1.0', snapshot.snapshotId, 'tag')
manager.createRef('feature-branch', snapshot.snapshotId, 'branch')

// Rollback and expire
await manager.rollbackTo(previousSnapshotId)
await manager.expireSnapshots({ retainLast: 10 })
```

### Bloom Filters

Skip files that cannot contain your data:

```typescript
import { createBloomFilter, bloomAdd, bloomMightContain } from '@db4/iceberg'

const filter = createBloomFilter('data/users.parquet', 'user_id', 10000, 0.01)

bloomAdd(filter, 'user-12345')

if (!bloomMightContain(filter, 'user-99999')) {
  // Skip this file - it definitely lacks this user
}
```

### R2 Tiering

Automatic hot/cold management:

```typescript
import { R2TieringManager } from '@db4/iceberg'

const tiering = new R2TieringManager({
  r2Bucket: env.COLD_BUCKET,
  coldThreshold: 7 * 24 * 60 * 60 * 1000,
  enablePredictiveTiering: true,
  enableColdCache: true,
})

await tiering.tierColdDocuments('users', documents)
const doc = await tiering.fetchFromCold('users', docId)
```

## With @db4/iceberg

- **Seconds, not hours** - Query edge data moments after writes
- **Zero ETL** - Automatic CDC, no custom pipelines to maintain
- **Safe evolution** - Schema changes propagate without breaking downstream
- **Debug with time travel** - Query any historical state
- **Tool freedom** - Spark, Snowflake, BigQuery, Trino, DuckDB

## Without It

- Analytics waits hours or days for batch ETL
- Schema changes shatter dashboards and reports
- Historical queries demand custom tooling
- Edge data stays siloed and wasted
- ETL becomes the bottleneck for every insight

## API Reference

### Core Exports

| Export | Description |
|--------|-------------|
| `CDCPipeline` | CDC streaming pipeline |
| `SnapshotManager` | Snapshot lifecycle |
| `SchemaEvolutionManager` | Safe schema changes |
| `TimeTravelQuery` | Historical state queries |
| `PartitionSpecBuilder` | Table partitioning |
| `PartitionPruner` | Partition skipping |
| `BloomFilterManager` | Probabilistic file skipping |
| `R2TieringManager` | Hot/cold tiering |
| `ManifestWriter` | Manifest generation |
| `ParquetFileWriter` | Parquet generation |

### Factory Functions

```typescript
// Pipeline
createCDCPipeline(config)
buildCDCLogEntry(sequenceId, operation, collection, docId, shardId, before?, after?, transactionId?)

// Snapshots
createSnapshotManager(metadata)
createTableMetadata({ tableUuid, location, schema })

// Schema
createSchemaEvolutionManager(metadata)
isValidTypePromotion(fromType, toType)

// Time Travel
createTimeTravelQuery(metadata)
queryAtTimestamp(metadata, timestampMs)
queryAtSnapshotId(metadata, snapshotId)
queryAtRef(metadata, refName)

// Partitions
createPartitionSpecBuilder(schema)
createPartitionPruner(spec, schema)
getPartitionPath(partitionData, spec)

// Bloom Filters
createBloomFilterManager(config)
createBloomFilter(path, columnName, expectedItems, falsePositiveRate?)

// Tiering
createR2TieringManager(config)
```

## Storage Layout

```
r2://bucket/warehouse/events/
├── metadata/
│   ├── v1.metadata.json
│   └── version-hint.text
├── data/
│   ├── created_at_day=19750/region=us-west/
│   │   └── 00000-0-abc123.parquet
│   └── created_at_day=19751/region=us-east/
│       └── 00001-0-def456.parquet
└── manifests/
    └── snap-1234567890-m0.avro
```

## Related Packages

- [@db4/do](../do) - Durable Object implementation (CDC source)
- [@db4/storage](../storage) - Three-tier storage abstraction
- [@db4/vortex](../vortex) - 2MB columnar blob engine

## License

MIT
