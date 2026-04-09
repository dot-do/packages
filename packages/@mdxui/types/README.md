---
name: "@mdxui/types"
version: 1.0.2
description: Core TypeScript types extending schema-dts for MDXUI
license: MIT
repository: "https://github.com/ai-primitives/mdxui"
homepage: "https://github.com/ai-primitives/mdxui#readme"
keywords:
  - mdx
  - typescript
  - schema
  - yaml-ld
  - types
downloads:
  monthly: 6
published: "2024-12-15T18:58:23.362Z"
updated: "2024-12-27T17:39:06.883Z"
---

# @mdxui/types

Core TypeScript types extending schema-dts to support `$type` alongside `@type` for YAML-LD frontmatter in MDX files.

## Installation

```bash
pnpm add @mdxui/types
```

## Usage

```typescript
import { BlogPost, DocumentationPage } from '@mdxui/types'

// In your MDX frontmatter
---
$type: BlogPost
title: My Blog Post
date: 2024-03-20
---

// Type checking in your components
interface Props {
  frontmatter: BlogPost
}
```

## Features

- Extended schema.org types with `$type` support
- Full TypeScript definitions for all MDXUI components
- Type safety for YAML-LD frontmatter
- Integration with schema-dts

## Related Packages

- `@mdxui/shared` - Shared utilities and components
- `@mdxui/blog` - Blog-specific implementations
- `@mdxui/docs` - Documentation specific implementations

## License

MIT © 2024 [Drivly](https://driv.ly) 