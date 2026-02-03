import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { config } from './config.js'

interface ValidationResult {
  name: string
  version: string
  status: 'ok' | 'broken' | 'warning'
  error?: string
  errorType?: string
}

const TEMP_DIR = join(process.cwd(), '.validate-temp')

async function validatePackage(name: string, version: string): Promise<ValidationResult> {
  const result: ValidationResult = { name, version, status: 'ok' }

  try {
    // Create isolated temp directory for this package
    const pkgDir = join(TEMP_DIR, name.replace('/', '__'))
    await mkdir(pkgDir, { recursive: true })

    // Create minimal package.json
    const testPkg = {
      name: 'test-install',
      version: '1.0.0',
      dependencies: {
        [name]: version,
      },
    }

    await writeFile(join(pkgDir, 'package.json'), JSON.stringify(testPkg, null, 2))

    // Try npm install with timeout
    try {
      execSync('npm install --ignore-scripts --no-audit --no-fund 2>&1', {
        cwd: pkgDir,
        timeout: 30000,
        encoding: 'utf-8',
        stdio: 'pipe',
      })
    } catch (e: unknown) {
      const error = e as { stdout?: string; stderr?: string; message?: string }
      const output = (error.stdout || '') + (error.stderr || '') + (error.message || '')

      // Categorize the error
      if (output.includes('workspace:')) {
        result.status = 'broken'
        result.errorType = 'workspace-dep'
        result.error = 'Has workspace: protocol dependency'
      } else if (output.includes('ERESOLVE')) {
        result.status = 'warning'
        result.errorType = 'peer-conflict'
        result.error = 'Peer dependency conflict'
      } else if (output.includes('404')) {
        result.status = 'broken'
        result.errorType = 'not-found'
        result.error = 'Package or dependency not found'
      } else if (output.includes('ETARGET')) {
        result.status = 'broken'
        result.errorType = 'version-not-found'
        result.error = 'Required version not found'
      } else {
        result.status = 'warning'
        result.errorType = 'unknown'
        result.error = output.slice(0, 200)
      }
    }

    // Cleanup
    await rm(pkgDir, { recursive: true, force: true })
  } catch (e) {
    result.status = 'warning'
    result.errorType = 'validation-error'
    result.error = String(e)
  }

  return result
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

  console.log(`Validating ${packages.length} packages...\n`)

  // Create temp directory
  await mkdir(TEMP_DIR, { recursive: true })

  const results: ValidationResult[] = []
  const broken: string[] = []
  const warnings: string[] = []

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i]
    const result = await validatePackage(pkg.name, pkg.version)
    results.push(result)

    const status = result.status === 'ok' ? '✓' : result.status === 'broken' ? '✗' : '⚠'
    const suffix = result.error ? ` - ${result.errorType}` : ''

    if ((i + 1) % 10 === 0 || result.status !== 'ok') {
      console.log(`[${i + 1}/${packages.length}] ${status} ${pkg.name}${suffix}`)
    }

    if (result.status === 'broken') {
      broken.push(pkg.name)
    } else if (result.status === 'warning') {
      warnings.push(pkg.name)
    }
  }

  // Cleanup temp directory
  await rm(TEMP_DIR, { recursive: true, force: true })

  // Write results
  const outDir = join(process.cwd(), 'meta')
  await mkdir(outDir, { recursive: true })

  // Full results JSON
  const resultsPath = join(outDir, 'validation-results.json')
  await writeFile(resultsPath, JSON.stringify(results, null, 2) + '\n')

  // Broken packages list
  const brokenPath = join(outDir, 'broken-packages.json')
  await writeFile(brokenPath, JSON.stringify(broken, null, 2) + '\n')

  // Generate clean package.json (excluding broken)
  const cleanDeps: Record<string, string> = {}
  for (const pkg of packages) {
    if (!broken.includes(pkg.name)) {
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

  // Summary
  console.log('\n=== Validation Summary ===')
  console.log(`Total packages: ${packages.length}`)
  console.log(`OK: ${packages.length - broken.length - warnings.length}`)
  console.log(`Broken: ${broken.length}`)
  console.log(`Warnings: ${warnings.length}`)

  if (broken.length > 0) {
    console.log('\nBroken packages:')
    for (const name of broken) {
      const r = results.find(x => x.name === name)
      console.log(`  ${name}: ${r?.errorType}`)
    }
  }

  console.log(`\nClean package.json written to: ${cleanPath}`)
  console.log(`(${Object.keys(cleanDeps).length} dependencies)`)
}

main().catch(console.error)
