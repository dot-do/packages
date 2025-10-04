/**
 * Streaming example
 */

import { Hono } from 'hono'
import { renderMDX } from '@dot-do/hono-mdx'

const app = new Hono()

// Streaming rendering (default)
app.get('/stream', (c) => {
  const largeContent = `
# Streaming Demo

This content is streamed progressively to the client.

${'## Section\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n'.repeat(20)}
  `

  return renderMDX(c, largeContent, {
    renderOptions: {
      streaming: true, // Default
    },
  })
})

// Non-streaming rendering
app.get('/static', (c) => {
  const content = `
# Static Rendering

This content is rendered completely before sending.

Useful for:
- SEO-critical pages
- Caching
- When you need the complete HTML upfront
  `

  return renderMDX(c, content, {
    renderOptions: {
      streaming: false,
    },
  })
})

// Streaming with abort signal
app.get('/abortable', (c) => {
  const controller = new AbortController()

  // Abort after 5 seconds
  setTimeout(() => controller.abort(), 5000)

  return renderMDX(c, '# This will abort after 5 seconds', {
    renderOptions: {
      streaming: true,
      signal: controller.signal,
    },
  })
})

export default app
