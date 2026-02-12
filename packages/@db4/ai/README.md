---
name: "@db4/ai"
version: 0.1.2
description: AI capabilities for db4 - embeddings, generations, and vector operations
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - ai
  - embeddings
  - generations
  - vector-operations
  - cloudflare
  - workers
  - durable-objects
downloads:
  monthly: 206
published: "2026-01-20T11:28:45.512Z"
updated: "2026-01-23T17:19:58.168Z"
---

# @db4/ai

[![npm version](https://img.shields.io/npm/v/@db4/ai.svg)](https://www.npmjs.com/package/@db4/ai)
[![license](https://img.shields.io/npm/l/@db4/ai.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/ai), [npm](https://www.npmjs.com/package/@db4/ai))

Your AI-powered features are broken. Embeddings drift stale. Summaries don't update when content changes. Tags fall out of sync. You're spending more time maintaining AI plumbing than building features.

**Declare once. Stay in sync forever.**

## The Problem

AI integration is a maintenance nightmare:

- **Stale embeddings** - Content changes, vectors don't
- **Broken cascades** - Summary updates, but tags still reflect the old version
- **Prompt sprawl** - Same logic duplicated across your codebase
- **Manual orchestration** - You're writing cron jobs to fix what should be automatic

## The Solution

Declare AI behavior in your schema. db4 handles the rest.

```typescript
const db = DB({
  Article: {
    title: 'string!',
    content: 'text!',

    // AI-generated summary from content
    summary: 'text ~> content',

    // Auto-maintained embedding
    embedding: 'vector[1536] ~> content',

    // Cascading: tags regenerate when summary changes
    tags: '[string] ~> summary',

    $vector: 'embedding',
  },
})
```

The `~>` operator declares generation dependencies. When `content` changes, `summary` regenerates. When `summary` regenerates, `tags` follow. Embeddings stay fresh automatically.

## Get Started

### 1. Install

```bash
npm install @db4/ai
```

### 2. Configure

```typescript
import { configure } from '@db4/ai'

configure({
  model: 'claude-3-5-sonnet-20241022',
  embeddingModel: '@cf/baai/bge-base-en-v1.5',
})
```

### 3. Use

```typescript
const article = await db.Article.create({
  title: 'Edge Computing Explained',
  content: 'Edge computing brings computation closer to data sources...',
})

// Auto-generated:
article.summary    // "Edge computing processes data near its source..."
article.embedding  // [0.023, -0.041, 0.089, ...] (1536 dims)
article.tags       // ['edge computing', 'distributed systems', 'latency']
```

No manual embedding calls. No orchestration code. No sync jobs.

## Core Features

### Cascading Generations

Build AI pipelines that auto-update:

```typescript
const schema = DB({
  Document: {
    source: 'text!',

    // Single-field generation
    summary: 'text ~> source',

    // Multi-field input
    abstract: 'text ~> [title, content]',

    // Chained: each stage feeds the next
    keywords: '[string] ~> summary',
    category: 'string ~> keywords',

    // Vector embedding
    embedding: 'vector[768] ~> content',
  },
})
```

### Automatic Embeddings

```typescript
import { createWorkersAIEmbedder } from '@db4/ai'

const embedder = createWorkersAIEmbedder('base')

// Single
const { embedding } = await embedder.embed('Hello, world!')

// Batch with caching
const { embeddings } = await embedder.embedBatch([
  'First document',
  'Second document',
])

// Incremental: only re-embed changed content
const { embedding, changed } = await embedder.updateIfChanged(
  record,
  ['title', 'content'],
  'embedding'
)
```

### Semantic Search

```typescript
import { createAI } from '@db4/ai'

const ai = createAI(db, {
  provider: 'workers-ai',
  embeddingModel: '@cf/baai/bge-base-en-v1.5',
  entityEmbeddings: {
    Post: { fields: ['title', 'content'] },
  },
})

await ai.indexEntities('Post', posts)

// Semantic search
const results = await ai.semanticSearch('Post', 'machine learning tutorials', {
  limit: 10,
  minScore: 0.7,
})

// Hybrid: semantic + full-text
const hybrid = await ai.hybridSearch('Post', 'typescript generics guide', {
  semanticWeight: 0.6,
  ftsWeight: 0.4,
})
```

### RAG Pipeline

```typescript
import { createRAGPipeline, createVectorIndex, createWorkersAIEmbedder } from '@db4/ai'

const rag = createRAGPipeline({
  embedder: createWorkersAIEmbedder('base'),
  vectorIndex: createVectorIndex({ dimensions: 768, enableTextIndex: true }),
  config: {
    chunking: { method: 'recursive', chunkSize: 500 },
    retrieval: { topK: 5, hybrid: true },
  },
})

await rag.addDocuments([
  { id: 'doc-1', content: '...', title: 'Getting Started' },
  { id: 'doc-2', content: '...', title: 'Configuration' },
])

const result = await rag.query('How do I configure sharding?')
console.log(result.context.formattedContext)
console.log(result.sources)
```

### Workflow Cascades

Complex pipelines with error handling, retries, and parallelism:

```typescript
import { Cascade } from '@db4/ai'

const workflow = new Cascade<string>()
  .then(extractEntities, { name: 'extract' })
  .parallel([summarize, classify])
  .aggregate((results) => ({
    summary: results[0],
    category: results[1],
  }))

const result = await workflow.run(articleContent)
```

### Agentic Loops

AI agents with entity tools:

```typescript
import { createDB4AgenticLoop, createEntityToolset, createSearchTools } from '@db4/ai'

const loop = createDB4AgenticLoop({
  provider: db,
  entityTypes: ['User', 'Post'],
  tools: [
    ...createEntityToolset(db, 'User'),
    ...createSearchTools(db, 'Post'),
  ],
  maxIterations: 10,
})

await loop.run('Find users interested in TypeScript and list their recent posts')
```

### Structured Extraction

```typescript
import { createExtractor, ContactSchema } from '@db4/ai'

const contactExtractor = createExtractor(ContactSchema)

const contact = await contactExtractor.extract(
  'Contact John Smith at john@example.com or call 555-1234'
)
// { name: 'John Smith', email: 'john@example.com', phone: '555-1234' }
```

### Evaluation

```typescript
import { EvalRunner, createTestSuite, semanticSimilarity } from '@db4/ai'

const suite = createTestSuite({
  name: 'Summarization Tests',
  testCases: [
    { id: 'test-1', input: 'Long article...', expected: 'Expected summary' },
  ],
  defaultComparator: semanticSimilarity,
})

const runner = new EvalRunner({ passThreshold: 0.7 })
runner.registerSuite(suite)

const results = await runner.runAll(summarize)
console.log(runner.generateReport())
```

## Success vs. Failure

### With @db4/ai

- Embeddings update automatically when content changes
- Cascades regenerate in correct dependency order
- Semantic search works out of the box
- RAG is one function call
- Schema changes automatically update AI pipelines

### Without It

- Stale embeddings return irrelevant search results
- Tags reference old summaries
- Cron jobs patch over broken orchestration
- Prompts duplicated across services
- Every schema change = manual AI pipeline update

## API Quick Reference

### Generation

```typescript
import { write, list, is, code, extract } from '@db4/ai'

const summary = await write`Summarize: ${content}`
const tags = await list`Extract tags: ${content}`
const spam = await is`Is this spam? ${message}`
const fn = await code`TypeScript function to validate email`
const data = await extract`Extract contact info: ${text}`
```

### Embeddings

```typescript
import { embedText, embedTexts, createEmbedder } from '@db4/ai'

const { embedding } = await embedText('Hello, world!')
const { embeddings } = await embedTexts(['First', 'Second'])

const embedder = createEmbedder('bge-base', { cacheEmbeddings: true })
```

### Vector Search

```typescript
import { createVectorIndex } from '@db4/ai'

const index = createVectorIndex({ dimensions: 768 })
index.add({ id: 'doc-1', embedding, metadata: doc })
const results = index.search(queryEmbedding, { topK: 10 })
```

### Batch Processing

```typescript
import { BatchProcessor, batchProcess } from '@db4/ai'

const processor = new BatchProcessor({
  concurrency: 5,
  batchSize: 10,
  onProgress: (p) => console.log(`${p.percentage}%`),
})

const results = await processor.process(items, processItem)
```

### Scheduling

```typescript
import { WorkflowScheduler } from '@db4/ai'

const scheduler = new WorkflowScheduler()

await scheduler.createRecurringWorkflow({
  name: 'Daily embedding update',
  schedule: '0 0 * * *',
  handler: updateEmbeddingsWorkflow,
})
```

## Supported Providers

### Embedding Models

| Provider | Model | Dimensions |
|----------|-------|------------|
| Workers AI | `@cf/baai/bge-small-en-v1.5` | 384 |
| Workers AI | `@cf/baai/bge-base-en-v1.5` | 768 |
| Workers AI | `@cf/baai/bge-large-en-v1.5` | 1024 |
| OpenAI | `text-embedding-3-small` | 1536 |
| OpenAI | `text-embedding-3-large` | 3072 |

### Generation Models

- Claude (claude-3-5-sonnet, claude-3-opus)
- OpenAI (gpt-4, gpt-4-turbo)
- Workers AI (llama-3, mistral, deepseek-coder)

## Related Packages

- [@db4/schema](../schema) - IceType schema with AI directives
- [@db4/search](../search) - Full-text and vector search
- [@db4/vortex](../vortex) - Columnar storage for embeddings
- [@db4/workflows](../workflows) - Durable execution for AI pipelines

## License

MIT
