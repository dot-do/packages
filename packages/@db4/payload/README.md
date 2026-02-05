---
name: "@db4/payload"
version: 0.1.2
description: Payload CMS database adapter for db4
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - payload
  - payload-cms
  - database-adapter
  - document-database
  - cloudflare
  - workers
downloads:
  monthly: 61
published: "2026-01-23T17:20:29.978Z"
updated: "2026-01-23T17:20:30.213Z"
---

# @db4/payload

[![npm version](https://img.shields.io/npm/v/@db4/payload.svg)](https://www.npmjs.com/package/@db4/payload)
[![license](https://img.shields.io/npm/l/@db4/payload.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/payload), [npm](https://www.npmjs.com/package/@db4/payload))

## Description

Payload CMS database adapter for db4. This package provides seamless integration between Payload CMS and db4 document database, enabling you to use db4 as the backend storage for your Payload-powered applications. The adapter supports all Payload features including collections, globals, versions, drafts, and authentication.

## Installation

```bash
npm install @db4/payload payload
```

Or with pnpm:

```bash
pnpm add @db4/payload payload
```

## Usage

```typescript
import { db4Adapter } from '@db4/payload';
import { buildConfig } from 'payload/config';

export default buildConfig({
  db: db4Adapter({
    url: process.env.DB4_URL || 'https://my-app.db4.io',
    apiKey: process.env.DB4_API_KEY,
  }),
  collections: [
    {
      slug: 'posts',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richText' },
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'publishedAt', type: 'date' },
      ],
    },
    {
      slug: 'users',
      auth: true,
      fields: [
        { name: 'name', type: 'text' },
        { name: 'avatar', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
});
```

### Query Translation

```typescript
import { QueryTranslator, createQueryTranslator } from '@db4/payload';

// The adapter automatically translates Payload queries to db4 format
// But you can also use the translator directly

const translator = createQueryTranslator();

// Translate a Payload where clause to db4 filter
const db4Filter = translator.translate({
  and: [
    { title: { contains: 'TypeScript' } },
    { status: { equals: 'published' } },
    {
      or: [
        { category: { equals: 'tutorial' } },
        { featured: { equals: true } },
      ],
    },
  ],
});

// Result:
// {
//   $and: [
//     { title: { $contains: 'TypeScript' } },
//     { status: { $eq: 'published' } },
//     { $or: [
//       { category: { $eq: 'tutorial' } },
//       { featured: { $eq: true } }
//     ]}
//   ]
// }
```

### Schema Mapping

```typescript
import { SchemaMapper, createSchemaMapper, generateMigration } from '@db4/payload';

// Map Payload collection to db4 schema
const mapper = createSchemaMapper();

const db4Schema = mapper.mapCollection({
  slug: 'posts',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'views', type: 'number', defaultValue: 0 },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
  ],
  versions: true,
});

// Generate migration for schema changes
const migration = generateMigration(oldSchema, newSchema);
console.log('Migration operations:', migration.operations);
```

### Versioning and Drafts

```typescript
import { db4Adapter } from '@db4/payload';

export default buildConfig({
  db: db4Adapter({
    url: process.env.DB4_URL,
    versioning: {
      maxVersions: 100, // Keep last 100 versions
      drafts: true, // Enable draft support
    },
  }),
  collections: [
    {
      slug: 'pages',
      versions: {
        drafts: true,
        maxPerDoc: 25,
      },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'richText' },
      ],
    },
  ],
});
```

### Uploads and Media

```typescript
import { db4Adapter } from '@db4/payload';

export default buildConfig({
  db: db4Adapter({
    url: process.env.DB4_URL,
    uploads: {
      storage: 'r2', // Use Cloudflare R2 for file storage
      bucket: 'my-media-bucket',
    },
  }),
  collections: [
    {
      slug: 'media',
      upload: {
        staticDir: 'media',
        imageSizes: [
          { name: 'thumbnail', width: 150, height: 150 },
          { name: 'card', width: 640, height: 480 },
        ],
      },
      fields: [
        { name: 'alt', type: 'text' },
        { name: 'caption', type: 'textarea' },
      ],
    },
  ],
});
```

### Transaction Support

```typescript
import { db4Adapter } from '@db4/payload';
import payload from 'payload';

// Transactions are automatically handled by the adapter
await payload.create({
  collection: 'orders',
  data: {
    items: [{ product: 'prod_123', quantity: 2 }],
    total: 99.99,
  },
});

// For complex operations, use explicit transactions
const result = await payload.db.transaction(async (session) => {
  const order = await payload.create({
    collection: 'orders',
    data: orderData,
    req: { transactionID: session.id },
  });

  await payload.update({
    collection: 'inventory',
    where: { product: { equals: 'prod_123' } },
    data: { $inc: { quantity: -2 } },
    req: { transactionID: session.id },
  });

  return order;
});
```

## API

Payload CMS adapter for db4:

```typescript
function db4Adapter(config: DB4AdapterConfig): PayloadDatabaseAdapter;
```

### db4Adapter(config)

```typescript
interface DB4AdapterConfig {
  url: string;
  apiKey?: string;
  versioning?: {
    maxVersions?: number;
    drafts?: boolean;
  };
  uploads?: {
    storage: 'r2' | 'do' | 'local';
    bucket?: string;
  };
  connection?: {
    timeout?: number;
    retries?: number;
  };
}

function db4Adapter(config: DB4AdapterConfig): PayloadDatabaseAdapter;
```

### Query Translator

```typescript
class QueryTranslator {
  translate(where: PayloadWhere): DB4QueryFilter;
  translateSort(sort: PayloadSort): DB4SortSpec;
  translatePagination(pagination: PayloadPagination): DB4PaginationOptions;
}
```

### Schema Mapper

```typescript
class SchemaMapper {
  mapCollection(collection: CollectionConfig): DB4CollectionSchema;
  mapField(field: PayloadField): DB4FieldSchema;
  mapIndex(index: PayloadIndex): DB4Index;
}

function generateMigration(from: Schema, to: Schema): SchemaMigration;
```

### Types

| Type | Description |
|------|-------------|
| `DB4AdapterConfig` | Adapter configuration options |
| `DB4CollectionSchema` | Collection schema definition |
| `DB4FieldSchema` | Field schema definition |
| `TranslatedQuery` | Translated query structure |
| `VersionDocument` | Version document structure |

## Related Packages

- [@db4/core](../core) - Core types and utilities
- [@db4/client](../client) - Client SDK

## See Also

- [@db4/compat](../compat) - Other database compatibility layers
- [@db4/drizzle](../drizzle) - Drizzle ORM adapter

## License

MIT
