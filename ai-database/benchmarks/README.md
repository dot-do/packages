# Database Adapter Benchmarks

Comprehensive performance testing for different database adapter implementations.

## Adapter Types Tested

1. **Drizzle + Relational** - Full schema with separate tables, typed queries
2. **KV-Style** - Single table with `key:value` pattern, JSON blobs
3. **Hybrid** - Drizzle schema with JSON columns for flexibility

## Backends Tested

- Cloudflare D1 (HTTP-based SQLite)
- Durable Objects SQLite (same-thread, zero-latency)

## Benchmark Scenarios

### 1. Simple Key Lookups
- Single thing by ns:id
- Single relationship by ns:id
- Measures: Latency, cache hit rate

### 2. Filtered Queries
- All things of a type in namespace
- Things by visibility
- Complex filters (type + visibility + data fields)
- Measures: Query time, result set size

### 3. Graph Traversal
- Outgoing relationships from thing
- Incoming relationships to thing
- Multi-hop traversal (thing → relationships → things)
- Measures: Join performance, N+1 query overhead

### 4. Bulk Operations
- Insert 100/1000/10000 things
- Batch relationship creation
- Bulk updates
- Measures: Throughput (ops/sec), transaction time

### 5. JSON Field Queries
- Filter by nested JSON field
- Sort by JSON field
- Aggregate on JSON field
- Measures: JSON operator performance

### 6. Concurrent Access
- Multiple simultaneous reads
- Read/write contention
- Lock behavior (D1 vs DO)
- Measures: Concurrency scaling, deadlocks

### 7. Real-World Patterns
- Create thing + relationships (atomic)
- Namespace-scoped list with pagination
- Search by multiple criteria
- Measures: End-to-end latency

## Test Data

- **Small:** 100 things, 200 relationships
- **Medium:** 10,000 things, 50,000 relationships
- **Large:** 100,000 things, 500,000 relationships

## Metrics Collected

- **Latency:** p50, p95, p99 (ms)
- **Throughput:** Operations per second
- **Memory:** Peak usage during test
- **Database Size:** Storage consumed
- **Code Complexity:** Lines of code, type errors

## Running Benchmarks

```bash
# Install dependencies
pnpm install

# Run all benchmarks
pnpm benchmark

# Run specific test
pnpm benchmark:lookup
pnpm benchmark:filter
pnpm benchmark:graph
pnpm benchmark:bulk
pnpm benchmark:json
pnpm benchmark:concurrent
pnpm benchmark:real-world

# Compare adapters
pnpm benchmark:compare

# Generate report
pnpm benchmark:report
```

## Results Format

```
┌─────────────────────┬──────────────┬──────────────┬──────────────┐
│ Scenario            │ Drizzle+D1   │ KV+D1        │ Drizzle+DO   │
├─────────────────────┼──────────────┼──────────────┼──────────────┤
│ Simple Lookup (p95) │ 45ms         │ 32ms         │ 2ms          │
│ Filter Query (p95)  │ 120ms        │ 95ms         │ 8ms          │
│ Graph Traversal     │ 250ms        │ 180ms        │ 15ms         │
│ Bulk Insert (1000)  │ 3.2s         │ 2.1s         │ 0.8s         │
│ JSON Query (p95)    │ 180ms        │ 140ms        │ 12ms         │
└─────────────────────┴──────────────┴──────────────┴──────────────┘
```

## Expected Results

Based on architecture:

**D1 (HTTP-based):**
- Higher latency (network round-trip)
- Better for read-heavy workloads with replicas
- Scales well geographically

**DO SQLite (same-thread):**
- Ultra-low latency (95-98% faster than D1)
- Better for write-heavy workloads
- Limited to single DO instance

**Drizzle vs KV:**
- Drizzle: Better type safety, more complex
- KV: Simpler code, potentially faster for simple lookups
- Hybrid might offer best of both

## Contributing

Add new benchmark scenarios in `scenarios/` directory.
