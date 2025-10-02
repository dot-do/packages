/**
 * Extract code blocks with assertions from MDX/markdown files
 */

import fs from 'fs/promises'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { visit } from 'unist-util-visit'
import type { Code } from 'mdast'
import type { TestBlock, ExtractOptions } from './types'
import { parseAssertions } from './parser'

/**
 * Extract test blocks from MDX/markdown file
 */
export async function extractTests(filePath: string, options: ExtractOptions = {}): Promise<TestBlock[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  const { content: markdown, data: frontmatter } = matter(content)

  const testBlocks: TestBlock[] = []
  let currentHeading: string | undefined

  // Parse markdown AST
  const processor = unified().use(remarkParse)
  const ast = processor.parse(markdown)

  // Visit all nodes to find headings and code blocks
  visit(ast, (node) => {
    // Track current heading for context
    if (node.type === 'heading' && (node as any).children?.[0]?.value) {
      currentHeading = (node as any).children[0].value
    }

    // Extract code blocks
    if (node.type === 'code') {
      const codeNode = node as Code
      const language = codeNode.lang || 'text'

      // Filter by language if specified
      if (options.languages && !options.languages.includes(language)) {
        return
      }

      // Parse assertions from code
      const assertions = parseAssertions(codeNode.value)

      // Skip if no assertions and requireAssertions is true
      if (options.requireAssertions && assertions.length === 0) {
        return
      }

      const testBlock: TestBlock = {
        file: filePath,
        language,
        startLine: codeNode.position?.start.line || 0,
        endLine: codeNode.position?.end.line || 0,
        code: codeNode.value,
        assertions,
        title: currentHeading,
        meta: codeNode.meta ? parseCodeMeta(codeNode.meta) : undefined,
      }

      testBlocks.push(testBlock)
    }
  })

  return testBlocks
}

/**
 * Extract test blocks from multiple files
 */
export async function extractTestsFromFiles(filePaths: string[], options: ExtractOptions = {}): Promise<TestBlock[]> {
  const results = await Promise.all(filePaths.map((file) => extractTests(file, options)))
  return results.flat()
}

/**
 * Parse code fence metadata (e.g., ```typescript title="example.ts")
 */
function parseCodeMeta(meta: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  // Parse key="value" pairs
  const kvPattern = /(\w+)="([^"]*)"/g
  let match
  while ((match = kvPattern.exec(meta)) !== null) {
    result[match[1]] = match[2]
  }

  // Parse boolean flags
  const flagPattern = /\b(\w+)(?!=)/g
  while ((match = flagPattern.exec(meta)) !== null) {
    if (!result[match[1]]) {
      result[match[1]] = true
    }
  }

  return result
}
