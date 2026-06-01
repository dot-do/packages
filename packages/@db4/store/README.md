---
name: "@db4/store"
version: 0.1.2
description: Durable Object storage layer for IceType schemas - document store, sharding, relations, and CDC streaming to Iceberg
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - iceberg
  - cloudflare
  - workers
  - durable-objects
  - sqlite
  - document-store
  - sharding
  - icetype
  - cdc
downloads:
  monthly: 39
published: "2026-01-23T17:20:52.120Z"
updated: "2026-01-23T17:20:52.466Z"
---

# @db4/icetype

[![npm version](https://img.shields.io/npm/v/icetype.svg)](https://www.npmjs.com/package/icetype)
[![license](https://img.shields.io/npm/l/icetype.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/icetype), [npm](https://www.npmjs.com/package/icetype))

**Durable Object storage layer** for Cloudflare Workers with IceType schemas, document storage, relations, CDC streaming, and Iceberg/Parquet integration.

## Architecture: packages/icetype vs icetype/ submodule

This package (`@db4/icetype`) is the **Durable Object integration layer** that bridges the IceType schema language to Cloudflare Workers runtime:

```
icetype/                    <-- Git submodule: @icetype/core
  packages/core/            <-- Pure IceType schema language (parser, validation, types)
                                - No Cloudflare dependencies
                                - Compiles to multiple backends (Iceberg, DuckDB, ClickHouse, etc.)
                                - Published as @icetype/core

packages/icetype/           <-- THIS PACKAGE: @db4/icetype
                                - Durable Object storage implementation
                                - Re-exports @icetype/core parser for convenience
                                - Adds DO-specific: CDC, Parquet, tiered storage, sharding
                                - Depends on @icetype/core
```

### Why two packages?

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `@icetype/core` | Universal schema language - parse, validate, compile | None (pure TypeScript) |
| `@db4/icetype` | Cloudflare Workers runtime - store, query, stream | `@icetype/core`, `@cloudflare/workers-types` |

**Use `@icetype/core`** when you need schema parsing without a runtime (e.g., CLI tools, code generation, type inference).

**Use `@db4/icetype`** when you need a complete Durable Object database with IceType schemas.

## Description

`@db4/icetype` provides a unified Durable Object-based database implementation for Cloudflare Workers. It combines the IceType schema language (from `@icetype/core`) for concise type definitions, batched document storage with efficient bin-packing, a universal junction table for relations, native SQLite indexing, and CDC streaming to Iceberg format.

## Features

- **IceType Schema Language**: Concise schema definitions with type inference, modifiers, and relation operators
- **Batched Document Storage**: Efficient bin-packing into 64/128/256-document batches for cost optimization
- **Relations via `_rels` Table**: Universal junction table supporting forward, backward, and fuzzy relations
- **Native SQLite Indexes**: Automatic field extraction and indexing
- **CDC Streaming**: Change Data Capture logging for Iceberg integration
- **Iceberg/Parquet Generation**: Convert schemas to Apache Iceberg metadata and Parquet schemas
- **Zone Maps & Bloom Filters**: Statistics and probabilistic indexes for query optimization

## Installation

```bash
npm install @db4/icetype
```

## Usage

Basic document storage with IceType:

```typescript
import { createIceTypeDO, parseSchema } from '@db4/icetype';

// In your Durable Object class
export class MyDO {
  private store;

  constructor(state: DurableObjectState) {
    this.store = createIceTypeDO(state.storage.sql, {
      shardId: 'shard-1',
      enableCDC: true,
    });
  }

  async createUser(data: { email: string; name: string }) {
    return await this.store.create('User', {
      $id: crypto.randomUUID(),
      $type: 'User',
      email: data.email,
      name: data.name,
    });
  }
}
```

### Defining Schemas with IceType

```typescript
import { parseSchema, validateSchema } from '@db4/icetype';

// Define a schema using IceType syntax
const userSchema = parseSchema({
  $type: 'User',
  $partitionBy: ['id'],
  $index: [['email'], ['createdAt']],

  id: 'uuid!',           // Required, unique UUID
  email: 'string#',      // Indexed string
  name: 'string',        // Regular string
  age: 'int?',           // Optional integer
  status: 'string = "active"',  // Default value
  posts: '<- Post.author[]',    // Backward relation
});

// Validate the schema
const result = validateSchema(userSchema);
if (!result.valid) {
  console.error('Schema errors:', result.errors);
}
```

### IceType Syntax Reference

**Field Modifiers:**
- `!` - Required/unique (e.g., `uuid!`)
- `#` - Indexed (e.g., `string#`)
- `?` - Optional/nullable (e.g., `int?`)
- `[]` - Array type (e.g., `string[]`)

**Primitive Types:**
- `string`, `text` - String values
- `int`, `long`, `bigint` - Integer values
- `float`, `double` - Floating point values
- `bool`, `boolean` - Boolean values
- `uuid` - UUID strings
- `timestamp`, `date`, `time` - Temporal values
- `json` - Arbitrary JSON
- `binary` - Binary data
- `decimal(precision,scale)` - Decimal numbers

**Relation Operators:**
- `-> Type` - Forward relation (direct foreign key)
- `~> Type` - Fuzzy forward (AI-powered matching)
- `<- Type.field` - Backward relation (reverse reference)
- `<~ Type.field` - Fuzzy backward

**Directives:**
- `$type` - Schema name
- `$partitionBy` - Partition fields
- `$index` - Composite indexes
- `$fts` - Full-text search fields
- `$vector` - Vector index fields

### Type Inference

```typescript
import { inferType } from '@db4/icetype';

inferType('hello');                    // 'string'
inferType(42);                         // 'int'
inferType(3.14);                       // 'float'
inferType(true);                       // 'bool'
inferType('2024-01-15');               // 'date'
inferType('2024-01-15T10:30:00Z');     // 'timestamp'
inferType('550e8400-e29b-41d4-a716-446655440000'); // 'uuid'
inferType([1, 2, 3]);                  // 'int[]'
inferType({ foo: 'bar' });             // 'json'
```

### Relations

```typescript
// Create a forward relation
store.createRelation(
  'Post', 'post-123',      // from
  'author',                 // relation name
  'User', 'user-456',      // to
);

// Create bidirectional relation
const [forward, backward] = store.createBidirectionalRelation(
  'Post', 'post-123', 'author',
  'User', 'user-456', 'posts'
);

// Query relations
const userPosts = store.getIncomingRelations('User', 'user-456', 'author');
const postAuthor = store.getOutgoingRelations('Post', 'post-123', 'author');
```

### CDC (Change Data Capture)

```typescript
// Get unsynced changes
const changes = store.getUnsyncedChanges(100);

// Process and mark as synced
for (const change of changes) {
  await streamToIceberg(change);
}
store.markSynced(changes.map(c => c.sequenceId));

// Get CDC cursor for streaming
const cursor = store.getCDCCursor();
```

### Iceberg Metadata Generation

```typescript
import {
  generateIcebergMetadata,
  generateParquetSchema,
  generateParquetSchemaString,
} from '@db4/icetype';

// Generate Iceberg table metadata from schema
const metadata = generateIcebergMetadata(
  userSchema,
  's3://my-bucket/tables/users',
  { 'owner': 'data-team' }
);

// Generate Parquet schema
const parquetSchema = generateParquetSchema(userSchema);

// Get Parquet schema as string (for debugging)
const schemaString = generateParquetSchemaString(userSchema);
console.log(schemaString);
// Output:
// message User {
//   REQUIRED BYTE_ARRAY $id (UTF8);
//   REQUIRED BYTE_ARRAY $type (UTF8);
//   REQUIRED INT32 $version (INT_32);
//   ...
// }
```

### Configuration Presets

```typescript
import {
  createConfig,
  PRESET_FINANCIAL,
  PRESET_ANALYTICS,
  PRESET_DOCUMENT_STORE,
  PRESET_REALTIME,
} from '@db4/icetype';

// Use a preset with overrides
const config = createConfig('ANALYTICS', {
  sharding: { shardCount: 64 },
});

// Available presets:
// - FINANCIAL: Maximum durability, comprehensive indexing
// - ANALYTICS: High throughput, eventual consistency
// - DOCUMENT_STORE: Balanced, with FTS and vector search
// - REALTIME: Low latency, minimal buffering
```

### Zone Maps and Bloom Filters

```typescript
import {
  createZoneMapManager,
  createBloomFilterManager,
} from '@db4/icetype';

// Zone maps for min/max statistics
const zoneMaps = createZoneMapManager(db);
zoneMaps.initialize();

// Update statistics for a batch
zoneMaps.updateStatsForBatch('users', 'batch-123', documents);

// Check if batch can be pruned
const pruneResult = zoneMaps.canPruneBatch('users', 'batch-123', {
  field: 'age',
  operator: '$gt',
  value: 30,
});

// Bloom filters for existence checks
const bloom = createBloomFilterManager(db);
bloom.initialize();

// Add value to filter
bloom.addValue('users', 'email', 'alice@myapp.com/api');

// Check if value might exist
const mightExist = bloom.mightContain('users', 'email', 'alice@myapp.com/api');
```

## API Reference

### Core Classes

#### `IceTypeDO`
Main document store class with full CRUD operations.

```typescript
class IceTypeDO {
  // Initialization
  initialize(): void;

  // Document operations
  create(collection: string, document: Document): Promise<StoredDocument>;
  get(collection: string, docId: string): Promise<StoredDocument | null>;
  update(collection: string, docId: string, updates: Partial<Document>): Promise<StoredDocument | null>;
  delete(collection: string, docId: string): Promise<boolean>;
  query(collection: string, options?: QueryOptions): Promise<QueryResult>;

  // Schema operations
  registerSchema(definition: Record<string, unknown>): IceTypeSchema;
  getSchema(name: string): IceTypeSchema | null;
  listSchemas(): Array<{ name: string; version: number; updatedAt: number }>;
  discoverSchema(collection: string): DiscoveredSchema | null;

  // Relation operations
  createRelation(from: string, fromId: string, relName: string, to: string, toId: string, options?: RelationOptions): StoredRelation;
  getOutgoingRelations(collection: string, docId: string, relName?: string): StoredRelation[];
  getIncomingRelations(collection: string, docId: string, relName?: string): StoredRelation[];

  // CDC operations
  getUnsyncedChanges(limit?: number): CDCLogEntry[];
  markSynced(sequenceIds: number[]): void;
  getCDCCursor(): CDCCursor;

  // Statistics
  getCollectionStats(collection: string): CollectionStats;
  getShardStats(): ShardStats;
}
```

#### `IceTypeParser`
Schema parser for IceType definitions.

```typescript
class IceTypeParser {
  parse(definition: Record<string, unknown>): IceTypeSchema;
  parseField(fieldDef: string): FieldDefinition;
  parseRelation(relDef: string): RelationDefinition;
  parseDirectives(definition: Record<string, unknown>): SchemaDirectives;
  validateSchema(schema: IceTypeSchema): ValidationResult;
}
```

#### `IcebergMetadataGenerator`
Generates Apache Iceberg table metadata from IceType schemas.

```typescript
class IcebergMetadataGenerator {
  generateSchema(schema: IceTypeSchema): IcebergSchema;
  generatePartitionSpec(schema: IceTypeSchema, icebergSchema: IcebergSchema): IcebergPartitionSpec;
  generateSortOrder(schema: IceTypeSchema, icebergSchema: IcebergSchema): IcebergSortOrder;
  generateTableMetadata(schema: IceTypeSchema, options: { location: string }): IcebergTableMetadata;
}
```

#### `ParquetSchemaGenerator`
Generates Apache Parquet schemas from IceType schemas.

```typescript
class ParquetSchemaGenerator {
  generateSchema(schema: IceTypeSchema): ParquetSchema;
  toSchemaString(schema: ParquetSchema): string;
}
```

### Utility Functions

```typescript
// Schema parsing
parseSchema(definition: Record<string, unknown>): IceTypeSchema;
parseField(fieldDef: string): FieldDefinition;
parseRelation(relDef: string): RelationDefinition;
validateSchema(schema: IceTypeSchema): ValidationResult;

// Type inference
inferType(value: unknown): string;
tokenize(input: string): Token[];

// Generation
generateIcebergMetadata(schema: IceTypeSchema, location: string, properties?: Record<string, string>): IcebergTableMetadata;
generateParquetSchema(schema: IceTypeSchema): ParquetSchema;
generateParquetSchemaString(schema: IceTypeSchema): string;
documentToParquetRow(document: Record<string, unknown>, schema: ParquetSchema): Record<string, unknown>;

// Configuration
createConfig(preset?: PresetName, overrides?: Partial<IceTypeDOConfig>): IceTypeDOConfig;
mergeConfig(base: IceTypeDOConfig, overrides: Partial<IceTypeDOConfig>): IceTypeDOConfig;
validateConfig(config: IceTypeDOConfig): string[];

// Bloom filters
createBloomFilter(expectedItems: number, falsePositiveRate: number): BloomFilter;
bloomAdd(filter: BloomFilter, value: string): void;
bloomMightContain(filter: BloomFilter, value: string): boolean;
bloomMerge(a: BloomFilter, b: BloomFilter): BloomFilter;
```

## Type Exports

The package exports comprehensive TypeScript types:

```typescript
// Document types
Document, StoredDocument, DocumentBatch

// Schema types
IceTypeSchema, FieldDefinition, RelationDefinition, SchemaDirectives
PrimitiveType, FieldModifier, RelationOperator

// Query types
QueryFilter, QueryOptions, QueryResult, QueryPlan
FilterOperator, SortDirection, SortSpec

// CDC types
CDCOperation, CDCLogEntry, CDCCursor, CDCBatch

// Iceberg types
IcebergSchema, IcebergField, IcebergType, IcebergTableMetadata
IcebergPartitionSpec, IcebergSortOrder, IcebergSnapshot

// Parquet types
ParquetSchema, ParquetField, ParquetPrimitiveType
ParquetRepetition, ParquetLogicalType

// Configuration types
IceTypeDOConfig, PipelineConfig, IndexesConfig, ShardingConfig
```

## API

IceType schema parsing and Durable Object storage:

```typescript
function createIceTypeDO(state: DurableObjectState): IceTypeStore;
function parseSchema(schema: string): ParsedSchema;

interface IceTypeStore {
  put(id: string, data: Document): Promise<void>;
  get(id: string): Promise<Document | null>;
  query(filter: Filter): Promise<Document[]>;
  delete(id: string): Promise<boolean>;
}
```

## Performance Benchmarks

The package includes comprehensive benchmarks. Run with:

```bash
npm run benchmark
```

Actual results on Apple Silicon (M-series):

| Operation | Throughput |
|-----------|------------|
| Schema parsing (simple) | ~1,180,000 ops/sec |
| Schema parsing (complex) | ~255,000 ops/sec |
| Field parsing | ~5,300,000 - 6,400,000 ops/sec |
| Relation parsing | ~5,500,000 - 9,500,000 ops/sec |
| Type inference | ~13,600,000 - 131,600,000 ops/sec |
| Iceberg metadata generation | ~350,000 - 414,000 ops/sec |
| Parquet schema generation | ~1,400,000 - 3,500,000 ops/sec |
| Bloom filter operations | ~1,400,000 - 2,400,000 ops/sec |

**Performance Highlights:**
- Type inference is extremely fast, averaging ~47M ops/sec
- Schema parsing handles simple schemas at over 1M ops/sec
- Parquet schema generation averages ~1.5M ops/sec
- All operations complete in sub-millisecond time

## Related Packages

- [@db4/schema](../schema) - High-level IceType schema compiler
- [@db4/core](../core) - Core types and utilities
- [@db4/do](../do) - Durable Object implementation

## See Also

- [@db4/iceberg](../iceberg) - CDC streaming to Apache Iceberg
- [@db4/vortex](../vortex) - Columnar query engine

## License

MIT
