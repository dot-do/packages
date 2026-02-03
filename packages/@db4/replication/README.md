---
name: "@db4/replication"
version: 0.1.2
description: Read replica management and routing for db4 document database
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - document-database
  - cloudflare
  - workers
  - durable-objects
  - replication
  - read-replicas
  - high-availability
downloads:
  monthly: 166
published: "2026-01-20T11:29:25.629Z"
updated: "2026-01-23T17:20:35.792Z"
---

# @db4/replication

[![npm version](https://img.shields.io/npm/v/@db4/replication.svg)](https://www.npmjs.com/package/@db4/replication)
[![license](https://img.shields.io/npm/l/@db4/replication.svg)](https://github.com/dot-do/db4/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

([GitHub](https://github.com/dot-do/db4/tree/main/packages/replication), [npm](https://www.npmjs.com/package/@db4/replication))

## Description

Read replica management and routing for db4 document database. This package provides intelligent read replica routing with health monitoring, automatic failover, circuit breakers, and replication lag tracking for distributed db4 deployments. Use it to achieve high availability and improved read throughput across multiple geographic regions.

## Installation

```bash
npm install @db4/replication
```

Or with pnpm:

```bash
pnpm add @db4/replication
```

## Usage

```typescript
import { ReplicationManager } from '@db4/replication';

const manager = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: [
    'https://replica-us-east.db4.io',
    'https://replica-us-west.db4.io',
    'https://replica-eu-west.db4.io',
  ],
  readPreference: 'nearest',
  consistency: 'eventual',
});

// Get the best target for reads (considers latency and health)
const readTarget = manager.getReadTarget();
console.log('Reading from:', readTarget);

// Get primary for writes
const writeTarget = manager.getPrimaryTarget();
console.log('Writing to:', writeTarget);

// Execute a read with automatic routing
const user = await manager.read(() => db.users.get('user_123'));

// Execute a write (always goes to primary)
const newUser = await manager.write(() =>
  db.users.create({ name: 'Alice', email: 'alice@myapp.com/api' })
);
```

### Health Monitoring

```typescript
import { ReplicationManager, HealthMonitor } from '@db4/replication';

const manager = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: ['https://replica1.db4.io', 'https://replica2.db4.io'],
  readPreference: 'secondary',
});

// Start automatic health monitoring
manager.startHealthMonitoring(async (url) => {
  const start = Date.now();
  const response = await fetch(`${url}/health`);
  const data = await response.json();

  return {
    replicaId: url,
    healthy: response.ok,
    responseTime: Date.now() - start,
    replicationLag: data.lagMs || 0,
    timestamp: Date.now(),
  };
}, {
  interval: 5000, // Check every 5 seconds
  timeout: 3000, // 3 second timeout
});

// Check current health status
const health = await manager.healthCheck();
console.log(`Healthy: ${health.healthyCount}/${health.totalCount}`);
console.log('Unhealthy replicas:', health.unhealthy);
```

### Failover Handling

```typescript
import { ReplicationManager } from '@db4/replication';

const manager = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: ['https://replica1.db4.io', 'https://replica2.db4.io'],
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
    halfOpenRequests: 3,
  },
});

// Listen for failover events
manager.onFailover((event) => {
  console.log('Failover occurred!');
  console.log(`Previous target: ${event.previousTarget}`);
  console.log(`New target: ${event.newTarget}`);
  console.log(`Reason: ${event.reason}`);

  // Optionally notify monitoring systems
  sendAlert(`Replica failover: ${event.reason}`);
});

// Listen for recovery events
manager.on('replica-recovered', (event) => {
  console.log(`Replica ${event.replicaId} is healthy again`);
});
```

### Read Preference Strategies

```typescript
import {
  ReplicationManager,
  PrimaryRoutingStrategy,
  SecondaryRoutingStrategy,
  NearestRoutingStrategy,
  WeightedRoundRobinStrategy,
} from '@db4/replication';

// Primary: All reads go to primary (strongest consistency)
const primaryOnly = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: ['https://replica1.db4.io'],
  readPreference: 'primary',
});

// Secondary: Reads prefer replicas (better read scaling)
const secondaryPreferred = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: ['https://replica1.db4.io', 'https://replica2.db4.io'],
  readPreference: 'secondary',
});

// Nearest: Reads go to lowest latency node
const nearest = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: ['https://replica-us.db4.io', 'https://replica-eu.db4.io'],
  readPreference: 'nearest',
});

// Custom weighted round-robin
const weighted = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: [
    { url: 'https://replica1.db4.io', weight: 3 },
    { url: 'https://replica2.db4.io', weight: 1 },
  ],
  strategy: new WeightedRoundRobinStrategy(),
});
```

### Replication Lag Tracking

```typescript
import { ReplicationManager, LagTracker } from '@db4/replication';

const manager = new ReplicationManager({
  primary: 'https://primary.db4.io',
  replicas: ['https://replica1.db4.io', 'https://replica2.db4.io'],
  lagTracking: {
    maxAcceptableLag: 5000, // 5 seconds
    measurementInterval: 1000,
    windowSize: 60, // Average over 60 measurements
  },
});

// Get current lag for all replicas
const lagStatus = manager.getLagStatus();
for (const [replicaId, lag] of Object.entries(lagStatus)) {
  console.log(`${replicaId}: ${lag.average}ms average lag`);
}

// Read with maximum lag constraint
const user = await manager.read(
  () => db.users.get('user_123'),
  { maxLag: 1000 } // Only use replicas with < 1s lag
);
```

### Circuit Breaker

```typescript
import { CircuitBreaker } from '@db4/replication';

const breaker = new CircuitBreaker({
  failureThreshold: 5, // Open after 5 failures
  resetTimeout: 30000, // Try again after 30s
  halfOpenRequests: 3, // Allow 3 test requests in half-open state
});

// Check circuit state
if (breaker.isOpen()) {
  console.log('Circuit is open, using fallback');
}

// Execute with circuit breaker protection
try {
  const result = await breaker.execute(async () => {
    return await riskyOperation();
  });
} catch (error) {
  if (breaker.isOpen()) {
    console.log('Circuit opened due to failures');
  }
  throw error;
}
```

## API

Multi-region replication for db4:

```typescript
class ReplicationManager {
  constructor(config: ReplicaConfig);
  read<T>(fn: () => Promise<T>): Promise<T>;
  write<T>(fn: () => Promise<T>): Promise<T>;
}
```

### ReplicationManager

```typescript
class ReplicationManager {
  constructor(config: ReplicaConfig);
  getReadTarget(context?: RoutingContext): string;
  getPrimaryTarget(): string;
  read<T>(fn: () => Promise<T>, options?: ReadOptions): Promise<T>;
  write<T>(fn: () => Promise<T>): Promise<T>;
  healthCheck(): Promise<HealthCheckResult>;
  startHealthMonitoring(checker: HealthChecker, options?: MonitoringOptions): void;
  stopHealthMonitoring(): void;
  onFailover(callback: FailoverCallback): void;
  on(event: ReplicationEventType, callback: ReplicationEventCallback): void;
  getMetrics(): ReplicationMetrics;
  getLagStatus(): Record<string, LagMeasurement>;
}
```

### Configuration Types

```typescript
interface ReplicaConfig {
  primary: string;
  replicas: string[] | ReplicaEndpointConfig[];
  readPreference?: ReadPreference;
  consistency?: ConsistencyLevel;
  circuitBreaker?: CircuitBreakerConfig;
  lagTracking?: LagTrackingConfig;
  retry?: RetryConfig;
}

type ReadPreference = 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest';
type ConsistencyLevel = 'strong' | 'session' | 'eventual';
```

### Event Types

| Event | Description |
|-------|-------------|
| `failover` | Triggered when traffic is routed to a different replica |
| `replica-unhealthy` | Triggered when a replica fails health check |
| `replica-recovered` | Triggered when a replica becomes healthy again |
| `circuit-open` | Triggered when circuit breaker opens |
| `circuit-close` | Triggered when circuit breaker closes |
| `lag-exceeded` | Triggered when replication lag exceeds threshold |

## Related Packages

- [@db4/core](../core) - Core types and utilities
- [@db4/client](../client) - Client SDK

## See Also

- [@db4/cache](../cache) - Edge caching with coherence
- [@db4/storage](../storage) - Three-tier storage abstraction

## License

MIT
