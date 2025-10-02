/**
 * Benchmark: Simple Key Lookups
 *
 * Tests single-entity retrieval by ns:id
 */

import type { Database } from '../../src/types/index.js'

export interface BenchmarkResult {
  name: string
  adapter: string
  operations: number
  totalTimeMs: number
  avgLatencyMs: number
  p50Ms: number
  p95Ms: number
  p99Ms: number
  opsPerSec: number
}

/**
 * Run simple lookup benchmark
 */
export async function benchmarkSimpleLookup(db: Database, adapterName: string, iterations = 1000): Promise<BenchmarkResult> {
  const latencies: number[] = []

  // Prepare test data
  const testThings = Array.from({ length: 100 }, (_, i) => ({
    ns: 'benchmark',
    id: `thing-${i}`,
    type: 'TestEntity',
    data: { index: i, name: `Entity ${i}` },
    visibility: 'public' as const,
  }))

  // Insert test data
  for (const thing of testThings) {
    await db.insert('things', thing)
  }

  // Run benchmark
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    const targetId = `thing-${i % 100}`

    const opStart = performance.now()
    await db.things.find(targetId, 'benchmark')
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
    name: 'Simple Lookup',
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
