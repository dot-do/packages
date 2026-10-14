---
name: "@dotdo/pg-queue"
version: 0.1.1
description: "pgmq-style message queue on Durable Objects with single-alarm visibility timeout and Cap'n Web RPC"
license: MIT
repository: "https://github.com/dot-do/postgres"
homepage: "https://github.com/dot-do/postgres#readme"
keywords:
  - pgmq
  - message-queue
  - durable-objects
  - cloudflare
  - workers
  - visibility-timeout
  - alarms
  - sqlite
  - capnweb
  - rpc
downloads:
  monthly: 12
published: "2026-01-22T15:59:04.482Z"
updated: "2026-01-24T15:49:26.168Z"
---

# @dotdo/pg-queue

[![npm version](https://img.shields.io/npm/v/@dotdo/pg-queue.svg)](https://www.npmjs.com/package/@dotdo/pg-queue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)

A high-performance, pgmq-style message queue built on Cloudflare Durable Objects with SQLite storage. Designed for cost efficiency and low latency with Cap'n Web RPC integration.

## Key Features

- **Single Alarm for Multiple Visibility Timeouts** - O(1) instead of O(n) alarm operations per dequeue, reducing costs by ~95%
- **Cap'n Web RPC** - Promise pipelining allows multiple operations in a single round-trip
- **SKIP LOCKED Pattern** - Atomic message claiming prevents concurrent consumers from receiving the same message
- **Batch Operations** - `enqueueBatch`, `ackBatch`, `nackBatch` for high-throughput scenarios
- **Dead Letter Queue (DLQ)** - Automatic DLQ routing after configurable retry attempts
- **Visibility Timeout Management** - Automatic message re-delivery if not acknowledged
- **Archive Support** - Optional message archiving for audit trails

## Installation

```bash
npm install @dotdo/pg-queue
# or
pnpm add @dotdo/pg-queue
# or
yarn add @dotdo/pg-queue
```

## Quick Start

### 1. Configure Wrangler

Add the Durable Object binding to your `wrangler.toml`:

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-12-30"
compatibility_flags = ["nodejs_compat"]

[[durable_objects.bindings]]
name = "QUEUE"
class_name = "QueueDO"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["QueueDO"]
```

### 2. Export the Durable Object

```typescript
import { QueueDO } from '@dotdo/pg-queue'

export { QueueDO }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.QUEUE.idFromName('my-queue')
    const stub = env.QUEUE.get(id)
    return stub.fetch(request)
  }
}

interface Env {
  QUEUE: DurableObjectNamespace
}
```

### 3. Use the Queue

```typescript
// Enqueue a message
const response = await stub.fetch(new Request('https://queue/enqueue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payload: { task: 'process-image', url: 'https://example.com/image.jpg' },
    delaySeconds: 0,
    maxRetries: 3
  })
}))

// Dequeue messages
const messages = await stub.fetch(new Request('https://queue/dequeue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vtSeconds: 30, qty: 10 })
}))
```

## API Reference

### Types

```typescript
interface Message<T = unknown> {
  msg_id: string
  payload: T
  status: 'pending' | 'processing' | 'completed' | 'dead'
  created_at: number
  vt: number              // Visibility timeout (Unix timestamp in ms)
  read_count: number
  max_retries: number
  worker_id: string | null
  archived_at: number | null
}

interface SendOptions {
  delaySeconds?: number   // Delay before message becomes visible (default: 0)
  maxRetries?: number     // Max retries before moving to DLQ (default: 3)
}

interface ReadOptions {
  qty?: number            // Max messages to read (default: 1)
  workerId?: string       // Worker ID for tracking (auto-generated if not provided)
}

interface QueueMetrics {
  total: number
  pending: number
  processing: number
  completed: number
  dead: number
  archived: number
  oldest_pending_age_seconds: number | null
  next_alarm_at: number | null
  alarm_invocations: number
}
```

### QueueRpc Interface

The `QueueRpc` interface defines all available queue operations:

```typescript
interface QueueRpc {
  // Single-Message Operations
  enqueue<T>(payload: T, options?: SendOptions): Promise<SendResult>
  dequeue<T>(vtSeconds: number, options?: ReadOptions): Promise<Message<T>[]>
  ack(msgId: string): Promise<DeleteResult>
  nack(msgId: string): Promise<NackResult>
  archive(msgId: string): Promise<ArchiveResult>
  extend(msgId: string, additionalSeconds: number): Promise<boolean>

  // Batch Operations
  enqueueBatch<T>(items: BatchEnqueueItem<T>[]): Promise<BatchEnqueueResult>
  ackBatch(msgIds: string[]): Promise<BatchAckResult>
  nackBatch(msgIds: string[]): Promise<BatchNackResult>

  // Monitoring & Management
  metrics(): Promise<QueueMetrics>
  listDLQ<T>(limit?: number): Promise<Message<T>[]>
  retryDLQ(msgId: string): Promise<boolean>
  purge(): Promise<number>
}
```

## Usage Examples

### Basic Producer/Consumer Pattern

```typescript
import type { QueueRpc, Message } from '@dotdo/pg-queue'

interface MyTask {
  task: string
  url: string
}

// Producer: Enqueue jobs
async function enqueueJob(stub: DurableObjectStub, task: MyTask) {
  const response = await stub.fetch(new Request('https://queue/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: task })
  }))
  const result = await response.json()
  return result.data.msg_id
}

// Consumer: Process jobs
async function processJobs(stub: DurableObjectStub) {
  // Dequeue up to 10 messages with 30-second visibility timeout
  const response = await stub.fetch(new Request('https://queue/dequeue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vtSeconds: 30, qty: 10 })
  }))
  const { data: messages } = await response.json() as { data: Message<MyTask>[] }

  for (const message of messages) {
    try {
      await processTask(message.payload)

      // Acknowledge successful processing
      await stub.fetch(new Request(`https://queue/ack/${message.msg_id}`, {
        method: 'DELETE'
      }))
    } catch (error) {
      // Negative acknowledge - returns to queue or moves to DLQ
      const nackResponse = await stub.fetch(new Request(`https://queue/nack/${message.msg_id}`, {
        method: 'POST'
      }))
      const { data } = await nackResponse.json() as { data: { moved_to_dlq: boolean } }

      if (data.moved_to_dlq) {
        console.error(`Message ${message.msg_id} moved to DLQ after exhausting retries`)
      }
    }
  }
}
```

### Delayed Jobs (Scheduling)

```typescript
// Schedule a job to run in 5 minutes
await stub.fetch(new Request('https://queue/enqueue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payload: { task: 'send-reminder', userId: '123' },
    delaySeconds: 300  // 5 minutes
  })
}))

// Schedule a job to run in 1 hour with more retries
await stub.fetch(new Request('https://queue/enqueue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payload: { task: 'daily-report' },
    delaySeconds: 3600,
    maxRetries: 5
  })
}))
```

### Batch Operations (High Throughput)

```typescript
// Enqueue multiple messages efficiently
const batchResponse = await stub.fetch(new Request('https://queue/batch/enqueue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      { payload: { task: 'job1' } },
      { payload: { task: 'job2' }, options: { delaySeconds: 60 } },
      { payload: { task: 'job3' }, options: { maxRetries: 5 } }
    ]
  })
}))
const { data: batchResult } = await batchResponse.json()
console.log(`Enqueued ${batchResult.successCount} messages`)

// Acknowledge multiple messages at once
const messages = await dequeueMessages(stub, 100)
const processedIds = await processAllMessages(messages)
await stub.fetch(new Request('https://queue/batch/ack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ msgIds: processedIds })
}))
```

### Extending Visibility Timeout (Heartbeat Pattern)

For long-running tasks, extend the visibility timeout to prevent re-delivery:

```typescript
async function processLongRunningTask(stub: DurableObjectStub, message: Message<MyTask>) {
  // Set up heartbeat to extend visibility every 20 seconds
  const heartbeatInterval = setInterval(async () => {
    const response = await stub.fetch(new Request(`https://queue/extend/${message.msg_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ additionalSeconds: 30 })
    }))
    const { data } = await response.json() as { data: { extended: boolean } }

    if (!data.extended) {
      // Message was already deleted or visibility expired
      clearInterval(heartbeatInterval)
    }
  }, 20000)

  try {
    await longRunningTask(message.payload)  // May take several minutes
    await stub.fetch(new Request(`https://queue/ack/${message.msg_id}`, {
      method: 'DELETE'
    }))
  } finally {
    clearInterval(heartbeatInterval)
  }
}
```

### Dead Letter Queue Management

```typescript
// List messages in the DLQ
const dlqResponse = await stub.fetch(new Request('https://queue/dlq?limit=50'))
const { data: dlqMessages } = await dlqResponse.json() as { data: Message<MyTask>[] }

for (const msg of dlqMessages) {
  console.log(`Failed message: ${msg.msg_id}`)
  console.log(`  Payload: ${JSON.stringify(msg.payload)}`)
  console.log(`  Attempts: ${msg.read_count}`)
}

// Retry a specific DLQ message after fixing the issue
await stub.fetch(new Request(`https://queue/dlq/${msgId}/retry`, {
  method: 'POST'
}))

// Or delete it permanently
await stub.fetch(new Request(`https://queue/ack/${msgId}`, {
  method: 'DELETE'
}))
```

### Monitoring Queue Health

```typescript
async function checkQueueHealth(stub: DurableObjectStub) {
  const response = await stub.fetch(new Request('https://queue/metrics'))
  const { data: metrics } = await response.json() as { data: QueueMetrics }

  console.log(`Queue Status:`)
  console.log(`  Pending: ${metrics.pending}`)
  console.log(`  Processing: ${metrics.processing}`)
  console.log(`  Dead (DLQ): ${metrics.dead}`)
  console.log(`  Archived: ${metrics.archived}`)
  console.log(`  Oldest pending age: ${metrics.oldest_pending_age_seconds}s`)
  console.log(`  Alarm invocations: ${metrics.alarm_invocations}`)

  // Alert if DLQ is growing
  if (metrics.dead > 100) {
    console.warn('DLQ has over 100 messages - investigate failures!')
  }

  // Alert if queue depth is high
  if (metrics.pending > 10000) {
    console.warn('High queue depth - consider scaling consumers!')
  }
}
```

### Cap'n Web RPC (Promise Pipelining)

For maximum efficiency, use Cap'n Web RPC with promise pipelining:

```typescript
import { createRpcClient } from 'capnweb/client'
import type { QueueRpc } from '@dotdo/pg-queue'

// WebSocket connection (hibernated for cost savings)
const ws = new WebSocket('wss://your-worker.example.com/rpc/my-queue')
const queue = createRpcClient<QueueRpc>(ws)

// Promise pipelining - all operations in single round-trip
const [result1, result2, stats] = await Promise.all([
  queue.enqueue({ task: 'job1' }),
  queue.enqueue({ task: 'job2' }),
  queue.metrics()
])

// Batch operations for even higher throughput
const batchResult = await queue.enqueueBatch([
  { payload: { task: 'job1' } },
  { payload: { task: 'job2' }, options: { delaySeconds: 60 } },
  { payload: { task: 'job3' }, options: { maxRetries: 5 } }
])

// Process messages
const messages = await queue.dequeue<MyTask>(30, { qty: 100 })
await processAllTasks(messages)
await queue.ackBatch(messages.map(m => m.msg_id))
```

## REST API Reference

The queue exposes a REST API for operations:

### Single-Message Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/enqueue` or `/send` | Enqueue a message |
| `POST` | `/dequeue` or `/read` | Dequeue messages with visibility timeout |
| `DELETE` | `/ack/:msgId` or `/delete/:msgId` | Acknowledge (delete) a message |
| `POST` | `/nack/:msgId` | Negative acknowledge (retry or DLQ) |
| `POST` | `/archive/:msgId` | Archive a message for audit trail |
| `POST` | `/extend/:msgId` | Extend visibility timeout |

### Batch Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/batch/enqueue` | Enqueue multiple messages |
| `POST` | `/batch/ack` | Acknowledge multiple messages |
| `POST` | `/batch/nack` | Nack multiple messages |

### Monitoring & Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/metrics` | Get queue metrics |
| `GET` | `/dlq` | List dead letter queue |
| `POST` | `/dlq/:msgId/retry` | Retry a DLQ message |
| `DELETE` | `/purge` | Purge all messages (use with caution!) |

## Configuration Options

### SendOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `delaySeconds` | `number` | `0` | Delay before message becomes visible |
| `maxRetries` | `number` | `3` | Maximum retry attempts before DLQ |

### ReadOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `qty` | `number` | `1` | Maximum messages to read |
| `workerId` | `string` | auto-generated | Worker ID for tracking |

## Architecture

### Single Alarm Optimization

Traditional queue implementations schedule a separate alarm for each message's visibility timeout, resulting in O(n) alarm operations. This package uses a single-alarm approach:

1. One alarm is set to the **earliest** visibility timeout expiration
2. When the alarm fires, **all** expired messages are processed
3. The alarm is rescheduled to the next earliest expiration

This reduces Durable Object alarm costs by approximately 95% at scale.

### SKIP LOCKED Pattern

Messages are claimed atomically using SQLite's UPDATE with a subquery:

```sql
UPDATE messages
SET status = 'processing', vt = ?, worker_id = ?
WHERE msg_id IN (
  SELECT msg_id FROM messages
  WHERE status = 'pending' AND vt <= ?
  ORDER BY created_at ASC
  LIMIT ?
)
RETURNING *
```

This prevents race conditions when multiple consumers dequeue simultaneously.

### Message Lifecycle

```
pending -> processing -> (ack) -> deleted
                     -> (nack) -> pending (retry)
                     -> (nack + max retries) -> dead (DLQ)
                     -> (archive) -> archived
                     -> (vt expires) -> pending (auto-retry)
```

## Troubleshooting

### Messages Not Being Processed

1. **Check queue metrics**: Use `/metrics` to see if messages are pending
2. **Verify visibility timeout**: Messages reappear after VT expires if not acked
3. **Check DLQ**: Failed messages may have moved to the dead letter queue

### High DLQ Count

1. **Review error logs**: Check why processing is failing
2. **Inspect DLQ messages**: Use `/dlq` to see failed payloads
3. **Increase maxRetries**: If failures are transient, allow more attempts
4. **Fix and retry**: After fixing issues, use `/dlq/:id/retry`

### Duplicate Processing

1. **Visibility timeout too short**: Increase `vtSeconds` for long tasks
2. **Missing acknowledgment**: Ensure `ack()` is called after processing
3. **Use heartbeat pattern**: Call `extend()` for long-running tasks

### Memory Issues

The SQLite storage in Durable Objects has limits. For very high-volume queues:

1. **Archive processed messages**: Use `/archive` instead of `/ack` if audit needed
2. **Purge completed messages**: Periodically clean up old data
3. **Use multiple queue instances**: Shard by queue name

## Exports

```typescript
// Main Durable Object
export { QueueDO, handleQueueRpc } from '@dotdo/pg-queue'

// Store (for standalone/testing use)
export { QueueStore, QUEUE_SCHEMA } from '@dotdo/pg-queue/store'

// Visibility management utilities
export {
  VisibilityAlarmManager,
  parseMessageRow,
  generateMsgId,
  generateWorkerId,
  VISIBILITY_QUERIES,
} from '@dotdo/pg-queue/visibility'

// Types
export type {
  Message,
  MessageRow,
  MessageStatus,
  SendOptions,
  ReadOptions,
  QueueMetrics,
  SendResult,
  DeleteResult,
  ArchiveResult,
  NackResult,
  BatchEnqueueItem,
  BatchEnqueueResult,
  BatchAckResult,
  BatchNackResult,
  QueueEnv,
  QueueRpc,
} from '@dotdo/pg-queue'
```

## License

MIT
