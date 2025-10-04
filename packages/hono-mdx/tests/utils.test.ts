/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest'
import { parseFrontmatter, mergeComponents, createHTMLResponse, isMDX, extractTitle, createErrorHTML } from '../src/utils'

describe('Utils', () => {
  describe('parseFrontmatter', () => {
    it('should parse YAML frontmatter', () => {
      const content = `---
title: My Post
date: 2025-01-01
draft: false
---

# Content
`
      const result = parseFrontmatter(content)

      expect(result.data).toEqual({
        title: 'My Post',
        date: '2025-01-01',
        draft: false,
      })
      expect(result.content).toContain('# Content')
    })

    it('should handle content without frontmatter', () => {
      const content = '# No Frontmatter'
      const result = parseFrontmatter(content)

      expect(result.data).toEqual({})
      expect(result.content).toBe(content)
    })

    it('should parse numbers', () => {
      const content = `---
count: 42
price: 19.99
---
Content`
      const result = parseFrontmatter(content)

      expect(result.data.count).toBe(42)
      expect(result.data.price).toBe(19.99)
    })

    it('should parse booleans', () => {
      const content = `---
published: true
draft: false
---
Content`
      const result = parseFrontmatter(content)

      expect(result.data.published).toBe(true)
      expect(result.data.draft).toBe(false)
    })
  })

  describe('mergeComponents', () => {
    it('should merge component objects', () => {
      const base = { Button: () => null }
      const override = { Card: () => null }

      const result = mergeComponents(base, override)

      expect(result).toHaveProperty('Button')
      expect(result).toHaveProperty('Card')
    })

    it('should override components', () => {
      const Button1 = () => null
      const Button2 = () => null

      const base = { Button: Button1 }
      const override = { Button: Button2 }

      const result = mergeComponents(base, override)

      expect(result.Button).toBe(Button2)
    })

    it('should handle undefined values', () => {
      const result = mergeComponents(undefined, { Button: () => null }, undefined)

      expect(result).toHaveProperty('Button')
    })
  })

  describe('createHTMLResponse', () => {
    it('should create response with correct headers', () => {
      const stream = new ReadableStream()
      const response = createHTMLResponse(stream)

      expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
      expect(response.headers.get('Content-Encoding')).toBe('identity')
    })

    it('should accept custom status', () => {
      const stream = new ReadableStream()
      const response = createHTMLResponse(stream, { status: 404 })

      expect(response.status).toBe(404)
    })

    it('should merge custom headers', () => {
      const stream = new ReadableStream()
      const response = createHTMLResponse(stream, {
        headers: { 'X-Custom': 'value' },
      })

      expect(response.headers.get('X-Custom')).toBe('value')
      expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    })
  })

  describe('isMDX', () => {
    it('should detect JSX components', () => {
      expect(isMDX('<Button>Click</Button>')).toBe(true)
      expect(isMDX('<div>HTML</div>')).toBe(true)
    })

    it('should return false for plain markdown', () => {
      expect(isMDX('# Title\n\nPlain text')).toBe(false)
    })
  })

  describe('extractTitle', () => {
    it('should extract title from frontmatter', () => {
      const content = `---
title: My Title
---
Content`
      expect(extractTitle(content)).toBe('My Title')
    })

    it('should extract title from h1 heading', () => {
      const content = '# My Heading\n\nContent'
      expect(extractTitle(content)).toBe('My Heading')
    })

    it('should prioritize frontmatter over heading', () => {
      const content = `---
title: Frontmatter Title
---
# Heading Title`
      expect(extractTitle(content)).toBe('Frontmatter Title')
    })

    it('should return undefined if no title found', () => {
      const content = 'No title here'
      expect(extractTitle(content)).toBeUndefined()
    })
  })

  describe('createErrorHTML', () => {
    it('should create error HTML in development', () => {
      const error = new Error('Test error')
      const html = createErrorHTML(error, true)

      expect(html).toContain('Test error')
      expect(html).toContain('<!DOCTYPE html>')
    })

    it('should create generic error HTML in production', () => {
      const error = new Error('Test error')
      const html = createErrorHTML(error, false)

      expect(html).not.toContain('Test error')
      expect(html).toContain('Something went wrong')
    })

    it('should include stack trace in development', () => {
      const error = new Error('Test error')
      error.stack = 'Stack trace here'
      const html = createErrorHTML(error, true)

      expect(html).toContain('Stack trace here')
    })
  })
})
