/**
 * Integration tests for hono-mdx
 */

import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { mdx, renderMDX, mdxHandler } from '../src/middleware'
import type { HonoMDXContext } from '../src/types'

describe('Integration Tests', () => {
  describe('renderMDX', () => {
    it('should render simple MDX to response', async () => {
      const app = new Hono()

      app.get('/test', async (c) => {
        return renderMDX(c, '# Hello World\n\nThis is **bold** text.')
      })

      const res = await app.request('/test')

      expect(res.status).toBe(200)
      expect(res.headers.get('Content-Type')).toContain('text/html')

      const html = await res.text()
      expect(html).toContain('Hello World')
    })

    it('should handle frontmatter', async () => {
      const app = new Hono()

      app.get('/test', async (c) => {
        return renderMDX(
          c,
          `---
title: My Page
---
# Content`
        )
      })

      const res = await app.request('/test')
      const html = await res.text()

      expect(html).toContain('Content')
    })

    it('should handle errors gracefully', async () => {
      const app = new Hono()

      app.get('/test', async (c) => {
        // Invalid MDX with unclosed tag
        return renderMDX(c, '<Button', { compileOptions: { development: false } })
      })

      const res = await app.request('/test')

      expect(res.status).toBe(500)
    })
  })

  describe('mdx middleware', () => {
    it('should extend context with mdx helpers', async () => {
      const app = new Hono()

      app.use('*', mdx())

      app.get('/test', async (c) => {
        const ctx = c as HonoMDXContext
        expect(typeof ctx.mdx).toBe('function')
        expect(typeof ctx.mdxFile).toBe('function')

        return ctx.mdx('# Test')
      })

      const res = await app.request('/test')
      expect(res.status).toBe(200)
    })

    it('should support default components', async () => {
      const Button = () => null

      const app = new Hono()

      app.use(
        '*',
        mdx({
          components: { Button },
        })
      )

      app.get('/test', async (c) => {
        const ctx = c as HonoMDXContext
        return ctx.mdx('<Button>Click me</Button>')
      })

      const res = await app.request('/test')
      expect(res.status).toBe(200)
    })

    it('should merge components from middleware and render options', async () => {
      const Button = () => null
      const Card = () => null

      const app = new Hono()

      app.use(
        '*',
        mdx({
          components: { Button },
        })
      )

      app.get('/test', async (c) => {
        const ctx = c as HonoMDXContext
        return ctx.mdx('<Button>Click</Button>\n<Card>Content</Card>', {
          components: { Card },
        })
      })

      const res = await app.request('/test')
      expect(res.status).toBe(200)
    })
  })

  describe('mdxHandler', () => {
    it('should create handler from static content', async () => {
      const app = new Hono()

      app.get('/test', mdxHandler('# Static Content'))

      const res = await app.request('/test')
      const html = await res.text()

      expect(res.status).toBe(200)
      expect(html).toContain('Static Content')
    })

    it('should create handler from dynamic content', async () => {
      const app = new Hono()

      app.get(
        '/test',
        mdxHandler((c) => {
          const name = c.req.query('name') || 'World'
          return `# Hello ${name}`
        })
      )

      const res = await app.request('/test?name=Alice')
      const html = await res.text()

      expect(html).toContain('Hello Alice')
    })

    it('should accept render options', async () => {
      const app = new Hono()

      app.get(
        '/test',
        mdxHandler('# Test', {
          css: 'body { color: red; }',
        })
      )

      const res = await app.request('/test')
      const html = await res.text()

      expect(html).toContain('color: red')
    })
  })

  describe('Streaming', () => {
    it('should support streaming responses', async () => {
      const app = new Hono()

      app.get('/test', async (c) => {
        return renderMDX(c, '# Streaming Test\n\nContent here.', {
          renderOptions: { streaming: true },
        })
      })

      const res = await app.request('/test')

      expect(res.status).toBe(200)
      expect(res.body).toBeTruthy() // Should have a body stream
    })

    it('should support non-streaming responses', async () => {
      const app = new Hono()

      app.get('/test', async (c) => {
        return renderMDX(c, '# Non-Streaming Test', {
          renderOptions: { streaming: false },
        })
      })

      const res = await app.request('/test')

      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('Non-Streaming Test')
    })
  })

  describe('Error Handling', () => {
    it('should show detailed errors in development', async () => {
      const app = new Hono()

      app.get('/test', async (c) => {
        return renderMDX(c, '<InvalidComponent>', {
          compileOptions: { development: true },
        })
      })

      const res = await app.request('/test')
      const html = await res.text()

      expect(res.status).toBe(500)
      expect(html).toContain('Error')
    })

    it('should show generic errors in production', async () => {
      const app = new Hono()

      app.get('/test', async (c) => {
        return renderMDX(c, '<InvalidComponent>', {
          compileOptions: { development: false },
        })
      })

      const res = await app.request('/test')
      const html = await res.text()

      expect(res.status).toBe(500)
      expect(html).toContain('Something went wrong')
    })
  })
})
