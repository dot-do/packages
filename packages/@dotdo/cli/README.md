---
name: "@dotdo/cli"
version: 0.2.5
description: Unified CLI module with syntax highlighting, output formatting, auth, and RPC
license: MIT
repository: "https://github.com/dot-do/cli.do"
homepage: "https://cli.do"
keywords:
  - cli
  - terminal
  - syntax-highlighting
  - shiki
  - json5
  - formatter
  - spinner
  - progress
downloads:
  monthly: 57
published: "2026-01-23T18:26:43.483Z"
updated: "2026-01-26T16:01:44.659Z"
---

# @dotdo/cli

[![npm version](https://img.shields.io/npm/v/@dotdo/cli.svg)](https://www.npmjs.com/package/@dotdo/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unified CLI module with syntax highlighting and output formatting for terminal applications.

## What is @dotdo/cli?

**@dotdo/cli** is a comprehensive CLI utilities package that provides everything you need for beautiful terminal output:

- **Output Formatters** - JSON, JSON5, tables, and syntax-highlighted output
- **Syntax Highlighting** - Powered by [shiki](https://shiki.style/) for accurate, beautiful code highlighting
- **Spinners** - Customizable loading animations with multiple frame styles
- **Progress Bars** - Track progress with ETA estimation and multi-bar support

Built with TypeScript, lazy-loaded for performance, and designed for modern Node.js applications.

## Installation

```bash
# npm
npm install @dotdo/cli

# pnpm
pnpm add @dotdo/cli

# yarn
yarn add @dotdo/cli

# bun
bun add @dotdo/cli
```

## Quick Start

```typescript
import { cli, formatOutput, highlightJson, createSpinner, createProgress } from '@dotdo/cli'

// Format and print JSON with syntax highlighting
const data = { name: '@dotdo/cli', version: '0.1.0' }
await cli.print(data, 'highlighted')

// Show a loading spinner
const spinner = createSpinner({ text: 'Loading...' }).start()
await doSomething()
spinner.succeed('Done!')

// Track progress
const progress = createProgress({ total: 100 }).start()
for (let i = 0; i <= 100; i++) {
  progress.update(i)
}
progress.complete()
```

## Usage Examples

### Output Formatting Examples

Format your data in multiple styles with a single function call:

```typescript
import { formatOutput, formatOutputSync } from '@dotdo/cli'

// Sample data
const user = {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.com',
  roles: ['admin', 'developer'],
  active: true,
  metadata: {
    lastLogin: '2024-01-15T10:30:00Z',
    loginCount: 42
  }
}

// JSON format (default) - standard JSON output
const jsonOutput = await formatOutput(user, 'json')
console.log(jsonOutput)
// Output:
// {
//   "id": 1,
//   "name": "Alice Johnson",
//   "email": "alice@example.com",
//   "roles": [
//     "admin",
//     "developer"
//   ],
//   "active": true,
//   "metadata": {
//     "lastLogin": "2024-01-15T10:30:00Z",
//     "loginCount": 42
//   }
// }

// JSON5 format - cleaner, no quotes on keys
const json5Output = await formatOutput(user, 'json5')
console.log(json5Output)
// Output:
// {
//   id: 1,
//   name: 'Alice Johnson',
//   email: 'alice@example.com',
//   roles: [
//     'admin',
//     'developer',
//   ],
//   active: true,
//   metadata: {
//     lastLogin: '2024-01-15T10:30:00Z',
//     loginCount: 42,
//   },
// }

// Table format - great for arrays of objects
const users = [
  { name: 'Alice', role: 'Admin', status: 'active' },
  { name: 'Bob', role: 'Developer', status: 'active' },
  { name: 'Charlie', role: 'Designer', status: 'inactive' }
]
const tableOutput = await formatOutput(users, 'table')
console.log(tableOutput)
// Output:
// +----------+-----------+----------+
// |   name   |   role    |  status  |
// +----------+-----------+----------+
// | Alice    | Admin     | active   |
// | Bob      | Developer | active   |
// | Charlie  | Designer  | inactive |
// +----------+-----------+----------+

// Highlighted format - syntax-highlighted JSON for terminal
const highlightedOutput = await formatOutput(user, 'highlighted')
console.log(highlightedOutput)
// Output: JSON with ANSI color codes for terminal display

// Raw format - pass-through for strings, JSON.stringify for objects
const rawOutput = await formatOutput('Hello, World!', 'raw')
console.log(rawOutput)
// Output: Hello, World!

// Synchronous formatting (excludes 'highlighted')
const syncJson = formatOutputSync(user, 'json')
const syncTable = formatOutputSync(users, 'table')
```

### Custom Indentation and Configuration

```typescript
import { formatOutput } from '@dotdo/cli'

const data = { name: 'test', value: 123 }

// Custom indentation (4 spaces)
const output = await formatOutput(data, 'json', { indent: 4 })
console.log(output)
// Output:
// {
//     "name": "test",
//     "value": 123
// }

// Maximum width for tables
const users = [
  { name: 'Alice', description: 'A very long description that might need truncation' }
]
const tableOutput = await formatOutput(users, 'table', { maxWidth: 50 })
```

### JSON5 Formatting Examples

JSON5 provides a cleaner, more human-readable format:

```typescript
import { formatJson5, parseJson5, stringifyJson5 } from '@dotdo/cli'

// Format data as JSON5
const config = {
  appName: 'my-app',
  port: 3000,
  debug: true,
  'special-key': 'value with special key',
  features: ['auth', 'api', 'websockets'],
  database: {
    host: 'localhost',
    port: 5432
  }
}

const json5 = formatJson5(config)
console.log(json5)
// Output:
// {
//   appName: 'my-app',
//   port: 3000,
//   debug: true,
//   'special-key': 'value with special key',
//   features: [
//     'auth',
//     'api',
//     'websockets',
//   ],
//   database: {
//     host: 'localhost',
//     port: 5432,
//   },
// }

// Parse JSON5 (supports comments and trailing commas)
const parsed = parseJson5(`{
  // This is a comment
  name: 'test',
  value: 42,  // trailing comma allowed
}`)
console.log(parsed) // { name: 'test', value: 42 }

// Stringify with custom indentation
const stringified = stringifyJson5({ foo: 'bar' }, 4)
```

### Syntax Highlighting Examples

Beautiful syntax highlighting for terminal output:

```typescript
import {
  highlight,
  highlightJson,
  highlightSql,
  highlightTypeScript,
  highlightJavaScript,
  highlightToHtml
} from '@dotdo/cli'

// Highlight JSON data
const data = { users: [{ id: 1, name: 'Alice' }], total: 1 }
const highlightedJson = await highlightJson(data)
console.log(highlightedJson)
// Output: Colorized JSON in terminal

// Highlight SQL queries
const sql = `
SELECT u.id, u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true
  AND u.created_at > '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 10;
`
const highlightedSql = await highlightSql(sql)
console.log(highlightedSql)

// Highlight TypeScript code
const tsCode = `
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}

const user = await fetchUser(1);
console.log(user.name);
`
const highlightedTs = await highlightTypeScript(tsCode)
console.log(highlightedTs)

// Highlight JavaScript code
const jsCode = `
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
`
const highlightedJs = await highlightJavaScript(jsCode)
console.log(highlightedJs)

// Highlight any supported language
const highlighted = await highlight('SELECT * FROM users', 'sql', 'github-dark')
console.log(highlighted)

// Different themes
const lightTheme = await highlight('const x = 1', 'typescript', 'github-light')
const darkTheme = await highlight('const x = 1', 'typescript', 'github-dark')
const oneDark = await highlight('const x = 1', 'typescript', 'one-dark-pro')

// Generate HTML output for web
const html = await highlightToHtml(`
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
`, 'typescript', 'github-dark')
// Use in web pages or documentation
```

### Spinner Examples

Display animated loading spinners:

```typescript
import { createSpinner, startSpinner, withSpinner, spinnerFrames } from '@dotdo/cli'

// Basic spinner
const spinner = createSpinner({ text: 'Loading data...' })
spinner.start()
// ... do async work
spinner.succeed('Data loaded successfully!')

// Quick start with default options
const quickSpinner = startSpinner('Processing files...')
// ... do work
quickSpinner.stop('Done!')

// Different completion states
const taskSpinner = createSpinner({ text: 'Running task...' }).start()
// Success
taskSpinner.succeed('Task completed!')
// Or failure
// taskSpinner.fail('Task failed!')
// Or warning
// taskSpinner.warn('Task completed with warnings')
// Or info
// taskSpinner.info('Task information')

// Update text while spinning
const progressSpinner = createSpinner({ text: 'Step 1 of 3...' }).start()
await step1()
progressSpinner.setText('Step 2 of 3...')
await step2()
progressSpinner.setText('Step 3 of 3...')
await step3()
progressSpinner.succeed('All steps completed!')

// Different spinner frame styles
const dotsSpinner = createSpinner({
  text: 'Dots style...',
  frames: spinnerFrames.dots  // Default
}).start()

const lineSpinner = createSpinner({
  text: 'Line style...',
  frames: spinnerFrames.line  // -\|/
}).start()

const circleSpinner = createSpinner({
  text: 'Circle style...',
  frames: spinnerFrames.circle
}).start()

const arrowSpinner = createSpinner({
  text: 'Arrow style...',
  frames: spinnerFrames.arrow
}).start()

const bounceSpinner = createSpinner({
  text: 'Bounce style...',
  frames: spinnerFrames.bounce
}).start()

const arcSpinner = createSpinner({
  text: 'Arc style...',
  frames: spinnerFrames.arc
}).start()

const barSpinner = createSpinner({
  text: 'Bouncing bar style...',
  frames: spinnerFrames.bouncingBar
}).start()

// Customize colors
const coloredSpinner = createSpinner({
  text: 'Colored spinner',
  color: 'green'  // cyan, green, yellow, red, blue, magenta, white, gray
}).start()

// Custom interval (speed)
const fastSpinner = createSpinner({
  text: 'Fast spinner',
  interval: 50  // milliseconds between frames
}).start()

// Wrap async function with automatic spinner
const result = await withSpinner(
  async () => {
    // Your async operation
    const data = await fetchData()
    return data
  },
  {
    text: 'Fetching data...',
    successText: 'Data fetched successfully!',
    failText: 'Failed to fetch data'
  }
)
// Spinner automatically succeeds or fails based on the promise
```

### Progress Bar Examples

Track progress with visual feedback:

```typescript
import { createProgress, startProgress, withProgress, MultiProgress } from '@dotdo/cli'

// Basic progress bar
const progress = createProgress({ total: 100 })
progress.start()
for (let i = 0; i <= 100; i += 10) {
  progress.update(i)
  await sleep(100)
}
progress.complete('Download complete!')

// Quick start
const quickProgress = startProgress(50)
for (let i = 0; i <= 50; i++) {
  quickProgress.increment()
  await sleep(50)
}
quickProgress.complete()

// Custom appearance
const customProgress = createProgress({
  total: 100,
  width: 50,           // Bar width in characters
  showPercent: true,   // Show percentage
  showEta: true,       // Show estimated time remaining
  fill: '#',           // Character for filled portion
  empty: '-'           // Character for empty portion
})
customProgress.start()

// Increment by custom amount
const downloadProgress = createProgress({ total: 1000 }).start()
downloadProgress.increment(100)  // +100
downloadProgress.increment(250)  // +250
downloadProgress.update(500)     // Set to 500 directly

// Process items with automatic progress tracking
const files = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt']
await withProgress(files, async (file, index) => {
  console.log(`Processing ${file}...`)
  await processFile(file)
  // Progress automatically increments after each item
})

// Multiple progress bars for concurrent tasks
const multi = new MultiProgress()

const downloadBar = multi.add('download', { total: 100 })
const processBar = multi.add('process', { total: 50 })

downloadBar.start()
processBar.start()

// Update independently
downloadBar.update(25)   // Download at 25%
processBar.update(10)    // Processing at 20%

downloadBar.update(50)
processBar.update(25)

downloadBar.complete()
processBar.complete()

multi.stop()

// Real-world example: File download simulation
async function downloadFiles(urls: string[]) {
  const progress = createProgress({
    total: urls.length,
    showEta: true
  }).start(0)

  for (const url of urls) {
    await downloadFile(url)
    progress.increment()
  }

  progress.complete(`Downloaded ${urls.length} files`)
}
```

### CLI Helper Object Examples

All utilities available through a convenient unified interface:

```typescript
import cli from '@dotdo/cli'

// Format data
const jsonOutput = await cli.format({ key: 'value' }, 'json')
const tableOutput = await cli.format(users, 'table')
const json5Output = await cli.format(config, 'json5')

// Highlight code
const highlightedSql = await cli.highlight('SELECT * FROM users', 'sql')
const highlightedTs = await cli.highlight('const x: number = 1', 'typescript')

// Create and use spinner
const spinner = cli.spinner({ text: 'Working...' })
spinner.start()
await doWork()
spinner.succeed('Complete!')

// Create and use progress bar
const progress = cli.progress({ total: 100 })
progress.start()
progress.update(50)
progress.complete()

// Print formatted output directly to stdout
await cli.print({ message: 'Hello' }, 'json')
await cli.print({ message: 'Hello' }, 'highlighted')

// Print highlighted code directly
await cli.printHighlighted('SELECT * FROM users', 'sql')
await cli.printHighlighted('const x = 1', 'typescript', 'github-light')
```

### Real-World CLI Application Example

A complete example showing how to build a CLI tool:

```typescript
import {
  cli,
  createSpinner,
  createProgress,
  formatOutput,
  highlightJson,
  highlightSql
} from '@dotdo/cli'

async function main() {
  // 1. Show loading spinner while fetching data
  const spinner = createSpinner({ text: 'Connecting to database...' }).start()

  try {
    await connectToDatabase()
    spinner.succeed('Connected to database')
  } catch (error) {
    spinner.fail('Failed to connect to database')
    process.exit(1)
  }

  // 2. Display the query being executed
  const query = `
    SELECT id, name, email, created_at
    FROM users
    WHERE active = true
    ORDER BY created_at DESC
    LIMIT 10
  `
  console.log('\nExecuting query:')
  console.log(await highlightSql(query))

  // 3. Show progress while processing results
  const users = await fetchUsers()
  const progress = createProgress({ total: users.length }).start()

  const processedUsers = []
  for (const user of users) {
    const processed = await processUser(user)
    processedUsers.push(processed)
    progress.increment()
  }
  progress.complete('Processing complete!')

  // 4. Display results in different formats
  console.log('\n--- JSON Output ---')
  console.log(await formatOutput(processedUsers, 'json'))

  console.log('\n--- Table Output ---')
  console.log(await formatOutput(processedUsers, 'table'))

  console.log('\n--- Highlighted JSON ---')
  console.log(await highlightJson(processedUsers))

  console.log('\n--- JSON5 Output ---')
  console.log(await formatOutput(processedUsers, 'json5'))
}

main().catch(console.error)
```

## Features

### Output Formatting

Format data in multiple output styles:

```typescript
import { formatOutput, formatOutputSync } from '@dotdo/cli'

const data = { name: 'John', age: 30, active: true }

// JSON output
const json = await formatOutput(data, 'json')
// {"name": "John", "age": 30, "active": true}

// JSON5 output (cleaner, no quotes on keys)
const json5 = await formatOutput(data, 'json5')
// {name: 'John', age: 30, active: true}

// Table output
const users = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'User' }
]
const table = await formatOutput(users, 'table')
// +-------+-------+
// | name  | role  |
// +-------+-------+
// | Alice | Admin |
// | Bob   | User  |
// +-------+-------+

// Highlighted JSON (with syntax colors)
const highlighted = await formatOutput(data, 'highlighted')
```

**Available formats:** `json`, `json5`, `table`, `highlighted`, `raw`

### Syntax Highlighting

Syntax highlighting powered by shiki with terminal ANSI colors:

```typescript
import {
  highlight,
  highlightJson,
  highlightSql,
  highlightTypeScript,
  highlightJavaScript,
  highlightToHtml
} from '@dotdo/cli'

// Highlight any supported language
const highlighted = await highlight('SELECT * FROM users', 'sql')
console.log(highlighted)

// Convenience functions for common languages
const jsonOutput = await highlightJson({ foo: 'bar' })
const sqlOutput = await highlightSql('SELECT id, name FROM users WHERE active = true')
const tsOutput = await highlightTypeScript('const x: number = 42')
const jsOutput = await highlightJavaScript('const x = 42')

// Generate HTML output (for web)
const html = await highlightToHtml('const x = 1', 'typescript', 'github-dark')
```

**Supported languages:** `json`, `sql`, `typescript` (or `ts`), `javascript` (or `js`)

**Available themes:** `github-dark`, `github-light`, `one-dark-pro`

### Spinners

Display animated loading spinners with customizable styles:

```typescript
import { createSpinner, startSpinner, withSpinner, spinnerFrames } from '@dotdo/cli'

// Create and control a spinner
const spinner = createSpinner({
  text: 'Loading...',
  frames: spinnerFrames.dots,  // dots, line, circle, arrow, bounce, arc, bouncingBar
  interval: 80,
  color: 'cyan'  // cyan, green, yellow, red, blue, magenta, white, gray
})

spinner.start()
spinner.setText('Still loading...')
spinner.succeed('Completed!')  // or .fail(), .warn(), .info()

// Start a spinner in one call
const s = startSpinner('Processing...')

// Wrap an async function with a spinner
const result = await withSpinner(
  async () => {
    await doAsyncWork()
    return 'result'
  },
  {
    text: 'Working...',
    successText: 'Done!',
    failText: 'Failed!'
  }
)
```

**Spinner frame styles:**
- `dots` - Classic dot animation (default)
- `line` - Simple line rotation
- `circle` - Circle segments
- `arrow` - Rotating arrows
- `bounce` - Bouncing dot
- `arc` - Arc segments
- `bouncingBar` - Bouncing bar animation

### Progress Bars

Track progress with visual feedback and ETA:

```typescript
import { createProgress, startProgress, withProgress, MultiProgress } from '@dotdo/cli'

// Create and control a progress bar
const progress = createProgress({
  total: 100,
  width: 40,
  showPercent: true,
  showEta: true,
  fill: '\u2588',   // Filled character
  empty: '\u2591'   // Empty character
})

progress.start()
progress.update(50)      // Set to 50%
progress.increment(10)   // Add 10 to current value
progress.complete('All done!')

// Start progress in one call
const p = startProgress(100)

// Process items with automatic progress tracking
const items = [1, 2, 3, 4, 5]
await withProgress(items, async (item, index) => {
  await processItem(item)
})

// Multiple progress bars
const multi = new MultiProgress()
const bar1 = multi.add('download', { total: 100 })
const bar2 = multi.add('process', { total: 50 })

bar1.start()
bar2.start()

bar1.update(50)
bar2.update(25)

multi.stop()
```

## API Reference

### Output Functions

| Function | Description |
|----------|-------------|
| `formatOutput(data, format?, config?)` | Format data asynchronously |
| `formatOutputSync(data, format?, config?)` | Format data synchronously (no `highlighted`) |
| `registerFormatter(format, formatter)` | Register a custom formatter |

### Output Formatters

| Class | Description |
|-------|-------------|
| `JsonFormatter` | Standard JSON formatting |
| `Json5Formatter` | JSON5 formatting (cleaner output) |
| `TableFormatter` | ASCII table formatting |
| `HighlightedFormatter` | Syntax-highlighted JSON |

### JSON5 Functions

| Function | Description |
|----------|-------------|
| `formatJson5(data, config?)` | Format data as JSON5 |
| `parseJson5(text)` | Parse JSON5 string |
| `stringifyJson5(value, space?)` | Stringify to JSON5 |

### Highlighting Functions

| Function | Description |
|----------|-------------|
| `highlight(code, lang?, theme?)` | Highlight code for terminal |
| `highlightToHtml(code, lang?, theme?)` | Highlight code to HTML |
| `highlightJson(data, theme?)` | Highlight JSON data |
| `highlightSql(sql, theme?)` | Highlight SQL query |
| `highlightTypeScript(code, theme?)` | Highlight TypeScript |
| `highlightJavaScript(code, theme?)` | Highlight JavaScript |
| `preloadHighlighter(themes?, langs?)` | Preload shiki for faster first use |
| `disposeHighlighter()` | Dispose highlighter to free resources |

### Spinner Functions

| Function | Description |
|----------|-------------|
| `createSpinner(config?)` | Create a new spinner instance |
| `startSpinner(text?, config?)` | Create and start a spinner |
| `withSpinner(fn, options?)` | Run async function with spinner |

### Spinner Class Methods

| Method | Description |
|--------|-------------|
| `start(text?)` | Start the spinner |
| `stop(finalText?)` | Stop the spinner |
| `succeed(text?)` | Stop with success indicator |
| `fail(text?)` | Stop with failure indicator |
| `warn(text?)` | Stop with warning indicator |
| `info(text?)` | Stop with info indicator |
| `setText(text)` | Update spinner text |
| `setColor(color)` | Update spinner color |
| `setFrames(frames)` | Update spinner frames |

### Progress Functions

| Function | Description |
|----------|-------------|
| `createProgress(config)` | Create a new progress bar |
| `startProgress(total, config?)` | Create and start a progress bar |
| `withProgress(items, fn, options?)` | Process items with progress tracking |
| `createMultiProgress(stream?)` | Create a multi-progress manager |

### Progress Class Methods

| Method | Description |
|--------|-------------|
| `start(initialValue?)` | Start the progress bar |
| `update(value)` | Set progress value |
| `increment(amount?)` | Increment progress |
| `complete(message?)` | Complete and stop |
| `stop(message?)` | Stop the progress bar |

### Configuration Types

```typescript
interface OutputConfig {
  format?: 'json' | 'json5' | 'table' | 'highlighted' | 'raw'
  colors?: boolean
  indent?: number
  theme?: 'github-dark' | 'github-light' | 'one-dark-pro'
  maxWidth?: number
}

interface SpinnerConfig {
  text?: string
  frames?: string[]
  interval?: number
  color?: string
  stream?: NodeJS.WriteStream
}

interface ProgressConfig {
  total: number
  width?: number
  showPercent?: boolean
  showEta?: boolean
  fill?: string
  empty?: string
  stream?: NodeJS.WriteStream
}

interface TableConfig {
  columns?: TableColumn[]
  showHeader?: boolean
  border?: 'single' | 'double' | 'rounded' | 'none'
  padding?: number
}
```

## CLI Helper Object

For convenience, all utilities are also available through the `cli` object:

```typescript
import cli from '@dotdo/cli'

// Format data
const output = await cli.format(data, 'json5')

// Highlight code
const highlighted = await cli.highlight(code, 'typescript')

// Create spinner
const spinner = cli.spinner({ text: 'Loading...' })

// Create progress bar
const progress = cli.progress({ total: 100 })

// Print formatted output
await cli.print(data, 'highlighted')
await cli.printHighlighted(code, 'sql')
```

## REPL (TypeScript Evaluation)

The `/repl` export provides TypeScript REPL functionality with remote or local execution:

```typescript
import { startRepl, evalExpression, createRepl } from '@dotdo/cli/repl'

// Start an interactive REPL
await startRepl({ local: true })

// Or evaluate a single expression
const result = await evalExpression('1 + 2 * 3', { local: true })
console.log(result) // 7

// Or create a REPL service for more control
const repl = await createRepl({
  local: true,
  theme: 'github-dark',
  prelude: 'const utils = { sum: (a, b) => a + b }'
})
await repl.start()
```

### REPL Configuration

```typescript
interface ReplConfig {
  prompt?: string              // Prompt string (default: '> ')
  theme?: HighlightTheme       // Syntax highlighting theme
  local?: boolean              // Use Miniflare instead of remote
  auth?: string                // Auth token for remote execution
  prelude?: string             // Code to run before REPL starts
  sdk?: ReplSDKConfig | boolean // Enable platform primitives
  timeout?: number             // Eval timeout in ms
  highlightInput?: boolean     // Highlight input (default: true)
  highlightOutput?: boolean    // Highlight output (default: true)
}
```

### Remote vs Local Execution

- **Remote (default)**: Executes code on platform workers with full SDK access
- **Local (`--local`)**: Uses Miniflare for offline development

```typescript
// Remote execution (requires auth)
await startRepl({ auth: 'your-token' })

// Local execution (requires miniflare + ai-evaluate)
await startRepl({ local: true })
```

### Parse CLI Arguments

```typescript
import { parseReplArgs } from '@dotdo/cli/repl'

const { config, expression, interactive } = parseReplArgs([
  '--local',
  '--theme', 'github-light',
  '1 + 2'
])
// config = { local: true, theme: 'github-light' }
// expression = '1 + 2'
// interactive = false
```

### Requirements for Local Mode

```bash
npm install ai-evaluate miniflare esbuild
```

## License

MIT
