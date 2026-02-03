#!/usr/bin/env npx tsx
/**
 * DO Ecosystem Publishing Script
 *
 * Publishes all @dotdo packages in dependency order with proper
 * build and test verification before each publish.
 *
 * Usage:
 *   npx tsx publish-ecosystem.ts [--dry-run] [--skip-tests] [--package <name>]
 *
 * Options:
 *   --dry-run      Show what would be published without actually publishing
 *   --skip-tests   Skip running tests (not recommended)
 *   --package      Only publish a specific package
 *   --from         Start publishing from a specific package (includes deps)
 *
 * @example
 *   npx tsx publish-ecosystem.ts --dry-run
 *   npx tsx publish-ecosystem.ts --package @dotdo/types
 *   npx tsx publish-ecosystem.ts --from @dotdo/rpc
 */

import { execSync, ExecSyncOptions } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

// =============================================================================
// Configuration
// =============================================================================

const PROJECTS_ROOT = process.env.PROJECTS_ROOT || join(process.env.HOME!, 'projects')

/**
 * Publishing order - packages are published in this sequence.
 * Each package lists its path relative to PROJECTS_ROOT.
 */
const PUBLISH_ORDER: PackageConfig[] = [
  // Layer 1: No dependencies
  {
    name: '@dotdo/types',
    path: 'types',
    description: 'Canonical type definitions (Fn, RpcPromise, DOContext)',
  },

  // Layer 2: Depends on types
  {
    name: '@dotdo/sqlite-collections',
    path: 'collections',
    description: 'MongoDB-style collections on SQLite',
  },
  {
    name: 'colo.do',
    path: 'colo',
    description: 'Cloudflare colo awareness and routing',
  },

  // Layer 3: Depends on types, collections, colo
  {
    name: '@dotdo/rpc',
    path: 'rpc.do/core',
    description: 'RPC client with CapnWeb pipelining',
  },
  {
    name: 'rpc.do',
    path: 'rpc.do',
    description: 'RPC service worker',
  },

  // Layer 4: Depends on types
  {
    name: '@dotdo/oauth',
    path: 'oauth.do/core',
    pathCheck: 'oauth.do', // Some packages have core/, some don't
    description: 'OAuth 2.1 client library',
  },
  {
    name: 'oauth.do',
    path: 'oauth.do',
    description: 'OAuth service worker',
  },

  // Layer 5: Tool packages
  {
    name: '@dotdo/fsx',
    path: 'fsx/core',
    description: 'Filesystem operations with AsyncFn',
  },
  {
    name: 'fsx.do',
    path: 'fsx',
    description: 'Filesystem service worker',
  },
  {
    name: '@dotdo/gitx',
    path: 'gitx/packages/core',
    description: 'Git operations with AsyncFn',
  },
  {
    name: 'gitx.do',
    path: 'gitx/packages/do',
    description: 'Git service worker',
  },
  {
    name: '@dotdo/bashx',
    path: 'bashx/core',
    description: 'Bash execution with AsyncFn',
  },
  {
    name: 'bashx.do',
    path: 'bashx',
    description: 'Bash service worker',
  },

  // Layer 6: Main DO package
  {
    name: '@dotdo/do',
    path: 'do',
    description: 'Digital Object runtime',
  },

  // Layer 7: CLI
  {
    name: '@dotdo/cli',
    path: 'cli.do',
    description: 'CLI framework',
  },
]

interface PackageConfig {
  name: string
  path: string
  pathCheck?: string
  description: string
}

interface Options {
  dryRun: boolean
  skipTests: boolean
  packageFilter?: string
  fromPackage?: string
  verbose: boolean
}

// =============================================================================
// Helpers
// =============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(msg: string, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`)
}

function logStep(step: string, pkg: string) {
  log(`\n${'='.repeat(60)}`, colors.cyan)
  log(`${step}: ${pkg}`, colors.bright)
  log('='.repeat(60), colors.cyan)
}

function logSuccess(msg: string) {
  log(`✓ ${msg}`, colors.green)
}

function logWarning(msg: string) {
  log(`⚠ ${msg}`, colors.yellow)
}

function logError(msg: string) {
  log(`✗ ${msg}`, colors.red)
}

function exec(cmd: string, cwd: string, options: Options): boolean {
  const execOptions: ExecSyncOptions = {
    cwd,
    stdio: options.verbose ? 'inherit' : 'pipe',
    encoding: 'utf-8',
  }

  if (options.dryRun) {
    log(`  [DRY RUN] Would execute: ${cmd}`, colors.yellow)
    return true
  }

  try {
    execSync(cmd, execOptions)
    return true
  } catch (error) {
    if (!options.verbose) {
      // Show error output if we weren't already showing it
      const err = error as { stdout?: string; stderr?: string }
      if (err.stderr) console.error(err.stderr)
      if (err.stdout) console.log(err.stdout)
    }
    return false
  }
}

function getPackageJson(pkgPath: string): { name: string; version: string; scripts?: Record<string, string> } | null {
  const packageJsonPath = join(pkgPath, 'package.json')
  if (!existsSync(packageJsonPath)) {
    return null
  }
  return JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
}

function hasScript(pkgPath: string, scriptName: string): boolean {
  const pkg = getPackageJson(pkgPath)
  return pkg?.scripts?.[scriptName] !== undefined
}

// =============================================================================
// Publishing Steps
// =============================================================================

function verifyPackage(config: PackageConfig, options: Options): boolean {
  const pkgPath = join(PROJECTS_ROOT, config.path)
  const checkPath = config.pathCheck ? join(PROJECTS_ROOT, config.pathCheck) : pkgPath

  // Check if directory exists
  if (!existsSync(checkPath)) {
    logWarning(`Package directory not found: ${checkPath}`)
    return false
  }

  // Check if package.json exists
  const pkg = getPackageJson(pkgPath)
  if (!pkg) {
    logWarning(`No package.json found in ${pkgPath}`)
    return false
  }

  // Verify package name matches
  if (pkg.name !== config.name) {
    logWarning(`Package name mismatch: expected ${config.name}, got ${pkg.name}`)
    return false
  }

  logSuccess(`Found ${config.name}@${pkg.version}`)
  return true
}

function installDeps(config: PackageConfig, options: Options): boolean {
  const pkgPath = join(PROJECTS_ROOT, config.path)
  log(`  Installing dependencies...`, colors.blue)
  return exec('pnpm install', pkgPath, options)
}

function buildPackage(config: PackageConfig, options: Options): boolean {
  const pkgPath = join(PROJECTS_ROOT, config.path)

  if (!hasScript(pkgPath, 'build')) {
    logWarning(`No build script found, skipping build`)
    return true
  }

  log(`  Building...`, colors.blue)
  return exec('pnpm build', pkgPath, options)
}

function typeCheck(config: PackageConfig, options: Options): boolean {
  const pkgPath = join(PROJECTS_ROOT, config.path)

  // Try different type check script names
  const typeCheckScripts = ['typecheck', 'check', 'type-check']
  const script = typeCheckScripts.find((s) => hasScript(pkgPath, s))

  if (!script) {
    logWarning(`No typecheck script found, skipping type check`)
    return true
  }

  log(`  Type checking...`, colors.blue)
  return exec(`pnpm ${script}`, pkgPath, options)
}

function runTests(config: PackageConfig, options: Options): boolean {
  if (options.skipTests) {
    logWarning(`Skipping tests (--skip-tests flag)`)
    return true
  }

  const pkgPath = join(PROJECTS_ROOT, config.path)

  if (!hasScript(pkgPath, 'test')) {
    logWarning(`No test script found, skipping tests`)
    return true
  }

  log(`  Running tests...`, colors.blue)
  return exec('pnpm test', pkgPath, options)
}

function publishPackage(config: PackageConfig, options: Options): boolean {
  const pkgPath = join(PROJECTS_ROOT, config.path)

  log(`  Publishing to npm...`, colors.blue)

  if (options.dryRun) {
    log(`  [DRY RUN] Would publish ${config.name}`, colors.yellow)
    return true
  }

  // Use --no-git-checks for local publishing
  // Use --access public for scoped packages
  const publishCmd = config.name.startsWith('@') ? 'pnpm publish --access public --no-git-checks' : 'pnpm publish --no-git-checks'

  return exec(publishCmd, pkgPath, options)
}

// =============================================================================
// Main
// =============================================================================

function parseArgs(): Options {
  const args = process.argv.slice(2)
  const options: Options = {
    dryRun: false,
    skipTests: false,
    verbose: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--dry-run':
        options.dryRun = true
        break
      case '--skip-tests':
        options.skipTests = true
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--package':
        options.packageFilter = args[++i]
        break
      case '--from':
        options.fromPackage = args[++i]
        break
      case '--help':
      case '-h':
        console.log(`
DO Ecosystem Publishing Script

Usage: npx tsx publish-ecosystem.ts [options]

Options:
  --dry-run       Show what would be published without actually publishing
  --skip-tests    Skip running tests (not recommended)
  --package <n>   Only publish a specific package
  --from <n>      Start publishing from a specific package
  --verbose, -v   Show full command output
  --help, -h      Show this help message

Packages (in publish order):
${PUBLISH_ORDER.map((p, i) => `  ${i + 1}. ${p.name.padEnd(25)} - ${p.description}`).join('\n')}
`)
        process.exit(0)
    }
  }

  return options
}

async function main() {
  const options = parseArgs()

  log('\n🚀 DO Ecosystem Publisher\n', colors.bright)

  if (options.dryRun) {
    logWarning('DRY RUN MODE - No packages will actually be published\n')
  }

  // Determine which packages to publish
  let packagesToPublish = PUBLISH_ORDER

  if (options.packageFilter) {
    packagesToPublish = PUBLISH_ORDER.filter((p) => p.name === options.packageFilter)
    if (packagesToPublish.length === 0) {
      logError(`Package not found: ${options.packageFilter}`)
      process.exit(1)
    }
  }

  if (options.fromPackage) {
    const startIndex = PUBLISH_ORDER.findIndex((p) => p.name === options.fromPackage)
    if (startIndex === -1) {
      logError(`Package not found: ${options.fromPackage}`)
      process.exit(1)
    }
    packagesToPublish = PUBLISH_ORDER.slice(startIndex)
  }

  log(`Publishing ${packagesToPublish.length} package(s):\n`)
  packagesToPublish.forEach((p, i) => {
    log(`  ${i + 1}. ${p.name}`, colors.cyan)
  })

  const results: { name: string; success: boolean; error?: string }[] = []

  for (const pkg of packagesToPublish) {
    logStep('Publishing', pkg.name)

    // Step 1: Verify package exists
    if (!verifyPackage(pkg, options)) {
      results.push({ name: pkg.name, success: false, error: 'Package verification failed' })
      continue
    }

    // Step 2: Install dependencies
    if (!installDeps(pkg, options)) {
      results.push({ name: pkg.name, success: false, error: 'Dependency installation failed' })
      continue
    }

    // Step 3: Build
    if (!buildPackage(pkg, options)) {
      results.push({ name: pkg.name, success: false, error: 'Build failed' })
      continue
    }

    // Step 4: Type check
    if (!typeCheck(pkg, options)) {
      results.push({ name: pkg.name, success: false, error: 'Type check failed' })
      continue
    }

    // Step 5: Run tests
    if (!runTests(pkg, options)) {
      results.push({ name: pkg.name, success: false, error: 'Tests failed' })
      continue
    }

    // Step 6: Publish
    if (!publishPackage(pkg, options)) {
      results.push({ name: pkg.name, success: false, error: 'Publish failed' })
      continue
    }

    results.push({ name: pkg.name, success: true })
    logSuccess(`Published ${pkg.name}`)
  }

  // Summary
  log('\n' + '='.repeat(60), colors.cyan)
  log('SUMMARY', colors.bright)
  log('='.repeat(60), colors.cyan)

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  if (successful.length > 0) {
    log(`\n✓ Successfully published (${successful.length}):`, colors.green)
    successful.forEach((r) => log(`  - ${r.name}`, colors.green))
  }

  if (failed.length > 0) {
    log(`\n✗ Failed (${failed.length}):`, colors.red)
    failed.forEach((r) => log(`  - ${r.name}: ${r.error}`, colors.red))
  }

  if (options.dryRun) {
    log('\n[DRY RUN] No packages were actually published', colors.yellow)
  }

  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch((err) => {
  logError(`Unexpected error: ${err.message}`)
  process.exit(1)
})
