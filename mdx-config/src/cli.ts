#!/usr/bin/env node
/**
 * MDX Config CLI
 * Command-line tool for MDX configuration management
 */

import { Command } from 'commander'
import { watch } from 'chokidar'
import { parseMDXFile, parseMDXDirectory } from './parser'
import { validate, validateBatch } from './validators'
import { generatePayloadCollection, generateServiceWorker, generateWranglerConfig, generateServiceTypes, generateCollectionTypes } from './generators'
import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'

const program = new Command()

program.name('mdx-config').description('MDX-driven platform configuration tool').version('0.1.0')

/**
 * Build command - generate all code from MDX files
 */
program
  .command('build')
  .description('Generate code from MDX configurations')
  .option('-i, --input <path>', 'Input directory containing MDX files', '.')
  .option('-o, --output <path>', 'Output directory for generated code', './generated')
  .option('--payload', 'Generate PayloadCMS collections', false)
  .option('--workers', 'Generate Cloudflare Workers', false)
  .option('--types', 'Generate TypeScript types', false)
  .option('--all', 'Generate everything', false)
  .action(async (options) => {
    console.log('🔨 Building MDX configurations...')

    const parsed = await parseMDXDirectory(options.input)
    console.log(`📄 Found ${parsed.size} MDX files`)

    const validationResults = validateBatch(parsed)
    console.log(`✅ Valid: ${validationResults.valid}`)
    console.log(`❌ Invalid: ${validationResults.invalid}`)

    if (validationResults.invalid > 0) {
      console.error('\n❌ Validation errors found:')
      for (const [path, result] of validationResults.results) {
        if (!result.valid && result.errors) {
          console.error(`\n${path}:`)
          result.errors.forEach((err) => {
            console.error(`  - ${err.path}: ${err.message}`)
          })
        }
      }
      process.exit(1)
    }

    // Generate based on options
    const generateAll = options.all
    const outputDir = options.output

    for (const [path, parsed] of validationResults.results) {
      if (!parsed.valid || !parsed.data) continue

      const type = parsed.type

      try {
        if ((generateAll || options.payload) && type === 'collection') {
          const code = generatePayloadCollection(parsed.data)
          const outputPath = join(outputDir, 'collections', `${parsed.data.collection}.ts`)
          await mkdir(dirname(outputPath), { recursive: true })
          await writeFile(outputPath, code)
          console.log(`  ✓ Generated Payload collection: ${outputPath}`)
        }

        if ((generateAll || options.workers) && type === 'service') {
          const code = generateServiceWorker(parsed.data)
          const wranglerCode = generateWranglerConfig({
            worker: parsed.data.service,
            bindings: [],
          })
          const workerDir = join(outputDir, 'workers', parsed.data.service)
          await mkdir(join(workerDir, 'src'), { recursive: true })
          await writeFile(join(workerDir, 'src', 'index.ts'), code)
          await writeFile(join(workerDir, 'wrangler.jsonc'), wranglerCode)
          console.log(`  ✓ Generated worker: ${workerDir}`)
        }

        if ((generateAll || options.types) && type === 'collection') {
          const code = generateCollectionTypes(parsed.data)
          const outputPath = join(outputDir, 'types', `${parsed.data.collection}.ts`)
          await mkdir(dirname(outputPath), { recursive: true })
          await writeFile(outputPath, code)
          console.log(`  ✓ Generated types: ${outputPath}`)
        }

        if ((generateAll || options.types) && type === 'service') {
          const code = generateServiceTypes(parsed.data)
          const outputPath = join(outputDir, 'types', `${parsed.data.service}.ts`)
          await mkdir(dirname(outputPath), { recursive: true })
          await writeFile(outputPath, code)
          console.log(`  ✓ Generated types: ${outputPath}`)
        }
      } catch (error) {
        console.error(`  ❌ Error generating ${type} from ${path}:`, error)
      }
    }

    console.log('\n✅ Build complete!')
  })

/**
 * Validate command - check MDX files without generating code
 */
program
  .command('validate')
  .description('Validate MDX configurations')
  .option('-i, --input <path>', 'Input directory or file', '.')
  .action(async (options) => {
    console.log('🔍 Validating MDX configurations...\n')

    const stat = await import('fs/promises').then((fs) => fs.stat(options.input))

    if (stat.isDirectory()) {
      const parsed = await parseMDXDirectory(options.input)
      const results = validateBatch(parsed)

      console.log(`📊 Results:`)
      console.log(`  Total: ${results.total}`)
      console.log(`  Valid: ${results.valid}`)
      console.log(`  Invalid: ${results.invalid}\n`)

      if (results.invalid > 0) {
        console.error('❌ Validation errors:\n')
        for (const [path, result] of results.results) {
          if (!result.valid && result.errors) {
            console.error(`${path}:`)
            result.errors.forEach((err) => {
              console.error(`  - ${err.path}: ${err.message}`)
            })
            console.error('')
          }
        }
        process.exit(1)
      }

      console.log('✅ All files valid!')
    } else {
      const parsed = await parseMDXFile(options.input)
      const result = validate(parsed)

      if (result.valid) {
        console.log(`✅ ${options.input} is valid (${result.type})`)
      } else {
        console.error(`❌ ${options.input} has errors:\n`)
        result.errors?.forEach((err) => {
          console.error(`  - ${err.path}: ${err.message}`)
        })
        process.exit(1)
      }
    }
  })

/**
 * Watch command - watch MDX files and auto-build on changes
 */
program
  .command('watch')
  .description('Watch MDX files and auto-build on changes')
  .option('-i, --input <path>', 'Input directory', '.')
  .option('-o, --output <path>', 'Output directory', './generated')
  .option('--all', 'Generate everything', true)
  .action(async (options) => {
    console.log('👀 Watching MDX files for changes...\n')

    const watcher = watch(`${options.input}/**/*.{md,mdx}`, {
      persistent: true,
      ignoreInitial: false,
    })

    const rebuild = async (path: string) => {
      console.log(`\n📝 Change detected: ${path}`)
      try {
        const parsed = await parseMDXFile(path)
        const result = validate(parsed)

        if (!result.valid) {
          console.error(`❌ Validation failed:`)
          result.errors?.forEach((err) => {
            console.error(`  - ${err.path}: ${err.message}`)
          })
          return
        }

        console.log(`✅ Valid ${result.type}`)
        // TODO: Trigger specific generator based on type
      } catch (error) {
        console.error(`❌ Error:`, error)
      }
    }

    watcher.on('add', rebuild).on('change', rebuild)

    console.log(`Watching: ${options.input}`)
    console.log('Press Ctrl+C to stop\n')
  })

/**
 * Deploy command - deploy generated workers
 */
program
  .command('deploy')
  .description('Deploy generated workers to Cloudflare')
  .option('-w, --worker <name>', 'Worker name to deploy')
  .option('--all', 'Deploy all workers', false)
  .action(async (options) => {
    console.log('🚀 Deploying workers...')

    if (options.all) {
      console.log('TODO: Deploy all workers')
    } else if (options.worker) {
      console.log(`TODO: Deploy worker: ${options.worker}`)
    } else {
      console.error('❌ Specify --worker <name> or --all')
      process.exit(1)
    }
  })

program.parse()
