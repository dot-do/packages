import { describe, it, expect } from 'vitest'
import { parseMDX, extractCodeBlocks, detectMDXType, parseFrontmatter } from './parser'

describe('parseMDX', () => {
  it('should parse MDX with frontmatter and content', async () => {
    const mdx = `---
service: Test Service
category: Testing
---

# Test Service
This is test content.
`

    const result = await parseMDX(mdx)

    expect(result.frontmatter).toEqual({
      service: 'Test Service',
      category: 'Testing',
    })
    expect(result.content).toContain('# Test Service')
    expect(result.raw).toBe(mdx)
  })

  it('should parse MDX without frontmatter', async () => {
    const mdx = `# Hello World\nThis is content.`

    const result = await parseMDX(mdx)

    expect(result.frontmatter).toEqual({})
    expect(result.content).toBe(mdx)
  })

  it('should include AST when requested', async () => {
    const mdx = `---
service: Test
---

# Content
`

    const result = await parseMDX(mdx, { includeAST: true })

    expect(result.ast).toBeDefined()
  })
})

describe('extractCodeBlocks', () => {
  it('should extract code blocks from MDX', () => {
    const content = `
Some text

\`\`\`typescript
const x = 5
\`\`\`

More text

\`\`\`javascript {filename="test.js"}
console.log('hello')
\`\`\`
`

    const blocks = extractCodeBlocks(content)

    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toEqual({
      language: 'typescript',
      code: 'const x = 5',
    })
    expect(blocks[1]).toEqual({
      language: 'javascript',
      code: "console.log('hello')",
      meta: 'filename="test.js"',
      filename: 'test.js',
    })
  })

  it('should return empty array when no code blocks', () => {
    const content = `Just text, no code blocks.`

    const blocks = extractCodeBlocks(content)

    expect(blocks).toEqual([])
  })
})

describe('detectMDXType', () => {
  it('should detect service type', () => {
    expect(detectMDXType({ service: 'Test' })).toBe('service')
  })

  it('should detect collection type', () => {
    expect(detectMDXType({ collection: 'Posts' })).toBe('collection')
  })

  it('should detect workflow type', () => {
    expect(detectMDXType({ workflow: 'Test Workflow' })).toBe('workflow')
  })

  it('should detect worker type', () => {
    expect(detectMDXType({ worker: 'test-worker' })).toBe('worker')
  })

  it('should return unknown for unrecognized type', () => {
    expect(detectMDXType({ foo: 'bar' })).toBe('unknown')
  })
})

describe('parseFrontmatter', () => {
  it('should parse frontmatter only', () => {
    const mdx = `---
collection: Posts
fields:
  - name: title
---

# Content here
`

    const frontmatter = parseFrontmatter(mdx)

    expect(frontmatter).toEqual({
      collection: 'Posts',
      fields: [{ name: 'title' }],
    })
  })
})
