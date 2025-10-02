/**
 * Benchmark: Graph Traversal
 *
 * Tests relationship queries and multi-hop navigation
 */

import type { Database } from '../types/index.js'
import type { BenchmarkResult } from './simple-lookup.js'

/**
 * Run graph traversal benchmark
 */
export async function benchmarkGraphTraversal(db: Database, adapterName: string, iterations = 100): Promise<BenchmarkResult> {
  const latencies: number[] = []

  // Create graph structure: 100 things with 500 relationships
  const thingCount = 100
  const relationshipCount = 500

  // Insert things
  const things = Array.from({ length: thingCount }, (_, i) => ({
    ns: 'benchmark',
    id: `node-${i}`,
    type: 'GraphNode',
    data: { index: i },
    visibility: 'public' as const,
  }))

  for (const thing of things) {
    await db.insert('things', thing)
  }

  // Insert relationships (random connections)
  for (let i = 0; i < relationshipCount; i++) {
    const fromIndex = Math.floor(Math.random() * thingCount)
    const toIndex = Math.floor(Math.random() * thingCount)

    if (fromIndex !== toIndex) {
      await db.insert('relationships', {
        ns: 'benchmark',
        id: `edge-${i}`,
        type: 'connects',
        fromNs: 'benchmark',
        fromId: `node-${fromIndex}`,
        toNs: 'benchmark',
        toId: `node-${toIndex}`,
        data: { weight: Math.random() },
        visibility: 'public' as const,
      })
    }
  }

  // Run benchmark - find all outgoing relationships for random nodes
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    const nodeIndex = i % thingCount

    const opStart = performance.now()

    // Query outgoing relationships
    await db.relationships
      .where({
        fromNs: 'benchmark',
        fromId: `node-${nodeIndex}`,
      })
      .execute()

    const opEnd = performance.now()
    latencies.push(opEnd - opStart)
  }

  const endTime = performance.now()
  const totalTime = endTime - startTime

  // Calculate percentiles
  latencies.sort((a, b) => a - b)
  const p50 = latencies[Math.floor(latencies.length * 0.5)]
  const p95 = latencies[Math.floor(latencies.length * 0.95)]
  const p99 = latencies[Math.floor(latencies.length * 0.99)]

  return {
    name: 'Graph Traversal',
    adapter: adapterName,
    operations: iterations,
    totalTimeMs: totalTime,
    avgLatencyMs: totalTime / iterations,
    p50Ms: p50,
    p95Ms: p95,
    p99Ms: p99,
    opsPerSec: (iterations / totalTime) * 1000,
  }
}
