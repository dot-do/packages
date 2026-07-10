---
name: "@mdxui/blog"
version: 1.0.2
description: Blog-specific layouts and components for MDXUI
license: MIT
repository: "https://github.com/ai-primitives/mdxui"
homepage: "https://github.com/ai-primitives/mdxui#readme"
keywords:
  - mdx
  - blog
  - react
  - components
  - layouts
downloads:
  monthly: 198
published: "2024-12-23T16:18:49.789Z"
updated: "2024-12-27T17:38:13.345Z"
---

# @mdxui/blog

Blog-specific layouts and components for MDXUI, optimized for creating modern, performant blog sites with MDX and YAML-LD frontmatter.

## Installation

```bash
pnpm add @mdxui/blog
```

## Features

- Blog-specific layouts
- Post list components
- Category and tag components
- Author bio components
- Related posts
- Social sharing
- SEO optimization
- RSS feed support

## Usage

```tsx
import { BlogLayout, PostList, AuthorBio } from '@mdxui/blog'

// In your MDX file
---
$type: BlogPost
title: My First Blog Post
author: John Doe
date: 2024-03-20
tags: ['react', 'mdx']
---

export default function BlogPost({ children }) {
  return (
    <BlogLayout>
      <article>{children}</article>
      <AuthorBio />
    </BlogLayout>
  )
}

// In your blog index
export default function BlogIndex({ posts }) {
  return (
    <BlogLayout>
      <PostList posts={posts} />
    </BlogLayout>
  )
}
```

## Components

- `BlogLayout` - Main blog layout with sidebar and navigation
- `PostList` - Paginated list of blog posts
- `AuthorBio` - Author biography component
- `TagCloud` - Tag visualization
- `ShareButtons` - Social sharing buttons
- `TableOfContents` - Post navigation

## Related Packages

- `@mdxui/types` - TypeScript type definitions
- `@mdxui/shared` - Shared components and utilities
- `@mdxui/widgets` - Interactive components

## License

MIT © 2024 [Drivly](https://driv.ly) 