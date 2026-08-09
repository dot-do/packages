---
name: vscode-mdxld
version: 1.0.0
description: VS Code extension for MDX-LD with namespace browsing, schema validation, and AI-enriched editing
license: MIT
repository: "https://github.com/ai-primitives/vscode-mdxld"
homepage: "https://mdx.org.ai"
downloads:
  monthly: 6
published: "2024-12-21T09:57:02.147Z"
updated: "2024-12-21T09:57:02.336Z"
---

# vscode-mdxld

[![npm version](https://img.shields.io/npm/v/vscode-mdxld.svg)](https://www.npmjs.com/package/vscode-mdxld)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

VS Code extension for MDX-LD providing integrated support for Structured Data (YAML), Unstructured Content (markdown), Executable Code (JS/TS), and UI Components (JSX/React) with schema.org, gs1.org, and mdx.org.ai enrichment.

## Features

### Namespace Browser (Left Panel)

- URI-based namespace browsing for collections
- Support for HTTP and local file system via @mdxdb/fs, @mdxdb/fetch
- Hierarchical namespace visualization
- Collection metadata display
- Integration with @mdxdb/clickhouse for advanced storage

### MDX Editor (Right Panel)

- YAML frontmatter editing with schema validation
- Schema enforcement for typed documents ($type)
- Markdown/MDX content editing
- JavaScript/TypeScript import/export support
- JSX/React component integration
- Real-time syntax highlighting and validation

### Additional Views

- AST Visualization (via mdxld/ast)
  - JSON5 format for improved readability
  - Syntax highlighting
  - Collapsible tree view
- UI Component Preview
  - Support for exported layout/components
  - Integration with mdx.org.ai $context/$type specifications
  - Live preview with hot reload

## Installation

```bash
ext install ai-primitives.vscode-mdxld
```

## Usage

### YAML-LD Frontmatter

```yaml
$type: 'https://mdx.org.ai/Document'
$context: 'https://schema.org'
title: 'My Document'
description: 'A sample document'
author: 'John Doe'
```

### UI Components

```jsx
export const layout = {
  container: {
    maxWidth: '800px',
    margin: '0 auto'
  }
}

export const components = {
  Button: props => <button {...props} className='primary' />,
  Card: ({ title, children }) => (
    <div className='card'>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

# Welcome to My Document

<Card title='Getting Started'>
  Click the button below to begin.
  <Button>Start Now</Button>
</Card>
```

### AST Visualization

The AST view shows the document structure in JSON5 format for improved readability:

```json5
{
  type: 'root',
  children: [
    {
      type: 'yaml',
      value: {
        $type: 'https://mdx.org.ai/Document',
        title: 'My Document',
      },
    },
    {
      type: 'heading',
      depth: 1,
      children: [{ type: 'text', value: 'Welcome to My Document' }],
    },
    // Additional nodes...
  ],
}
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the package
pnpm build

# Lint the code
pnpm lint

# Format the code
pnpm format
```

## Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) to learn about our development process and how to propose bugfixes and improvements.

## License

MIT © [AI Primitives](https://mdx.org.ai)

## Dependencies

This extension uses the following key dependencies:

- mdxld: YAML-LD parsing and AST support
- @mdxdb/fs: Local file system support
- @mdxdb/fetch: HTTP/remote URI support
- @mdxdb/clickhouse: ClickHouse storage backend
- TypeScript for static typing
- ESLint for linting
- Prettier for code formatting
