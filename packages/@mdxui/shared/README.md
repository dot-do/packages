---
name: "@mdxui/shared"
version: 1.0.2
description: Shared components, layouts, and utilities for MDXUI
license: MIT
repository: "https://github.com/ai-primitives/mdxui"
homepage: "https://github.com/ai-primitives/mdxui#readme"
keywords:
  - mdx
  - react
  - components
  - layouts
  - utilities
downloads:
  monthly: 10
published: "2024-12-24T13:33:55.887Z"
updated: "2024-12-27T17:38:56.050Z"
---

# @mdxui/shared

Shared components, layouts, libraries, hooks, configurations and utilities for MDXUI.

## Installation

```bash
pnpm add @mdxui/shared
```

## Features

- Common React components and layouts
- Shared hooks for data fetching and state management
- Configuration utilities
- Theme management
- Common utilities for MDX processing
- Shared TypeScript configurations

## Usage

```typescript
import { 
  useTheme, 
  Layout, 
  Container, 
  MDXProvider 
} from '@mdxui/shared'

function App({ children }) {
  const { theme, setTheme } = useTheme()
  
  return (
    <Layout>
      <Container>
        <MDXProvider>
          {children}
        </MDXProvider>
      </Container>
    </Layout>
  )
}
```

## Components

- `Layout` - Base layout component
- `Container` - Responsive container
- `MDXProvider` - MDX context provider
- `ThemeProvider` - Theme context provider
- And more...

## Hooks

- `useTheme` - Theme management
- `useMDX` - MDX utilities
- `useConfig` - Configuration management

## Related Packages

- `@mdxui/types` - TypeScript type definitions
- `@mdxui/shadcn` - shadcn/ui components
- `@mdxui/tremor` - Tremor chart components

## License

MIT © 2024 [Drivly](https://driv.ly) 