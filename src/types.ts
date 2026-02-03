export interface Source {
  name: string
  type: 'scope' | 'user'
  priority: number
}

export interface FeaturedPackage {
  name: string
  priority: number
}

export interface Config {
  sources: Source[]
  excludedPackages: string[]
  excludedScopes: string[]
  featuredPackages: FeaturedPackage[]
  output: {
    tsvPath: string
    readmePath: string
  }
}

export interface PackageInfo {
  name: string
  version: string
  description: string
  license: string | null
  repository: string | null
  homepage: string | null
  keywords: string[]
  publishedAt: string | null
  updatedAt: string | null
  readme: string | null
}

export interface PackageDownloads {
  downloads: number
  package: string
}

export interface BulkDownloadsResult {
  [packageName: string]: {
    downloads: number
    package: string
    start: string
    end: string
  }
}

export interface CachedPackage {
  name: string
  version: string
}

export interface CatalogEntry extends PackageInfo {
  downloadsMonthly: number
  featured: boolean
  featuredPriority: number | null
  sourcePriority: number
}

export interface NpmSearchResult {
  objects: Array<{
    package: {
      name: string
      version: string
      description?: string
      keywords?: string[]
      date: string
      links: {
        npm?: string
        homepage?: string
        repository?: string
      }
      publisher?: {
        username: string
      }
    }
    score: {
      final: number
    }
  }>
  total: number
}

export interface NpmPackageResult {
  name: string
  'dist-tags': {
    latest: string
  }
  versions: Record<string, {
    name: string
    version: string
    description?: string
    license?: string
    repository?: { url?: string } | string
    homepage?: string
    keywords?: string[]
  }>
  time: Record<string, string>
  readme?: string
  license?: string
  description?: string
  homepage?: string
  repository?: { url?: string } | string
  keywords?: string[]
}
