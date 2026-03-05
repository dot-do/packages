---
name: "@db4/vortex"
version: 0.1.2
description: Native columnar query engine with 100x faster random access than Parquet
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - vortex
  - columnar
  - cloudflare
  - workers
  - durable-objects
  - encoding
downloads:
  monthly: 100
published: "2026-01-20T11:31:56.607Z"
updated: "2026-01-23T17:20:56.166Z"
---

# @db4/vortex

([GitHub](https://github.com/dot-do/db4/tree/main/packages/vortex), [npm](https://www.npmjs.com/package/@db4/vortex))

**Edge analytics is impossible.**

That's what everyone says. Cloudflare Workers cap at 128MB memory. Durable Objects max at 1GB. Parquet takes 100ms+ just to parse metadata. Need aggregations over millions of rows? Ship everything to BigQuery and wait.

Your users watch loading spinners.

@db4/vortex breaks this barrier. A columnar query engine built for edge constraints: 2MB blocks that fit in DO SQLite, zone maps that skip 90% of data unread, vectorized aggregations delivering sub-100ms on millions of rows.

**Real-time analytics. At the edge. No warehouse.**

## Installation

```bash
npm install @db4/vortex
```

## Three Steps to Edge Analytics

### 1. Define your schema

```typescript
import { createVortexEngine, VortexType } from '@db4/vortex';

const engine = createVortexEngine();

engine.createTable('events', {
  fields: [
    { name: 'timestamp', type: VortexType.TIMESTAMP_MS, nullable: false },
    { name: 'userId', type: VortexType.UTF8, nullable: false },
    { name: 'action', type: VortexType.UTF8, nullable: false },
    { name: 'duration', type: VortexType.FLOAT64, nullable: true },
  ],
});
```

### 2. Insert data (auto-encoded columnar)

```typescript
engine.insert('events', [
  { timestamp: Date.now(), userId: 'user_123', action: 'click', duration: 0.5 },
  { timestamp: Date.now(), userId: 'user_456', action: 'scroll', duration: 2.3 },
  // ... millions more
]);
```

### 3. Query with zone-map pruning

```typescript
const result = engine.query('events', {
  filter: {
    op: 'and',
    predicates: [
      { column: 'action', op: 'eq', value: 'click' },
      { column: 'timestamp', op: 'ge', value: Date.now() - 86400000 },
    ],
  },
  groupBy: {
    columns: ['userId'],
    aggregates: [
      { func: 'count', alias: 'clickCount' },
      { func: 'avg', column: 'duration', alias: 'avgDuration' },
    ],
  },
});

console.log(result.stats);
// { blocksScanned: 5, blocksSkipped: 95, rowsScanned: 500000, executionTimeMs: 47 }
```

## What Makes Vortex Different

### Zone Maps: Skip What You Don't Need

Every block stores min/max per column. Before scanning any row, the engine checks if a block could match:

```typescript
import { canPruneWithZoneMap } from '@db4/vortex';

// Zone map: { name: 'timestamp', min: jan1, max: jan15, nullCount: 0 }
// Query: WHERE timestamp > jan20

const zoneMapColumn = { name: 'timestamp', min: jan1, max: jan15, nullCount: 0 };
const canSkip = canPruneWithZoneMap(zoneMapColumn, 'gt', jan20);
// true - max is jan15, so timestamp > jan20 never matches
```

Time-series queries routinely skip 90%+ of blocks. Scanning 1 million rows instead of 10 million.

### Cascading Encodings: Automatic Compression

Vortex selects optimal encoding per column:

```typescript
import { selectEncoding, VortexType, VortexEncoding } from '@db4/vortex';

// Low-cardinality strings -> Dictionary
selectEncoding(['pending', 'active', 'completed', /* ...repeat */], VortexType.UTF8);
// { encoding: DICTIONARY, estimatedCompressionRatio: 47.3 }

// Sequential integers -> Delta
selectEncoding([1001, 1002, 1003, 1004], VortexType.INT64);
// { encoding: DELTA, estimatedCompressionRatio: 8.2 }

// Repeated values -> Run-length
selectEncoding(['US', 'US', 'US', 'EU', 'EU', 'EU'], VortexType.UTF8);
// { encoding: RLE, estimatedCompressionRatio: 156.0 }
```

| Data Pattern | Encoding | Compression |
|--------------|----------|-------------|
| Low cardinality | `DICTIONARY` | 10-100x |
| Repeated values | `RLE` | 50-1000x |
| Small integers | `BITPACKED` | 2-8x |
| Sequential IDs | `DELTA` | 4-10x |
| Mostly nulls | `SPARSE` | 10-100x |

### Vectorized Aggregations

8-way unrolled loops optimized for V8 TurboFan:

```typescript
import { vectorBatchAggregate, TDigest } from '@db4/vortex';

const prices = new Float64Array(1_000_000);

// Single-pass: sum, count, min, max
const stats = vectorBatchAggregate(prices);
// { sum: 1234567.89, count: 1000000, min: 0.01, max: 999.99 }

// Streaming percentiles, bounded memory
const digest = new TDigest();
for (const value of millionsOfValues) {
  digest.add(value);
}
const p99 = digest.quantile(0.99);  // O(1) memory, ~1% accuracy
```

### 2MB Block Constraint

Automatic management of DO's 2MB BLOB limit:

```typescript
import {
  splitIntoChunks,
  writeChunk,
  VORTEX_BLOCK_MAX_SIZE,
  VortexType,
} from '@db4/vortex';

// Auto-split large datasets
const chunks = splitIntoChunks({
  name: 'events',
  type: VortexType.UTF8,
  values: millionsOfEvents,
  maxChunkSize: VORTEX_BLOCK_MAX_SIZE,  // 2MB
});

// Store in DO SQLite
for (const chunk of chunks) {
  const bytes = writeChunk(chunk);  // Always <= 2MB
  await doStorage.put(`block:${chunk.header.sequenceNumber}`, bytes);
}
```

## API Reference

### VortexEngine

High-level query engine for OLAP workloads.

```typescript
import { createVortexEngine } from '@db4/vortex';

const engine = createVortexEngine({
  maxMemoryBytes: 256 * 1024 * 1024,
  enableParallel: false,
  enableCache: true,
  cacheTtlMs: 60000,
  batchSize: 10000,
});

// Table management
engine.createTable(name, schema);
engine.dropTable(name);
engine.listTables();
engine.getSchema(name);

// Ingestion
engine.insert(table, rows);
engine.insertBlock(table, block);

// Querying
engine.query(table, options);
engine.aggregate(table, aggregates, filter?);
engine.count(table, filter?);
engine.scan(table, options);  // Generator for streaming
engine.scanColumns(table, columns, filter?);

// Statistics
engine.getTableStats(table);
engine.getColumnStats(table, column);
engine.clearCache();
```

### Query Options

```typescript
const result = engine.query('events', {
  projection: ['userId', 'action'],  // SELECT
  filter: {                           // WHERE
    op: 'and',
    predicates: [
      { column: 'action', op: 'eq', value: 'click' },
      { column: 'timestamp', op: 'between', range: [start, end] },
    ],
  },
  orderBy: [{ column: 'timestamp', direction: 'desc' }],
  limit: 100,
  offset: 0,
  groupBy: {
    columns: ['userId'],
    aggregates: [
      { func: 'count', alias: 'total' },
      { func: 'sum', column: 'amount', alias: 'revenue' },
    ],
  },
});
```

### Filter Operators

```typescript
// Comparison
{ column: 'price', op: 'eq', value: 100 }
{ column: 'price', op: 'ne', value: 0 }
{ column: 'price', op: 'lt', value: 50 }
{ column: 'price', op: 'le', value: 50 }
{ column: 'price', op: 'gt', value: 100 }
{ column: 'price', op: 'ge', value: 100 }

// Range
{ column: 'price', op: 'between', range: [10, 100] }
{ column: 'status', op: 'in', values: ['active', 'pending'] }

// Pattern matching
{ column: 'email', op: 'like', pattern: '%@example.com' }

// Null checks
{ column: 'deletedAt', op: 'is_null' }
{ column: 'email', op: 'is_not_null' }

// Compound predicates
{
  op: 'and',
  predicates: [
    { column: 'price', op: 'gt', value: 0 },
    { op: 'or', predicates: [
      { column: 'status', op: 'eq', value: 'sale' },
      { column: 'featured', op: 'eq', value: true },
    ]},
  ],
}
```

### Aggregation Functions

```typescript
engine.aggregate('sales', [
  { func: 'count', alias: 'totalOrders' },
  { func: 'count_distinct', column: 'userId', alias: 'uniqueCustomers' },
  { func: 'sum', column: 'amount', alias: 'revenue' },
  { func: 'avg', column: 'amount', alias: 'avgOrderValue' },
  { func: 'min', column: 'amount', alias: 'minOrder' },
  { func: 'max', column: 'amount', alias: 'maxOrder' },
  { func: 'variance', column: 'amount', alias: 'amountVariance' },
  { func: 'stddev', column: 'amount', alias: 'amountStdDev' },
  { func: 'median', column: 'amount', alias: 'medianOrder' },
  { func: 'percentile', column: 'amount', alias: 'p95', options: { percentile: 0.95 } },
]);
```

### Low-Level Block API

Direct columnar storage control:

```typescript
import {
  createBlock,
  parseBlock,
  serializeBlock,
  VortexType,
} from '@db4/vortex';

const block = createBlock({
  columns: [
    { name: 'id', type: VortexType.INT64, values: [1, 2, 3], enableBloom: true },
    { name: 'name', type: VortexType.UTF8, values: ['Alice', 'Bob', 'Carol'] },
    { name: 'score', type: VortexType.FLOAT64, values: [95.5, 87.2, 92.1] },
  ],
  enableBloomFilters: true,
  bloomFilterFPR: 0.01,
});

console.log(block.header.rowCount);  // 3
console.log(block.zoneMap);          // { columns: [{ name: 'score', min: 87.2, max: 95.5 }] }

const bytes = serializeBlock(block);
const restored = parseBlock(bytes);
```

### Chunk API

```typescript
import {
  createChunk,
  writeChunk,
  splitIntoChunks,
  mergeChunks,
  ChunkWriter,
  ChunkReader,
  estimateChunkSize,
  VortexType,
} from '@db4/vortex';

// Streaming writes with auto-chunking
const writer = new ChunkWriter('scores', VortexType.FLOAT64, {
  maxChunkSize: 2 * 1024 * 1024,
  onFlush: (chunk) => console.log(`Flushed ${chunk.header.sequenceNumber}`),
});

writer.append([1.0, 2.0, 3.0]);
writer.append([4.0, 5.0, 6.0]);
const finalChunk = writer.finish();

// Streaming reads
const reader = new ChunkReader(chunk, { skipNulls: true });
for (const value of reader) {
  process(value);
}

// Size estimation
const estimate = estimateChunkSize({ type: VortexType.FLOAT64, values: myArray });
console.log(estimate.fitsInSingleChunk);
```

### Zone Map API

```typescript
import {
  createZoneMap,
  ZoneMapBuilder,
  mergeZoneMaps,
  canPruneWithZoneMap,
  ZoneMap,
  VortexType,
} from '@db4/vortex';

const zoneMap = createZoneMap({
  name: 'price',
  type: VortexType.FLOAT64,
  values: [10.5, 20.3, 15.7, 12.1, null, 8.9],
});
// { name: 'price', min: 8.9, max: 20.3, nullCount: 1, rowCount: 6 }

// Incremental building
const builder = new ZoneMapBuilder('timestamp', VortexType.TIMESTAMP_MS);
builder.append([Date.now(), Date.now() + 1000]);
builder.append([Date.now() + 2000]);
const finalZoneMap = builder.getZoneMap();

// Pruning check
const canPrune = canPruneWithZoneMap(
  { name: 'price', min: 8.9, max: 20.3, nullCount: 0 },
  'gt',
  50
);
// true - max 20.3, so price > 50 never matches

// Merge across blocks
const merged = mergeZoneMaps(zoneMap1, zoneMap2);
```

### Bloom Filter API

```typescript
import { BloomFilterImpl } from '@db4/vortex';

const bloom = new BloomFilterImpl(10000, 0.01);  // 10K items, 1% FPR
bloom.add('user_123');
bloom.add('user_456');

bloom.mayContain('user_123');  // true (maybe present)
bloom.mayContain('user_999');  // false (definitely absent)
```

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Point lookup (bloom) | <1ms | Bloom + zone map |
| Range scan (1M rows) | 10-50ms | Zone map pruning |
| Aggregation (1M rows) | 20-80ms | Vectorized |
| GROUP BY (1M rows, 1K groups) | 50-150ms | Hash aggregation |
| Percentile (streaming) | <10ms | T-Digest |

Benchmarked on Cloudflare Workers with Durable Object SQLite.

## With Vortex

- **Real-time dashboards** on millions of events, sub-100ms
- **Per-user analytics** colocated in Durable Objects
- **Time-series queries** without a central warehouse
- **Parquet-like compression** with 100x faster random access

## Without Vortex

- Every analytics query ships to BigQuery/Snowflake (200ms+ latency)
- Pre-computed aggregates mean stale data
- "Real-time" means "within the hour"
- Separate infrastructure for OLTP and OLAP

## Data Types

```typescript
enum VortexType {
  NULL = 'null',
  BOOL = 'bool',
  INT8 = 'i8',
  INT16 = 'i16',
  INT32 = 'i32',
  INT64 = 'i64',
  UINT8 = 'u8',
  UINT16 = 'u16',
  UINT32 = 'u32',
  UINT64 = 'u64',
  FLOAT32 = 'f32',
  FLOAT64 = 'f64',
  UTF8 = 'utf8',
  BINARY = 'binary',
  TIMESTAMP_MS = 'timestamp_ms',
  TIMESTAMP_US = 'timestamp_us',
  DATE32 = 'date32',
  TIME64 = 'time64',
  LIST = 'list',
  STRUCT = 'struct',
  MAP = 'map',
}
```

## Encoding Types

```typescript
enum VortexEncoding {
  PRIMITIVE = 'primitive',    // Uncompressed, Arrow-compatible
  DICTIONARY = 'dictionary',  // Low-cardinality
  RLE = 'rle',                // Run-length
  BITPACKED = 'bitpacked',    // FastLanes bit-packing
  DELTA = 'delta',            // Sequential integers
  FOR = 'for',                // Frame-of-reference
  FSST = 'fsst',              // String compression
  ALP = 'alp',                // Floating-point
  CONSTANT = 'constant',      // All same value
  SPARSE = 'sparse',          // Mostly-null
  ROARING = 'roaring',        // Bitmap
  DICT_RLE = 'dict_rle',      // Hybrid dictionary + RLE
  PATCHED = 'patched',        // Delta with outliers
  PREFIX = 'prefix',          // Prefix compression
  STRUCT = 'struct',          // Struct with offsets
  LIST = 'list',              // List with repetition
  MAP = 'map',                // Key-value pairs
}
```

## Related Packages

- **@db4/do** - Durable Object storage integration
- **@db4/iceberg** - CDC streaming to Apache Iceberg
- **@db4/storage** - Three-tier storage (Hot/Warm/Cold)
- **@db4/query** - TypeScript query engine

## License

MIT
