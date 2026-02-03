import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { config } from './config.js'

interface PackageJson {
  name: string
  version: string
  description: string
  dependencies: Record<string, string>
  keywords: string[]
  license: string
  repository?: { type: string; url: string }
  homepage?: string
}

interface ProblemPackage {
  name: string
  version: string
  issues: string[]
}

async function loadExcludedPackages(outDir: string): Promise<Set<string>> {
  const excluded = new Set<string>()

  try {
    const problemsPath = join(outDir, 'problem-packages.json')
    const content = await readFile(problemsPath, 'utf-8')
    const problems: ProblemPackage[] = JSON.parse(content)

    for (const p of problems) {
      excluded.add(p.name)
    }

    console.log(`Loaded ${excluded.size} excluded packages from problem-packages.json`)
  } catch {
    console.log('No problem-packages.json found, run "pnpm validate:quick" first to detect issues')
  }

  return excluded
}

async function generateMetaPackage() {
  const outDir = join(process.cwd(), 'meta')
  await mkdir(outDir, { recursive: true })

  // Load excluded packages
  const excluded = await loadExcludedPackages(outDir)

  const tsvPath = config.output.tsvPath
  const content = await readFile(tsvPath, 'utf-8')
  const lines = content.trim().split('\n')

  const dependencies: Record<string, string> = {}
  let total = 0
  let skipped = 0

  // Skip header, parse packages
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t')
    const name = cols[0]
    const version = cols[1]

    total++

    // Skip excluded packages
    if (excluded.has(name)) {
      skipped++
      continue
    }

    dependencies[name] = `^${version}`
  }

  const packageJson: PackageJson = {
    name: '@nathanclevenger/packages',
    version: '0.0.1',
    description: 'Meta-package containing all packages by Nathan Clevenger',
    dependencies,
    keywords: [
      'meta-package',
      'monorepo',
      'dotdo',
      'saaskit',
      'mdxui',
      'ai',
    ],
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'https://github.com/nathanclevenger/packages',
    },
    homepage: 'https://github.com/nathanclevenger/packages',
  }

  const outPath = join(outDir, 'package.json')
  await writeFile(outPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8')

  console.log(`\nGenerated meta-package:`)
  console.log(`  Total in catalog: ${total}`)
  console.log(`  Excluded (broken): ${skipped}`)
  console.log(`  Dependencies: ${Object.keys(dependencies).length}`)
  console.log(`  Output: ${outPath}`)
}

generateMetaPackage().catch(console.error)
