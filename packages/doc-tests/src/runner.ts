/**
 * Test runner for documentation tests
 */

import type { TestBlock, TestResult, TestResults, AssertionResult, RunOptions } from './types'
import { createRuntime, linkEventSystem } from './runtime'
import { validateAssertion } from './parser'

/**
 * Run tests extracted from documentation
 */
export async function runTests(blocks: TestBlock[], options: RunOptions = {}): Promise<TestResults> {
  const startTime = Date.now()

  // Create runtime environment
  const runtime = createRuntime(options.runtime)
  linkEventSystem(runtime)

  // Run setup if provided
  if (options.setup) {
    await options.setup()
  }

  try {
    // Run tests
    const tests: TestResult[] = []

    if (options.parallel) {
      // Run tests in parallel
      const results = await Promise.all(blocks.map((block) => runTest(block, runtime, options)))
      tests.push(...results)
    } else {
      // Run tests sequentially
      for (const block of blocks) {
        const result = await runTest(block, runtime, options)
        tests.push(result)
      }
    }

    // Calculate results
    const passed = tests.filter((t) => t.status === 'passed').length
    const failed = tests.filter((t) => t.status === 'failed').length
    const skipped = tests.filter((t) => t.status === 'skipped').length

    return {
      total: tests.length,
      passed,
      failed,
      skipped,
      duration: Date.now() - startTime,
      tests,
    }
  } finally {
    // Run teardown if provided
    if (options.teardown) {
      await options.teardown()
    }
  }
}

/**
 * Run a single test block
 */
async function runTest(block: TestBlock, runtime: any, options: RunOptions): Promise<TestResult> {
  const startTime = Date.now()

  try {
    // Execute code with runtime context
    const context = await executeCode(block.code, runtime, options.timeout)

    // Validate assertions
    const assertions: AssertionResult[] = []

    for (const assertion of block.assertions) {
      const passed = validateAssertion(assertion, context)

      assertions.push({
        assertion,
        passed,
        actual: context[extractVariableName(assertion.expression)],
        expected: assertion.expected,
      })
    }

    // Check if all assertions passed
    const allPassed = assertions.every((a) => a.passed)

    return {
      block,
      status: allPassed ? 'passed' : 'failed',
      duration: Date.now() - startTime,
      assertions,
    }
  } catch (error) {
    return {
      block,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
      assertions: [],
    }
  }
}

/**
 * Execute code in sandboxed environment
 */
async function executeCode(code: string, runtime: any, timeout: number = 5000): Promise<Record<string, unknown>> {
  // Create context with runtime methods
  const context: Record<string, unknown> = {
    ai: runtime.ai,
    db: runtime.db,
    on: runtime.on,
    send: runtime.send,
    every: runtime.every,
    api: runtime.api,
  }

  // Remove assertion comments from code
  const cleanCode = code
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n')

  // Wrap code in async function
  const wrappedCode = `
    (async function() {
      const { ai, db, on, send, every, api } = this;
      ${cleanCode}
    }).call(this)
  `

  // Execute with timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
  })

  const executionPromise = (async () => {
    try {
      // Create function with context
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
      const func = new AsyncFunction(`return ${wrappedCode}`)

      // Execute and capture results
      await func.call(context)

      return context
    } catch (error) {
      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  })()

  return (await Promise.race([executionPromise, timeoutPromise])) as Record<string, unknown>
}

/**
 * Extract variable name from assertion expression
 */
function extractVariableName(expression: string): string {
  // Simple extraction - get first identifier
  const match = expression.match(/^(\w+)/)
  return match ? match[1] : 'result'
}
