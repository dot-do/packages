/**
 * Hono Middleware for MDX
 *
 * Provides middleware and helper functions for rendering MDX in Hono
 */

import type { Context, MiddlewareHandler } from 'hono'
import { compileMDXToComponent } from './compiler'
import { renderMDXComponent, streamWithTemplate, wrapInTemplate } from './renderer'
import { createHTMLResponse, createErrorHTML, parseFrontmatter, mergeComponents } from './utils'
import type { HonoMDXOptions, MDXRenderOptions, HonoMDXContext } from './types'

/**
 * Create MDX middleware for Hono
 *
 * Extends context with `mdx()` and `mdxFile()` helper methods
 *
 * @param options - Middleware options
 * @returns Hono middleware
 */
export function mdx(options: HonoMDXOptions = {}): MiddlewareHandler {
  const { components: defaultComponents = {}, compileOptions: defaultCompileOptions = {}, renderOptions: defaultRenderOptions = {}, template, cache = true } = options

  return async (c, next) => {
    // Extend context with MDX helpers
    ;(c as HonoMDXContext).mdx = async (content: string, renderOptions?: MDXRenderOptions) => {
      return renderMDX(c, content, {
        components: mergeComponents(defaultComponents, renderOptions?.components),
        compileOptions: { ...defaultCompileOptions, ...renderOptions?.compileOptions },
        renderOptions: { ...defaultRenderOptions, ...renderOptions?.renderOptions },
        template: renderOptions?.template || template,
        css: renderOptions?.css,
        scripts: renderOptions?.scripts,
      })
    }
    ;(c as HonoMDXContext).mdxFile = async (filePath: string, renderOptions?: MDXRenderOptions) => {
      return serveMDXFile(c, filePath, {
        components: mergeComponents(defaultComponents, renderOptions?.components),
        compileOptions: { ...defaultCompileOptions, ...renderOptions?.compileOptions },
        renderOptions: { ...defaultRenderOptions, ...renderOptions?.renderOptions },
        template: renderOptions?.template || template,
        css: renderOptions?.css,
        scripts: renderOptions?.scripts,
      })
    }

    await next()
  }
}

/**
 * Render MDX content to a Hono response
 *
 * @param c - Hono context
 * @param content - MDX content
 * @param options - Render options
 * @returns Response
 */
export async function renderMDX(c: Context, content: string, options: MDXRenderOptions = {}): Promise<Response> {
  const { components = {}, props = {}, compileOptions = {}, renderOptions = {}, template, css, scripts = [] } = options

  const development = compileOptions.development ?? false
  const streaming = renderOptions.streaming ?? true

  try {
    // Parse frontmatter
    const { data: frontmatter, content: mdxContent } = parseFrontmatter(content)

    // Compile MDX to component
    const compiled = await compileMDXToComponent(mdxContent, {
      ...compileOptions,
      development,
    })

    // Merge props with frontmatter
    const componentProps = { ...frontmatter, ...props }

    // Render component
    const contentStream = await renderMDXComponent(compiled.default, componentProps, components, renderOptions)

    // Wrap in template or stream with template
    const htmlStream = streaming ? streamWithTemplate(contentStream, template, css, scripts) : wrapInTemplate(contentStream, template, css, scripts)

    // Return response
    return createHTMLResponse(htmlStream)
  } catch (error) {
    console.error('MDX render error:', error)

    const errorHTML = createErrorHTML(error instanceof Error ? error : new Error(String(error)), development)

    return new Response(errorHTML, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }
}

/**
 * Serve MDX file as a response
 *
 * @param c - Hono context
 * @param filePath - Path to MDX file
 * @param options - Render options
 * @returns Response
 */
export async function serveMDXFile(c: Context, filePath: string, options: MDXRenderOptions = {}): Promise<Response> {
  try {
    // Read file content
    // Note: In Cloudflare Workers, you'd typically use KV or R2 for file storage
    // This is a placeholder - actual implementation depends on your storage
    const content = await readFile(filePath)

    return renderMDX(c, content, options)
  } catch (error) {
    console.error('MDX file error:', error)

    const development = options.compileOptions?.development ?? false
    const errorHTML = createErrorHTML(error instanceof Error ? error : new Error(String(error)), development)

    return new Response(errorHTML, {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }
}

/**
 * Read file content
 *
 * Placeholder function - implement based on your storage backend
 *
 * @param filePath - File path
 * @returns File content
 */
async function readFile(filePath: string): Promise<string> {
  // TODO: Implement based on your storage backend
  // Options:
  // 1. Cloudflare KV: await env.KV.get(filePath)
  // 2. Cloudflare R2: await env.BUCKET.get(filePath).then(obj => obj?.text())
  // 3. Local filesystem (development): fs.readFileSync(filePath, 'utf-8')
  // 4. HTTP fetch: await fetch(url).then(r => r.text())

  throw new Error(`File reading not implemented. Please provide a file reading implementation for: ${filePath}`)
}

/**
 * Create a simple MDX route handler
 *
 * @param content - MDX content or factory function
 * @param options - Render options
 * @returns Hono handler
 */
export function mdxHandler(content: string | ((c: Context) => string | Promise<string>), options: MDXRenderOptions = {}) {
  return async (c: Context) => {
    const mdxContent = typeof content === 'function' ? await content(c) : content
    return renderMDX(c, mdxContent, options)
  }
}

/**
 * Create a file-based MDX route handler
 *
 * @param filePath - File path or factory function
 * @param options - Render options
 * @returns Hono handler
 */
export function mdxFileHandler(filePath: string | ((c: Context) => string | Promise<string>), options: MDXRenderOptions = {}) {
  return async (c: Context) => {
    const path = typeof filePath === 'function' ? await filePath(c) : filePath
    return serveMDXFile(c, path, options)
  }
}
