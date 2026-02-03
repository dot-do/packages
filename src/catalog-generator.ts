import { readFile } from 'node:fs/promises'
import { config } from './config.js'
import { searchPackages, getPackageInfo, getBulkDownloads, pauseBetweenSources } from './npm-registry.js'
import { writeTsv } from './tsv-writer.js'
import { writeAllReadmes } from './readme-writer.js'
import type { CatalogEntry, CachedPackage, Source } from './types.js'

interface PackageWithSource {
  name: string
  source: Source
}

/**
 * Load existing catalog.tsv to get cached package versions
 */
async function loadCachedVersions(tsvPath: string): Promise<Map<string, CachedPackage>> {
  const cache = new Map<string, CachedPackage>()

  try {
    const content = await readFile(tsvPath, 'utf-8')
    const lines = content.trim().split('\n')

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t')
      if (cols.length >= 2) {
        const name = cols[0]
        const version = cols[1]
        cache.set(name, { name, version })
      }
    }

    console.log(`Loaded ${cache.size} cached packages from ${tsvPath}`)
  } catch {
    console.log('No existing catalog found, fetching all packages')
  }

  return cache
}

export async function generateCatalog(): Promise<void> {
  console.log('Starting catalog generation...\n')

  // Load cached versions for incremental updates
  const cachedVersions = await loadCachedVersions(config.output.tsvPath)

  // 1. Collect all packages from all sources
  const allPackages: PackageWithSource[] = []

  for (let i = 0; i < config.sources.length; i++) {
    const source = config.sources[i]

    // Pause between sources (except before first)
    if (i > 0) {
      await pauseBetweenSources()
    }

    console.log(`Searching ${source.name}...`)
    const packageNames = await searchPackages(source)
    console.log(`  Found ${packageNames.length} packages`)

    for (const name of packageNames) {
      // Skip excluded packages and scopes
      if (config.excludedPackages.includes(name)) continue
      const scope = name.startsWith('@') ? name.split('/')[0] : null
      if (scope && config.excludedScopes.includes(scope)) continue

      allPackages.push({ name, source })
    }
  }

  // Deduplicate by name (keep first occurrence)
  const uniquePackages = new Map<string, PackageWithSource>()
  for (const pkg of allPackages) {
    if (!uniquePackages.has(pkg.name)) {
      uniquePackages.set(pkg.name, pkg)
    }
  }

  console.log(`\nTotal unique packages: ${uniquePackages.size}`)

  // 2. Fetch bulk downloads first (much more efficient)
  const packageNames = Array.from(uniquePackages.keys())
  console.log('\nFetching download stats (bulk API)...')
  const downloads = await getBulkDownloads(packageNames)
  console.log(`  Got stats for ${downloads.size} packages`)

  // 3. Fetch details for each package
  const entries: CatalogEntry[] = []
  let processed = 0
  let skipped = 0

  console.log('\nFetching package details...')

  for (const [name, { source }] of uniquePackages) {
    processed++

    if (processed % 10 === 0) {
      console.log(`  Processed ${processed}/${uniquePackages.size} (${skipped} cached)...`)
    }

    const info = await getPackageInfo(name)
    if (!info) continue

    // Check if we can use cached data (same version = skip README refetch in future optimization)
    const cached = cachedVersions.get(name)
    if (cached && cached.version === info.version) {
      skipped++
    }

    const featured = config.featuredPackages.find(f => f.name === name)

    entries.push({
      ...info,
      downloadsMonthly: downloads.get(name) ?? 0,
      featured: !!featured,
      featuredPriority: featured?.priority ?? null,
      sourcePriority: source.priority,
    })
  }

  console.log(`\nFetched details for ${entries.length} packages (${skipped} unchanged)`)

  // 4. Sort entries according to ordering rules
  entries.sort((a, b) => {
    // Featured packages first (sorted by priority)
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    if (a.featured && b.featured) {
      return (a.featuredPriority ?? 999) - (b.featuredPriority ?? 999)
    }

    // Then by source priority (lower = higher priority)
    if (a.sourcePriority !== b.sourcePriority) {
      return a.sourcePriority - b.sourcePriority
    }

    // Within source: by monthly downloads (descending)
    return b.downloadsMonthly - a.downloadsMonthly
  })

  // 5. Write outputs
  console.log('\nWriting outputs...')
  await writeTsv(entries, config.output.tsvPath)
  await writeAllReadmes(entries, config.output.readmePath)

  console.log('\nCatalog generation complete!')
}
