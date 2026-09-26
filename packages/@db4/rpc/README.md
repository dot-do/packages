---
name: "@db4/rpc"
version: 0.1.2
description: CapnWeb magic-map RPC for db4 document database
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - rpc
  - capnproto
  - cloudflare
  - workers
  - durable-objects
  - magic-map
downloads:
  monthly: 16
published: "2026-01-20T11:32:10.860Z"
updated: "2026-01-23T17:20:40.713Z"
---

# @db4/rpc

([GitHub](https://github.com/dot-do/db4/tree/main/packages/rpc), [npm](https://www.npmjs.com/package/@db4/rpc))

**N+1 queries are killing your app.** Fetch a user. Then their orders. Then each order's items. Then inventory for each item. Four waterfalls of network latency. Your users wait. Your bills spike.

What if your code ran *inside* the database?

## The Magic-Map Pattern

`@db4/rpc` implements **CapnWeb**—an RPC protocol that captures client code, serializes it, and replays it server-side. Write normal JavaScript. Get one round trip.

```typescript
import { createClient } from '@db4/rpc'

const db = createClient({ url: 'https://api.example.com/rpc' }).proxy()

// Looks like 4 round trips...
const user = await db.users.get('user-123')
const orders = await db.orders.list({ userId: user.id })
const items = await Promise.all(
  orders.map(order => db.items.getByOrder(order.id))
)

// Magic-map makes it ONE:
const items = await db.items.getByOrder.map(orderIds)
```

## How It Works

```
CLIENT                              SERVER
──────                              ──────
db.users.get('123')           ─┐
db.orders.list({userId:'123'}) ─┼──▶ Batch Request
db.items.get.map(itemIds)     ─┘         │
                                         ▼
                                   Execute all in parallel
                                         │
◀────────────────────────────────────────┘
All results, single response          Batch Response
```

**Three steps:**
1. **Capture** — Proxy records each method call as a path
2. **Batch** — Calls collect into one request
3. **Replay** — Server executes all methods, returns all results

## Quick Start

### 1. Install

```bash
npm install @db4/rpc
```

### 2. Create a Server

```typescript
import { CapnWebServer } from '@db4/rpc'

const api = {
  users: {
    get: async (id: string) => db.query('SELECT * FROM users WHERE id = ?', [id]),
    list: async (filter: { active?: boolean }) => db.query('SELECT * FROM users WHERE active = ?', [filter.active]),
  },
  orders: {
    list: async ({ userId }: { userId: string }) => db.query('SELECT * FROM orders WHERE user_id = ?', [userId]),
    create: async (data: { userId: string; items: string[] }) => {
      return db.transaction(async (tx) => {
        const order = await tx.insert('orders', { userId: data.userId })
        await Promise.all(data.items.map(item =>
          tx.insert('order_items', { orderId: order.id, itemId: item })
        ))
        return order
      })
    },
  },
}

const server = new CapnWebServer(api, {
  compression: { enabled: true, algorithm: 'gzip' },
})

export default { fetch: (request: Request) => server.fetch(request) }
```

### 3. Create a Client

```typescript
import { createClient } from '@db4/rpc'

interface API {
  users: {
    get(id: string): Promise<User>
    list(filter: { active?: boolean }): Promise<User[]>
  }
  orders: {
    list(filter: { userId: string }): Promise<Order[]>
    create(data: { userId: string; items: string[] }): Promise<Order>
  }
}

const db = createClient({
  url: 'https://api.example.com/rpc',
  batchWindow: 10, // Collect calls for 10ms
}).proxy<API>()
```

## Batch Operations

### `.map()` — Automatic Batching

Transform arrays into single batch requests:

```typescript
const userIds = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5']

// WITHOUT magic-map: 5 requests (N+1)
const users = await Promise.all(userIds.map(id => db.users.get(id)))

// WITH magic-map: 1 request
const users = await db.users.get.map(userIds)
```

For complex arguments:

```typescript
const users = await db.users.get.map(userIds, (id) => [id, { includeProfile: true }])
```

### `$batch()` — Manual Batching

Group heterogeneous operations:

```typescript
const batch = db.$batch()

const userPromise = batch.users.get('user-123')
const ordersPromise = batch.orders.list({ userId: 'user-123' })
const statsPromise = batch.analytics.getUserStats('user-123')

// Nothing sent yet—execute all at once
await batch.$execute()

const [user, orders, stats] = await Promise.all([userPromise, ordersPromise, statsPromise])
```

## Real-Time Subscriptions

Live updates over WebSocket:

```typescript
import { createWebSocketClient } from '@db4/rpc'

const client = createWebSocketClient('wss://api.example.com/rpc', {
  reconnect: true,
  pingInterval: 30000,
})

const subscription = client.subscribeDocument({
  documentId: 'order-123',
  collection: 'orders',
})

subscription.onData((event) => console.log('Order updated:', event.data))
subscription.onError((error) => console.error('Subscription error:', error))
subscription.unsubscribe()
```

## Server Middleware

Add auth, logging, and rate limiting:

```typescript
import {
  CapnWebServer,
  createAuthMiddleware,
  createLoggingMiddleware,
  createRateLimitMiddleware,
} from '@db4/rpc'

const server = new CapnWebServer(api, {
  middleware: [
    createLoggingMiddleware((msg, data) => logger.info(msg, data)),

    createAuthMiddleware(async (request, context) => {
      const token = context.headers?.authorization?.replace('Bearer ', '')
      const user = await verifyToken(token)
      context.user = user
      return !!user
    }),

    createRateLimitMiddleware({
      maxRequests: 100,
      windowMs: 60000,
      keyFn: (req, ctx) => ctx.user?.id ?? ctx.clientIp ?? 'anonymous',
    }),
  ],
})
```

## API Reference

### Client

| Export | Description |
|--------|-------------|
| `createClient(options)` | RPC client with configurable transport |
| `createHttpClient(url, options?)` | HTTP-only client |
| `createWebSocketClient(url, options?)` | WebSocket client with reconnection |
| `CapnWebClient` | Full client with batching and subscriptions |
| `RPCError` | RPC failure errors |

### Server

| Export | Description |
|--------|-------------|
| `CapnWebServer` | RPC server with HTTP and WebSocket handlers |
| `createRPCHandler(instance, options?)` | Quick server factory |
| `createAuthMiddleware(validator, errorMessage?)` | Authentication |
| `createLoggingMiddleware(logger?)` | Request logging |
| `createRateLimitMiddleware(options)` | Rate limiting |
| `createPathValidationMiddleware(allowedPaths)` | Path allowlist |
| `expose(options?)` | Decorator for RPC-callable methods |
| `getExposedMethods(instance)` | Get exposed methods |
| `createExposedOnlyResolver()` | Resolver for exposed methods only |

### Magic Map

| Export | Description |
|--------|-------------|
| `createMagicMap(transport)` | Proxy that captures method calls |
| `createTypedMagicMap<T>(transport)` | Type-safe magic map |
| `isMagicMapProxy(value)` | Check if value is magic map proxy |
| `getProxyPath(proxy)` | Get current proxy path |
| `MagicMapResolutionError` | Magic map failures |

### Serialization & Protocol

| Export | Description |
|--------|-------------|
| `JsonSerializer` | JSON serializer |
| `CapnWebSerializer` | Binary serializer |
| `createSerializer(format?)` | Create 'json' or 'binary' serializer |
| `ProtocolEncoder` | Binary encoder with compression |
| `ProtocolDecoder` | Binary decoder |
| `createProtocol(options?)` | Create encoder/decoder pair |

### Subscriptions

| Export | Description |
|--------|-------------|
| `Subscription` | Client-side subscription |
| `SubscriptionManager` | Client subscription manager |
| `SubscriptionRegistry` | Server-side registry |

## The Numbers

Typical e-commerce page with 10 orders, 5 items each:

| Approach | Requests | Latency (100ms RTT) |
|----------|----------|---------------------|
| Naive N+1 | 1 + N + N*M | **5+ seconds** |
| Manual optimization | 3-5 | 300-500ms |
| **Magic-map** | **1** | **100ms** |

**50x faster. One line of code.**

## Why CapnWeb?

- **Zero boilerplate** — No GraphQL schemas, no REST endpoints
- **Type-safe** — Full TypeScript inference
- **Automatic batching** — `.map()` and `$batch()` kill N+1
- **Binary protocol** — CapnProto-inspired efficiency
- **Edge-native** — Built for Cloudflare Workers
- **Real-time** — WebSocket subscriptions with auto-reconnect

---

Stop waiting for waterfalls. Ship faster.

```bash
npm install @db4/rpc
```

## License

MIT
