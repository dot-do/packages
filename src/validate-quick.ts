import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { config } from './config.js'

interface PackageIssue {
  name: string
  version: string
  issues: string[]
  issueType: 'direct' | 'transitive'
  deps?: Record<string, string>
  dependsOnBroken?: string[]
}

interface DepGraph {
  nodes: Record<string, { dependencies: string[] }>
  edges: Array<{ from: string; to: string }>
}

const REGISTRY_URL = 'https://registry.npmjs.org'
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function checkPackage(name: string): Promise<{ issues: string[]; deps: Record<string, string> } | null> {
  try {
    const encodedName = name.startsWith('@')
      ? `@${encodeURIComponent(name.slice(1))}`
      : encodeURIComponent(name)

    const response = await fetch(`${REGISTRY_URL}/${encodedName}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return { issues: ['Package not found on npm'], deps: {} }
    }

    const data = await response.json() as {
      'dist-tags': { latest: string }
      versions: Record<string, {
        dependencies?: Record<string, string>
        peerDependencies?: Record<string, string>
        optionalDependencies?: Record<string, string>
      }>
    }

    const latest = data['dist-tags']?.latest
    if (!latest) {
      return { issues: ['No latest version'], deps: {} }
    }

    const versionData = data.versions[latest]
    if (!versionData) {
      return { issues: ['Version data missing'], deps: {} }
    }

    const issues: string[] = []
    const allDeps = {
      ...versionData.dependencies,
      ...versionData.peerDependencies,
      ...versionData.optionalDependencies,
    }

    const problemDeps: Record<string, string> = {}

    for (const [dep, ver] of Object.entries(allDeps)) {
      if (ver.includes('workspace:')) {
        issues.push(`workspace dep: ${dep}@${ver}`)
        problemDeps[dep] = ver
      }
      if (ver.includes('file:')) {
        issues.push(`file dep: ${dep}@${ver}`)
        problemDeps[dep] = ver
      }
      if (ver.includes('link:')) {
        issues.push(`link dep: ${dep}@${ver}`)
        problemDeps[dep] = ver
      }
      if (ver === '*') {
        issues.push(`wildcard dep: ${dep}@*`)
        problemDeps[dep] = ver
      }
    }

    if (issues.length > 0) {
      return { issues, deps: problemDeps }
    }

    return null
  } catch (e) {
    return { issues: [`Fetch error: ${e}`], deps: {} }
  }
}

async function main() {
  console.log('Loading catalog...')
  const tsvPath = config.output.tsvPath
  const content = await readFile(tsvPath, 'utf-8')
  const lines = content.trim().split('\n')

  const packages: Array<{ name: string; version: string }> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    packages.push({ name: cols[0], version: cols[1] })
  }

  const packageSet = new Set(packages.map(p => p.name))

  console.log(`Quick-checking ${packages.length} packages for bad dependencies...\n`)

  // Phase 1: Find directly broken packages
  const directProblems: PackageIssue[] = []
  let checked = 0

  for (const pkg of packages) {
    await delay(50)

    const result = await checkPackage(pkg.name)
    if (result) {
      directProblems.push({
        name: pkg.name,
        version: pkg.version,
        issues: result.issues,
        issueType: 'direct',
        deps: result.deps,
      })
      console.log(`✗ ${pkg.name}: ${result.issues.join(', ')}`)
    }

    checked++
    if (checked % 50 === 0) {
      console.log(`  ... checked ${checked}/${packages.length}`)
    }
  }

  const brokenNames = new Set(directProblems.map(p => p.name))
  console.log(`\nFound ${brokenNames.size} directly broken packages`)

  // Phase 2: Load dep graph and find transitive issues
  console.log('\nChecking for transitive dependencies on broken packages...')

  let graph: DepGraph | null = null
  try {
    const graphPath = join(process.cwd(), 'meta', 'graphs', 'full.json')
    const graphContent = await readFile(graphPath, 'utf-8')
    graph = JSON.parse(graphContent) as DepGraph
  } catch {
    console.log('  (No dep graph found, run "pnpm graph" first for transitive checks)')
  }

  const transitiveProblems: PackageIssue[] = []

  if (graph) {
    // Find all packages that depend on broken packages
    const dependsOnBroken = new Map<string, string[]>()

    for (const edge of graph.edges) {
      if (brokenNames.has(edge.to) && !brokenNames.has(edge.from)) {
        if (!dependsOnBroken.has(edge.from)) {
          dependsOnBroken.set(edge.from, [])
        }
        dependsOnBroken.get(edge.from)!.push(edge.to)
      }
    }

    // Multi-level: also find packages that depend on packages that depend on broken
    let changed = true
    while (changed) {
      changed = false
      const currentBroken = new Set([...brokenNames, ...dependsOnBroken.keys()])

      for (const edge of graph.edges) {
        if (currentBroken.has(edge.to) && !currentBroken.has(edge.from) && !dependsOnBroken.has(edge.from)) {
          if (!dependsOnBroken.has(edge.from)) {
            dependsOnBroken.set(edge.from, [])
          }
          dependsOnBroken.get(edge.from)!.push(edge.to)
          changed = true
        }
      }
    }

    for (const [name, brokenDeps] of dependsOnBroken) {
      const pkg = packages.find(p => p.name === name)
      if (pkg) {
        transitiveProblems.push({
          name: pkg.name,
          version: pkg.version,
          issues: [`depends on broken: ${brokenDeps.join(', ')}`],
          issueType: 'transitive',
          dependsOnBroken: brokenDeps,
        })
        console.log(`⚠ ${name}: depends on ${brokenDeps.join(', ')}`)
      }
    }
  }

  const allProblems = [...directProblems, ...transitiveProblems]
  const allBrokenNames = new Set(allProblems.map(p => p.name))

  // Write results
  const outDir = join(process.cwd(), 'meta')
  await mkdir(outDir, { recursive: true })

  const problemsPath = join(outDir, 'problem-packages.json')
  await writeFile(problemsPath, JSON.stringify(allProblems, null, 2) + '\n')

  // Generate clean package.json
  const cleanDeps: Record<string, string> = {}
  for (const pkg of packages) {
    if (!allBrokenNames.has(pkg.name)) {
      cleanDeps[pkg.name] = `^${pkg.version}`
    }
  }

  const cleanPkg = {
    name: '@nathanclevenger/packages',
    version: '0.0.1',
    description: 'Meta-package containing all packages by Nathan Clevenger (validated)',
    dependencies: cleanDeps,
    keywords: ['meta-package', 'monorepo'],
    license: 'MIT',
  }

  const cleanPath = join(outDir, 'package.json')
  await writeFile(cleanPath, JSON.stringify(cleanPkg, null, 2) + '\n')

  // Generate issues.md
  const issuesLines = [
    '# Package Issues',
    '',
    `> Auto-generated: ${new Date().toISOString()}`,
    '',
    `**Total packages:** ${packages.length}`,
    `**Direct issues:** ${directProblems.length}`,
    `**Transitive issues:** ${transitiveProblems.length}`,
    `**Total excluded:** ${allBrokenNames.size}`,
    `**Clean packages:** ${packages.length - allBrokenNames.size}`,
    '',
    '## Install Command',
    '',
    '```bash',
    'cd meta && npm install --legacy-peer-deps',
    '```',
    '',
    '## Summary by Issue Type',
    '',
  ]

  // Count issue types
  const issueTypeCounts = new Map<string, number>()
  for (const p of directProblems) {
    for (const issue of p.issues) {
      const type = issue.split(':')[0].trim()
      issueTypeCounts.set(type, (issueTypeCounts.get(type) || 0) + 1)
    }
  }
  issueTypeCounts.set('transitive dependency', transitiveProblems.length)

  for (const [type, count] of issueTypeCounts) {
    issuesLines.push(`- **${type}**: ${count} packages`)
  }

  // Direct issues section
  issuesLines.push('', '## Direct Issues', '')

  const byScope = new Map<string, PackageIssue[]>()
  for (const p of directProblems) {
    const scope = p.name.startsWith('@') ? p.name.split('/')[0] : 'unscoped'
    if (!byScope.has(scope)) byScope.set(scope, [])
    byScope.get(scope)!.push(p)
  }

  for (const [scope, pkgs] of [...byScope.entries()].sort()) {
    issuesLines.push(`### ${scope}`, '')

    for (const p of pkgs) {
      issuesLines.push(`#### \`${p.name}@${p.version}\``, '')
      issuesLines.push('| Dependency | Version | Issue |')
      issuesLines.push('|------------|---------|-------|')

      if (p.deps && Object.keys(p.deps).length > 0) {
        for (const [dep, ver] of Object.entries(p.deps)) {
          const issueType = ver.includes('workspace:') ? 'workspace protocol' :
                           ver.includes('file:') ? 'file protocol' :
                           ver.includes('link:') ? 'link protocol' :
                           ver === '*' ? 'wildcard' : 'unknown'
          issuesLines.push(`| \`${dep}\` | \`${ver}\` | ${issueType} |`)
        }
      } else {
        for (const issue of p.issues) {
          issuesLines.push(`| - | - | ${issue} |`)
        }
      }
      issuesLines.push('')
    }
  }

  // Transitive issues section
  if (transitiveProblems.length > 0) {
    issuesLines.push('## Transitive Issues', '')
    issuesLines.push('These packages depend on broken packages:', '')

    for (const p of transitiveProblems) {
      issuesLines.push(`- \`${p.name}\` → ${p.dependsOnBroken?.map(d => `\`${d}\``).join(', ')}`)
    }
    issuesLines.push('')
  }

  // Exclusion list
  issuesLines.push('## Excluded from Meta-Package', '')
  issuesLines.push('```')
  for (const p of allProblems) {
    issuesLines.push(p.name)
  }
  issuesLines.push('```')

  const issuesPath = join(outDir, 'issues.md')
  await writeFile(issuesPath, issuesLines.join('\n') + '\n')

  // Summary
  console.log('\n=== Validation Summary ===')
  console.log(`Total packages: ${packages.length}`)
  console.log(`Direct issues: ${directProblems.length}`)
  console.log(`Transitive issues: ${transitiveProblems.length}`)
  console.log(`Total excluded: ${allBrokenNames.size}`)
  console.log(`Clean packages: ${Object.keys(cleanDeps).length}`)
  console.log(`\nResults: ${problemsPath}`)
  console.log(`Issues:  ${issuesPath}`)
  console.log(`Package: ${cleanPath}`)
}

main().catch(console.error)
