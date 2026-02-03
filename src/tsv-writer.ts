import { writeFile } from 'node:fs/promises'
import type { CatalogEntry } from './types.js'

const TSV_COLUMNS = [
  'name',
  'version',
  'description',
  'downloads_monthly',
  'repository',
  'homepage',
  'license',
  'keywords',
  'published',
  'updated',
  'featured',
] as const

function escapeField(value: string | null | undefined): string {
  if (value == null) return ''
  // Escape tabs and newlines in field values
  return value.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '')
}

function formatEntry(entry: CatalogEntry): string {
  const fields = [
    entry.name,
    entry.version,
    escapeField(entry.description),
    entry.downloadsMonthly.toString(),
    escapeField(entry.repository),
    escapeField(entry.homepage),
    escapeField(entry.license),
    entry.keywords.join(','),
    entry.publishedAt ?? '',
    entry.updatedAt ?? '',
    entry.featured ? 'true' : 'false',
  ]
  return fields.join('\t')
}

export async function writeTsv(entries: CatalogEntry[], outputPath: string): Promise<void> {
  const header = TSV_COLUMNS.join('\t')
  const rows = entries.map(formatEntry)
  const content = [header, ...rows].join('\n')

  await writeFile(outputPath, content + '\n', 'utf-8')
  console.log(`Wrote ${entries.length} entries to ${outputPath}`)
}
