# @dot-do/doc-tests

> Self-validating documentation framework - Write documentation that tests itself

## Overview

`@dot-do/doc-tests` is a testing framework that extracts executable code from markdown/MDX documentation and validates it using inline assertions. This ensures your documentation examples always work and stay up-to-date with your actual API.

## Features

- ✅ **Embed tests in documentation** - Use special comment syntax for assertions
- ✅ **Extract & run automatically** - Parse code blocks and generate Vitest tests
- ✅ **Mock runtime environment** - Sandbox with `ai()`, `db()`, `on()`, `send()`, `every()` methods
- ✅ **CI/CD integration** - Validate docs on every PR
- ✅ **Zero configuration** - Works out of the box with MDX

## Installation

```bash
pnpm add -D @dot-do/doc-tests
```

## Usage

### 1. Write Documentation with Assertions

````mdx
---
title: Database Operations
---

Create a new record:

```typescript
await db.loans.create({
  applicantId: 'turbo123',
  amount: 25000,
  term: 60,
  status: 'submitted'
})
// => { id: string, applicantId: 'turbo123', amount: 25000, term: 60, status: 'submitted' }
```

Query a record:

```typescript
const loan = await db.loans.get('turbo123')
// => loan.amount === 25000
// => loan.status === 'submitted'
```
````

### 2. Extract and Run Tests

```typescript
import { extractTests, runTests } from '@dot-do/doc-tests'

// Extract tests from MDX file
const tests = await extractTests('docs/database.mdx')

// Run tests with Vitest
await runTests(tests)
```

### 3. Integrate with Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { docTestPlugin } from '@dot-do/doc-tests/vitest'

export default defineConfig({
  plugins: [docTestPlugin()],
  test: {
    include: ['docs/**/*.mdx'],
  },
})
```

## Assertion Syntax

### Value Assertions

```typescript
const result = await ai.brainstormIdeas('startup ideas')
// => result.length > 0
// => Array.isArray(result)
```

### Object Shape Assertions

```typescript
await db.users.create({ name: 'John', email: 'john@example.com' })
// => { id: string, name: 'John', email: 'john@example.com', createdAt: Date }
```

### Multiple Assertions

```typescript
on('task.completed', async (data) => {
  return { success: true }
})
// => Handler registered
// => typeof handler === 'function'
```

### Custom Matchers

```typescript
const embedding = await ai.embed('hello world')
// => embedding.length === 768
// => embedding.every(n => typeof n === 'number')
```

## Mock Runtime

The framework provides a sandboxed runtime environment with mocked methods:

- `ai()` - AI template functions (returns predefined responses)
- `db()` - Database operations (in-memory storage)
- `on()` - Event handlers (captured and testable)
- `send()` - Event emission (tracks calls)
- `every()` - Scheduled tasks (captured, not executed)

### Customizing Mocks

```typescript
import { createRuntime } from '@dot-do/doc-tests'

const runtime = createRuntime({
  ai: {
    brainstormIdeas: async () => ['Idea 1', 'Idea 2', 'Idea 3']
  },
  db: {
    loans: {
      create: async (data) => ({ id: 'test-id', ...data })
    }
  }
})

await runTests(tests, { runtime })
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate Documentation

on: [push, pull_request]

jobs:
  doc-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm doc-tests
```

### Pre-commit Hook

```bash
# .husky/pre-commit
pnpm doc-tests
```

## API Reference

### `extractTests(file: string): Promise<TestBlock[]>`

Extract code blocks with assertions from markdown/MDX file.

### `runTests(tests: TestBlock[], options?: RunOptions): Promise<TestResults>`

Run extracted tests in sandboxed environment.

### `generateVitest(tests: TestBlock[]): string`

Generate Vitest test file from extracted code blocks.

### `createRuntime(mocks?: RuntimeMocks): Runtime`

Create sandboxed runtime environment with custom mocks.

## Configuration

Create `doc-tests.config.ts`:

```typescript
import { defineConfig } from '@dot-do/doc-tests'

export default defineConfig({
  include: ['docs/**/*.mdx'],
  exclude: ['docs/archive/**'],
  runtime: {
    ai: { /* custom AI mocks */ },
    db: { /* custom DB mocks */ }
  },
  timeout: 5000,
  parallel: true
})
```

## Examples

See `/docs/examples/` for complete examples:

- [AI Functions](/docs/examples/ai-functions.mdx)
- [Database Operations](/docs/examples/database.mdx)
- [Event Workflows](/docs/examples/workflows.mdx)
- [Custom Assertions](/docs/examples/custom-assertions.mdx)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT © dot-do
