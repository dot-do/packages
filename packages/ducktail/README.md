---
name: ducktail
version: 0.3.0-rc.3
description: Event collection worker with hibernatable WebSocket connections for Cloudflare Workers
license: MIT
repository: "https://github.com/dotdo/duckdb"
homepage: "https://duck.do"
keywords:
  - duckdb
  - cloudflare
  - workers
  - events
  - analytics
  - tail
  - durable-objects
  - websocket
  - hibernation
downloads:
  monthly: 19
published: "2026-01-23T19:18:00.317Z"
updated: "2026-01-23T20:31:38.284Z"
---

# DuckTail

High-performance event collection system for Cloudflare Workers with hibernatable WebSocket connections, auto-scaling sharding, and configurable storage modes.

## Overview

DuckTail is a scalable event ingestion pipeline designed to run on Cloudflare's edge infrastructure. It collects events from browsers, servers, and worker tail logs, buffers them efficiently using Durable Objects, and persists them to R2 storage in Parquet format for analytics.

### Key Features

- **WebSocket-first transport** - 95% cheaper than HTTP per-request with hibernatable connections
- **Client-side event buffering** - Reduces WebSocket messages and improves efficiency
- **Auto-scaling sharding** - Automatically scales from 1 to 128 Durable Objects (~128K RPS)
- **Configurable storage modes** - fire-and-forget, buffered, confirmed, durable
- **Real-time materialized views** - DuckDB-powered incremental aggregations
- **Browser SDK** - Lightweight (<6KB gzipped) analytics snippet

## Architecture

```
                                    Browser/Client
                                          |
                                    ┌─────┴─────┐
                                    │  duck.js  │
                                    │   SDK     │
                                    └─────┬─────┘
                                          │ WebSocket/HTTP
                                          ▼
                        ┌─────────────────────────────────────┐
                        │         Cloudflare Worker           │
                        │           (worker.ts)               │
                        │                                     │
                        │  Endpoints:                         │
                        │  • /e - Event submission            │
                        │  • /ws - WebSocket upgrade          │
                        │  • /duck.js - Browser SDK           │
                        │  • /p.gif - Tracking pixel          │
                        │  • /buffer/* - Buffer coordinator   │
                        │  • /recording/* - Session recording │
                        └──────────────┬──────────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │                          │                          │
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│     DuckTailDO        │  │  BufferCoordinatorDO  │  │  SessionRecordingDO   │
│   (Simple Buffer)     │  │   (Auto-scaling)      │  │  (Session Replay)     │
└───────────┬───────────┘  └───────────┬───────────┘  └───────────┬───────────┘
            │                          │                          │
            │              ┌───────────┼───────────┐              │
            │              ▼           ▼           ▼              │
            │      ┌──────────┐ ┌──────────┐ ┌──────────┐         │
            │      │ Buffer   │ │ Buffer   │ │ Buffer   │         │
            │      │ DO #1    │ │ DO #2    │ │ DO #N    │         │
            │      │ (DuckDB) │ │ (DuckDB) │ │ (DuckDB) │         │
            │      └────┬─────┘ └────┬─────┘ └────┬─────┘         │
            │           │            │            │               │
            └───────────┴────────────┴────────────┴───────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────────┐
                        │          R2 Bucket          │
                        │   ducktail/YYYY-MM-DD/      │
                        │     *.parquet / *.json      │
                        └─────────────────────────────┘
```

### Durable Objects

| Durable Object | Purpose |
|----------------|---------|
| **DuckTailDO** | Simple event buffer with importance-based flushing |
| **DuckTailDuckLakeDO** | Extended DO with DuckLake integration for ACID storage |
| **DuckTailBufferDO** | DuckDB-powered buffer with real-time materialized views |
| **BufferCoordinatorDO** | Auto-scaling coordinator managing buffer shards |
| **SessionRecordingDO** | Session replay recording storage |
| **DuckLakeMetadataDO** | SQLite-backed metadata for DuckLake catalog |

### Auto-Scaling Sharding

The system uses Cloudflare's Rate Limiting API as an early warning signal to scale proactively:

```
┌──────┬──────┬─────────────┬────────────────┬───────────────┐
│ Tier │  DOs │ Optimal RPS │ Acceptable RPS │   Threshold   │
├──────┼──────┼─────────────┼────────────────┼───────────────┤
│  1   │   1  │    1,000    │     1,200      │    default    │
│  2   │   4  │    4,000    │     4,800      │      45%      │
│  3   │   8  │    8,000    │     9,600      │      55%      │
│  4   │  16  │   16,000    │    19,200      │      65%      │
│  5   │  32  │   32,000    │    38,400      │      75%      │
│  6   │  64  │   64,000    │    76,800      │      85%      │
│  7   │ 128  │  128,000    │   153,600      │      95%      │
└──────┴──────┴─────────────┴────────────────┴───────────────┘
```

## Quick Start

### Installation

```bash
npm install ducktail
```

### Deploy to Cloudflare

1. Build the dashboard (optional):
```bash
cd app && npm run build
```

2. Deploy the worker:
```bash
npm run deploy
```

Or for local development:
```bash
npm run dev
```

### Add Analytics to Your Website

1. Get a write key for your site

2. Add the tracking snippet:
```html
<!-- DuckTail Analytics -->
<script>window.duck=window.duck||[];duck.push(['init','YOUR_WRITE_KEY']);duck.push(['page']);</script>
<script async src="https://ducktail.workers.do/duck.js"></script>
<noscript><img src="https://ducktail.workers.do/p.gif?e=pageview&k=YOUR_WRITE_KEY" alt="" width="1" height="1" style="display:none;position:absolute"/></noscript>
<!-- End DuckTail Analytics -->
```

Or generate it programmatically:
```bash
curl "https://ducktail.workers.do/snippet?k=YOUR_WRITE_KEY"
```

### Using the SDK

**Browser (via snippet):**
```javascript
// Track a custom event
duck.push(['track', 'button_click', { buttonId: 'signup' }]);

// Identify a user
duck.push(['identify', 'user123', { email: 'user@example.com' }]);
```

**Node.js / TypeScript:**
```typescript
import { DuckTailWSClient } from 'ducktail/client';

const client = new DuckTailWSClient({
  url: 'wss://ducktail.workers.do/ws',
  batchInterval: 1000,
  maxBatchSize: 100,
});

await client.connect();

client.track('page_view', {
  data: { page: '/home' }
});

// Manual flush when needed
await client.flush();

// Close when done
await client.close();
```

## Configuration Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DUCKLAKE_CATALOG_ID` | DuckLake catalog identifier | `ducktail-events` |
| `SHARD_TIER2_THRESHOLD` | % of rate limit to trigger tier 2 | `45` |
| `SHARD_TIER3_THRESHOLD` | % of rate limit to trigger tier 3 | `55` |
| `SHARD_TIER4_THRESHOLD` | % of rate limit to trigger tier 4 | `65` |
| `SHARD_TIER5_THRESHOLD` | % of rate limit to trigger tier 5 | `75` |
| `SHARD_TIER6_THRESHOLD` | % of rate limit to trigger tier 6 | `85` |
| `SHARD_TIER7_THRESHOLD` | % of rate limit to trigger tier 7 | `95` |
| `SHARD_TIER{2-7}_COUNT` | Number of shards per tier | `4,8,16,32,64,128` |

### wrangler.toml Configuration

```toml
name = "ducktail"
main = "./worker.ts"
compatibility_date = "2025-01-14"
compatibility_flags = ["nodejs_compat"]

# Durable Objects
[[durable_objects.bindings]]
name = "DUCKTAIL_DO"
class_name = "DuckTailDuckLakeDO"

[[durable_objects.bindings]]
name = "DUCKTAIL_BUFFER"
class_name = "DuckTailBufferDO"

[[durable_objects.bindings]]
name = "BUFFER_COORDINATOR"
class_name = "BufferCoordinatorDO"

# Rate Limit for auto-scaling signals
[unsafe]
bindings = [
  { name = "DUCKTAIL_SHARD_SIGNAL", type = "ratelimit", namespace_id = "1001", simple = { limit = 6000, period = 10 } }
]

# R2 bucket for event storage
[[r2_buckets]]
binding = "DATA_BUCKET"
bucket_name = "your-bucket-name"
```

## API Documentation

### Event Submission

#### POST /e
Submit events via HTTP POST.

**Request Body (DuckTail format):**
```json
{
  "events": [
    {
      "timestamp": 1706000000000,
      "source": "web-app",
      "type": "pageview",
      "importance": "normal",
      "data": {
        "url": "/home",
        "referrer": "https://google.com"
      }
    }
  ],
  "storageMode": "buffered"
}
```

**Request Body (Analytics format):**
```json
{
  "event": "pageview",
  "writeKey": "YOUR_WRITE_KEY",
  "timestamp": 1706000000000,
  "anonymousId": "abc123",
  "properties": {
    "url": "/home"
  }
}
```

**Response:**
```json
{
  "received": 1,
  "stored": 1,
  "_shards": [{ "shardId": "default", "tier": 1, "received": 1, "stored": 1 }]
}
```

#### GET /e
Submit single event via query parameters.

```
GET /e?source=web&type=click&button=signup
```

### WebSocket Protocol

Connect to `/ws` for persistent connections.

**Send Events:**
```json
{ "type": "events", "events": [...], "storageMode": "buffered" }
```

**Response:**
```json
{ "type": "ack", "received": 10, "stored": 10 }
```

**Subscribe to Events:**
```json
{ "type": "subscribe", "filter": { "source": "web*", "minImportance": "high" } }
```

**Get Stats:**
```json
{ "type": "stats" }
```

**Ping:**
```json
{ "type": "ping" }
```

### Buffer Coordinator Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /buffer/stats` | Coordinator status and shard health |
| `POST /buffer/events` | Submit events through coordinator |
| `GET /buffer/stats/aggregate` | Aggregated stats from all shards |
| `GET /buffer/mv/pageviews` | Aggregated pageview materialized view |
| `GET /buffer/mv/errors` | Aggregated error materialized view |
| `GET /buffer/mv/latency` | Aggregated latency materialized view |
| `POST /buffer/scale` | Manual tier scaling (POST with `{"tier": 1-7}`) |
| `GET /buffer/ws` | WebSocket to specific buffer shard |

### Other Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check with shard info |
| `GET /shards` | Current sharding status and metrics |
| `GET /stats` | Buffer and write statistics |
| `POST /flush` | Force buffer flush to R2 |
| `GET /duck.js` | Browser analytics SDK |
| `GET /p.gif` | Tracking pixel for no-JS environments |
| `GET /snippet` | Generate analytics snippet HTML |
| `GET /events` | Query events from DuckLake |
| `GET /snapshots` | List DuckLake snapshots |

## Storage Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `fire-and-forget` | Return immediately, buffer async | Analytics, non-critical events |
| `buffered` | Buffer in DO memory, flush later | Default, balanced durability |
| `confirmed` | Write to DO SQLite, then return | Important events needing confirmation |
| `durable` | Write to R2, then return | Critical audit logs requiring durability |

### Event Importance Levels

| Level | Behavior | Use Case |
|-------|----------|----------|
| `critical` | Immediate flush, never dropped | Audit logs, security events |
| `high` | Early flush threshold, rarely dropped | Important user actions |
| `normal` | Standard buffer behavior | Default analytics |
| `low` | Can be dropped under pressure | Verbose debugging |

## Browser SDK (duck.js)

The browser SDK provides:

- **WebSocket-first transport** - Automatically uses WebSocket with HTTP fallback
- **Client-side buffering** - Batches events (default: 10 events or 5 seconds)
- **Automatic reconnection** - Exponential backoff on connection loss
- **Auto-tracking** - Page views, errors, scroll depth, page leave events
- **Performance timing** - FCP, LCP, TTFB automatically captured
- **Session management** - Anonymous ID and session ID tracking

### SDK Configuration

```javascript
duck.push(['init', 'YOUR_WRITE_KEY', {
  batchSize: 10,           // Events per batch
  flushInterval: 5000,     // Flush interval (ms)
  autoTrackPageViews: true,
  autoTrackPageLeave: true,
  autoTrackScroll: true,
  autoTrackErrors: true,
  autoTrackPerformance: true,
  respectDoNotTrack: true,
  cookieDomain: '.example.com',
  sessionTimeout: 30,      // Minutes
  debug: false
}]);
```

## Package Exports

```typescript
// Main entry - core client and event creation utilities
import { DuckTailClient, createEvent } from 'ducktail';

// WebSocket client - persistent connection with batching
import { DuckTailWSClient } from 'ducktail/client';

// Durable Objects - for worker bindings
import { DuckTailDO, DuckTailBufferDO } from 'ducktail/do';

// Analytics utilities - event processing helpers
import * as analytics from 'ducktail/analytics';

// Console wrapper - auto-capture console.log/error/warn to DuckTail
import 'ducktail/console';
// Or for programmatic control:
import { wrapConsole, unwrapConsole, flush, configure } from 'ducktail/console';

// Schema utilities - event normalization and validation
import { normalizeEvent } from 'ducktail/schema';

// Routing/sharding - shard routing utilities
import { ShardRouter, routeToShard } from 'ducktail/routing';

// Compaction - periodic maintenance for Parquet files
import { CompactionSchedulerDO, Compactor, StreamingMaterializedView } from 'ducktail/compaction';
```

### Console Wrapper (ducktail/console)

Auto-capture all console output and stream it to DuckTail. Simply importing the module wraps the global console:

```typescript
// Auto-wraps console on import (like 'dotenv/config')
import 'ducktail/console'

// Now all console calls are captured and streamed
console.log('Hello world')   // -> streamed to DuckTail
console.error('Oops')        // -> streamed with importance: 'critical'
console.warn('Careful')      // -> streamed with importance: 'high'
```

Configure via environment variables:
- `DUCKTAIL_ENDPOINT` - Target endpoint (default: `https://ducktail.workers.do`)
- `DUCKTAIL_SOURCE` - Source identifier (default: `console`)
- `DUCKTAIL_ENABLED` - Enable/disable capture (default: `true`)
- `DUCKTAIL_BATCH_INTERVAL` - Batch interval in ms (default: `1000`)
- `DUCKTAIL_MAX_BATCH_SIZE` - Max events per batch (default: `100`)
- `DUCKTAIL_API_KEY` - API key for authentication

### Compaction Module (ducktail/compaction)

Periodic maintenance jobs for optimizing stored event data:

- **Compaction** - Merges small Parquet files into larger, sorted files for better query performance
- **Rollups** - Pre-computes aggregate tables (hourly/daily/monthly) for fast dashboard queries
- **Streaming MVs** - Real-time materialized views updated incrementally

```typescript
import { CompactionSchedulerDO } from 'ducktail/compaction'

// In wrangler.toml, add a cron trigger:
// [triggers]
// crons = ["*/5 * * * *"]

// Worker scheduled handler:
export default {
  async scheduled(event, env, ctx) {
    const doId = env.COMPACTION_SCHEDULER.idFromName('default')
    await env.COMPACTION_SCHEDULER.get(doId).fetch('http://internal/run')
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Type check
npm run typecheck

# Build
npm run build

# Local development
npm run dev

# Deploy
npm run deploy
```

## License

MIT
