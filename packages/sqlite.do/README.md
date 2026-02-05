---
name: sqlite.do
version: 0.0.1
description: High-level API and utilities for distributed SQLite on Cloudflare
license: MIT
keywords:
  - sqlite
  - cloudflare
  - durable-objects
downloads:
  monthly: 85
published: "2026-01-22T11:02:53.960Z"
updated: "2026-01-22T11:02:54.169Z"
---

# sqlite.do

[![npm version](https://img.shields.io/npm/v/sqlite.do.svg)](https://www.npmjs.com/package/sqlite.do)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

**REST API and admin tools for edge SQLite.**

You need HTTP endpoints for your databases. You need admin tools to manage them. You need monitoring to keep them healthy.

**Here's everything you need.**

## The Problem

You've deployed your Durable Object databases. Now what? You need REST endpoints for external integrations. Admin APIs for management. Health checks for monitoring. Building all this from scratch is tedious.

## The Solution

`sqlite.do` provides a complete REST API layer and admin toolkit. Deploy once, manage everything.

```bash
# Query via REST
curl https://sqlite.do/api/my-database/query \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sql": "SELECT * FROM users LIMIT 10"}'

# Admin operations
curl https://sqlite.do/admin/my-database/stats
```

HTTP endpoints. Admin tools. Monitoring. All included.

## Installation

```bash
npm install sqlite.do
```

## REST API

### Query Endpoint

Execute SQL queries via HTTP:

```bash
POST /api/{database}/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "sql": "SELECT * FROM users WHERE active = ?",
  "params": [true]
}
```

Response:

```json
{
  "columns": ["id", "email", "active", "created_at"],
  "rows": [
    { "id": 1, "email": "alice@example.com", "active": true, "created_at": "2024-01-15" }
  ],
  "rowsAffected": 0,
  "lastInsertRowid": null,
  "timing": { "queryMs": 2, "totalMs": 15 }
}
```

### Execute Endpoint

For write operations:

```bash
POST /api/{database}/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "sql": "INSERT INTO users (email, name) VALUES (?, ?)",
  "params": ["bob@example.com", "Bob"]
}
```

Response:

```json
{
  "rowsAffected": 1,
  "lastInsertRowid": 42,
  "timing": { "queryMs": 5, "totalMs": 20 }
}
```

### Batch Endpoint

Multiple statements in one request:

```bash
POST /api/{database}/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "statements": [
    { "sql": "INSERT INTO logs (event) VALUES (?)", "params": ["user_created"] },
    { "sql": "UPDATE stats SET count = count + 1 WHERE name = ?", "params": ["users"] },
    { "sql": "SELECT count FROM stats WHERE name = ?", "params": ["users"] }
  ]
}
```

### Transaction Endpoint

ACID transactions via REST:

```bash
POST /api/{database}/transaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "mode": "write",
  "statements": [
    { "sql": "INSERT INTO orders (user_id, total) VALUES (?, ?)", "params": [1, 99.99] },
    { "sql": "UPDATE users SET order_count = order_count + 1 WHERE id = ?", "params": [1] }
  ]
}
```

## Admin API

### Database Management

```bash
# List all databases
GET /admin/databases
Authorization: Bearer <admin-token>

# Get database info
GET /admin/{database}/info

# Get database stats
GET /admin/{database}/stats

# Export database
GET /admin/{database}/export
Accept: application/x-sqlite3

# Delete database
DELETE /admin/{database}
```

### Schema Operations

```bash
# Get schema
GET /admin/{database}/schema

# Get table info
GET /admin/{database}/tables/{table}

# Get indexes
GET /admin/{database}/indexes
```

### Health & Monitoring

```bash
# Health check
GET /admin/{database}/health

# Response:
{
  "status": "healthy",
  "database": "my-database",
  "stats": {
    "tables": 5,
    "rows": 12450,
    "sizeBytes": 524288,
    "walSizeBytes": 8192
  },
  "sync": {
    "localLsn": 1234,
    "lastSyncTime": "2024-01-15T10:30:00Z",
    "pendingFrames": 0
  }
}
```

## Quick Start

### Deploy the API

```typescript
import { createSqliteDoApp } from 'sqlite.do'

const app = createSqliteDoApp({
  // Authentication
  authToken: env.AUTH_TOKEN,
  adminToken: env.ADMIN_TOKEN,

  // Rate limiting
  rateLimit: {
    queries: 1000,   // per minute
    writes: 100      // per minute
  },

  // CORS
  cors: {
    origins: ['https://myapp.com'],
    methods: ['GET', 'POST']
  }
})

export default app
```

### Wrangler Configuration

```toml
# wrangler.toml
name = "sqlite-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [
  { name = "DATABASE", class_name = "DatabaseDO" }
]

[vars]
AUTH_TOKEN = "your-auth-token"
ADMIN_TOKEN = "your-admin-token"
```

### Client Usage

```typescript
import { SqliteDoClient } from 'sqlite.do'

const client = new SqliteDoClient({
  baseUrl: 'https://sqlite.do',
  database: 'my-database',
  authToken: process.env.AUTH_TOKEN
})

// Query
const users = await client.query('SELECT * FROM users WHERE active = ?', [true])

// Execute
const result = await client.execute(
  'INSERT INTO users (email) VALUES (?)',
  ['new@example.com']
)

// Batch
const results = await client.batch([
  { sql: 'INSERT INTO logs (msg) VALUES (?)', params: ['event1'] },
  { sql: 'SELECT COUNT(*) FROM logs' }
])

// Transaction
await client.transaction([
  { sql: 'UPDATE accounts SET balance = balance - ?', params: [100] },
  { sql: 'INSERT INTO transfers (amount) VALUES (?)', params: [100] }
])
```

## Authentication

### Bearer Token

```typescript
const app = createSqliteDoApp({
  authToken: env.AUTH_TOKEN
})

// Requests must include:
// Authorization: Bearer <token>
```

### Per-Database Tokens

```typescript
const app = createSqliteDoApp({
  authStrategy: 'per-database',
  getToken: async (database: string) => {
    return env[`TOKEN_${database.toUpperCase()}`]
  }
})
```

### Custom Authentication

```typescript
const app = createSqliteDoApp({
  authenticate: async (request: Request) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    // Your authentication logic
    const user = await validateToken(token)

    if (!user) {
      return { authenticated: false, error: 'Invalid token' }
    }

    return {
      authenticated: true,
      user,
      permissions: user.role === 'admin' ? ['read', 'write', 'admin'] : ['read']
    }
  }
})
```

## Rate Limiting

```typescript
const app = createSqliteDoApp({
  rateLimit: {
    // Queries per minute
    queries: 1000,

    // Writes per minute
    writes: 100,

    // By IP or token
    keyBy: 'token',  // or 'ip'

    // Custom key function
    getKey: (request) => {
      return request.headers.get('X-API-Key') || 'anonymous'
    }
  }
})
```

## Monitoring & Observability

### Request Logging

```typescript
const app = createSqliteDoApp({
  logging: {
    enabled: true,
    level: 'info',
    includeQuery: true,      // Log SQL queries
    includeTiming: true,     // Log execution times
    destination: 'console'   // or 'logpush'
  }
})
```

### Metrics

```typescript
const app = createSqliteDoApp({
  metrics: {
    enabled: true,
    endpoint: '/metrics',    // Prometheus-compatible
    include: ['queries', 'writes', 'errors', 'latency']
  }
})

// GET /metrics
// sqlite_queries_total{database="mydb"} 12345
// sqlite_query_latency_seconds{database="mydb",quantile="0.99"} 0.015
```

### Webhooks

```typescript
const app = createSqliteDoApp({
  webhooks: {
    onError: 'https://myapp.com/webhooks/sqlite-error',
    onSlowQuery: {
      url: 'https://myapp.com/webhooks/slow-query',
      thresholdMs: 100
    }
  }
})
```

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/{db}/query` | Execute SELECT query |
| `POST` | `/api/{db}/execute` | Execute write operation |
| `POST` | `/api/{db}/batch` | Execute multiple statements |
| `POST` | `/api/{db}/transaction` | Execute transaction |
| `GET` | `/admin/databases` | List databases |
| `GET` | `/admin/{db}/info` | Database info |
| `GET` | `/admin/{db}/stats` | Database statistics |
| `GET` | `/admin/{db}/schema` | Database schema |
| `GET` | `/admin/{db}/health` | Health check |
| `GET` | `/admin/{db}/export` | Export database |
| `DELETE` | `/admin/{db}` | Delete database |

### Error Responses

```json
{
  "error": {
    "code": "SQLITE_CONSTRAINT_UNIQUE",
    "message": "UNIQUE constraint failed: users.email",
    "details": {
      "table": "users",
      "column": "email"
    }
  }
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request (invalid SQL, missing params) |
| `401` | Unauthorized |
| `403` | Forbidden (insufficient permissions) |
| `404` | Database not found |
| `429` | Rate limited |
| `500` | Server error |

## TypeScript SDK

Full type safety for API responses:

```typescript
import { SqliteDoClient, QueryResult, ExecuteResult } from 'sqlite.do'

interface User {
  id: number
  email: string
  name: string
}

const client = new SqliteDoClient({ ... })

// Typed results
const result = await client.query<User>('SELECT * FROM users WHERE id = ?', [1])
const user: User = result.rows[0]

// Type inference
const users = await client.query<User>('SELECT * FROM users')
users.rows.forEach(user => {
  console.log(user.email)  // TypeScript knows this is string
})
```

## Links

- [GitHub Repository](https://github.com/dotdo-io/sqlite)
- [API Documentation](https://sqlite.do/docs/api)
- [Authentication Guide](https://sqlite.do/docs/auth)

## License

MIT
