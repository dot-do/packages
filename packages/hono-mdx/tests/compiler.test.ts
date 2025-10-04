/**
 * Tests for MDX compiler
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { compileMDX, compileMDXToJS, compileMDXToComponent, clearCompilationCache, getCompilationCacheSize } from '../src/compiler'

describe('MDX Compiler', () => {
  beforeEach(() => {
    clearCompilationCache()
  })

  describe('compileMDX', () => {
    it('should compile simple MDX to JSX', async () => {
      const source = '# Hello World\n\nThis is **bold** text.'
      const result = await compileMDX(source)

      expect(result).toContain('Hello World')
      expect(typeof result).toBe('string')
    })

    it('should compile MDX with JSX components', async () => {
      const source = `
# Title

<Button>Click me</Button>
`
      const result = await compileMDX(source)

      expect(result).toContain('Button')
    })

    it('should support automatic JSX runtime', async () => {
      const source = '# Hello'
      const result = await compileMDX(source, { jsxRuntime: 'automatic' })

      expect(typeof result).toBe('string')
    })

    it('should support classic JSX runtime', async () => {
      const source = '# Hello'
      const result = await compileMDX(source, { jsxRuntime: 'classic' })

      expect(typeof result).toBe('string')
    })
  })

  describe('compileMDXToJS', () => {
    it('should transform MDX to executable JavaScript', async () => {
      const source = '# Hello World'
      const result = await compileMDXToJS(source)

      expect(result).toContain('export default')
      expect(typeof result).toBe('string')
    })

    it('should minify in production mode', async () => {
      const source = '# Hello World\n\nSome content here.'
      const dev = await compileMDXToJS(source, { development: true })
      const prod = await compileMDXToJS(source, { development: false })

      // Production should be smaller (minified)
      expect(prod.length).toBeLessThan(dev.length)
    })
  })

  describe('compileMDXToComponent', () => {
    it('should compile MDX to React component', async () => {
      const source = '# Hello World'
      const result = await compileMDXToComponent(source)

      expect(result).toHaveProperty('default')
      expect(typeof result.default).toBe('function')
    })

    it('should cache compiled components in production', async () => {
      const source = '# Hello World'

      expect(getCompilationCacheSize()).toBe(0)

      await compileMDXToComponent(source, { development: false })
      expect(getCompilationCacheSize()).toBe(1)

      await compileMDXToComponent(source, { development: false })
      expect(getCompilationCacheSize()).toBe(1) // Should use cache
    })

    it('should not cache in development mode', async () => {
      const source = '# Hello World'

      clearCompilationCache()
      expect(getCompilationCacheSize()).toBe(0)

      await compileMDXToComponent(source, { development: true })
      expect(getCompilationCacheSize()).toBe(0) // Should not cache
    })

    it('should handle frontmatter exports', async () => {
      const source = `
export const title = 'My Title'

# Content
`
      const result = await compileMDXToComponent(source)

      expect(result).toHaveProperty('title', 'My Title')
    })
  })

  describe('Cache Management', () => {
    it('should clear compilation cache', async () => {
      const source = '# Test'

      await compileMDXToComponent(source, { development: false })
      expect(getCompilationCacheSize()).toBeGreaterThan(0)

      clearCompilationCache()
      expect(getCompilationCacheSize()).toBe(0)
    })

    it('should track cache size', async () => {
      clearCompilationCache()

      await compileMDXToComponent('# First', { development: false })
      expect(getCompilationCacheSize()).toBe(1)

      await compileMDXToComponent('# Second', { development: false })
      expect(getCompilationCacheSize()).toBe(2)
    })
  })
})
