---
name: mdxai
version: 1.2.0
description: Zero-config CLI to recursively generate and update MDX structured data using MDXLD
license: MIT
repository: "https://github.com/ai-primitives/mdxai"
homepage: "https://mdx.org.ai"
keywords:
  - mdx
  - mdxld
  - cli
  - ai
  - linked-data
  - typescript
downloads:
  monthly: 50
published: "2024-12-14T16:26:08.986Z"
updated: "2024-12-27T21:43:01.170Z"
---

# mdxai

[![npm version](https://badge.fury.io/js/mdxai.svg)](https://www.npmjs.com/package/mdxai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Zero-config CLI to recursively generate and update MDX with frontmatter, structured data, and executable code, and JSX/React components.

## Features

- 🚀 Zero-config MDX generation and updates
- 📝 Support for schema.org and mdx.org.ai contexts & types
- 🔄 Recursive directory processing with concurrent execution
- 📊 Real-time progress streaming to terminal
- 🌐 Browser and edge runtime compatible
- ⚡️ CLI powered by fs/promises for Node.js environments

## Installation

Install globally:

```bash
npm install -g mdxai
```

Or use with npx:

```bash
npx mdxai hello-world write a blog post about the future of AI
```

## CLI Usage

Generate MDX content with real-time progress streaming:

```bash
# Basic usage
mdxai [options] <filepath> <prompt>
```

Options:

- `--max-tokens` - Maximum tokens for generation (default: no limit)
- `--model` - Model to use (default: gpt-4o-mini)

Examples:

```bash
# Generate a new blog post
mdxai blog/future-of-ai.mdx write a blog post about the future of AI

# Edit MDX content (.mdx extension is optional)
mdxai blog/future-of-ai add more real-world examples from recent news

# Specify a model
mdxai --model gpt-4o blog/future-of-ai add more real-world examples from recent news

```

The CLI provides real-time feedback and zero-config operation:

- Zero configuration needed - just specify the type and start generating
- Automatically detects and processes MDX files recursively
- Infers appropriate layouts and components based on schema type
- Handles YAML-LD frontmatter conversion automatically
- Streams AI-generated content to terminal as it's being generated
- Shows file processing progress with concurrent operations
- Creates .generated.mdx files alongside originals

### YAML-LD Frontmatter

MDX files can include MDX-LD/YAML-LD frontmatter:

```yaml
---
# Using $ prefix for MDX-LD properties
$id: https://example.com/my-example-article
$type: https://schema.org/Article
title: My Example Article
description: An example article
---
# My Example Article

This is an example article.
```
