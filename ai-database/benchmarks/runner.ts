/**
 * Benchmark Runner
 *
 * Runs all benchmark scenarios across different adapters and generates comparison report
 */

import type { Database } from '../src/types/index.js'
import type { BenchmarkResult } from './scenarios/simple-lookup.js'
import { benchmarkSimpleLookup } from './scenarios/simple-lookup.js'
import { benchmarkFilteredQuery } from './scenarios/filtered-query.js'
import { benchmarkBulkInsert } from './scenarios/bulk-insert.js'
import { benchmarkGraphTraversal } from './scenarios/graph-traversal.js'

export interface BenchmarkSuite {
  adapters: {
    name: string
    db: Database
  }[]
  scenarios: {
    name: string
    run: (db: Database, adapterName: string) => Promise<BenchmarkResult>
  }[]
}

/**
 * Run complete benchmark suite
 */
export async function runBenchmarks(suite: BenchmarkSuite): Promise<Map<string, BenchmarkResult[]>> {
  const results = new Map<string, BenchmarkResult[]>()

  console.log('🚀 Starting Database Adapter Benchmarks\n')

  for (const adapter of suite.adapters) {
    console.log(`\n📊 Testing ${adapter.name}...`)
    const adapterResults: BenchmarkResult[] = []

    for (const scenario of suite.scenarios) {
      console.log(`  Running ${scenario.name}...`)

      try {
        const result = await scenario.run(adapter.db, adapter.name)
        adapterResults.push(result)
        console.log(`    ✓ ${result.opsPerSec.toFixed(2)} ops/sec (p95: ${result.p95Ms.toFixed(2)}ms)`)
      } catch (error) {
        console.error(`    ✗ Failed: ${error}`)
      }
    }

    results.set(adapter.name, adapterResults)
  }

  return results
}

/**
 * Generate comparison report
 */
export function generateReport(results: Map<string, BenchmarkResult[]>): string {
  const adapters = Array.from(results.keys())
  const scenarios = Array.from(results.values())[0]?.map(r => r.name) || []

  let report = '\n'
  report += '┌─────────────────────────────────────────────────────────────────────────┐\n'
  report += '│                    DATABASE ADAPTER BENCHMARKS                          │\n'
  report += '└─────────────────────────────────────────────────────────────────────────┘\n\n'

  // Table header
  const colWidth = 20
  report += '┌─' + '─'.repeat(colWidth) + '─┬'
  for (const _ of adapters) {
    report += '─'.repeat(colWidth) + '─┬'
  }
  report = report.slice(0, -1) + '┐\n'

  report += '│ ' + 'Scenario'.padEnd(colWidth) + ' │'
  for (const adapter of adapters) {
    report += ' ' + adapter.padEnd(colWidth) + ' │'
  }
  report += '\n'

  report += '├─' + '─'.repeat(colWidth) + '─┼'
  for (const _ of adapters) {
    report += '─'.repeat(colWidth) + '─┼'
  }
  report = report.slice(0, -1) + '┤\n'

  // Metrics rows
  const metrics: Array<{ name: string; getValue: (r: BenchmarkResult) => number; unit: string }> = [
    { name: 'Throughput', getValue: r => r.opsPerSec, unit: ' ops/s' },
    { name: 'Avg Latency', getValue: r => r.avgLatencyMs, unit: 'ms' },
    { name: 'p50 Latency', getValue: r => r.p50Ms, unit: 'ms' },
    { name: 'p95 Latency', getValue: r => r.p95Ms, unit: 'ms' },
    { name: 'p99 Latency', getValue: r => r.p99Ms, unit: 'ms' },
  ]

  for (const scenario of scenarios) {
    report += '│ ' + scenario.padEnd(colWidth) + ' │' + ' '.repeat((colWidth + 2) * adapters.length - 1) + '│\n'

    for (const metric of metrics) {
      report += '│   ' + metric.name.padEnd(colWidth - 2) + ' │'

      for (const adapter of adapters) {
        const adapterResults = results.get(adapter)
        const result = adapterResults?.find(r => r.name === scenario)

        if (result) {
          const value = metric.getValue(result).toFixed(2)
          const display = `${value}${metric.unit}`
          report += ' ' + display.padEnd(colWidth) + ' │'
        } else {
          report += ' ' + 'N/A'.padEnd(colWidth) + ' │'
        }
      }
      report += '\n'
    }

    report += '├─' + '─'.repeat(colWidth) + '─┼'
    for (const _ of adapters) {
      report += '─'.repeat(colWidth) + '─┼'
    }
    report = report.slice(0, -1) + '┤\n'
  }

  // Summary
  report += '│ ' + 'SUMMARY'.padEnd(colWidth) + ' │' + ' '.repeat((colWidth + 2) * adapters.length - 1) + '│\n'

  for (const adapter of adapters) {
    const adapterResults = results.get(adapter) || []
    const avgThroughput = adapterResults.reduce((sum, r) => sum + r.opsPerSec, 0) / adapterResults.length
    const avgP95 = adapterResults.reduce((sum, r) => sum + r.p95Ms, 0) / adapterResults.length

    report += '│   ' + adapter.padEnd(colWidth - 2) + ' │'
    report += ' ' + `${avgThroughput.toFixed(2)} ops/s avg`.padEnd(colWidth) + ' │'
    report += ' ' + `${avgP95.toFixed(2)}ms p95 avg`.padEnd(colWidth) + ' │'
    report += '\n'
  }

  report += '└─' + '─'.repeat(colWidth) + '─┴'
  for (const _ of adapters) {
    report += '─'.repeat(colWidth) + '─┴'
  }
  report = report.slice(0, -1) + '┘\n'

  return report
}

/**
 * Main benchmark execution
 */
export async function main() {
  // Note: In real implementation, create actual adapter instances
  // This is a template showing the structure

  const suite: BenchmarkSuite = {
    adapters: [
      // { name: 'Drizzle+D1', db: createD1Database(...) },
      // { name: 'KV+D1', db: createKVDatabase(...) },
      // { name: 'Drizzle+DO', db: createDODatabase(...) },
      // { name: 'KV+DO', db: createKVDatabase(...) },
    ],
    scenarios: [
      { name: 'Simple Lookup', run: benchmarkSimpleLookup },
      { name: 'Filtered Query', run: benchmarkFilteredQuery },
      { name: 'Bulk Insert', run: benchmarkBulkInsert },
      { name: 'Graph Traversal', run: benchmarkGraphTraversal },
    ],
  }

  const results = await runBenchmarks(suite)
  const report = generateReport(results)

  console.log(report)

  // Save report to file
  // await writeFile('benchmark-results.txt', report)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
