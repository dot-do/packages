/**
 * MDX Parser
 * Parses MDX files to extract frontmatter and content
 */

import matter from 'gray-matter'
import { compile } from '@mdx-js/mdx'
import YAML from 'yaml'

export interface ParsedMDX {
  frontmatter: Record<string, any>
  content: string
  raw: string
  ast?: any
}

export interface ParserOptions {
  validateSchema?: boolean
  includeAST?: boolean
}

/**
 * Parse MDX file content
 * Extracts YAML frontmatter and MDX content
 */
export async function parseMDX(source: string, options: ParserOptions = {}): Promise<ParsedMDX> {
  // Extract frontmatter using gray-matter
  const { data: frontmatter, content } = matter(source)

  const result: ParsedMDX = {
    frontmatter,
    content: content.trim(),
    raw: source,
  }

  // Optionally compile to AST
  if (options.includeAST) {
    try {
      const compiled = await compile(source, {
        outputFormat: 'function-body',
        development: false,
      })
      result.ast = compiled
    } catch (error) {
      console.error('Failed to compile MDX to AST:', error)
    }
  }

  return result
}

/**
 * Parse MDX from file path
 */
export async function parseMDXFile(filePath: string, options: ParserOptions = {}): Promise<ParsedMDX> {
  const fs = await import('fs/promises')
  const source = await fs.readFile(filePath, 'utf-8')
  return parseMDX(source, options)
}

/**
 * Parse multiple MDX files from directory
 */
export async function parseMDXDirectory(dirPath: string, options: ParserOptions = {}): Promise<Map<string, ParsedMDX>> {
  const fs = await import('fs/promises')
  const path = await import('path')

  const results = new Map<string, ParsedMDX>()

  async function walkDir(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await walkDir(fullPath)
      } else if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
        const parsed = await parseMDXFile(fullPath, options)
        const relativePath = path.relative(dirPath, fullPath)
        results.set(relativePath, parsed)
      }
    }
  }

  await walkDir(dirPath)
  return results
}

/**
 * Extract code blocks from MDX content
 * Useful for virtual filesystem pattern
 */
export interface CodeBlock {
  language: string
  code: string
  meta?: string
  filename?: string
}

export function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = []

  // Match fenced code blocks: ```language {meta}\ncode\n```
  const codeBlockRegex = /```(\w+)(?:\s+{([^}]+)})?\n([\s\S]*?)```/g

  let match
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [, language, meta, code] = match

    const block: CodeBlock = {
      language,
      code: code.trim(),
    }

    if (meta) {
      block.meta = meta

      // Extract filename from meta
      const filenameMatch = meta.match(/filename="([^"]+)"/)
      if (filenameMatch) {
        block.filename = filenameMatch[1]
      }
    }

    blocks.push(block)
  }

  return blocks
}

/**
 * Parse frontmatter only (without full MDX processing)
 */
export function parseFrontmatter(source: string): Record<string, any> {
  const { data } = matter(source)
  return data
}

/**
 * Detect MDX type from frontmatter
 */
export type MDXType = 'service' | 'collection' | 'workflow' | 'worker' | 'unknown'

export function detectMDXType(frontmatter: Record<string, any>): MDXType {
  if ('service' in frontmatter) return 'service'
  if ('collection' in frontmatter) return 'collection'
  if ('workflow' in frontmatter) return 'workflow'
  if ('worker' in frontmatter) return 'worker'
  return 'unknown'
}
