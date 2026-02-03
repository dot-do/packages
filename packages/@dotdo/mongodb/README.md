---
name: "@dotdo/mongodb"
version: 0.1.1
description: "MongoDB client compatibility wrapper using capnweb RPC to @dotdo/documentdb backend"
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - mongodb
  - documentdb
  - cloudflare
  - workers
  - compatibility
  - client
downloads:
  monthly: 165
published: "2026-01-22T15:58:42.382Z"
updated: "2026-01-24T15:49:02.625Z"
---

# @dotdo/mongodb

> MongoDB driver API, PostgreSQL backend. Same `find()` and `insertOne()`, edge-native performance.

**Already using MongoDB? Just change this line:**

```typescript
// Before
import { MongoClient } from 'mongodb'

// After
import { MongoClient } from '@dotdo/mongodb'
```

That's it. Your queries just work, now backed by PostgreSQL at the edge.

---

## The Problem

MongoDB Atlas promised simplicity. And it delivered - for a while.

Now you're facing trade-offs:

- **External:** Your MongoDB code is everywhere. Migrating means rewriting thousands of queries.
- **Internal:** You know the MongoDB API. You don't want to learn SQL.
- **Philosophical:** You shouldn't have to choose between familiar syntax and relational guarantees.

Your cluster lives in one region. Your edge functions can't reach it efficiently. Schema-less felt liberating until you needed to debug production data.

---

## The Guide

**@dotdo/mongodb** is the MongoDB driver API backed by PostgreSQL JSONB. Same `MongoClient`. Same `find()`. Same `insertMany()`. Same cursor API.

Your queries route to PostgreSQL. Your data gets relational superpowers. Your database runs at the edge.

No API changes. No query rewrites. Just swap the import.

---

## The Plan

### Step 1: Install

```bash
npm install @dotdo/mongodb
```

### Step 2: Update Import

```typescript
// Before
import { MongoClient } from 'mongodb'

// After
import { MongoClient } from '@dotdo/mongodb'
```

### Step 3: Update Connection String

```typescript
// Before (MongoDB Atlas)
const client = new MongoClient('mongodb+srv://user:pass@cluster.mongodb.net/mydb')

// After (postgres.do)
const client = new MongoClient('mongodb://db.postgres.do/mydb')
```

**Done.** Your `find()`, `insertMany()`, and aggregation pipelines work unchanged.

---

## Success: What You Get

| Before (MongoDB Atlas) | After (@dotdo/mongodb) |
|------------------------|------------------------|
| Regional clusters | Edge database in 300+ locations |
| Minimum cluster costs | $0 for idle (hibernation) |
| Per-operation pricing | FREE reads via Cloudflare Cache |
| MongoDB-only | PostgreSQL superpowers (joins, constraints, SQL when needed) |

---

## Avoid the Failure

Without action:

- You pay minimum cluster costs even for small workloads
- Edge functions add latency reaching regional databases
- Schema-less data becomes harder to reason about
- You miss PostgreSQL features like foreign keys and transactions

---

## API Compatibility

### Client & Database

```typescript
import { MongoClient } from '@dotdo/mongodb'

const client = new MongoClient('mongodb://db.postgres.do/mydb')
await client.connect()

// Get database
const db = client.db('mydb')

// List collections
const collections = await db.listCollections().toArray()

// Close connection
await client.close()
```

### Collection CRUD

```typescript
const users = db.collection('users')

// Insert
const { insertedId } = await users.insertOne({ name: 'John', email: 'john@example.com' })
const { insertedIds } = await users.insertMany([
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
])

// Find
const user = await users.findOne({ _id: id })
const allUsers = await users.find({ active: true }).toArray()

// Update
await users.updateOne({ _id: id }, { $set: { verified: true } })
await users.updateMany({ active: false }, { $set: { archived: true } })

// Delete
await users.deleteOne({ _id: id })
await users.deleteMany({ status: 'spam' })

// Replace
await users.replaceOne({ _id: id }, { name: 'New Name', email: 'new@example.com' })

// Count
const count = await users.countDocuments({ active: true })
const estimated = await users.estimatedDocumentCount()
```

### Cursor API

```typescript
const cursor = users.find({ active: true })

// Chain methods (fluent API)
cursor
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(20)
  .project({ name: 1, email: 1, _id: 0 })

// Get results
const docs = await cursor.toArray()

// Or iterate
for await (const doc of cursor) {
  console.log(doc)
}

// Or use forEach
await cursor.forEach(doc => console.log(doc))

// Cursor methods
await cursor.hasNext()  // Check if more documents
await cursor.next()     // Get next document
await cursor.count()    // Count matching documents
```

### Update Operators

```typescript
// Currently implemented operators
await users.updateOne({ _id: id }, {
  // Set fields
  $set: { status: 'active', 'profile.verified': true },

  // Unset fields
  $unset: { tempField: '' },

  // Increment numeric fields
  $inc: { loginCount: 1, 'stats.views': 5 },

  // Array: push (add element)
  $push: { tags: 'premium' },

  // Array: pull (remove matching elements)
  $pull: { tags: 'trial' },
})

// Additional operators (planned):
// $mul, $min, $max, $rename, $setOnInsert, $currentDate, $addToSet, $pop
```

### Query Operators

```typescript
// Comparison
await users.find({
  age: { $eq: 25 },      // Equal
  age: { $ne: 25 },      // Not equal
  age: { $gt: 18 },      // Greater than
  age: { $gte: 18 },     // Greater than or equal
  age: { $lt: 65 },      // Less than
  age: { $lte: 65 },     // Less than or equal
  age: { $in: [18, 21, 25] },      // In array
  age: { $nin: [0, -1] },          // Not in array
})

// Logical
await users.find({
  $and: [{ active: true }, { verified: true }],
  $or: [{ role: 'admin' }, { role: 'moderator' }],
  $not: { status: 'banned' },
  $nor: [{ deleted: true }, { suspended: true }],
})

// Element
await users.find({
  email: { $exists: true },        // Field exists
  age: { $type: 'number' },        // Field type
})

// Array
await users.find({
  tags: { $all: ['a', 'b'] },      // Contains all
  tags: { $size: 3 },              // Array length
  tags: { $elemMatch: { $gte: 5 } }, // Element matches
})

// Regex
await users.find({
  name: { $regex: '^John', $options: 'i' },
})
```

### Aggregation Pipeline

```typescript
const results = await users.aggregate([
  // Match stage - filter documents
  { $match: { active: true } },

  // Group stage - aggregate by field
  { $group: {
    _id: '$department',
    count: { $sum: 1 },
    avgSalary: { $avg: '$salary' },
    maxSalary: { $max: '$salary' },
    minSalary: { $min: '$salary' },
    firstEmployee: { $first: '$name' },
    lastEmployee: { $last: '$name' },
    names: { $push: '$name' }
  }},

  // Sort stage - order results
  { $sort: { count: -1 } },

  // Skip stage - pagination
  { $skip: 0 },

  // Limit stage - limit results
  { $limit: 10 },

  // Project stage - shape output
  { $project: {
    department: '$_id',
    count: 1,
    avgSalary: 1
  }},

  // Unwind stage - deconstruct arrays
  { $unwind: '$names' }  // or { $unwind: { path: '$names' } }
]).toArray()

// Supported pipeline stages: $match, $project, $group, $sort, $skip, $limit, $unwind
// Supported group accumulators: $sum, $avg, $min, $max, $first, $last, $push
```

### ObjectId

```typescript
import { ObjectId } from '@dotdo/mongodb'

// Create new ObjectId
const id = new ObjectId()

// Parse from string
const id = new ObjectId('507f1f77bcf86cd799439011')

// Check validity
ObjectId.isValid('507f1f77bcf86cd799439011')  // true

// Compare ObjectIds
id.equals(otherId)

// Get creation timestamp
id.getTimestamp()  // Date when ObjectId was created

// Convert to string
id.toString()      // '507f1f77bcf86cd799439011'
id.toHexString()   // '507f1f77bcf86cd799439011'
```

---

## Complete API Examples

### All CRUD Methods

```typescript
const users = db.collection('users')

// ===== INSERT =====
// Insert single document
const { insertedId } = await users.insertOne({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30
})

// Insert multiple documents
const { insertedIds, insertedCount } = await users.insertMany([
  { name: 'Bob', email: 'bob@example.com', age: 25 },
  { name: 'Carol', email: 'carol@example.com', age: 35 }
])

// ===== FIND =====
// Find single document
const user = await users.findOne({ name: 'Alice' })

// Find with query operators
const adults = await users.find({ age: { $gte: 18 } }).toArray()

// Find with cursor methods
const results = await users
  .find({ active: true })
  .sort({ createdAt: -1 })
  .skip(10)
  .limit(20)
  .project({ name: 1, email: 1 })
  .toArray()

// ===== UPDATE =====
// Update single document
const updateResult = await users.updateOne(
  { name: 'Alice' },
  { $set: { verified: true }, $inc: { loginCount: 1 } }
)

// Update multiple documents
await users.updateMany(
  { active: false },
  { $set: { archived: true } }
)

// Update with upsert
await users.updateOne(
  { email: 'new@example.com' },
  { $set: { name: 'New User' } },
  { upsert: true }
)

// ===== REPLACE =====
// Replace entire document (preserves _id only)
await users.replaceOne(
  { name: 'Alice' },
  { name: 'Alice Smith', email: 'alice.smith@example.com', age: 31 }
)

// ===== DELETE =====
// Delete single document
const deleteResult = await users.deleteOne({ name: 'Bob' })

// Delete multiple documents
await users.deleteMany({ archived: true })

// ===== COUNT =====
// Count with filter
const activeCount = await users.countDocuments({ active: true })

// Estimated count (total documents)
const totalCount = await users.estimatedDocumentCount()
```

### All Query Operators

```typescript
// ===== COMPARISON OPERATORS =====
await users.find({ age: { $eq: 25 } })      // Equal to 25
await users.find({ age: { $ne: 25 } })      // Not equal to 25
await users.find({ age: { $gt: 18 } })      // Greater than 18
await users.find({ age: { $gte: 18 } })     // Greater than or equal to 18
await users.find({ age: { $lt: 65 } })      // Less than 65
await users.find({ age: { $lte: 65 } })     // Less than or equal to 65
await users.find({ age: { $in: [18, 21, 25] } })   // In array
await users.find({ age: { $nin: [0, -1] } })       // Not in array

// ===== LOGICAL OPERATORS =====
// $and - all conditions must match
await users.find({
  $and: [
    { active: true },
    { verified: true }
  ]
})

// $or - at least one condition must match
await users.find({
  $or: [
    { role: 'admin' },
    { role: 'moderator' }
  ]
})

// $nor - none of the conditions must match
await users.find({
  $nor: [
    { deleted: true },
    { suspended: true }
  ]
})

// $not - negates a condition
await users.find({
  age: { $not: { $lt: 18 } }  // age is NOT less than 18
})

// ===== ELEMENT OPERATORS =====
// Check if field exists
await users.find({ email: { $exists: true } })

// Check field type
await users.find({ age: { $type: 'number' } })

// ===== ARRAY OPERATORS =====
// $all - array contains all specified elements
await users.find({
  tags: { $all: ['active', 'verified'] }
})

// $size - array has exact length
await users.find({
  tags: { $size: 3 }
})

// $elemMatch - array element matches multiple conditions
await users.find({
  scores: { $elemMatch: { $gte: 80, $lt: 90 } }
})

// ===== REGEX OPERATOR =====
// Case-sensitive regex
await users.find({
  name: { $regex: '^John' }
})

// Case-insensitive regex
await users.find({
  email: { $regex: '@gmail\\.com$', $options: 'i' }
})
```

### All Update Operators

```typescript
// ===== FIELD OPERATORS =====
// $set - set field values
await users.updateOne(
  { name: 'Alice' },
  { $set: { verified: true, 'profile.bio': 'Hello world' } }
)

// $unset - remove fields
await users.updateOne(
  { name: 'Alice' },
  { $unset: { tempField: '', 'profile.draft': '' } }
)

// $inc - increment numeric fields
await users.updateOne(
  { name: 'Alice' },
  { $inc: { loginCount: 1, 'stats.views': 10 } }
)

// ===== ARRAY OPERATORS =====
// $push - add element to array
await users.updateOne(
  { name: 'Alice' },
  { $push: { tags: 'premium' } }
)

// $pull - remove matching elements from array
await users.updateOne(
  { name: 'Alice' },
  { $pull: { tags: 'trial' } }
)
```

---

## Feature Compatibility Matrix

### Core Methods

| Feature | mongodb (official) | @dotdo/mongodb | Notes |
|---------|-------------------|----------------|-------|
| `MongoClient` | ✓ | ✓ | Full support |
| `Db` / `Collection` | ✓ | ✓ | Full support |
| `insertOne()` | ✓ | ✓ | Full support |
| `insertMany()` | ✓ | ✓ | Full support |
| `findOne()` | ✓ | ✓ | Full support |
| `find()` | ✓ | ✓ | Full support |
| `updateOne()` | ✓ | ✓ | Full support |
| `updateMany()` | ✓ | ✓ | Full support |
| `replaceOne()` | ✓ | ✓ | Full support |
| `deleteOne()` | ✓ | ✓ | Full support |
| `deleteMany()` | ✓ | ✓ | Full support |
| `countDocuments()` | ✓ | ✓ | Full support |
| `estimatedDocumentCount()` | ✓ | ✓ | Full support |
| `aggregate()` | ✓ | ✓ | See pipeline stages below |

### Cursor API

| Feature | mongodb (official) | @dotdo/mongodb | Notes |
|---------|-------------------|----------------|-------|
| `.toArray()` | ✓ | ✓ | Full support |
| `.forEach()` | ✓ | ✓ | Full support |
| `.next()` | ✓ | ✓ | Full support |
| `.hasNext()` | ✓ | ✓ | Full support |
| `.count()` | ✓ | ✓ | Full support |
| `.sort()` | ✓ | ✓ | Full support |
| `.limit()` | ✓ | ✓ | Full support |
| `.skip()` | ✓ | ✓ | Full support |
| `.project()` | ✓ | ✓ | Full support |

### Query Operators

| Operator | mongodb (official) | @dotdo/mongodb | Notes |
|----------|-------------------|----------------|-------|
| `$eq`, `$ne` | ✓ | ✓ | Equality |
| `$gt`, `$gte`, `$lt`, `$lte` | ✓ | ✓ | Comparison |
| `$in`, `$nin` | ✓ | ✓ | Array membership |
| `$and`, `$or`, `$nor` | ✓ | ✓ | Logical operators |
| `$not` | ✓ | ✓ | Negation |
| `$exists`, `$type` | ✓ | ✓ | Element operators |
| `$regex`, `$options` | ✓ | ✓ | Regular expressions |
| `$all`, `$size`, `$elemMatch` | ✓ | ✓ | Array operators |

### Update Operators

| Operator | mongodb (official) | @dotdo/mongodb | Notes |
|----------|-------------------|----------------|-------|
| `$set` | ✓ | ✓ | Set field values |
| `$unset` | ✓ | ✓ | Remove fields |
| `$inc` | ✓ | ✓ | Increment numbers |
| `$push` | ✓ | ✓ | Add to array |
| `$pull` | ✓ | ✓ | Remove from array |
| `$mul` | ✓ | Planned | Multiply numbers |
| `$min`, `$max` | ✓ | Planned | Min/max values |
| `$rename` | ✓ | Planned | Rename fields |
| `$setOnInsert` | ✓ | Planned | Set on upsert |
| `$currentDate` | ✓ | Planned | Current timestamp |
| `$addToSet` | ✓ | Planned | Add unique to array |
| `$pop` | ✓ | Planned | Remove first/last from array |

### Aggregation Pipeline

| Stage | mongodb (official) | @dotdo/mongodb | Notes |
|-------|-------------------|----------------|-------|
| `$match` | ✓ | ✓ | Filter documents |
| `$project` | ✓ | ✓ | Reshape documents |
| `$group` | ✓ | ✓ | Group by key |
| `$sort` | ✓ | ✓ | Sort documents |
| `$limit` | ✓ | ✓ | Limit results |
| `$skip` | ✓ | ✓ | Skip results |
| `$unwind` | ✓ | ✓ | Deconstruct arrays |
| `$lookup` | ✓ | Planned | Join collections |
| `$count` | ✓ | Planned | Count documents |
| `$facet` | ✓ | Planned | Multi-faceted aggregation |

### Group Accumulators

| Accumulator | mongodb (official) | @dotdo/mongodb | Notes |
|-------------|-------------------|----------------|-------|
| `$sum` | ✓ | ✓ | Sum values |
| `$avg` | ✓ | ✓ | Average values |
| `$min` | ✓ | ✓ | Minimum value |
| `$max` | ✓ | ✓ | Maximum value |
| `$first` | ✓ | ✓ | First value |
| `$last` | ✓ | ✓ | Last value |
| `$push` | ✓ | ✓ | Array of values |

### Other Features

| Feature | mongodb (official) | @dotdo/mongodb | Notes |
|---------|-------------------|----------------|-------|
| `ObjectId` | ✓ | ✓ | Full support |
| TypeScript types | ✓ | ✓ | Full support |
| Indexes | ✓ | Planned | Coming soon |
| Change streams | ✓ | Planned | Coming soon |
| Transactions | ✓ | Planned | Coming soon |
| Sessions | ✓ | Planned | Coming soon |

---

## TypeScript Support

Full type definitions with generic collections:

```typescript
import { MongoClient, ObjectId } from '@dotdo/mongodb'
import type {
  Document,
  Filter,
  UpdateFilter,
  InsertOneResult,
  InsertManyResult,
  UpdateResult,
  DeleteResult,
  FindOptions,
  Sort,
  SortDirection,
  MongoClientOptions,
} from '@dotdo/mongodb'

// Define your document type
interface User extends Document {
  _id?: ObjectId
  name: string
  email: string
  active: boolean
  createdAt: Date
}

const client = new MongoClient(url)
await client.connect()

// Typed collection
const users = client.db().collection<User>('users')

// Fully typed operations
const user = await users.findOne({ name: 'John' })
// user is User | null

const { insertedId } = await users.insertOne({
  name: 'Jane',
  email: 'jane@example.com',
  active: true,
  createdAt: new Date()
})

// Filter is type-checked
await users.updateOne(
  { email: 'jane@example.com' },  // Filter<User>
  { $set: { active: false } }     // UpdateFilter<User>
)
```

---

## Why PostgreSQL Under the Hood?

Your MongoDB queries translate to PostgreSQL JSONB operations. This gives you:

- **ACID transactions** - Real transactional guarantees
- **Foreign keys** - Relational integrity when you need it
- **SQL escape hatch** - Drop to raw SQL for complex queries
- **Proven reliability** - 30+ years of PostgreSQL stability
- **Edge deployment** - Runs in Cloudflare Durable Objects worldwide

Same API you know. Better foundation underneath.

---

## Part of postgres.do

@dotdo/mongodb is part of the [postgres.do](https://github.com/dot-do/postgres) ecosystem - PostgreSQL at the edge.

| Package | Description |
|---------|-------------|
| [`@dotdo/documentdb`](https://github.com/dot-do/postgres/tree/main/packages/documentdb) | DocumentDB server (MongoDB wire protocol) |
| [`mongo.do`](https://github.com/dot-do/postgres/tree/main/packages/mongo.do) | Managed MongoDB-compatible service |
| [`@dotdo/postgres`](https://github.com/dot-do/postgres/tree/main/packages/postgres) | Edge PostgreSQL server |
| [`postgres.do`](https://github.com/dot-do/postgres/tree/main/packages/postgres.do) | SQL tagged template client |

---

## Links

- [Documentation](https://postgres.do/docs/mongodb)
- [GitHub](https://github.com/dot-do/postgres)
- [MongoDB Driver Reference](https://www.mongodb.com/docs/drivers/node/current/) (for API compatibility)

## License

MIT
