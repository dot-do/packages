---
name: "@mdx.do/mdx"
version: 0.1.0
description: A powerful MDX processor that can compile, evaluate, and manipulate MDX content with support for frontmatter, components, and AST manipulation
license: MIT
repository: "https://github.com/drivly/mdx.do"
homepage: "https://mdx.do"
keywords:
  - mdx
  - markdown
  - react
  - compiler
  - frontmatter
  - ast
  - processor
  - jsx
downloads:
  monthly: 5
published: "2024-12-11T21:34:28.335Z"
updated: "2024-12-11T21:34:28.612Z"
---

# @mdx.do/mdx

A powerful MDX processor that can compile, evaluate, and manipulate MDX content with support for frontmatter, components, and AST manipulation.

## Installation

```bash
npm install @mdx.do/mdx
```

## Features

- Process MDX strings with frontmatter
- Compile and evaluate MDX content
- Component registry for custom components
- Frontmatter manipulation
- AST parsing and manipulation
- Support for JSX components
- TypeScript support

## Usage

### Basic MDX Processing

```typescript
import { mdx } from '@mdx.do/mdx'

const mdxContent = `---
title: Hello World
---

# Welcome

This is a paragraph with a <Button>Click me</Button>`

const result = await mdx(mdxContent)
console.log(result.data) // { title: 'Hello World' }
console.log(result.default) // React component
```

### Component Registration

```typescript
import { registerComponent } from '@mdx.do/mdx'
import { Button } from './components'

// Register a component for use in MDX
registerComponent('Button', Button)
```

### Merging Frontmatter

```typescript
const result = await mdx(mdxContent)
const updated = await result.merge({ author: 'John Doe' })
// Updates frontmatter while preserving content
```

### Appending Content

```typescript
const result = await mdx('# Hello')
const updated = await result.append('## World')
// Results in: # Hello\n\n## World
```

### Object Input

```typescript
const HelloWorld = () => <div>Hello World</div>

const result = await mdx({
  jsx: HelloWorld,
  data: { title: 'My Page' }
})
```

## API Reference

### `mdx(input: string | MDXInput): Promise<MDXResult>`

Main function to process MDX content.

#### Input Types

```typescript
interface MDXInput {
  jsx?: ComponentType<any>    // React component
  data?: Record<string, any>  // Frontmatter data
  ast?: Root                  // MDAST Root node
  mdx?: string               // MDX string
}
```

#### Result Object

```typescript
interface MDXResult {
  mdx: string                // Original MDX content
  data: Record<string, any>  // Parsed frontmatter
  ast: Root                  // Parsed AST
  default: ComponentType<any> // Compiled React component
  markdown: ComponentType<any> // Markdown-only component
  merge: (update: Record<string, any>) => Promise<MDXResult>
  append: (content: string) => Promise<MDXResult>
}
```

### Component Registry

```typescript
registerComponent(name: string, component: ComponentType<any>): void
getComponent(name: string): ComponentType<any> | undefined
getAllComponents(): Record<string, ComponentType<any>>
```

## Examples

### Blog Post with Components

```typescript
import { mdx, registerComponent } from '@mdx.do/mdx'
import { CodeBlock, Image } from './components'

// Register custom components
registerComponent('CodeBlock', CodeBlock)
registerComponent('Image', Image)

const blogPost = `---
title: Getting Started with React
author: John Doe
date: 2023-12-15
---

# Getting Started with React

Here's a simple example:

<CodeBlock language="jsx">
  function App() {
    return <h1>Hello World</h1>
  }
</CodeBlock>

<Image src="react-logo.png" alt="React Logo" />
`

const result = await mdx(blogPost)
// Use result.default to render the blog post
```

### Dynamic Content

```typescript
const base = await mdx('# My Document')
const updated = await base.append('## New Section')
const final = await updated.merge({ 
  lastModified: new Date().toISOString() 
})
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT