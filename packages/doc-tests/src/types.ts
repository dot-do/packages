/**
 * Type definitions for self-validating documentation framework
 */

export interface TestBlock {
  /** Source file path */
  file: string
  /** Language of code block (typescript, javascript, etc) */
  language: string
  /** Line number where block starts */
  startLine: number
  /** Line number where block ends */
  endLine: number
  /** Raw code content */
  code: string
  /** Extracted assertions from comments */
  assertions: Assertion[]
  /** Optional title/description from markdown heading */
  title?: string
  /** Metadata from code fence */
  meta?: Record<string, unknown>
}

export interface Assertion {
  /** Line number in code block */
  line: number
  /** Type of assertion */
  type: 'equals' | 'shape' | 'expression' | 'type' | 'custom'
  /** Assertion expression */
  expression: string
  /** Expected value (for equals assertions) */
  expected?: unknown
  /** Object shape definition (for shape assertions) */
  shape?: Record<string, unknown>
}

export interface TestResults {
  /** Total number of tests */
  total: number
  /** Number of passed tests */
  passed: number
  /** Number of failed tests */
  failed: number
  /** Number of skipped tests */
  skipped: number
  /** Duration in milliseconds */
  duration: number
  /** Individual test results */
  tests: TestResult[]
}

export interface TestResult {
  /** Test file and block */
  block: TestBlock
  /** Test status */
  status: 'passed' | 'failed' | 'skipped'
  /** Error message if failed */
  error?: string
  /** Stack trace if failed */
  stack?: string
  /** Duration in milliseconds */
  duration: number
  /** Assertion results */
  assertions: AssertionResult[]
}

export interface AssertionResult {
  /** Assertion that was tested */
  assertion: Assertion
  /** Whether assertion passed */
  passed: boolean
  /** Actual value received */
  actual?: unknown
  /** Expected value */
  expected?: unknown
  /** Error message if failed */
  error?: string
}

export interface Runtime {
  /** AI template functions */
  ai: AIRuntime
  /** Database operations */
  db: DBRuntime
  /** Event system */
  on: OnFunction
  /** Event emission */
  send: SendFunction
  /** Scheduled tasks */
  every: EveryFunction
  /** HTTP API calls */
  api?: APIRuntime
}

export interface AIRuntime {
  [key: string]: (...args: any[]) => Promise<any>
}

export interface DBRuntime {
  [table: string]: {
    create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>
    get: (id: string) => Promise<Record<string, unknown> | null>
    update: (id: string, data: Record<string, unknown>) => Promise<Record<string, unknown>>
    delete: (id: string) => Promise<boolean>
    list: (options?: { limit?: number; offset?: number }) => Promise<Record<string, unknown>[]>
    search: (query: string) => Promise<Record<string, unknown>[]>
  }
}

export type OnFunction = (event: string, handler: EventHandler) => void

export type SendFunction = (event: string, data?: any) => Promise<{ results: any[]; context: Record<string, unknown> }>

export type EveryFunction = (schedule: string, handler: ScheduledHandler) => void

export type EventHandler = (data: any, context?: Record<string, unknown>) => Promise<any> | any

export type ScheduledHandler = (event: any, context?: Record<string, unknown>) => Promise<void> | void

export interface APIRuntime {
  get: (url: string, options?: RequestInit) => Promise<Response>
  post: (url: string, body?: any, options?: RequestInit) => Promise<Response>
  put: (url: string, body?: any, options?: RequestInit) => Promise<Response>
  delete: (url: string, options?: RequestInit) => Promise<Response>
}

export interface RunOptions {
  /** Custom runtime environment */
  runtime?: Partial<Runtime>
  /** Timeout for each test in milliseconds */
  timeout?: number
  /** Whether to run tests in parallel */
  parallel?: boolean
  /** Custom setup function */
  setup?: () => Promise<void> | void
  /** Custom teardown function */
  teardown?: () => Promise<void> | void
}

export interface ExtractOptions {
  /** Include only specific languages */
  languages?: string[]
  /** Exclude code blocks without assertions */
  requireAssertions?: boolean
  /** Custom assertion comment pattern */
  assertionPattern?: RegExp
}

export interface DocTestConfig {
  /** Files to include (glob patterns) */
  include?: string[]
  /** Files to exclude (glob patterns) */
  exclude?: string[]
  /** Runtime mocks */
  runtime?: Partial<Runtime>
  /** Test timeout */
  timeout?: number
  /** Run tests in parallel */
  parallel?: boolean
  /** Setup function */
  setup?: () => Promise<void> | void
  /** Teardown function */
  teardown?: () => Promise<void> | void
}
