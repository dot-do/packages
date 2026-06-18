---
name: "@dotdo/documentdb"
version: 0.1.1
description: "MongoDB-compatible RPC server using PostgreSQL (via @dotdo/postgres) as the backend"
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - mongodb
  - documentdb
  - postgres
  - postgresql
  - bson
  - jsonb
  - cloudflare
  - workers
  - durable-objects
  - serverless
downloads:
  monthly: 137
published: "2026-01-22T15:58:31.445Z"
updated: "2026-01-24T15:48:50.396Z"
---

# @dotdo/documentdb

## You Want Documents. You Need PostgreSQL.

Your team loves the document model. Flexible schemas. Nested objects. Easy to start.

But MongoDB has problems:

- **Operational overhead** - Replica sets, sharding, backups... it's a full-time job.
- **Query limitations** - No joins. No transactions across collections. Working around them is painful.
- **Cost unpredictability** - Atlas pricing scales weirdly. Small projects pay enterprise prices.

You want document semantics. You don't want to give up relational power.

---

## MongoDB API. PostgreSQL Backend. Edge Performance.

**@dotdo/documentdb** is MongoDB semantics backed by PostgreSQL JSONB.

Same `find()`. Same `aggregate()`. SQL joins when you need them.

```typescript
import { DocumentDBClient } from '@dotdo/documentdb'

const client = new DocumentDBClient('https://db.postgres.do/mydb')
const db = client.db('myapp')
const users = await db.collection('users').find({ active: true }).toArray()
```

Your documents are stored in PostgreSQL. You get ACID transactions, foreign keys, and full SQL when you need it.

---

## The Plan: Get Document + Relational in 3 Steps

### Step 1: Install

```bash
npm install @dotdo/documentdb
```

### Step 2: Connect

```typescript
import { DocumentDBClient } from '@dotdo/documentdb'

const client = new DocumentDBClient('https://db.postgres.do/mydb')
const db = client.db('myapp')
const users = db.collection('users')
```

### Step 3: Use MongoDB API

```typescript
// Insert documents
await users.insertOne({ name: 'John', email: 'john@example.com' })

// Find with query operators
const activeUsers = await users.find({
  active: true,
  age: { $gte: 18 }
}).toArray()

// Aggregation pipeline
const stats = await users.aggregate([
  { $match: { active: true } },
  { $group: { _id: '$department', count: { $sum: 1 } } }
]).toArray()
```

**That's it.** MongoDB API with PostgreSQL reliability.

---

## What You Get

| MongoDB Atlas | @dotdo/documentdb |
|---------------|-------------------|
| Separate infrastructure | PostgreSQL you already know |
| No joins | Full SQL joins available |
| Collection-level transactions | ACID transactions across everything |
| Atlas pricing | Edge pricing with hibernation |

---

## The Full Document API

### Collection Operations

```typescript
const users = db.collection('users')

// Insert
await users.insertOne({ name: 'John' })
await users.insertMany([{ name: 'Jane' }, { name: 'Bob' }])

// Find
const cursor = users.find({ active: true })
const user = await users.findOne({ _id: id })

// Update
await users.updateOne({ _id: id }, { $set: { verified: true } })
await users.updateMany({ active: false }, { $set: { archived: true } })

// Delete
await users.deleteOne({ _id: id })
await users.deleteMany({ status: 'spam' })

// Count
const count = await users.countDocuments({ active: true })
```

### Query Operators

```typescript
// Comparison
await users.find({ age: { $gt: 18, $lt: 65 } })
await users.find({ status: { $in: ['active', 'pending'] } })
await users.find({ status: { $ne: 'deleted' } })

// Logical
await users.find({
  $or: [{ status: 'active' }, { role: 'admin' }]
})
await users.find({
  $and: [{ age: { $gte: 18 } }, { verified: true }]
})

// Element
await users.find({ email: { $exists: true } })

// Array
await users.find({ tags: { $all: ['nodejs', 'typescript'] } })
await users.find({ scores: { $elemMatch: { $gt: 80 } } })

// Regex
await users.find({ name: { $regex: /^john/i } })
```

### Aggregation Pipeline

```typescript
const results = await users.aggregate([
  // Filter documents
  { $match: { active: true } },

  // Group and aggregate
  { $group: {
    _id: '$department',
    count: { $sum: 1 },
    avgSalary: { $avg: '$salary' },
    names: { $push: '$name' }
  }},

  // Sort results
  { $sort: { count: -1 } },

  // Limit output
  { $limit: 10 },

  // Project fields
  { $project: {
    department: '$_id',
    count: 1,
    avgSalary: { $round: ['$avgSalary', 2] }
  }},

  // Join with another collection (PostgreSQL superpower)
  { $lookup: {
    from: 'departments',
    localField: '_id',
    foreignField: '_id',
    as: 'deptInfo'
  }}
]).toArray()
```

### Update Operators

```typescript
await users.updateOne({ _id: id }, {
  $set: { status: 'active' },
  $unset: { tempField: '' },
  $inc: { loginCount: 1 },
  $push: { tags: 'premium' },
  $pull: { tags: 'trial' },
  $addToSet: { roles: 'admin' },
  $currentDate: { lastModified: true }
})
```

---

## ObjectId Support

Full MongoDB ObjectId compatibility:

```typescript
import { ObjectId, createObjectId, isValidObjectId } from '@dotdo/documentdb'

// Generate new ObjectId
const id = createObjectId()
// '507f1f77bcf86cd799439011'

// Validate ObjectId
isValidObjectId('507f1f77bcf86cd799439011') // true

// Use in queries
await users.find({ _id: new ObjectId('507f1f77bcf86cd799439011') })
```

---

## Durable Object Deployment

Deploy as a Cloudflare Durable Object:

```typescript
import { createDocumentDBDO } from '@dotdo/documentdb'

// Export the Durable Object
export const DocumentDB = createDocumentDBDO()

export default {
  fetch(request, env) {
    const id = env.DOCUMENT_DB.idFromName('mydb')
    const stub = env.DOCUMENT_DB.get(id)
    return stub.fetch(request)
  }
}
```

---

## SQL When You Need It

Documents stored as JSONB means you can use SQL directly:

```typescript
// MongoDB query
await users.find({ active: true, age: { $gte: 18 } })

// Or use SQL for complex operations
await pglite.query(`
  SELECT u.doc, COUNT(o.doc) as order_count
  FROM users u
  LEFT JOIN orders o ON o.doc->>'userId' = u.doc->>'_id'
  WHERE u.doc @> '{"active": true}'
  GROUP BY u.doc
`)
```

Best of both worlds. Document API for speed. SQL for power.

---

## Cost Benefits

| Feature | @dotdo/documentdb | MongoDB Atlas |
|---------|-------------------|---------------|
| **Cache reads** | FREE | Per-query cost |
| **Idle databases** | $0 (hibernation) | $$ (always running) |
| **Per-tenant DBs** | Built-in | Complex setup |
| **Edge locations** | 300+ | Limited regions |

---

## API Reference

### `DocumentDBClient(url)`

Create a client connection.

### `client.db(name)`

Get a database instance.

### `db.collection(name)`

Get a collection.

### Collection Methods

- `insertOne(doc)` - Insert single document
- `insertMany(docs)` - Insert multiple documents
- `find(filter)` - Query documents
- `findOne(filter)` - Find single document
- `updateOne(filter, update)` - Update single document
- `updateMany(filter, update)` - Update multiple documents
- `deleteOne(filter)` - Delete single document
- `deleteMany(filter)` - Delete multiple documents
- `aggregate(pipeline)` - Run aggregation pipeline
- `countDocuments(filter)` - Count matching documents

---

## Operator Support Matrix

@dotdo/documentdb supports most MongoDB query operators by translating them to PostgreSQL JSONB operations.

### Query Operators

| Category | Operator | Supported | Notes |
|----------|----------|-----------|-------|
| **Comparison** | `$eq` | Yes | Exact value matching |
| | `$ne` | Yes | Not equal matching |
| | `$gt` | Yes | Greater than (numeric) |
| | `$gte` | Yes | Greater than or equal |
| | `$lt` | Yes | Less than (numeric) |
| | `$lte` | Yes | Less than or equal |
| | `$in` | Yes | Match any value in array |
| | `$nin` | Yes | Match none in array |
| **Logical** | `$and` | Yes | Combine with AND |
| | `$or` | Yes | Combine with OR |
| | `$nor` | Yes | Match none (NOT OR) |
| | `$not` | Yes | Negate expression |
| **Element** | `$exists` | Yes | Field existence check |
| | `$type` | Yes | JSONB type checking |
| **String** | `$regex` | Yes | PostgreSQL regex (~) |
| | `$options` | Partial | Case-insensitive needs fix |
| | `$text` | No | Requires FTS setup |
| **Array** | `$all` | Yes | All elements present |
| | `$elemMatch` | Yes | Element condition match |
| | `$size` | Yes | Array length check |
| **Evaluation** | `$where` | Yes | Sandboxed via ai-evaluate |
| | `$mod` | Yes | Modulo operations |
| | `$expr` | Yes | Field comparisons |
| **Geospatial** | `$geoWithin` | No | Requires PostGIS |
| | `$geoIntersects` | No | Requires PostGIS |
| | `$near` | No | Requires PostGIS |
| | `$nearSphere` | No | Requires PostGIS |
| **Bitwise** | `$bitsAllClear` | No | Not implemented |
| | `$bitsAllSet` | No | Not implemented |
| | `$bitsAnyClear` | No | Not implemented |
| | `$bitsAnySet` | No | Not implemented |

### Update Operators

| Operator | Supported | Notes |
|----------|-----------|-------|
| `$set` | Yes | Set field values |
| `$unset` | Yes | Remove fields |
| `$inc` | Yes | Increment numeric values |
| `$mul` | Yes | Multiply numeric values |
| `$min` | Yes | Update if less than |
| `$max` | Yes | Update if greater than |
| `$rename` | Yes | Rename fields |
| `$push` | Yes | Add to array |
| `$pop` | Yes | Remove from array end |
| `$pull` | Yes | Remove matching elements |
| `$addToSet` | Yes | Add unique to array |
| `$currentDate` | Yes | Set to current date |

### Aggregation Pipeline Stages

| Stage | Supported | Notes |
|-------|-----------|-------|
| `$match` | Yes | Filter documents |
| `$project` | Yes | Field selection |
| `$sort` | Yes | Sort results |
| `$limit` | Yes | Limit results |
| `$skip` | Yes | Skip results |
| `$count` | Yes | Count documents |
| `$group` | Partial | Basic grouping |
| `$lookup` | Yes | Collection joins |
| `$unwind` | Partial | Array expansion |
| `$addFields` | Yes | Add computed fields |
| `$facet` | No | Not implemented |
| `$bucket` | No | Not implemented |

---

## The Cost of Separate Infrastructure

Every day with MongoDB separate from PostgreSQL:
- Two databases to manage, monitor, backup
- No joins between documents and relational data
- Duplicate data to work around limitations
- Two bills, two sets of credentials

**Get documents + relational today. One database. Full power.**

```bash
npm install @dotdo/documentdb
```

---

## Deployment to mongo.do

The documentdb package deploys as a Cloudflare Worker to `mongo.do`.

### Prerequisites

1. **Cloudflare Account** with Workers and Durable Objects enabled
2. **Wrangler CLI** installed and authenticated (`wrangler login`)
3. **DNS Configuration**: `mongo.do` zone configured in Cloudflare

### Wrangler Configuration

The `wrangler.jsonc` file configures the worker. Key settings for production:

```jsonc
{
  "name": "mongo-do",
  "main": "src/worker/index.ts",
  "compatibility_date": "2026-01-15",
  "compatibility_flags": ["nodejs_compat"],

  // Durable Objects for document storage
  "durable_objects": {
    "bindings": [{ "name": "DOCUMENTDB_DO", "class_name": "DocumentDBDO" }]
  },

  // Production routes - use Workers Custom Domains
  "routes": [
    { "pattern": "mongo.do/*", "custom_domain": true },
    { "pattern": "api.mongo.do/*", "custom_domain": true }
  ],

  // Environment
  "vars": {
    "ENVIRONMENT": "production",
    "OAUTH_ENABLED": "false"
  }
}
```

### DNS Setup

Configure these DNS records in Cloudflare:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| AAAA | mongo.do | 100:: | Proxied |
| AAAA | api.mongo.do | 100:: | Proxied |
| AAAA | staging.mongo.do | 100:: | Proxied |

The `100::` address is Cloudflare's reserved address for Workers Custom Domains.

### Deployment Commands

```bash
# Navigate to the documentdb package
cd packages/documentdb

# Deploy to production
pnpm run deploy
# or: wrangler deploy

# Deploy to staging
wrangler deploy --env staging
# or: wrangler deploy -c wrangler.staging.jsonc

# Dry run (verify configuration without deploying)
pnpm run deploy:dry-run

# View logs
wrangler tail mongo-do
```

### Verification

After deployment, verify the worker is responding:

```bash
# Health check
curl https://mongo.do/health

# Expected response:
# {"status":"ok","service":"mongo.do","timestamp":"...","environment":"production"}

# Root endpoint
curl https://mongo.do/

# Expected response:
# {"name":"mongo.do","version":"0.0.1","description":"MongoDB at the edge...","status":"ok"}
```

### Environment Variables

| Variable | Production | Staging | Description |
|----------|------------|---------|-------------|
| `ENVIRONMENT` | `production` | `staging` | Environment name |
| `OAUTH_ENABLED` | `false` | `false` | Enable OAuth authentication |
| `OAUTH_URL` | `https://oauth.do` | `https://oauth.do` | OAuth provider URL |
| `DOCUMENTDB_DEFAULT_DB` | `documentdb` | `documentdb` | Default database name |
| `MAX_DOCUMENT_SIZE_KB` | `16384` | `16384` | Max document size (16MB) |
| `MAX_BATCH_SIZE` | `1000` | `1000` | Max bulk operation batch |

### Optional R2 and KV Setup

For enhanced storage and caching, create these resources:

```bash
# R2 bucket for document backups
wrangler r2 bucket create documentdb-storage

# KV namespace for caching
wrangler kv:namespace create CACHE
```

Then uncomment the `r2_buckets` and `kv_namespaces` sections in `wrangler.jsonc`.

---

## Part of the postgres.do Ecosystem

| Package | Description |
|---------|-------------|
| [`@dotdo/mongodb`](../mongodb) | MongoDB client wrapper |
| [`mongo.do`](../mongo.do) | Managed MongoDB service |
| [`@dotdo/postgres`](../postgres) | PostgreSQL server |
| [`postgres.do`](../postgres.do) | SQL tagged template client |

---

## Links

- [Documentation](https://postgres.do/docs/documentdb)
- [GitHub](https://github.com/dot-do/postgres)
- [MongoDB Docs](https://www.mongodb.com/docs/manual/) (API reference)

## License

MIT
