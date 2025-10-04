/**
 * MDX Compiler
 *
 * Compiles MDX source to executable JavaScript using @mdx-js/mdx and esbuild
 */

import { compile } from '@mdx-js/mdx'
import { transform } from 'esbuild'
import type { MDXCompileOptions, CompiledMDX } from './types'

/**
 * Cache for compiled MDX modules
 */
const compilationCache = new Map<string, CompiledMDX>()

/**
 * Compile MDX source to JavaScript
 *
 * @param source - MDX source code
 * @param options - Compilation options
 * @returns Compiled JavaScript code
 */
export async function compileMDX(source: string, options: MDXCompileOptions = {}): Promise<string> {
  const {
    jsxRuntime = 'automatic',
    development = false,
    jsxImportSource = 'react',
    remarkPlugins = [],
    rehypePlugins = [],
    ...mdxOptions
  } = options

  // Compile MDX to JSX
  const compiled = await compile(source, {
    ...mdxOptions,
    development,
    jsxRuntime,
    jsxImportSource,
    remarkPlugins,
    rehypePlugins,
    outputFormat: 'function-body',
    format: 'mdx',
  })

  return String(compiled)
}

/**
 * Compile and transform MDX to executable JavaScript
 *
 * @param source - MDX source code
 * @param options - Compilation options
 * @returns Transformed JavaScript code ready for execution
 */
export async function compileMDXToJS(source: string, options: MDXCompileOptions = {}): Promise<string> {
  // First compile MDX to JSX
  const jsx = await compileMDX(source, options)

  // Then transform JSX to JavaScript using esbuild
  const result = await transform(jsx, {
    loader: 'jsx',
    jsx: options.jsxRuntime === 'automatic' ? 'automatic' : 'transform',
    jsxImportSource: options.jsxImportSource || 'react',
    format: 'esm',
    target: 'es2022',
    minify: !options.development,
  })

  return result.code
}

/**
 * Compile and evaluate MDX to a React component
 *
 * @param source - MDX source code
 * @param options - Compilation options
 * @returns Compiled MDX module with default export
 */
export async function compileMDXToComponent(source: string, options: MDXCompileOptions = {}): Promise<CompiledMDX> {
  // Check cache if not in development
  if (!options.development) {
    const cacheKey = getCacheKey(source, options)
    const cached = compilationCache.get(cacheKey)
    if (cached) {
      return cached
    }
  }

  // Use @mdx-js/mdx's evaluate function for runtime compilation
  const { evaluate } = await import('@mdx-js/mdx')
  const runtime = options.development ? await import('react/jsx-dev-runtime') : await import('react/jsx-runtime')

  try {
    const module = await evaluate(source, {
      ...runtime,
      remarkPlugins: options.remarkPlugins,
      rehypePlugins: options.rehypePlugins,
      development: options.development,
      format: 'mdx',
    } as any)

    // Cache the result
    if (!options.development) {
      const cacheKey = getCacheKey(source, options)
      compilationCache.set(cacheKey, module as CompiledMDX)
    }

    return module as CompiledMDX
  } catch (error) {
    throw new Error(`Failed to evaluate MDX code: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Generate cache key for compiled MDX
 *
 * @param source - MDX source code
 * @param options - Compilation options
 * @returns Cache key
 */
function getCacheKey(source: string, options: MDXCompileOptions): string {
  // Simple hash function for cache key
  const optionsStr = JSON.stringify({
    jsxRuntime: options.jsxRuntime,
    jsxImportSource: options.jsxImportSource,
    development: options.development,
  })

  return `${hashString(source)}-${hashString(optionsStr)}`
}

/**
 * Simple string hash function
 *
 * @param str - String to hash
 * @returns Hash number
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

/**
 * Clear compilation cache
 */
export function clearCompilationCache(): void {
  compilationCache.clear()
}

/**
 * Get compilation cache size
 *
 * @returns Number of cached modules
 */
export function getCompilationCacheSize(): number {
  return compilationCache.size
}
