# @hono/mdx

Render MDX in [Hono](https://hono.dev) with full streaming support for Cloudflare Workers and other edge runtimes.

## Features

✅ **Full Streaming Support** - Progressive rendering with React 19's `renderToReadableStream`
✅ **Custom Components** - Use your own React components in MDX
✅ **File-based or String-based** - Render from files or strings
✅ **Plugin System** - Support for remark/rehype plugins
✅ **TypeScript First** - Full type safety
✅ **Cloudflare Workers Optimized** - Uses Web Streams API
✅ **Development Mode** - Better error messages and hot reloading
✅ **Production Ready** - Optimized builds and caching

## Installation

```bash
npm install @hono/mdx hono react react-dom
```

## Quick Start

```typescript
import { Hono } from 'hono'
import { mdx, renderMDX } from '@hono/mdx'

const app = new Hono()

// Simple usage
app.get('/hello', (c) => {
  return renderMDX(c, '# Hello World\n\nThis is **MDX**!')
})

// With middleware
app.use('*', mdx({
  components: {
    Button: ({ children }) => `<button>${children}</button>`
  }
}))

app.get('/doc', (c) => {
  return c.mdx(`
# Interactive Demo

<Button>Click me!</Button>
  `)
})

export default app
```

## Usage

### Basic Rendering

```typescript
import { renderMDX } from '@hono/mdx'

app.get('/doc', (c) => {
  const content = `
# My Document

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2
  `

  return renderMDX(c, content)
})
```

### With Frontmatter

```typescript
app.get('/post', (c) => {
  const content = `
---
title: My Blog Post
date: 2025-01-01
author: Alice
---

# ${title}

By ${author} on ${date}

Post content here...
  `

  return renderMDX(c, content)
})
```

### Custom Components

```typescript
import { mdx } from '@hono/mdx'

// Define your components
const Button = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
)

const Card = ({ title, children }) => (
  <div className="card">
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
)

// Use middleware with components
app.use('*', mdx({
  components: { Button, Card }
}))

app.get('/interactive', (c) => {
  return c.mdx(`
# Interactive Demo

<Card title="Welcome">
  <Button onClick={() => alert('Clicked!')}>
    Click me
  </Button>
</Card>
  `)
})
```

### Streaming vs Non-Streaming

```typescript
// Streaming (default) - progressive rendering
app.get('/stream', (c) => {
  return renderMDX(c, content, {
    renderOptions: { streaming: true }
  })
})

// Non-streaming - wait for full render
app.get('/static', (c) => {
  return renderMDX(c, content, {
    renderOptions: { streaming: false }
  })
})
```

### File-based Rendering

```typescript
import { serveMDXFile } from '@hono/mdx'

app.get('/docs/:page', (c) => {
  const page = c.req.param('page')
  return serveMDXFile(c, `./docs/${page}.mdx`)
})
```

**Note:** File reading must be implemented based on your storage backend (KV, R2, filesystem, etc.)

### Route Handlers

```typescript
import { mdxHandler, mdxFileHandler } from '@hono/mdx'

// Static content
app.get('/about', mdxHandler(`
# About Us

We build awesome MDX tools!
`))

// Dynamic content
app.get('/greeting', mdxHandler((c) => {
  const name = c.req.query('name') || 'World'
  return `# Hello ${name}!`
}))

// File-based
app.get('/docs/:page', mdxFileHandler((c) => {
  const page = c.req.param('page')
  return `./docs/${page}.mdx`
}))
```

### Custom HTML Template

```typescript
app.use('*', mdx({
  template: (content, css, scripts) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My Site</title>
  <link rel="stylesheet" href="/styles.css">
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  <div id="app">${content}</div>
  ${scripts?.map(src => `<script src="${src}"></script>`).join('\n') || ''}
</body>
</html>
  `
}))
```

### With Custom CSS

```typescript
app.get('/styled', (c) => {
  return renderMDX(c, content, {
    css: `
      body { font-family: sans-serif; }
      h1 { color: #333; }
      .card { border: 1px solid #ddd; padding: 1rem; }
    `
  })
})
```

### Development Mode

```typescript
app.get('/dev', (c) => {
  return renderMDX(c, content, {
    compileOptions: {
      development: true // Better error messages, no caching
    }
  })
})
```

### With Remark/Rehype Plugins

```typescript
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

app.use('*', mdx({
  compileOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight]
  }
}))
```

## API Reference

### `renderMDX(context, content, options?)`

Render MDX content to a Hono response.

**Parameters:**
- `context: Context` - Hono context
- `content: string` - MDX content
- `options?: MDXRenderOptions` - Render options

**Returns:** `Promise<Response>`

### `mdx(options?)`

Hono middleware that extends context with MDX helpers.

**Parameters:**
- `options?: HonoMDXOptions` - Middleware options

**Returns:** `MiddlewareHandler`

**Extended Context:**
- `c.mdx(content, options?)` - Render MDX content
- `c.mdxFile(filePath, options?)` - Render MDX file

### `serveMDXFile(context, filePath, options?)`

Serve an MDX file as a response.

**Parameters:**
- `context: Context` - Hono context
- `filePath: string` - Path to MDX file
- `options?: MDXRenderOptions` - Render options

**Returns:** `Promise<Response>`

### `mdxHandler(content, options?)`

Create a route handler from MDX content.

**Parameters:**
- `content: string | ((c: Context) => string | Promise<string>)` - MDX content or factory
- `options?: MDXRenderOptions` - Render options

**Returns:** `Handler`

### `mdxFileHandler(filePath, options?)`

Create a route handler from an MDX file.

**Parameters:**
- `filePath: string | ((c: Context) => string | Promise<string>)` - File path or factory
- `options?: MDXRenderOptions` - Render options

**Returns:** `Handler`

## Type Definitions

```typescript
interface MDXRenderOptions {
  components?: Record<string, ComponentType<any>>
  props?: Record<string, any>
  compileOptions?: MDXCompileOptions
  renderOptions?: RenderOptions
  template?: (content: string, css?: string, scripts?: string[]) => string
  css?: string
  scripts?: string[]
}

interface MDXCompileOptions {
  jsxRuntime?: 'classic' | 'automatic'
  development?: boolean
  jsxImportSource?: string
  remarkPlugins?: any[]
  rehypePlugins?: any[]
}

interface RenderOptions {
  streaming?: boolean
  signal?: AbortSignal
  bootstrapScripts?: string[]
  bootstrapModules?: string[]
}
```

## Advanced Usage

### Caching Compiled MDX

The package automatically caches compiled MDX in production mode:

```typescript
import { clearCompilationCache, getCompilationCacheSize } from '@hono/mdx'

// Clear cache
clearCompilationCache()

// Get cache size
const size = getCompilationCacheSize()
console.log(`Cache contains ${size} compiled modules`)
```

### Low-level API

For advanced use cases, you can use the low-level APIs:

```typescript
import { compileMDXToComponent, renderMDXComponent, streamWithTemplate } from '@hono/mdx'

// Compile MDX
const compiled = await compileMDXToComponent(source)

// Render component
const stream = await renderMDXComponent(
  compiled.default,
  { /* props */ },
  { /* components */ }
)

// Wrap in template
const htmlStream = streamWithTemplate(stream, template)

// Return response
return new Response(htmlStream, {
  headers: { 'Content-Type': 'text/html' }
})
```

## Examples

See the [examples directory](./examples) for complete working examples:

- [Basic Usage](./examples/basic.ts)
- [Streaming](./examples/streaming.ts)
- [Custom Components](./examples/components.ts)

## Cloudflare Workers

This package is optimized for Cloudflare Workers:

```typescript
// wrangler.jsonc
{
  "name": "my-mdx-app",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01"
}
```

```typescript
// src/index.ts
import { Hono } from 'hono'
import { mdx } from '@hono/mdx'

const app = new Hono()

app.use('*', mdx())

app.get('/', (c) => c.mdx('# Hello from Workers!'))

export default app
```

## Contributing

Contributions are welcome! Please read our [contributing guidelines](../../CONTRIBUTING.md).

## License

MIT © [Hono](https://github.com/honojs)

## Related

- [Hono](https://hono.dev) - Ultrafast web framework
- [MDX](https://mdxjs.com) - Markdown for the component era
- [React](https://react.dev) - JavaScript library for UIs

## Support

- [GitHub Issues](https://github.com/dot-do/packages/issues)
- [GitHub Discussions](https://github.com/dot-do/packages/discussions)
