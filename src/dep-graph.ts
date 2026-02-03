import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { config } from './config.js'

interface DepGraphNode {
  name: string
  version: string
  scope: string | null
  dependencies: string[]
  dependents: string[]
  downloads: number
}

interface DepGraph {
  nodes: Record<string, DepGraphNode>
  edges: Array<{ from: string; to: string }>
}

const REGISTRY_URL = 'https://registry.npmjs.org'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchPackageDeps(name: string): Promise<string[]> {
  try {
    const encodedName = name.startsWith('@')
      ? `@${encodeURIComponent(name.slice(1))}`
      : encodeURIComponent(name)

    const response = await fetch(`${REGISTRY_URL}/${encodedName}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) return []

    const data = await response.json() as {
      'dist-tags': { latest: string }
      versions: Record<string, { dependencies?: Record<string, string> }>
    }

    const latest = data['dist-tags']?.latest
    if (!latest) return []

    const deps = data.versions[latest]?.dependencies ?? {}
    return Object.keys(deps)
  } catch {
    return []
  }
}

function getScope(name: string): string | null {
  if (name.startsWith('@')) {
    return name.split('/')[0]
  }
  return null
}

function writeDot(
  filename: string,
  title: string,
  nodes: string[],
  edges: Array<{ from: string; to: string }>,
  nodeColors?: Map<string, string>
): string {
  const lines = [
    'digraph dependencies {',
    `  label="${title}";`,
    '  labelloc="t";',
    '  rankdir=LR;',
    '  node [shape=box, style=filled, fillcolor=white];',
    '  edge [color="#666666"];',
  ]

  // Add nodes with colors
  for (const node of nodes) {
    const color = nodeColors?.get(node) ?? 'white'
    const label = node.replace('@', '').replace('/', '/\\n')
    lines.push(`  "${node}" [label="${label}", fillcolor="${color}"];`)
  }

  // Add edges
  for (const edge of edges) {
    if (nodes.includes(edge.from) && nodes.includes(edge.to)) {
      lines.push(`  "${edge.from}" -> "${edge.to}";`)
    }
  }

  lines.push('}')
  return lines.join('\n') + '\n'
}

async function generateDepGraph() {
  console.log('Loading catalog...')
  const tsvPath = config.output.tsvPath
  const content = await readFile(tsvPath, 'utf-8')
  const lines = content.trim().split('\n')

  // Build set of our packages
  const ourPackages = new Set<string>()
  const packageInfo = new Map<string, { version: string; downloads: number }>()

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    const name = cols[0]
    const version = cols[1]
    const downloads = parseInt(cols[3]) || 0

    ourPackages.add(name)
    packageInfo.set(name, { version, downloads })
  }

  console.log(`Found ${ourPackages.size} packages in catalog`)

  // Fetch dependencies for each package
  const graph: DepGraph = { nodes: {}, edges: [] }

  // Initialize nodes
  for (const name of ourPackages) {
    const info = packageInfo.get(name)!
    graph.nodes[name] = {
      name,
      version: info.version,
      scope: getScope(name),
      dependencies: [],
      dependents: [],
      downloads: info.downloads,
    }
  }

  console.log('Fetching dependencies...')
  let processed = 0

  for (const name of ourPackages) {
    await delay(100)

    const allDeps = await fetchPackageDeps(name)
    const internalDeps = allDeps.filter(dep => ourPackages.has(dep))

    graph.nodes[name].dependencies = internalDeps

    for (const dep of internalDeps) {
      graph.nodes[dep].dependents.push(name)
      graph.edges.push({ from: name, to: dep })
    }

    processed++
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${ourPackages.size}...`)
    }
  }

  // Output directory
  const outDir = join(process.cwd(), 'meta', 'graphs')
  await mkdir(outDir, { recursive: true })

  // === 1. Full JSON graph ===
  const jsonPath = join(outDir, 'full.json')
  await writeFile(jsonPath, JSON.stringify(graph, null, 2) + '\n', 'utf-8')
  console.log(`\nWrote: ${jsonPath}`)

  // === 2. Graphs by scope ===
  const scopes = new Map<string, string[]>()
  const unscoped: string[] = []

  for (const name of ourPackages) {
    const scope = getScope(name)
    if (scope) {
      if (!scopes.has(scope)) scopes.set(scope, [])
      scopes.get(scope)!.push(name)
    } else {
      unscoped.push(name)
    }
  }

  // Scope colors
  const scopeColors = new Map<string, string>([
    ['@dotdo', '#e3f2fd'],
    ['@saaskit', '#f3e5f5'],
    ['@mdxui', '#e8f5e9'],
    ['@db4', '#fff3e0'],
    ['@icetype', '#fce4ec'],
    ['@mdxld', '#e0f7fa'],
    ['@mdxe', '#f1f8e9'],
    ['@mdxdb', '#ede7f6'],
    ['@org.ai', '#fff8e1'],
    ['@nathanclevenger', '#e8eaf6'],
    ['@graphdl', '#efebe9'],
  ])

  console.log('\nGenerating scope graphs...')

  for (const [scope, packages] of scopes) {
    if (packages.length < 2) continue

    const scopeEdges = graph.edges.filter(
      e => packages.includes(e.from) && packages.includes(e.to)
    )

    if (scopeEdges.length === 0) continue

    const safeName = scope.replace('@', '').replace('.', '-')
    const dotContent = writeDot(
      `${safeName}.dot`,
      `${scope} internal dependencies`,
      packages,
      scopeEdges
    )

    const dotPath = join(outDir, `scope-${safeName}.dot`)
    await writeFile(dotPath, dotContent, 'utf-8')
    console.log(`  ${scope}: ${packages.length} packages, ${scopeEdges.length} edges`)
  }

  // === 3. Hub-centered graphs (top depended-on packages) ===
  console.log('\nGenerating hub graphs...')

  const hubs = Object.values(graph.nodes)
    .filter(n => n.dependents.length >= 5)
    .sort((a, b) => b.dependents.length - a.dependents.length)
    .slice(0, 10)

  for (const hub of hubs) {
    // Include hub + all packages that depend on it + their deps on hub
    const related = new Set([hub.name, ...hub.dependents])

    // Also include what the hub depends on
    for (const dep of hub.dependencies) {
      related.add(dep)
    }

    const hubEdges = graph.edges.filter(
      e => related.has(e.from) && related.has(e.to)
    )

    const nodeColors = new Map<string, string>()
    nodeColors.set(hub.name, '#ffeb3b') // Yellow for hub

    const safeName = hub.name.replace('@', '').replace('/', '-').replace('.', '-')
    const dotContent = writeDot(
      `hub-${safeName}.dot`,
      `${hub.name} (${hub.dependents.length} dependents)`,
      Array.from(related),
      hubEdges,
      nodeColors
    )

    const dotPath = join(outDir, `hub-${safeName}.dot`)
    await writeFile(dotPath, dotContent, 'utf-8')
    console.log(`  ${hub.name}: ${related.size} nodes, ${hubEdges.length} edges`)
  }

  // === 4. High-level scope-to-scope graph ===
  console.log('\nGenerating high-level scope graph...')

  const scopeEdges = new Map<string, Set<string>>()

  for (const edge of graph.edges) {
    const fromScope = getScope(edge.from) ?? 'unscoped'
    const toScope = getScope(edge.to) ?? 'unscoped'

    if (fromScope !== toScope) {
      const key = fromScope
      if (!scopeEdges.has(key)) scopeEdges.set(key, new Set())
      scopeEdges.get(key)!.add(toScope)
    }
  }

  const hlLines = [
    'digraph scope_dependencies {',
    '  label="Scope-level dependencies";',
    '  labelloc="t";',
    '  rankdir=LR;',
    '  node [shape=box, style=filled];',
  ]

  const allScopes = new Set<string>()
  for (const [from, tos] of scopeEdges) {
    allScopes.add(from)
    for (const to of tos) allScopes.add(to)
  }

  for (const scope of allScopes) {
    const color = scopeColors.get(scope) ?? '#f5f5f5'
    const count = scope === 'unscoped' ? unscoped.length : (scopes.get(scope)?.length ?? 0)
    hlLines.push(`  "${scope}" [label="${scope}\\n(${count})", fillcolor="${color}"];`)
  }

  for (const [from, tos] of scopeEdges) {
    for (const to of tos) {
      hlLines.push(`  "${from}" -> "${to}";`)
    }
  }

  hlLines.push('}')

  const hlPath = join(outDir, 'overview.dot')
  await writeFile(hlPath, hlLines.join('\n') + '\n', 'utf-8')
  console.log(`  Wrote overview with ${allScopes.size} scopes`)

  // === 5. Unscoped packages graph ===
  if (unscoped.length > 1) {
    console.log('\nGenerating unscoped packages graph...')

    const unscopedEdges = graph.edges.filter(
      e => unscoped.includes(e.from) && unscoped.includes(e.to)
    )

    // Only include packages with connections
    const connected = new Set<string>()
    for (const e of unscopedEdges) {
      connected.add(e.from)
      connected.add(e.to)
    }

    if (connected.size > 0) {
      const dotContent = writeDot(
        'unscoped.dot',
        `Unscoped packages (${connected.size} connected)`,
        Array.from(connected),
        unscopedEdges
      )

      const dotPath = join(outDir, 'unscoped.dot')
      await writeFile(dotPath, dotContent, 'utf-8')
      console.log(`  ${connected.size} packages, ${unscopedEdges.length} edges`)
    }
  }

  // Summary
  console.log('\n=== Summary ===')
  console.log(`Total packages: ${ourPackages.size}`)
  console.log(`Packages with internal deps: ${Object.values(graph.nodes).filter(n => n.dependencies.length > 0).length}`)
  console.log(`Packages depended on: ${Object.values(graph.nodes).filter(n => n.dependents.length > 0).length}`)
  console.log(`Total internal edges: ${graph.edges.length}`)
  console.log(`\nGraphs written to: ${outDir}`)
}

generateDepGraph().catch(console.error)
