---
name: "@db4/auth"
version: 0.1.2
description: JWT validation and authentication for db4 document database
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - auth
  - jwt
  - jwks
  - cloudflare
  - workers
downloads:
  monthly: 20
published: "2026-01-20T11:28:41.420Z"
updated: "2026-01-23T17:20:00.937Z"
---

# @db4/auth

([GitHub](https://github.com/dot-do/db4/tree/main/packages/auth), [npm](https://www.npmjs.com/package/@db4/auth))

**Your auth is a liability.** Third-party services add 200ms latency. DIY implementations leak credentials. Monolithic libraries bloat your Workers. And while you struggle to coordinate rate limiting across distributed nodes, attackers slip through the gaps.

`@db4/auth` ends this. Edge-native JWT validation, session management, and rate limiting—zero dependencies, pure Web Crypto, built for Cloudflare Workers.

## Features

- **JWT Validation** - RS256, ES256, HS256 with JWKS auto-caching
- **Session Management** - Create, validate, refresh, revoke with pluggable storage
- **Rate Limiting** - Token bucket, sliding window, fixed window with composite IP/user limits
- **Edge-Native** - Zero dependencies, Web Crypto API, Cloudflare Workers optimized

## Installation

```bash
npm install @db4/auth
```

## 3 Steps to Secure Your Edge

### 1. Validate JWTs

```typescript
import { validateJWT, JWKSClient, JWTExpiredError } from '@db4/auth'

const jwks = new JWKSClient({ cacheTTL: 600000 }) // 10-minute cache

export default {
  async fetch(request: Request): Promise<Response> {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 })
    }

    try {
      const keys = await jwks.getJWKS('https://auth.example.com/.well-known/jwks.json')
      const { payload } = await validateJWT(authHeader.slice(7), keys, {
        issuer: 'https://auth.example.com',
        audience: 'my-api',
        algorithms: ['RS256', 'ES256'],
      })

      return new Response(`Hello, ${payload.sub}!`)
    } catch (error) {
      if (error instanceof JWTExpiredError) {
        return new Response('Token expired', { status: 401 })
      }
      return new Response('Invalid token', { status: 401 })
    }
  },
}
```

### 2. Manage Sessions

```typescript
import { SessionManager, SessionExpiredError, SessionRevokedError } from '@db4/auth'

const sessions = new SessionManager({ defaultExpiresIn: 86400 }) // 24 hours

// Create after login
const session = await sessions.createSession('user-123', {
  metadata: { device: 'mobile', ip: request.headers.get('CF-Connecting-IP') },
})

// Validate on requests
try {
  const validated = await sessions.validateSession(sessionId)
} catch (error) {
  if (error instanceof SessionExpiredError) {
    return new Response('Session expired', { status: 401 })
  }
  if (error instanceof SessionRevokedError) {
    return new Response('Session revoked', { status: 401 })
  }
}

// Revoke all on password change
await sessions.revokeAllUserSessions('user-123')
```

### 3. Rate Limit

```typescript
import {
  CompositeRateLimiter,
  createRateLimitResponse,
  createCompositeRateLimitHeaders,
  applyRateLimitHeaders,
} from '@db4/auth'

const rateLimiter = new CompositeRateLimiter()

export default {
  async fetch(request: Request): Promise<Response> {
    const result = await rateLimiter.check(
      {
        ip: request.headers.get('CF-Connecting-IP') ?? undefined,
        userId: getUserIdFromToken(request),
      },
      {
        perIP: { limit: 100, window: 60 },    // 100/min per IP
        perUser: { limit: 1000, window: 60 }, // 1000/min per user
        global: { limit: 10000, window: 60 }, // 10k/min global
      },
    )

    if (!result.allowed) {
      return createRateLimitResponse(result.ip ?? result.user ?? result.global!)
    }

    const response = await handleRequest(request)
    return applyRateLimitHeaders(response, createCompositeRateLimitHeaders(result))
  },
}
```

## API Reference

### JWT Validation

#### `validateJWT(token, key, options?)`

Validates and decodes a JWT.

```typescript
const result = await validateJWT(token, key, {
  issuer: 'https://auth.example.com',
  audience: 'my-app',
  algorithms: ['RS256', 'ES256'],
  clockTolerance: 30, // seconds
})

// result.payload - decoded claims
// result.header - JWT header (alg, typ, kid)
```

#### `decodeJWT(token)`

Decodes without verification (inspection only).

```typescript
const { header, payload } = decodeJWT(token)
```

#### `JWKSClient`

Fetches and caches JWKS from identity providers.

```typescript
const client = new JWKSClient({ cacheTTL: 600000 })

const jwks = await client.getJWKS('https://auth.example.com/.well-known/jwks.json')
const key = await client.getKey('https://auth.example.com/.well-known/jwks.json', 'key-id')
await client.refreshJWKS('https://auth.example.com/.well-known/jwks.json') // force refresh
client.clearCache()
```

#### Signature Verification

```typescript
await verifyRS256(data, signature, rsaPublicKey)
await verifyES256(data, signature, ecPublicKey)
await verifyHS256(data, signature, secret)
```

#### Claims Validation

```typescript
import { validateClaims, extractClaims } from '@db4/auth'

// Throws JWTExpiredError or JWTClaimsError on failure
validateClaims(payload, {
  issuer: 'https://auth.example.com',
  audience: 'my-app',
  clockTolerance: 30,
})

// Extract custom claims
const { role, permissions } = extractClaims<{ role: string; permissions: string[] }>(
  payload,
  ['role', 'permissions'],
)
```

### Session Management

#### `SessionManager`

```typescript
const manager = new SessionManager({
  storage: new InMemorySessionStorage(), // or custom
  defaultExpiresIn: 86400,
})

// Create
const session = await manager.createSession('user-id', {
  expiresIn: 3600,
  metadata: { device: 'mobile' },
})

// Validate (updates lastActivityAt)
const validated = await manager.validateSession(sessionId)
const validated = await manager.validateSession(sessionId, { updateActivity: false })

// Get without validation
const session = await manager.getSession(sessionId)

// Refresh
const refreshed = await manager.refreshSession(sessionId)
const refreshed = await manager.refreshSession(sessionId, { expiresIn: 7200 })

// Revoke (soft delete)
await manager.revokeSession(sessionId)

// Delete (hard delete)
await manager.deleteSession(sessionId)

// Bulk operations
await manager.revokeAllUserSessions('user-id')
await manager.deleteAllUserSessions('user-id')
await manager.cleanupExpiredSessions('user-id')

// Query
const all = await manager.getUserSessions('user-id')
const active = await manager.getActiveUserSessions('user-id')
```

#### Session Interface

```typescript
interface Session {
  id: string
  userId: string
  createdAt: number      // Unix timestamp (seconds)
  expiresAt: number
  lastActivityAt: number
  revoked: boolean
  metadata?: Record<string, unknown>
}
```

### Rate Limiting

#### `TokenBucketRateLimiter`

Best for allowing bursts while maintaining average rate.

```typescript
const limiter = new TokenBucketRateLimiter()

const result = await limiter.consume('api-key', {
  capacity: 100,  // max burst
  refillRate: 10, // tokens/second
})

await limiter.peek('api-key', config)      // check without consuming
await limiter.reset('api-key')             // reset bucket
await limiter.consumeOrThrow('api-key', config) // throws on limit
```

#### `SlidingWindowRateLimiter`

Precise limiting with no boundary issues.

```typescript
const limiter = new SlidingWindowRateLimiter()

const result = await limiter.consume('client-id', {
  limit: 100,
  window: 60,
}, 1) // optional weight

await limiter.peek('client-id', config)
await limiter.reset('client-id')
await limiter.consumeOrThrow('client-id', config)
```

#### `FixedWindowRateLimiter`

Simple and memory-efficient.

```typescript
const limiter = new FixedWindowRateLimiter()

const result = await limiter.consume('client-id', { limit: 100, window: 60 })

await limiter.peek('client-id', config)
await limiter.reset('client-id')
await limiter.consumeOrThrow('client-id', config)
```

#### `CompositeRateLimiter`

Combine per-IP, per-user, and global limits.

```typescript
const limiter = new CompositeRateLimiter()

const result = await limiter.check(
  { ip: '192.168.1.1', userId: 'user-123' },
  {
    perIP: { limit: 100, window: 60 },
    perUser: { limit: 1000, window: 60 },
    global: { limit: 10000, window: 60 },
  },
)

// result.allowed - false if ANY limit exceeded
// result.limitedBy - 'ip' | 'user' | 'global'
// result.retryAfter - max retry across all limits

await limiter.peek(context, config)
await limiter.reset({ ip: '192.168.1.1', userId: 'user-123' })
await limiter.resetGlobal()
await limiter.checkOrThrow(context, config)
```

#### Rate Limit Result

```typescript
interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: number   // Unix timestamp
  retryAfter: number // seconds (0 if allowed)
}
```

### Response Helpers

```typescript
import {
  createRateLimitHeaders,
  createCompositeRateLimitHeaders,
  applyRateLimitHeaders,
  createRateLimitResponse,
} from '@db4/auth'

// Standard headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After
const headers = createRateLimitHeaders(result)
const headers = createCompositeRateLimitHeaders(compositeResult) // uses most restrictive

const response = applyRateLimitHeaders(new Response('OK'), headers)
const errorResponse = createRateLimitResponse(result)
const errorResponse = createRateLimitResponse(result, 'Custom message')
```

## Custom Storage

Implement these interfaces for production use with KV, D1, or Durable Objects.

### Session Storage

```typescript
interface SessionStorage {
  get(sessionId: string): Promise<Session | null>
  set(session: Session): Promise<void>
  delete(sessionId: string): Promise<void>
  getByUserId(userId: string): Promise<Session[]>
  deleteByUserId(userId: string): Promise<void>
}

// Example: Cloudflare KV
class KVSessionStorage implements SessionStorage {
  constructor(private kv: KVNamespace) {}

  async get(sessionId: string) {
    return this.kv.get(`session:${sessionId}`, 'json')
  }

  async set(session: Session) {
    const ttl = session.expiresAt - Math.floor(Date.now() / 1000)
    await this.kv.put(`session:${session.id}`, JSON.stringify(session), {
      expirationTtl: Math.max(ttl, 60),
    })
    // Track by userId for getByUserId
    const userSessions = await this.kv.get(`user:${session.userId}`, 'json') as string[] ?? []
    if (!userSessions.includes(session.id)) {
      userSessions.push(session.id)
      await this.kv.put(`user:${session.userId}`, JSON.stringify(userSessions))
    }
  }
  // ... implement other methods
}
```

### Rate Limit Storage

```typescript
interface RateLimitStorage {
  get(key: string): Promise<{ count: number; windowStart: number } | null>
  set(key: string, count: number, windowStart: number, ttl: number): Promise<void>
  increment(key: string, windowStart: number, ttl: number): Promise<number>
  delete(key: string): Promise<void>
}

interface TokenBucketStorage {
  get(key: string): Promise<{ tokens: number; lastRefill: number } | null>
  set(key: string, state: { tokens: number; lastRefill: number }, ttl: number): Promise<void>
  delete(key: string): Promise<void>
}

interface SlidingWindowStorage {
  getEntries(key: string, windowStart: number): Promise<Array<{ timestamp: number; weight: number }>>
  addEntry(key: string, entry: { timestamp: number; weight: number }, ttl: number): Promise<void>
  delete(key: string): Promise<void>
}
```

## Error Handling

All errors extend base classes for easy catching:

```typescript
import {
  // JWT errors (extend JWTError)
  JWTError,
  JWTSignatureError,
  JWTExpiredError,
  JWTMalformedError,
  JWTUnsupportedAlgorithmError,
  JWTClaimsError,
  JWKSFetchError,
  JWKSKeyNotFoundError,

  // Session errors (extend SessionError)
  SessionError,
  SessionNotFoundError,
  SessionExpiredError,
  SessionRevokedError,

  // Rate limit errors
  RateLimitExceededError,
} from '@db4/auth'

try {
  await validateJWT(token, key)
} catch (error) {
  if (error instanceof JWTExpiredError) {
    // Token expired
  } else if (error instanceof JWTSignatureError) {
    // Invalid signature
  } else if (error instanceof JWTClaimsError) {
    // Issuer/audience/nbf validation failed
  } else if (error instanceof JWTMalformedError) {
    // Invalid token structure
  } else if (error instanceof JWKSKeyNotFoundError) {
    // Key ID not in JWKS
  } else if (error instanceof JWTError) {
    // Other JWT error
  }
}

try {
  await rateLimiter.checkOrThrow(context, config)
} catch (error) {
  if (error instanceof RateLimitExceededError) {
    return createRateLimitResponse(error.result)
  }
}
```

## Without Edge-Native Auth

- **200ms+ latency** on every request to central auth
- **Security gaps** between distributed workers
- **Single point of failure** takes down everything
- **Failed audits** from inconsistent session management
- **Abandoned users** who won't wait for slow auth

## With @db4/auth

- **Sub-millisecond validation** with cached JWKS in-worker
- **Consistent rate limits** across all edge locations
- **No external dependencies** to fail
- **Audit-ready sessions** with full lifecycle tracking
- **Invisible auth** because instant auth is invisible

## License

MIT
