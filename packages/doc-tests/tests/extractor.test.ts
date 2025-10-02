import { describe, it, expect } from 'vitest'
import { extractTests } from '../src/extractor'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('extractor', () => {
  it('should extract code blocks from markdown', async () => {
    const content = `
# Test Document

Some text

\`\`\`typescript
const result = await ai.brainstormIdeas('test')
// => result.length > 0
\`\`\`
    `

    const tempDir = join(tmpdir(), 'doc-tests-' + Date.now())
    await mkdir(tempDir, { recursive: true })
    const testFile = join(tempDir, 'test.mdx')
    await writeFile(testFile, content)

    const blocks = await extractTests(testFile)

    expect(blocks).toHaveLength(1)
    expect(blocks[0].language).toBe('typescript')
    expect(blocks[0].code).toContain('brainstormIdeas')
    expect(blocks[0].assertions).toHaveLength(1)
  })

  it('should parse multiple code blocks', async () => {
    const content = `
\`\`\`typescript
const a = 1
// => a === 1
\`\`\`

\`\`\`typescript
const b = 2
// => b === 2
\`\`\`
    `

    const tempDir = join(tmpdir(), 'doc-tests-' + Date.now())
    await mkdir(tempDir, { recursive: true })
    const testFile = join(tempDir, 'test.mdx')
    await writeFile(testFile, content)

    const blocks = await extractTests(testFile)

    expect(blocks).toHaveLength(2)
  })

  it('should filter by language', async () => {
    const content = `
\`\`\`typescript
const ts = 1
\`\`\`

\`\`\`javascript
const js = 1
\`\`\`

\`\`\`python
val = 1
\`\`\`
    `

    const tempDir = join(tmpdir(), 'doc-tests-' + Date.now())
    await mkdir(tempDir, { recursive: true })
    const testFile = join(tempDir, 'test.mdx')
    await writeFile(testFile, content)

    const blocks = await extractTests(testFile, { languages: ['typescript'] })

    expect(blocks).toHaveLength(1)
    expect(blocks[0].language).toBe('typescript')
  })

  it('should skip blocks without assertions when required', async () => {
    const content = `
\`\`\`typescript
const noAssertions = 1
\`\`\`

\`\`\`typescript
const withAssertions = 1
// => withAssertions === 1
\`\`\`
    `

    const tempDir = join(tmpdir(), 'doc-tests-' + Date.now())
    await mkdir(tempDir, { recursive: true })
    const testFile = join(tempDir, 'test.mdx')
    await writeFile(testFile, content)

    const blocks = await extractTests(testFile, { requireAssertions: true })

    expect(blocks).toHaveLength(1)
    expect(blocks[0].assertions.length).toBeGreaterThan(0)
  })
})
