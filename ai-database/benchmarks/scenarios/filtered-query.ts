/**
 * Benchmark: Filtered Queries
 *
 * Tests queries with WHERE conditions
 */

import type { Database } from '../types/index.js'
import type { BenchmarkResult } from './simple-lookup.js'

/**
 * Run filtered query benchmark
 */
export async function benchmarkFilteredQuery(db: Database, adapterName: string, iterations = 100): Promise<BenchmarkResult> {
  const latencies: number[] = []

  // Prepare test data with variety
  const types = ['Person', 'Organization', 'Product', 'Service', 'Article']
  const visibilities = ['public', 'private', 'unlisted'] as const

  const testThings = Array.from({ length: 1000 }, (_, i) => ({
    ns: 'benchmark',
    id: `thing-${i}`,
    type: types[i % types.length],
    data: {
      index: i,
      category: i % 10,
      active: i % 3 === 0,
    },
    visibility: visibilities[i % 3],
  }))

  // Insert test data
  for (const thing of testThings) {
    await db.insert('things', thing)
  }

  // Run benchmark - filter by type
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    const targetType = types[i % types.length]

    const opStart = performance.now()
    await db.things.where({ type: targetType }).execute()
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
    name: 'Filtered Query',
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
