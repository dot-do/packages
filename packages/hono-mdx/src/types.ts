/**
 * Type definitions for hono-mdx
 */

import type { Context } from 'hono'
import type { ComponentType, ReactElement } from 'react'
import type { CompileOptions } from '@mdx-js/mdx'

/**
 * MDX compilation options
 */
export interface MDXCompileOptions extends Omit<CompileOptions, 'outputFormat'> {
  /**
   * JSX runtime to use ('automatic' uses React 17+ JSX transform)
   * @default 'automatic'
   */
  jsxRuntime?: 'classic' | 'automatic'

  /**
   * Enable development mode (better error messages, warnings)
   * @default false
   */
  development?: boolean

  /**
   * Custom JSX import source
   * @default 'react'
   */
  jsxImportSource?: string
}

/**
 * React rendering options
 */
export interface RenderOptions {
  /**
   * Enable streaming (progressive rendering)
   * @default true
   */
  streaming?: boolean

  /**
   * Abort signal for cancellation
   */
  signal?: AbortSignal

  /**
   * Bootstrap scripts to include in HTML
   */
  bootstrapScripts?: string[]

  /**
   * Bootstrap modules to include in HTML
   */
  bootstrapModules?: string[]
}

/**
 * Combined MDX rendering options
 */
export interface MDXRenderOptions {
  /**
   * MDX components to make available
   */
  components?: Record<string, ComponentType<any>>

  /**
   * Props to pass to the MDX component
   */
  props?: Record<string, any>

  /**
   * MDX compilation options
   */
  compileOptions?: MDXCompileOptions

  /**
   * React rendering options
   */
  renderOptions?: RenderOptions

  /**
   * Custom HTML template wrapper
   */
  template?: (content: string) => string

  /**
   * Additional CSS to inject
   */
  css?: string

  /**
   * Additional scripts to inject
   */
  scripts?: string[]
}

/**
 * Hono MDX middleware options
 */
export interface HonoMDXOptions {
  /**
   * Default MDX components
   */
  components?: Record<string, ComponentType<any>>

  /**
   * Default MDX compilation options
   */
  compileOptions?: MDXCompileOptions

  /**
   * Default render options
   */
  renderOptions?: RenderOptions

  /**
   * Cache compiled MDX (in production)
   * @default true
   */
  cache?: boolean

  /**
   * Custom HTML template
   */
  template?: (content: string) => string
}

/**
 * Compiled MDX module
 */
export interface CompiledMDX {
  /**
   * Compiled JavaScript code
   */
  code: string

  /**
   * MDX default export (component)
   */
  default: ComponentType<any>

  /**
   * Named exports from MDX
   */
  [key: string]: any
}

/**
 * MDX file metadata
 */
export interface MDXMetadata {
  /**
   * File path
   */
  path: string

  /**
   * Last modified timestamp
   */
  mtime?: number

  /**
   * File size in bytes
   */
  size?: number

  /**
   * Frontmatter data
   */
  frontmatter?: Record<string, any>
}

/**
 * Hono context with MDX extensions
 */
export interface HonoMDXContext extends Context {
  /**
   * Render MDX content to response
   */
  mdx: (content: string, options?: MDXRenderOptions) => Promise<Response>

  /**
   * Render MDX file to response
   */
  mdxFile: (filePath: string, options?: MDXRenderOptions) => Promise<Response>
}
