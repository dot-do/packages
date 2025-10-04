/**
 * hono-mdx - Render MDX in Hono with full streaming support
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono'
 * import { mdx, renderMDX } from 'hono-mdx'
 *
 * const app = new Hono()
 *
 * // Use middleware
 * app.use('*', mdx({
 *   components: { Button, Card }
 * }))
 *
 * // Render MDX
 * app.get('/doc', (c) => renderMDX(c, `# Hello World`))
 * ```
 */

// Re-export core functionality
export { compileMDX, compileMDXToJS, compileMDXToComponent, clearCompilationCache, getCompilationCacheSize } from './compiler'

export { renderToStream, renderToString, renderMDXComponent, wrapInTemplate, streamWithTemplate } from './renderer'

export { mdx, renderMDX, serveMDXFile, mdxHandler, mdxFileHandler } from './middleware'

export { parseFrontmatter, mergeComponents, createHTMLResponse, isMDX, extractTitle, createErrorHTML, measure } from './utils'

// Re-export types
export type {
  MDXCompileOptions,
  RenderOptions,
  MDXRenderOptions,
  HonoMDXOptions,
  CompiledMDX,
  MDXMetadata,
  HonoMDXContext,
} from './types'
