---
name: "@mdxui/docs"
version: 1.0.2
description: Documentation site layouts and components for MDXUI
license: MIT
repository: "https://github.com/ai-primitives/mdxui"
homepage: "https://github.com/ai-primitives/mdxui#readme"
keywords:
  - mdx
  - docs
  - documentation
  - react
  - components
downloads:
  monthly: 24
published: "2024-12-24T13:33:39.742Z"
updated: "2024-12-27T17:38:34.473Z"
---

# @mdxui/docs

Documentation site layouts and components for MDXUI, designed for creating beautiful and functional documentation with MDX and YAML-LD frontmatter.

## Installation

```bash
pnpm add @mdxui/docs
```

## Features

- Documentation-specific layouts
- Sidebar navigation
- API reference components
- Code blocks with syntax highlighting
- Search integration
- Versioning support
- Multi-language support
- Light/dark mode

## Usage

```tsx
import { 
  DocsLayout, 
  APIReference, 
  CodeBlock 
} from '@mdxui/docs'

// In your MDX file
---
$type: DocumentationPage
title: API Reference
version: 1.0.0
---

export default function APIDoc({ children }) {
  return (
    <DocsLayout>
      <APIReference>
        {children}
      </APIReference>
    </DocsLayout>
  )
}

// Example usage in MDX
<CodeBlock language="typescript">
  const example = "Hello World";
</CodeBlock>
```

## Components

- `DocsLayout` - Main documentation layout with navigation
- `APIReference` - API documentation component
- `CodeBlock` - Syntax highlighted code blocks
- `VersionSelector` - Documentation version switcher
- `LanguageSelector` - Documentation language switcher
- `SearchBar` - Documentation search
- `Sidebar` - Documentation navigation sidebar

## Related Packages

- `@mdxui/types` - TypeScript type definitions
- `@mdxui/shared` - Shared components and utilities
- `@mdxui/widgets` - Interactive components like search

## License

MIT © 2024 [Drivly](https://driv.ly) 