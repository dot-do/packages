---
name: "@dotdo/iceberg"
version: 0.1.1
description: Apache Iceberg table format types and utilities for pg_lake
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - iceberg
  - apache-iceberg
  - parquet
  - data-lake
  - pg_lake
  - postgresql
  - time-travel
  - cloudflare
  - workers
downloads:
  monthly: 128
published: "2026-01-22T15:58:38.749Z"
updated: "2026-01-24T15:48:57.830Z"
---

# @dotdo/iceberg

**Apache Iceberg table format for Cloudflare Workers.**

TypeScript implementation of the Apache Iceberg specification for building data lakehouses on Cloudflare R2.

```typescript
import { MetadataBuilder, SchemaBuilder } from '@dotdo/iceberg'

// Define schema
const schema = new SchemaBuilder()
  .addField({ name: 'id', type: 'long', required: true })
  .addField({ name: 'name', type: 'string' })
  .addField({ name: 'created_at', type: 'timestamptz' })
  .build()

// Create table metadata
const metadata = new MetadataBuilder({ location: 's3://bucket/table' })
  .setSchema(schema)
  .setPartitionSpec([{ sourceId: 3, transform: 'day', fieldId: 1000 }])
  .build()
```

## Why Iceberg?

You have data that grows. Users need to query it efficiently. You want time-travel.

Traditional approaches:
- **Raw JSON files** - No schema evolution. No efficient queries. No time-travel.
- **SQLite/PGLite** - Single-file limits. No column pruning. Backups are snapshots.
- **External data warehouses** - Latency. Cost. Vendor lock-in.

Iceberg gives you:
- **Schema evolution** - Add columns, rename fields, widen types
- **Time-travel queries** - Query any historical snapshot
- **Partition pruning** - Skip irrelevant data files
- **Column pruning** - Read only the columns you need
- **ACID transactions** - Concurrent writes without corruption

## What This Package Provides

This is the **type system and builder layer** for Iceberg tables. It provides:

| Module | Purpose |
|--------|---------|
| **Types** | Complete TypeScript types for Iceberg spec v2 |
| **Schema** | Schema builder with evolution and validation |
| **Metadata** | Table metadata builder with snapshot management |
| **Manifest** | Manifest and manifest list builders |
| **Catalog** | Catalog interface for table discovery |
| **WAL** | WAL-to-Iceberg transformation utilities |

This package does NOT include:
- Parquet file reading/writing (use `@dotdo/parquet`)
- Query execution (use `@dotdo/pg-lake`)
- Storage backends (use R2 directly or via `@dotdo/pg-lake`)

## Installation

```bash
npm install @dotdo/iceberg
```

## Quick Start

### Building a Schema

```typescript
import { SchemaBuilder } from '@dotdo/iceberg'

const schema = new SchemaBuilder()
  .addField({ name: 'id', type: 'long', required: true })
  .addField({ name: 'name', type: 'string' })
  .addField({ name: 'email', type: 'string' })
  .addField({ name: 'metadata', type: { type: 'map', keyType: 'string', valueType: 'string' } })
  .addField({ name: 'tags', type: { type: 'list', elementType: 'string' } })
  .addField({ name: 'created_at', type: 'timestamptz', required: true })
  .build()
```

### Schema Evolution

```typescript
import { SchemaEvolution } from '@dotdo/iceberg'

const evolution = new SchemaEvolution(existingSchema)

// Add new columns
evolution.addColumn({ name: 'status', type: 'string' })

// Rename columns (readers with old schema still work)
evolution.renameColumn('email', 'email_address')

// Widen types (int -> long, float -> double)
evolution.updateColumnType('count', 'long')

const newSchema = evolution.apply()
```

### Creating Table Metadata

```typescript
import { MetadataBuilder, createPartitionSpec, createSortOrder } from '@dotdo/iceberg'

const metadata = new MetadataBuilder({
  location: 's3://my-bucket/warehouse/events',
  tableUuid: crypto.randomUUID(),
})
  .setSchema(schema)
  .setPartitionSpec([
    { sourceId: 6, transform: 'day', fieldId: 1000, name: 'created_day' }
  ])
  .setSortOrder([
    { sourceId: 1, direction: 'asc', nullOrder: 'nulls-last', transform: 'identity' }
  ])
  .setProperties({
    'write.format.default': 'parquet',
    'write.parquet.compression-codec': 'zstd',
  })
  .build()
```

### Building Manifests

```typescript
import { ManifestBuilder, ManifestListBuilder } from '@dotdo/iceberg'

// Build a manifest for data files
const manifest = new ManifestBuilder({ schema, partitionSpec })
  .addEntry({
    status: 'added',
    dataFile: {
      content: 'data',
      filePath: 'data/part-00000.parquet',
      fileFormat: 'PARQUET',
      recordCount: 10000,
      fileSizeInBytes: 1024 * 1024,
    }
  })
  .build()

// Build a manifest list for a snapshot
const manifestList = new ManifestListBuilder({ snapshotId: 1n })
  .addManifest({
    manifestPath: 'metadata/manifest-1.avro',
    manifestLength: 4096,
    partitionSpecId: 0,
    addedFilesCount: 1,
    addedRowsCount: 10000,
  })
  .build()
```

### WAL to Iceberg

Transform PostgreSQL WAL records into Iceberg format for time-travel queries:

```typescript
import { walRecordToRow, WAL_TABLE_SCHEMA } from '@dotdo/iceberg/wal'

const walRecord = {
  lsn: 12345678n,
  operation: 'INSERT',
  schema: 'public',
  table: 'users',
  newRow: { id: 1, name: 'Alice' },
  timestamp: Date.now(),
  doId: 'do-abc123',
}

// Convert to Iceberg row format
const row = walRecordToRow(walRecord)

// WAL_TABLE_SCHEMA is the Iceberg schema for WAL tables
// Use it to create a metadata builder for WAL storage
```

## API Reference

### Schema Module

```typescript
import {
  SchemaBuilder,      // Build schemas incrementally
  SchemaEvolution,    // Evolve existing schemas
  validateSchema,     // Validate schema correctness
  findFieldById,      // Find field by ID
  findFieldByName,    // Find field by name
} from '@dotdo/iceberg'
```

### Types Module

```typescript
import type {
  // Core types
  IcebergSchema,
  IcebergField,
  IcebergType,
  IcebergPrimitiveType,

  // Partitioning
  IcebergPartitionSpec,
  IcebergPartitionField,
  IcebergTransform,

  // Sorting
  IcebergSortOrder,
  IcebergSortField,

  // Snapshots
  IcebergSnapshot,
  IcebergSnapshotSummary,
  IcebergTableMetadata,

  // Manifests
  IcebergManifestFile,
  IcebergManifestEntry,
  IcebergDataFile,
} from '@dotdo/iceberg'
```

### Metadata Module

```typescript
import {
  MetadataBuilder,           // Build table metadata
  generateMetadataFileName,  // Generate v123.metadata.json names
  generateManifestFileName,  // Generate manifest file names
  generateDataFileName,      // Generate data file names
} from '@dotdo/iceberg'
```

### Catalog Module

```typescript
import {
  BaseCatalog,              // Abstract catalog base class
  type ICatalog,            // Catalog interface
  type TableIdentifier,     // { namespace: string[], name: string }
  type NamespaceIdentifier, // string[]

  // Commit operations
  createAppendCommit,       // Create append commit request
  assertRefSnapshotId,      // Requirement for optimistic locking
} from '@dotdo/iceberg'
```

## Supported Types

| Primitive | Description |
|-----------|-------------|
| `boolean` | True or false |
| `int` | 32-bit signed integer |
| `long` | 64-bit signed integer |
| `float` | 32-bit IEEE 754 floating point |
| `double` | 64-bit IEEE 754 floating point |
| `decimal(P,S)` | Arbitrary-precision decimal |
| `date` | Calendar date |
| `time` | Time of day (microsecond precision) |
| `timestamp` | Timestamp without timezone |
| `timestamptz` | Timestamp with timezone |
| `string` | UTF-8 string |
| `uuid` | UUID |
| `fixed(L)` | Fixed-length byte array |
| `binary` | Variable-length byte array |

| Nested | Description |
|--------|-------------|
| `struct` | Tuple of typed fields |
| `list` | Collection of elements |
| `map` | Key-value pairs |

## Supported Transforms

| Transform | Description | Example |
|-----------|-------------|---------|
| `identity` | Value unchanged | `identity` |
| `bucket[N]` | Hash mod N | `bucket[16]` |
| `truncate[W]` | Truncate to width | `truncate[10]` |
| `year` | Extract year | `year` |
| `month` | Extract year-month | `month` |
| `day` | Extract year-month-day | `day` |
| `hour` | Extract year-month-day-hour | `hour` |
| `void` | Always null | `void` |

## Part of the postgres.do Ecosystem

| Package | Description |
|---------|-------------|
| [`@dotdo/pg-lake`](../pglake) | Data lakehouse on R2 |
| [`@dotdo/parquet`](../parquet) | Parquet file support |
| [`@dotdo/postgres`](../postgres) | PostgreSQL server |

## Links

- [Apache Iceberg Spec](https://iceberg.apache.org/spec/)
- [Documentation](https://postgres.do/docs/iceberg)
- [GitHub](https://github.com/dot-do/postgres)

## License

MIT
