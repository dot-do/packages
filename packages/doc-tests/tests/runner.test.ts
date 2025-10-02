import { describe, it, expect } from 'vitest'
import { runTests } from '../src/runner'
import type { TestBlock } from '../src/types'

describe('runner', () => {
  it('should run simple test blocks', async () => {
    const blocks: TestBlock[] = [
      {
        file: 'test.mdx',
        language: 'typescript',
        startLine: 1,
        endLine: 3,
        code: `const x = 10`,
        assertions: [
          {
            line: 2,
            type: 'expression',
            expression: 'x === 10',
          },
        ],
      },
    ]

    const results = await runTests(blocks)

    expect(results.total).toBe(1)
    expect(results.passed).toBe(1)
    expect(results.failed).toBe(0)
  })

  it('should fail on incorrect assertions', async () => {
    const blocks: TestBlock[] = [
      {
        file: 'test.mdx',
        language: 'typescript',
        startLine: 1,
        endLine: 3,
        code: `const x = 10`,
        assertions: [
          {
            line: 2,
            type: 'expression',
            expression: 'x === 20',
          },
        ],
      },
    ]

    const results = await runTests(blocks)

    expect(results.total).toBe(1)
    expect(results.passed).toBe(0)
    expect(results.failed).toBe(1)
  })

  it('should run tests with AI runtime', async () => {
    const blocks: TestBlock[] = [
      {
        file: 'test.mdx',
        language: 'typescript',
        startLine: 1,
        endLine: 3,
        code: `const ideas = await ai.brainstormIdeas('test')`,
        assertions: [
          {
            line: 2,
            type: 'expression',
            expression: 'Array.isArray(ideas)',
          },
        ],
      },
    ]

    const results = await runTests(blocks)

    expect(results.passed).toBe(1)
  })

  it('should run tests with DB runtime', async () => {
    const blocks: TestBlock[] = [
      {
        file: 'test.mdx',
        language: 'typescript',
        startLine: 1,
        endLine: 5,
        code: `
const user = await db.users.create({ name: 'John' })
const retrieved = await db.users.get(user.id)
        `,
        assertions: [
          {
            line: 3,
            type: 'expression',
            expression: 'user.name === "John"',
          },
          {
            line: 4,
            type: 'expression',
            expression: 'retrieved.name === "John"',
          },
        ],
      },
    ]

    const results = await runTests(blocks)

    expect(results.passed).toBe(1)
  })

  it('should support parallel execution', async () => {
    const blocks: TestBlock[] = Array.from({ length: 5 }, (_, i) => ({
      file: 'test.mdx',
      language: 'typescript',
      startLine: i * 3,
      endLine: i * 3 + 3,
      code: `const x = ${i}`,
      assertions: [
        {
          line: i * 3 + 2,
          type: 'expression',
          expression: `x === ${i}`,
        },
      ],
    }))

    const results = await runTests(blocks, { parallel: true })

    expect(results.total).toBe(5)
    expect(results.passed).toBe(5)
  })

  it('should timeout long-running tests', async () => {
    const blocks: TestBlock[] = [
      {
        file: 'test.mdx',
        language: 'typescript',
        startLine: 1,
        endLine: 3,
        code: `await new Promise(resolve => setTimeout(resolve, 10000))`,
        assertions: [],
      },
    ]

    const results = await runTests(blocks, { timeout: 100 })

    expect(results.failed).toBe(1)
    expect(results.tests[0].error).toContain('timeout')
  })
})
