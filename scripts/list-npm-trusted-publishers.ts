#!/usr/bin/env npx tsx
/**
 * List npm Trusted Publisher Configuration URLs
 *
 * Generates a list of npm package URLs and the exact configuration
 * needed for each package's OIDC trusted publisher setup.
 *
 * Usage:
 *   npx tsx list-npm-trusted-publishers.ts [--markdown] [--open]
 *
 * Options:
 *   --markdown  Output as markdown table
 *   --open      Open first unconfigured package in browser
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const PROJECTS_ROOT = process.env.PROJECTS_ROOT || join(process.env.HOME!, 'projects')
const GITHUB_ORG = process.env.GITHUB_ORG || 'drivly' // Update to your org

interface PackageInfo {
  name: string
  path: string
  repo: string
  workflow: string
  npmUrl: string
  accessUrl: string
}

const PACKAGES: Omit<PackageInfo, 'npmUrl' | 'accessUrl'>[] = [
  { name: '@dotdo/types', path: 'types', repo: 'types', workflow: 'release.yml' },
  { name: '@dotdo/sqlite-collections', path: 'collections', repo: 'collections', workflow: 'release.yml' },
  { name: 'colo.do', path: 'colo', repo: 'colo.do', workflow: 'release.yml' },
  { name: '@dotdo/rpc', path: 'rpc.do/core', repo: 'rpc.do', workflow: 'release.yml' },
  { name: 'rpc.do', path: 'rpc.do', repo: 'rpc.do', workflow: 'release.yml' },
  { name: '@dotdo/oauth', path: 'oauth.do/core', repo: 'oauth.do', workflow: 'release.yml' },
  { name: 'oauth.do', path: 'oauth.do', repo: 'oauth.do', workflow: 'release.yml' },
  { name: '@dotdo/fsx', path: 'fsx/core', repo: 'fsx', workflow: 'release.yml' },
  { name: 'fsx.do', path: 'fsx', repo: 'fsx', workflow: 'release.yml' },
  { name: '@dotdo/gitx', path: 'gitx/packages/core', repo: 'gitx', workflow: 'release.yml' },
  { name: 'gitx.do', path: 'gitx/packages/do', repo: 'gitx', workflow: 'release.yml' },
  { name: '@dotdo/bashx', path: 'bashx/core', repo: 'bashx', workflow: 'release.yml' },
  { name: 'bashx.do', path: 'bashx', repo: 'bashx', workflow: 'release.yml' },
  { name: '@dotdo/do', path: 'do', repo: 'do', workflow: 'release.yml' },
  { name: '@dotdo/cli', path: 'cli.do', repo: 'cli.do', workflow: 'release.yml' },
]

function getNpmUrl(name: string): string {
  // Handle scoped packages
  if (name.startsWith('@')) {
    return `https://www.npmjs.com/package/${name}`
  }
  return `https://www.npmjs.com/package/${name}`
}

function getAccessUrl(name: string): string {
  // npm access URL for configuring trusted publishers
  const encodedName = encodeURIComponent(name)
  return `https://www.npmjs.com/package/${encodedName}/access`
}

function checkPackageExists(name: string): boolean {
  try {
    execSync(`npm view ${name} version`, { stdio: 'pipe', encoding: 'utf-8' })
    return true
  } catch {
    return false
  }
}

function getLocalVersion(path: string): string | null {
  const pkgPath = join(PROJECTS_ROOT, path, 'package.json')
  if (!existsSync(pkgPath)) return null
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    return pkg.version
  } catch {
    return null
  }
}

function main() {
  const args = process.argv.slice(2)
  const markdown = args.includes('--markdown')
  const openFirst = args.includes('--open')

  console.log('\n🔐 npm OIDC Trusted Publisher Configuration\n')
  console.log(`GitHub Organization: ${GITHUB_ORG}`)
  console.log(`Workflow file: release.yml\n`)

  const packages: (PackageInfo & { exists: boolean; localVersion: string | null })[] = PACKAGES.map((pkg) => ({
    ...pkg,
    npmUrl: getNpmUrl(pkg.name),
    accessUrl: getAccessUrl(pkg.name),
    exists: checkPackageExists(pkg.name),
    localVersion: getLocalVersion(pkg.path),
  }))

  if (markdown) {
    console.log('| Package | npm Status | Local Version | Access URL |')
    console.log('|---------|------------|---------------|------------|')
    for (const pkg of packages) {
      const status = pkg.exists ? '✅ Published' : '❌ Not published'
      const version = pkg.localVersion || 'N/A'
      console.log(`| ${pkg.name} | ${status} | ${version} | [Configure](${pkg.accessUrl}) |`)
    }
    console.log('')
  } else {
    const published = packages.filter((p) => p.exists)
    const unpublished = packages.filter((p) => !p.exists)

    if (unpublished.length > 0) {
      console.log('📦 Packages that need initial publish first:\n')
      console.log('   These must be published manually once before OIDC can be configured:\n')
      for (const pkg of unpublished) {
        console.log(`   ${pkg.name}`)
        console.log(`     Local version: ${pkg.localVersion || 'unknown'}`)
        console.log(`     Publish with: cd ${join(PROJECTS_ROOT, pkg.path)} && npm publish --provenance --access public`)
        console.log('')
      }
    }

    if (published.length > 0) {
      console.log('✅ Packages ready for OIDC configuration:\n')
      for (const pkg of published) {
        console.log(`   ${pkg.name}`)
        console.log(`     Access URL: ${pkg.accessUrl}`)
        console.log(`     GitHub Org: ${GITHUB_ORG}`)
        console.log(`     Repository: ${pkg.repo}`)
        console.log(`     Workflow:   release.yml`)
        console.log(`     Environment: (leave blank)`)
        console.log('')
      }
    }
  }

  // Summary with steps
  console.log('=' .repeat(60))
  console.log('\n📋 Manual Configuration Steps:\n')
  console.log('For each published package:')
  console.log('1. Go to the Access URL above')
  console.log('2. Click "Add trusted publisher"')
  console.log('3. Select "GitHub Actions"')
  console.log('4. Enter:')
  console.log(`   • Owner: ${GITHUB_ORG}`)
  console.log('   • Repository: <repo-name from above>')
  console.log('   • Workflow: release.yml')
  console.log('   • Environment: (leave blank)')
  console.log('5. Save\n')

  if (openFirst) {
    const firstPublished = packages.find((p) => p.exists)
    if (firstPublished) {
      console.log(`\n🌐 Opening ${firstPublished.name} access page...`)
      try {
        execSync(`open "${firstPublished.accessUrl}"`)
      } catch {
        console.log(`   Failed to open browser. Visit: ${firstPublished.accessUrl}`)
      }
    }
  }

  // Generate a quick reference for batch setup
  console.log('\n📝 Quick Reference (copy-paste ready):\n')
  const published = packages.filter((p) => p.exists)
  for (const pkg of published) {
    console.log(`${pkg.name}`)
    console.log(`  URL: ${pkg.accessUrl}`)
    console.log(`  Repo: ${GITHUB_ORG}/${pkg.repo}`)
    console.log('')
  }
}

main()
