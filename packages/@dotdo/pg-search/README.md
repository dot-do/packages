---
name: "@dotdo/pg-search"
version: 0.1.1
description: "BM25 full-text search with Orama + PGlite and Cap'n Web RPC for hibernated WebSocket connections"
license: MIT
keywords:
  - orama
  - pglite
  - search
  - full-text
  - bm25
  - capnweb
  - rpc
  - durable-objects
  - cloudflare-workers
downloads:
  monthly: 157
published: "2026-01-22T15:59:07.498Z"
updated: "2026-01-24T15:49:29.880Z"
---

# @dotdo/pg-search

> BM25 full-text search with Orama + PGlite and Cap'n Web RPC for hibernated WebSocket connections

[![npm version](https://img.shields.io/npm/v/@dotdo/pg-search.svg)](https://www.npmjs.com/package/@dotdo/pg-search)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

```typescript
import { OramaBlobStore } from '@dotdo/pg-search/blob'

const store = new OramaBlobStore({
  schema: { title: 'string', content: 'string', tags: 'string[]' }
})

await store.init()
await store.insert({ title: 'Hello World', content: 'Full-text search at the edge', tags: ['search'] })

const results = await store.search({ term: 'edge' })
console.log(results.documents) // [{ id: '...', title: 'Hello World', ... }]
```

## Installation

```bash
npm install @dotdo/pg-search @dotdo/pglite @orama/orama
# or
pnpm add @dotdo/pg-search @dotdo/pglite @orama/orama
```

## Features

- **BM25 Full-Text Search** - Industry-standard ranking algorithm via Orama
- **Three Storage Patterns** - Blob, Sync, and SQL patterns for different use cases
- **Cap'n Web RPC** - Promise pipelining over hibernated WebSockets (95% cost savings)
- **Durable Object Integration** - SearchDO class for Cloudflare Workers
- **Type-Safe Client** - Full TypeScript support with SearchRpcClient
- **PGlite Persistence** - Documents stored in PostgreSQL, index in Orama

## Storage Patterns

This package provides three storage patterns, each optimized for different use cases:

### 1. Blob Pattern (`OramaBlobStore`)

Stores the entire Orama index as a serialized blob in PGlite. Best for:
- Cold start scenarios where index needs to be restored
- Periodic checkpointing for durability
- Simple persistence without complex sync logic

```typescript
import { OramaBlobStore } from '@dotdo/pg-search/blob'

const store = new OramaBlobStore({
  schema: {
    title: 'string',
    content: 'string',
    tags: 'string[]',
  },
  indexName: 'articles',
})

await store.init()

// Insert documents
const doc = await store.insert({
  title: 'TypeScript Guide',
  content: 'Learn TypeScript from scratch with practical examples...',
  tags: ['typescript', 'javascript', 'tutorial'],
})

// Search with BM25 ranking
const results = await store.search({
  term: 'TypeScript tutorial',
  limit: 10,
  hydrate: true,
})

console.log(`Found ${results.count} matches in ${results.elapsed.formatted}`)
for (const hit of results.hits) {
  console.log(`${hit.score.toFixed(2)}: ${hit.document.title}`)
}

// Checkpoint index to PGlite for persistence
await store.checkpoint()

// Close when done
await store.close()
```

**Trade-offs:**
- Checkpoint is O(n) - must serialize entire index
- Space efficient for small-medium indices
- No partial updates - full serialization on checkpoint

### 2. Sync Pattern (`OramaSyncStore`)

Maintains Orama index in sync with PGlite on every write operation. Best for:
- Real-time search requirements
- Strong consistency guarantees
- Applications where search results must reflect latest data

```typescript
import { OramaSyncStore } from '@dotdo/pg-search/sync'

const store = new OramaSyncStore({
  schema: {
    title: 'string',
    body: 'string',
    author: 'string',
  },
})

await store.init()

// Every write syncs to both PGlite and Orama
await store.insert({
  title: 'Breaking News',
  body: 'Important update about...',
  author: 'John Doe',
})

// Search immediately reflects the new document
const results = await store.search({ term: 'breaking' })

// Verify consistency between index and database
const { consistent, mismatches } = await store.verify()
if (!consistent) {
  console.log('Mismatches found:', mismatches)
  await store.rebuildIndex() // Rebuild from PGlite data
}

await store.close()
```

**Trade-offs:**
- Higher write latency (dual-write to PGlite and Orama)
- More complex error handling with rollback support
- Built-in consistency verification

### 3. SQL Pattern (`OramaSqlStore`)

Registers Orama search as a virtual SQL function in PGlite. Best for:
- Complex queries combining full-text search with SQL joins
- Existing SQL-based applications
- Hybrid queries (search + filter + aggregate)

```typescript
import { OramaSqlStore } from '@dotdo/pg-search/sql'

const store = new OramaSqlStore({
  schema: {
    name: 'string',
    description: 'string',
    price: 'number',
  },
  tableName: 'products',
})

await store.init()

// Insert products
await store.insertMany([
  { name: 'Laptop', description: 'Powerful laptop for developers', price: 1299 },
  { name: 'Keyboard', description: 'Mechanical keyboard with RGB', price: 149 },
  { name: 'Monitor', description: 'Ultra-wide developer monitor', price: 499 },
])

// Execute search and store results for SQL joins
const searchId = await store.executeSearch('developer', { limit: 100 })

// Join search results with other SQL operations
const results = await store.query(`
  SELECT d.data, s.score, s.rank
  FROM products d
  JOIN _orama_search_results s ON d.id = s.doc_id
  WHERE s.search_id = $1
    AND (d.data->>'price')::numeric < 1000
  ORDER BY s.rank
`, [searchId])

// Or use the convenience method
const combined = await store.searchWithSql('developer', {
  additionalSql: `AND (d.data->>'price')::numeric < 1000`,
})

await store.close()
```

**Trade-offs:**
- More complex implementation
- Function registration overhead
- Results must be serializable to SQL types

## Durable Object Integration

The `SearchDO` class provides a complete Durable Object implementation with both REST API and Cap'n Web RPC support.

### Setting Up SearchDO

```typescript
// src/index.ts
import { SearchDO } from '@dotdo/pg-search/do'

export { SearchDO }

export default {
  async fetch(request: Request, env: Env) {
    const id = env.SEARCH.idFromName('main')
    const stub = env.SEARCH.get(id)
    return stub.fetch(request)
  }
}
```

```toml
# wrangler.toml
[[durable_objects.bindings]]
name = "SEARCH"
class_name = "SearchDO"

[[migrations]]
tag = "v1"
new_classes = ["SearchDO"]
```

### REST API

SearchDO exposes the following REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=term&limit=10` | Search documents |
| GET | `/documents/:id` | Get a document by ID |
| POST | `/documents` | Index a new document |
| POST | `/documents/batch` | Index multiple documents |
| DELETE | `/documents/:id` | Delete a document |
| GET | `/stats` | Get index statistics |
| POST | `/indexes` | Create a new search index |
| GET | `/health` | Health check |

### Cap'n Web RPC Client

For high-performance scenarios, use the typed RPC client with promise pipelining:

```typescript
import { SearchRpcClient } from '@dotdo/pg-search/rpc'

interface Article {
  id: string
  title: string
  content: string
  author: string
}

const client = new SearchRpcClient<Article>('wss://search.example.com/rpc', {
  autoReconnect: true,
  maxReconnectAttempts: 5,
})

// Individual calls
const results = await client.search({ term: 'typescript' })

// Get a document
const doc = await client.get('article-123')

// Update a document
await client.update('article-123', { title: 'Updated Title' })

// Close connection when done
client.close()
```

### Promise Pipelining (Batched Operations)

Promise pipelining dramatically reduces latency by batching multiple operations into a single round-trip:

```typescript
// Without pipelining: 3 round-trips (~150ms at 50ms latency)
const doc1 = await client.index({ title: 'First', content: '...' })
const doc2 = await client.index({ title: 'Second', content: '...' })
const results = await client.search({ term: 'first' })

// With pipelining: 1 round-trip (~50ms)
const batch = client.batch()
const doc1Promise = batch.index({ title: 'First', content: '...' })
const doc2Promise = batch.index({ title: 'Second', content: '...' })
const resultsPromise = batch.search({ term: 'first' })
await batch.execute()

// All promises are now resolved
const doc1 = await doc1Promise
const doc2 = await doc2Promise
const results = await resultsPromise
```

## Search Options

All store implementations support the same search options:

```typescript
interface SearchOptions {
  /** Search term - required */
  term: string

  /** Fields to search in (default: all indexed fields) */
  properties?: string[]

  /** Maximum results to return (default: 10) */
  limit?: number

  /** Offset for pagination (default: 0) */
  offset?: number

  /** Whether to hydrate full documents from PGlite (default: true) */
  hydrate?: boolean

  /** BM25 algorithm parameters */
  bm25?: {
    k?: number   // Term frequency saturation (default: 1.2)
    b?: number   // Length normalization (default: 0.75)
    d?: number   // TF normalization (default: 0.5)
  }
}
```

### Search Examples

```typescript
// Basic search
const results = await store.search({ term: 'javascript' })

// Search specific fields
const results = await store.search({
  term: 'tutorial',
  properties: ['title', 'tags'],
})

// Pagination
const page2 = await store.search({
  term: 'programming',
  limit: 20,
  offset: 20,
})

// Just get IDs and scores (skip hydration for performance)
const results = await store.search({
  term: 'react',
  hydrate: false,
})

// Custom BM25 parameters
const results = await store.search({
  term: 'typescript',
  bm25: {
    k: 1.5,   // Increase term frequency importance
    b: 0.5,   // Reduce document length normalization
  },
})
```

## Understanding Full-Text Search: BM25 vs tsvector/tsquery

### PostgreSQL Native: tsvector/tsquery

PostgreSQL provides built-in full-text search using `tsvector` (document representation) and `tsquery` (query representation):

```sql
-- Create a tsvector from text
SELECT to_tsvector('english', 'The quick brown fox jumps over the lazy dog');
-- Result: 'brown':3 'dog':9 'fox':4 'jump':5 'lazi':8 'quick':2

-- Search using tsquery
SELECT * FROM documents
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'quick & fox');
```

**How tsvector works:**
- Normalizes text (lowercasing, stemming)
- Removes stop words ("the", "a", "is")
- Creates position-aware tokens
- Supports language-specific configurations

**tsquery operators:**
- `&` (AND): `'cat & dog'` - both terms required
- `|` (OR): `'cat | dog'` - either term
- `!` (NOT): `'cat & !dog'` - cat but not dog
- `<->` (FOLLOWED BY): `'quick <-> fox'` - phrase search

```sql
-- Create a GIN index for fast searches
CREATE INDEX idx_content_fts ON documents USING GIN(to_tsvector('english', content));

-- Rank results using ts_rank
SELECT title, ts_rank(to_tsvector('english', content), query) AS rank
FROM documents, to_tsquery('english', 'typescript & tutorial') AS query
WHERE to_tsvector('english', content) @@ query
ORDER BY rank DESC;
```

### Orama BM25 (This Package)

BM25 (Best Matching 25) is a probabilistic ranking algorithm used by search engines like Elasticsearch and Lucene:

```typescript
// BM25 search with Orama
const results = await store.search({
  term: 'typescript tutorial',
  bm25: {
    k: 1.2,   // Term frequency saturation
    b: 0.75,  // Document length normalization
  },
})
```

**BM25 formula components:**
- **TF (Term Frequency)**: How often the term appears, with saturation (diminishing returns)
- **IDF (Inverse Document Frequency)**: Rare terms weighted more heavily
- **Document Length**: Normalized against average document length

### Comparison: tsvector/tsquery vs BM25

| Feature | tsvector/tsquery | BM25 (Orama) |
|---------|-----------------|--------------|
| **Ranking** | Basic `ts_rank` | Probabilistic, tunable |
| **Setup** | Built into PostgreSQL | Requires Orama library |
| **Boolean queries** | Native (`&`, `|`, `!`) | Via code logic |
| **Phrase search** | Native (`<->`) | Supported |
| **Relevance tuning** | Weight classes (A-D) | k, b, d parameters |
| **Stemming** | Language-specific dictionaries | Automatic |
| **Index storage** | In database (GIN/GiST) | In-memory + checkpoint |
| **Query flexibility** | SQL integration | JavaScript API |

### Why This Package Uses BM25

1. **Better Relevance Ranking**: BM25's probabilistic model typically produces more relevant results than `ts_rank`

2. **Tunable Parameters**: Easily adjust ranking behavior for your use case:
   ```typescript
   // Favor exact matches over frequency
   bm25: { k: 0.5, b: 0.3 }

   // Favor comprehensive documents
   bm25: { k: 1.5, b: 0.9 }
   ```

3. **In-Memory Speed**: Orama searches are typically sub-millisecond, while SQL queries have overhead

4. **JavaScript Integration**: Native TypeScript/JavaScript API without SQL string building

### When to Use tsvector/tsquery Instead

Use PostgreSQL's native FTS when you need:

- **SQL Integration**: Complex JOINs with search results
- **No Additional Dependencies**: Pure PostgreSQL solution
- **Stored Procedures**: Database-side search logic
- **Large Datasets**: When Orama's in-memory index becomes too large

You can use the SQL pattern (`OramaSqlStore`) to get both:

```typescript
// Combine Orama BM25 ranking with PostgreSQL queries
const searchId = await store.executeSearch('typescript', { limit: 100 })

const results = await store.query(`
  SELECT d.data, s.score
  FROM documents d
  JOIN _orama_search_results s ON d.id = s.doc_id
  WHERE s.search_id = $1
    AND d.data @> '{"category": "tutorials"}'
  ORDER BY s.rank
`, [searchId])
```

## BM25 Full-Text Search vs Vector Similarity Search

Understanding when to use full-text search (FTS) versus vector similarity search is crucial for building effective search systems.

### Full-Text Search (BM25)

BM25 (Best Matching 25) is a probabilistic ranking function that scores documents based on:
- **Term Frequency (TF)**: How often search terms appear in the document
- **Inverse Document Frequency (IDF)**: How rare the term is across all documents
- **Document Length Normalization**: Prevents long documents from being unfairly favored

**Strengths:**
- Exact keyword matching - "TypeScript" matches "TypeScript"
- Interpretable results - you can explain why a document matched
- Fast indexing - no ML model required
- Low latency - typically <1ms for search
- Great for structured queries - "error AND production"

**Use Cases:**
- Documentation search
- E-commerce product search with specific terms
- Log search
- Code search
- When users search for exact terms

```typescript
// BM25 search - exact keyword matching
const results = await store.search({ term: 'TypeScript React' })
// Matches documents containing "TypeScript" and/or "React"
```

### Vector Similarity Search (pgvector)

Vector search uses embeddings (dense numerical representations) to find semantically similar content.

**Strengths:**
- Semantic understanding - "automobile" matches "car"
- Handles typos and variations naturally
- Multilingual search without translation
- Great for natural language queries
- Finds conceptually similar content

**Use Cases:**
- Semantic search / Q&A
- Recommendation systems
- Image/audio similarity
- When users describe what they want in natural language

```sql
-- Vector search - semantic matching
SELECT * FROM items
ORDER BY embedding <=> query_embedding
LIMIT 10;
-- Finds conceptually similar items even without keyword overlap
```

### Comparison Table

| Aspect | BM25 (FTS) | Vector Search |
|--------|------------|---------------|
| **Matching** | Exact keywords | Semantic similarity |
| **Query type** | Keywords, boolean operators | Natural language |
| **Speed** | <1ms | 1-10ms (depends on index) |
| **Index size** | Small (~10% of data) | Large (embeddings ~3KB per doc) |
| **Interpretability** | High (keyword hits) | Low (similarity scores) |
| **Setup** | Simple | Requires embedding model |
| **Typo tolerance** | Low (needs stemming) | High |
| **Cost** | CPU only | CPU + GPU for embeddings |

### Hybrid Search

For many applications, combining both approaches yields the best results:

```typescript
interface HybridSearchOptions {
  term: string
  vector?: number[]
  bm25Weight?: number   // 0-1, default: 0.5
  vectorWeight?: number // 0-1, default: 0.5
}

// Hybrid search combines keyword relevance with semantic understanding
const results = await store.hybridSearch({
  term: 'react state management',
  vector: await embed('react state management'),
  bm25Weight: 0.4,
  vectorWeight: 0.6,
})
```

### When to Use Each

| Scenario | Recommendation |
|----------|----------------|
| User searches "error 404 not found" | **BM25** - exact error codes matter |
| User searches "how to fix page not loading" | **Vector** - semantic intent |
| Product search "blue nike shoes size 10" | **BM25** - specific attributes |
| "Something similar to this article" | **Vector** - conceptual similarity |
| Code search "useEffect cleanup" | **BM25** - exact function names |
| Documentation "how does auth work" | **Hybrid** - both keyword and concept |

## Performance Tips

### Indexing

```typescript
// Use insertMany for bulk operations
await store.insertMany(documents) // 10x faster than individual inserts

// Checkpoint periodically, not after every write
let writeCount = 0
for (const doc of documents) {
  await store.insert(doc)
  if (++writeCount % 100 === 0) {
    await store.checkpoint()
  }
}
```

### Schema Design

```typescript
// Index only searchable fields
const store = new OramaBlobStore({
  schema: {
    title: 'string',      // Searchable
    content: 'string',    // Searchable
    // Don't index: id, timestamps, relations
  }
})

// Store full document data in PGlite, search fields in Orama
```

### Search Optimization

```typescript
// Skip hydration when you only need IDs/scores
const results = await store.search({
  term: 'query',
  hydrate: false,  // 2-3x faster
})

// Limit fields to search
const results = await store.search({
  term: 'query',
  properties: ['title'],  // Don't search large content field
})

// Use pagination instead of large limits
const page1 = await store.search({ term: 'query', limit: 20 })
const page2 = await store.search({ term: 'query', limit: 20, offset: 20 })
```

### Memory Management

```typescript
// Close stores when done to free memory
await store.close()

// For Durable Objects, checkpoint before hibernation
export class MySearchDO {
  async alarm() {
    await this.store.checkpoint()
  }
}
```

## API Reference

### OramaBlobStore

| Method | Description |
|--------|-------------|
| `init()` | Initialize database and index |
| `insert(doc)` | Insert a document |
| `insertMany(docs)` | Insert multiple documents |
| `update(id, partial)` | Update a document |
| `delete(id)` | Delete a document |
| `search(options)` | Search documents |
| `get(id)` | Get document by ID |
| `getAll()` | Get all documents |
| `getStats()` | Get index statistics |
| `checkpoint(options?)` | Save index to PGlite |
| `restore(options?)` | Restore index from PGlite |
| `close()` | Close connections |

### OramaSyncStore

Same as `OramaBlobStore` plus:

| Method | Description |
|--------|-------------|
| `rebuildIndex()` | Rebuild index from PGlite data |
| `verify()` | Verify index/database consistency |

### OramaSqlStore

Same as `OramaBlobStore` plus:

| Method | Description |
|--------|-------------|
| `executeSearch(term, options?)` | Execute search and return ID for SQL joins |
| `searchWithSql(term, options?)` | Search and join in one call |
| `query(sql, params?)` | Execute raw SQL query |
| `registerFunction(name, fn)` | Register custom SQL function |

### SearchRpcClient

| Method | Description |
|--------|-------------|
| `search(options)` | Search documents |
| `index(doc)` | Index a document |
| `indexMany(docs)` | Index multiple documents |
| `get(id)` | Get document by ID |
| `delete(id)` | Delete a document |
| `update(id, partial)` | Update a document |
| `stats()` | Get index statistics |
| `createIndex(config)` | Create new index |
| `getAll()` | Get all documents |
| `batch()` | Create batch for pipelining |
| `close()` | Close WebSocket connection |

## Troubleshooting

### "OramaStore not initialized"

Always call `init()` before using the store:

```typescript
const store = new OramaBlobStore({ schema })
await store.init() // Required!
await store.search({ term: 'query' })
```

### "No checkpoint found for index"

The index hasn't been checkpointed yet. Use `failSilently` option:

```typescript
await store.restore({ failSilently: true })
```

### Search returns no results

1. Check if documents are indexed:
```typescript
const stats = await store.getStats()
console.log('Document count:', stats.documentCount)
```

2. Verify schema matches document structure:
```typescript
// Schema must include all searchable fields
const store = new OramaBlobStore({
  schema: {
    title: 'string',  // Must match document property names
    content: 'string',
  }
})
```

3. Check search term:
```typescript
// Orama uses word tokenization - single characters may not match
await store.search({ term: 'a' }) // May not work
await store.search({ term: 'apple' }) // Works
```

### WebSocket connection fails

```typescript
const client = new SearchRpcClient('wss://...', {
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
})
```

### Memory issues in Workers

The Orama index lives in memory. For large indices:

1. Use pagination instead of large result sets
2. Consider sharding across multiple Durable Objects
3. Use the SQL pattern for very large datasets

## Related Packages

- [`@dotdo/postgres`](../postgres) - PostgreSQL in Cloudflare Durable Objects
- [`@dotdo/pglite`](../pglite) - PGlite fork optimized for Cloudflare Workers
- [`@orama/orama`](https://github.com/oramasearch/orama) - Full-text search engine

## Links

- [Documentation](https://postgres.do/docs)
- [GitHub](https://github.com/dot-do/postgres)
- [Orama Documentation](https://docs.oramasearch.com/)

## License

MIT
