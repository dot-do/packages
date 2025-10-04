/**
 * Basic MDX rendering example
 */

import { Hono } from 'hono'
import { renderMDX } from '@dot-do/hono-mdx'

const app = new Hono()

// Simple MDX rendering
app.get('/', (c) => {
  return renderMDX(
    c,
    `
# Welcome to hono-mdx!

This is a **basic example** of rendering MDX in Hono.

## Features

- Easy to use
- Full TypeScript support
- Streaming by default

Try it out!
  `
  )
})

// MDX with frontmatter
app.get('/post', (c) => {
  const content = `
---
title: My First Post
date: 2025-01-01
author: Alice
tags: [demo, mdx, hono]
---

# {title}

Written by **{author}** on {date}

This post demonstrates MDX with frontmatter.

## Tags

{tags.join(', ')}
  `

  return renderMDX(c, content)
})

// Dynamic MDX content
app.get('/greeting', (c) => {
  const name = c.req.query('name') || 'World'
  const time = new Date().toLocaleTimeString()

  return renderMDX(
    c,
    `
# Hello, ${name}!

Current time: ${time}

This content is generated dynamically.
  `
  )
})

export default app
