/**
 * @dot-do/doc-tests
 *
 * Self-validating documentation framework
 * Write documentation that tests itself
 */

export * from './types'
export * from './extractor'
export * from './parser'
export * from './runner'
export * from './runtime'

import { extractTests, extractTestsFromFiles } from './extractor'
import { runTests } from './runner'
import { createRuntime } from './runtime'
import type { TestBlock, TestResults, Runtime, RunOptions, ExtractOptions } from './types'

/**
 * Main API - Extract and run tests from documentation
 */
export async function validateDocs(files: string | string[], options?: ExtractOptions & RunOptions): Promise<TestResults> {
  const filePaths = Array.isArray(files) ? files : [files]

  // Extract test blocks
  const blocks = await extractTestsFromFiles(filePaths, options)

  // Run tests
  const results = await runTests(blocks, options)

  return results
}

/**
 * Create custom runtime for advanced use cases
 */
export { createRuntime, extractTests, extractTestsFromFiles, runTests }

/**
 * Re-export types for convenience
 */
export type { TestBlock, TestResults, Runtime, RunOptions, ExtractOptions }
