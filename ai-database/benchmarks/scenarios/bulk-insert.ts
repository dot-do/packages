/**
 * Benchmark: Bulk Insert Operations
 *
 * Tests throughput for bulk data insertion
 */

import type { Database } from '../../src/types/index.js'
import type { BenchmarkResult } from './simple-lookup.js'

/**
 * Run bulk insert benchmark
 */
export async function benchmarkBulkInsert(db: Database, adapterName: string, batchSize = 1000): Promise<BenchmarkResult> {
  const latencies: number[] = []

  // Prepare test batches
  const batches = 10
  const totalOperations = batches * batchSize

  const startTime = performance.now()

  for (let batch = 0; batch < batches; batch++) {
    const batchStart = performance.now()

    // Generate batch data
    const things = Array.from({ length: batchSize }, (_, i) => ({
      ns: 'benchmark',
      id: `bulk-${batch}-${i}`,
      type: 'BulkEntity',
      data: {
        batchId: batch,
        index: i,
        timestamp: Date.now(),
        payload: 'x'.repeat(100), // 100 bytes per entity
      },
      visibility: 'public' as const,
    }))

    // Insert batch
    for (const thing of things) {
      await db.insert('things', thing)
    }

    const batchEnd = performance.now()
    latencies.push(batchEnd - batchStart)
  }

  const endTime = performance.now()
  const totalTime = endTime - startTime

  // Calculate percentiles
  latencies.sort((a, b) => a - b)
  const p50 = latencies[Math.floor(latencies.length * 0.5)]
  const p95 = latencies[Math.floor(latencies.length * 0.95)]
  const p99 = latencies[Math.floor(latencies.length * 0.99)]

  return {
    name: 'Bulk Insert',
    adapter: adapterName,
    operations: totalOperations,
    totalTimeMs: totalTime,
    avgLatencyMs: totalTime / batches,
    p50Ms: p50,
    p95Ms: p95,
    p99Ms: p99,
    opsPerSec: (totalOperations / totalTime) * 1000,
  }
}
