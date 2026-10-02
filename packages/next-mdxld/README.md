---
name: next-mdxld
version: 1.3.0
description: MDX loader for Next.js with dynamic layouts and components
downloads:
  monthly: 35
published: "2024-12-22T14:44:43.456Z"
updated: "2025-01-14T18:43:04.766Z"
---

# next-mdxld

[![npm version](https://badge.fury.io/js/next-mdxld.svg)](https://www.npmjs.com/package/next-mdxld)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A NextJS plugin for MDXLD (MDX with YAML Linked Data frontmatter) that enables component and layout selection based on frontmatter $context and $type.

## Quick Start

```mdx
---
$id: https://example.com/blog/my-blog-post
$type: https://schema.org/BlogPosting
title: My Blog Post
author: John Doe
datePublished: 2024-01-15
---

export { layout, components } from 'https://esm.sh/@mdxui/shadcn'

# My Blog Post

This content will use the simple blog layout and shadcn components.
```

## Features

- 🚀 NextJS App Router Support
- 📄 MDXLD Frontmatter Processing
- 🎨 Dynamic Component Selection via $type
- 📱 Flexible Layout System via $context
- 🔄 Automatic Page Generation
- 🎯 TypeScript Support

## Installation

```bash
# Using pnpm (recommended)
pnpm add next-mdxld @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
# Or using npm
npm install next-mdxld @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

## Setup

### 1. Configure Next.js for MDX

Create or update your `next.config.js`:

```javascript
import createMDX from '@next/mdx'
import remarkMdxld from 'remark-mdxld'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Allow URL imports from trusted domains
  experimental: {
    urlImports: ['https://esm.sh']
  }
}

const withMDX = createMDX({
  // Add markdown plugins here
  options: {
    remarkPlugins: [remarkMdxld],
    rehypePlugins: []
  }
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
```

### 2. Set up MDX Components

Create `mdx-components.tsx` in your project root:

```typescript
import React from 'react'
import type { MDXComponents } from 'mdx/types'
import { defaultLayouts } from 'next-mdxld/layouts'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children, frontmatter }) => {
      const Layout = frontmatter?.$type ?
        defaultLayouts[frontmatter.$type] || defaultLayouts.default :
        defaultLayouts.default

      return <Layout frontmatter={frontmatter}>{children}</Layout>
    },
    ...components
  }
}
```

### 3. Create App Layout

```javascript
import { Layout } from 'next-mdxld/components'

export default function RootLayout({ children }) {
  return (
    <Layout>
      {children}
    </Layout>
  )
}
```

### 4. Set up Dynamic Page Route

```javascript
import { MDXPage } from 'next-mdxld/page'

export default MDXPage
```

### Example MDX Files

#### Schema.org BlogPosting
```mdx
---
$type: https://schema.org/BlogPosting
title: My Technical Blog Post
author: John Doe
datePublished: 2024-01-15
---

# Advanced TypeScript Patterns

This content will be rendered using the BlogPosting component within the Blog layout.
```

#### Schema.org WebSite
```mdx
---
$type: https://schema.org/WebSite
name: My Developer Portfolio
url: https://example.com
---

# Welcome to My Portfolio

This content uses the WebSite component for optimal SEO and structure.
```

#### mdx.org.ai API
```mdx
---
$type: https://mdx.org.ai/API
endpoint: /api/users
method: POST
---

# Create User API

This content will be rendered with API-specific components and documentation layout.
```

#### mdx.org.ai Agent
```mdx
---
$type: https://mdx.org.ai/Agent
tools: ["chat", "search", "code"]
---

# Support Agent

This content will be rendered with Agent-specific components and interaction UI.
```

## Documentation

For detailed documentation and examples, visit:
- [mdxld.org](https://mdxld.org) - Main documentation
- [Next.js MDX Documentation](https://nextjs.org/docs/pages/building-your-application/configuring/mdx) - Official Next.js MDX setup guide

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) to learn about our development process.

## License

MIT © [AI Primitives](https://primitives.org.ai)
