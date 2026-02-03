import type {
  NpmSearchResult,
  NpmPackageResult,
  BulkDownloadsResult,
  PackageInfo,
  Source,
} from './types.js'

const REGISTRY_URL = 'https://registry.npmjs.org'
const DOWNLOADS_URL = 'https://api.npmjs.org/downloads/point/last-month'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Global rate limiter - increased to 500ms for safety
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 500

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - elapsed)
  }
  lastRequestTime = Date.now()

  return fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  })
}

async function fetchWithRetry<T>(url: string, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 5s, 10s, 20s
      const backoff = Math.pow(2, attempt) * 2500
      console.log(`  Retry ${attempt}/${maxRetries - 1}, waiting ${backoff / 1000}s...`)
      await delay(backoff)
    }

    try {
      const response = await rateLimitedFetch(url)

      if (response.status === 429) {
        lastError = new Error(`Rate limited (429)`)
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response.json() as Promise<T>
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (!(lastError.message.includes('429') || lastError.message.includes('Rate limited'))) {
        // Non-rate-limit error, don't retry
        throw lastError
      }
    }
  }

  throw lastError ?? new Error('Unknown error')
}

export async function searchPackages(source: Source): Promise<string[]> {
  const packages: string[] = []
  let offset = 0
  const size = 250

  // Determine the prefix to filter results
  const scopePrefix = source.type === 'scope' ? `${source.name}/` : null

  while (true) {
    // Use @scope format for scopes (more reliable than scope: prefix)
    const query = source.type === 'scope'
      ? source.name
      : `maintainer:${source.name}`

    const url = `${REGISTRY_URL}/-/v1/search?text=${encodeURIComponent(query)}&size=${size}&from=${offset}`

    try {
      const result = await fetchWithRetry<NpmSearchResult>(url)

      let matchCount = 0
      for (const obj of result.objects) {
        const name = obj.package.name
        // Filter to only include actual scope packages (npm search returns fuzzy matches)
        if (scopePrefix && !name.startsWith(scopePrefix)) {
          continue
        }
        packages.push(name)
        matchCount++
      }

      // If we got results but none matched our scope prefix, the remaining results won't either
      if (result.objects.length > 0 && matchCount === 0) {
        break
      }

      if (result.objects.length < size) {
        break
      }

      offset += size
    } catch (error) {
      console.error(`Error searching ${source.name}:`, error instanceof Error ? error.message : error)
      break
    }
  }

  return packages
}

export async function getPackageInfo(packageName: string): Promise<PackageInfo | null> {
  try {
    const encodedName = packageName.startsWith('@')
      ? `@${encodeURIComponent(packageName.slice(1))}`
      : encodeURIComponent(packageName)

    const url = `${REGISTRY_URL}/${encodedName}`
    const result = await fetchWithRetry<NpmPackageResult>(url)

    const latestVersion = result['dist-tags']?.latest
    const versionData = latestVersion ? result.versions?.[latestVersion] : null

    const getRepoUrl = (repo: { url?: string } | string | undefined): string | null => {
      if (!repo) return null
      if (typeof repo === 'string') return repo
      return repo.url?.replace(/^git\+/, '').replace(/\.git$/, '') ?? null
    }

    return {
      name: result.name,
      version: latestVersion ?? 'unknown',
      description: result.description ?? versionData?.description ?? '',
      license: result.license ?? versionData?.license ?? null,
      repository: getRepoUrl(result.repository ?? versionData?.repository),
      homepage: result.homepage ?? versionData?.homepage ?? null,
      keywords: result.keywords ?? versionData?.keywords ?? [],
      publishedAt: result.time?.created ?? null,
      updatedAt: latestVersion ? result.time?.[latestVersion] ?? null : null,
      readme: result.readme ?? null,
    }
  } catch (error) {
    console.error(`Error fetching ${packageName}:`, error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Fetch downloads for multiple packages in a single request (up to 128)
 * Scoped packages are fetched individually since bulk API doesn't support them well
 */
export async function getBulkDownloads(packageNames: string[]): Promise<Map<string, number>> {
  const results = new Map<string, number>()

  // Separate scoped and non-scoped packages
  const scopedPackages = packageNames.filter(n => n.startsWith('@'))
  const regularPackages = packageNames.filter(n => !n.startsWith('@'))

  // Fetch regular packages in bulk (up to 128 per request)
  const BATCH_SIZE = 128

  for (let i = 0; i < regularPackages.length; i += BATCH_SIZE) {
    const batch = regularPackages.slice(i, i + BATCH_SIZE)
    const url = `${DOWNLOADS_URL}/${batch.join(',')}`

    try {
      const data = await fetchWithRetry<BulkDownloadsResult>(url)

      for (const [name, info] of Object.entries(data)) {
        if (info && typeof info.downloads === 'number') {
          results.set(name, info.downloads)
        }
      }
    } catch (error) {
      console.error(`Error fetching bulk downloads:`, error instanceof Error ? error.message : error)
      for (const name of batch) {
        results.set(name, 0)
      }
    }
  }

  // Fetch scoped packages individually (bulk API doesn't handle them well)
  for (const name of scopedPackages) {
    try {
      const url = `${DOWNLOADS_URL}/${encodeURIComponent(name)}`
      const data = await fetchWithRetry<{ downloads: number }>(url)
      results.set(name, data.downloads ?? 0)
    } catch {
      results.set(name, 0)
    }
  }

  return results
}

/**
 * Pause between sources to avoid rate limiting
 */
export async function pauseBetweenSources(): Promise<void> {
  console.log('  Pausing 2s between sources...')
  await delay(2000)
}
