import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { CatalogEntry } from './types.js'

function generateFrontmatter(entry: CatalogEntry): string {
  const frontmatter: Record<string, unknown> = {
    name: entry.name,
    version: entry.version,
  }

  if (entry.description) {
    frontmatter.description = entry.description
  }

  if (entry.license) {
    frontmatter.license = entry.license
  }

  if (entry.repository) {
    frontmatter.repository = entry.repository
  }

  if (entry.homepage) {
    frontmatter.homepage = entry.homepage
  }

  if (entry.keywords.length > 0) {
    frontmatter.keywords = entry.keywords
  }

  frontmatter.downloads = {
    monthly: entry.downloadsMonthly,
  }

  if (entry.featured) {
    frontmatter.featured = true
  }

  if (entry.publishedAt) {
    frontmatter.published = entry.publishedAt
  }

  if (entry.updatedAt) {
    frontmatter.updated = entry.updatedAt
  }

  return yamlStringify(frontmatter)
}

function yamlStringify(obj: Record<string, unknown>, indent = 0): string {
  const lines: string[] = []
  const prefix = '  '.repeat(indent)

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue

    if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${prefix}${key}:`)
      for (const item of value) {
        lines.push(`${prefix}  - ${escapeYamlString(String(item))}`)
      }
    } else if (typeof value === 'object') {
      lines.push(`${prefix}${key}:`)
      lines.push(yamlStringify(value as Record<string, unknown>, indent + 1))
    } else if (typeof value === 'boolean') {
      lines.push(`${prefix}${key}: ${value}`)
    } else if (typeof value === 'number') {
      lines.push(`${prefix}${key}: ${value}`)
    } else {
      lines.push(`${prefix}${key}: ${escapeYamlString(String(value))}`)
    }
  }

  return lines.join('\n')
}

function escapeYamlString(str: string): string {
  // If string contains special chars, wrap in quotes
  if (/[:\[\]{}#&*!|>'"%@`\n]/.test(str) || str.startsWith(' ') || str.endsWith(' ')) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
  }
  return str
}

function getPackagePath(packageName: string, basePath: string): string {
  // @scope/name -> packages/@scope/name/README.md
  // name -> packages/name/README.md
  return join(basePath, packageName, 'README.md')
}

export async function writeReadme(entry: CatalogEntry, basePath: string): Promise<void> {
  const filePath = getPackagePath(entry.name, basePath)
  const dir = dirname(filePath)

  await mkdir(dir, { recursive: true })

  const frontmatter = generateFrontmatter(entry)
  const readme = entry.readme ?? `# ${entry.name}\n\n${entry.description ?? 'No description available.'}`

  const content = `---\n${frontmatter}\n---\n\n${readme}`

  await writeFile(filePath, content, 'utf-8')
}

export async function writeAllReadmes(entries: CatalogEntry[], basePath: string): Promise<void> {
  let written = 0

  for (const entry of entries) {
    try {
      await writeReadme(entry, basePath)
      written++
    } catch (error) {
      console.error(`Error writing README for ${entry.name}:`, error)
    }
  }

  console.log(`Wrote ${written} README files to ${basePath}`)
}
