---
name: "@mdxui/terminal"
version: 6.0.0
description: OpenTUI renderer for MDXUI primitives - build CLI dashboards with the same components as web
license: MIT
keywords:
  - mdxui
  - terminal
  - cli
  - tui
  - opentui
  - dashboard
downloads:
  monthly: 286
published: "2026-01-11T12:19:34.974Z"
updated: "2026-01-24T14:38:13.585Z"
---

# @mdxui/terminal

Universal UI renderer for MDXUI - same components render to terminal, web, and AI agents.

> **Alpha Status**: This package is under active development. Some features are experimental or incomplete. APIs may change.

**Multi-tier rendering**: Components output to TEXT, MARKDOWN, ASCII, UNICODE, ANSI, or Interactive based on context. AI agents get structured Markdown via MCP. Humans get rich TUIs. UX designers preview in Storybook.

## Installation

```bash
pnpm add @mdxui/terminal
```

## Quick Start

```tsx
import { CLI, Box, Text } from '@mdxui/terminal'

async function main() {
  const cli = await CLI()
  cli.render(
    <Box border="single">
      <Text color="cyan">Hello Terminal!</Text>
    </Box>
  )
}

main()
```

## Examples

The package includes complete example applications demonstrating real-world usage patterns. Run them directly or use as templates for your own CLI tools.

### Running Examples

```bash
# Navigate to the terminal package
cd packages/terminal

# Simple CLI - Basic components, styled text, system info
pnpm example:simple

# Interactive Menu - Multi-screen navigation, forms, VIM bindings
pnpm example:menu

# Dashboard - Metrics cards, data tables, useQuery/useMutation
pnpm example:dashboard
```

Or run directly with tsx:

```bash
npx tsx examples/simple-cli.tsx
npx tsx examples/interactive-menu.tsx
npx tsx examples/dashboard.tsx
```

### Example: Simple CLI

Basic terminal output with styled text, boxes, and system information:

```tsx
import { CLI, Box, Text, Badge, Panel, List } from '@mdxui/terminal'

async function main() {
  const cli = await CLI({ exitOnCtrlC: true, useAlternateScreen: true })

  cli.render(
    <Box flexDirection="column" gap={1}>
      <Box border="rounded" padding={1}>
        <Text bold color="cyan">Welcome to the Terminal!</Text>
      </Box>

      <Panel title="Status">
        <Badge variant="success">Online</Badge>
      </Panel>
    </Box>
  )
}

main()
```

### Example: Interactive Menu

Multi-screen navigation with keyboard controls and form inputs:

```tsx
import {
  CLI, Box, Text, Select, Input, Button, Panel,
  useKeyboard, useFocus, FocusProvider,
  VIM_BINDINGS, COMMON_BINDINGS,
} from '@mdxui/terminal'

function MainMenu({ onNavigate }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { isFocused } = useFocus({ autoFocus: true })

  useKeyboard({
    bindings: [...VIM_BINDINGS, ...COMMON_BINDINGS],
    onAction: (action) => {
      if (action === 'move-down') setSelectedIndex(i => i + 1)
      if (action === 'move-up') setSelectedIndex(i => i - 1)
      if (action === 'confirm') onNavigate(menuItems[selectedIndex].value)
    },
    enabled: isFocused,
  })

  return (
    <Panel title="Main Menu">
      <Select
        options={menuItems}
        highlightedIndex={selectedIndex}
        focused={isFocused}
      />
    </Panel>
  )
}
```

### Example: Dashboard with Data Binding

Full dashboard with metrics, tables, and reactive data using `useQuery`/`useMutation`:

```tsx
import {
  CLI, Box, Text, Table, Badge, Panel, Spinner,
  createDB, createCollection, DBProvider,
  useQuery, useMutation,
} from '@mdxui/terminal'
import { z } from 'zod'

// Define schema and collection
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
})

const usersCollection = createCollection({ name: 'users', schema: UserSchema })
const db = createDB({ collections: [usersCollection] })

// Data-bound component
function UserTable() {
  const { data, isLoading, refetch } = useQuery({ from: 'users' })
  const { mutate: deleteUser } = useMutation({
    collection: 'users',
    operation: 'delete',
  })

  if (isLoading) return <Spinner label="Loading..." />

  return (
    <Table
      data={data}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
      ]}
    />
  )
}

// App with provider
function App() {
  return (
    <DBProvider db={db}>
      <UserTable />
    </DBProvider>
  )
}
```

See the `examples/` directory for complete, runnable versions of each example.

## Architecture Overview

The terminal package implements a **UINode-based rendering architecture** that decouples component definitions from their output format. This enables the same semantic UI tree to render appropriately across different environments.

```
┌─────────────────────────────────────────────────────────────┐
│                    Input Sources                            │
├─────────────────────────────────────────────────────────────┤
│  JSX Components          │  JSON/API Responses              │
│  <Dashboard>             │  { type: 'dashboard', ... }      │
│    <Metrics />           │                                  │
│  </Dashboard>            │                                  │
└────────────┬─────────────┴──────────────┬───────────────────┘
             │                            │
             ▼                            ▼
     ┌───────────────┐            ┌───────────────┐
     │  compileJSX() │            │ parseUINode() │
     │  JSX Compiler │            │ JSON Parser   │
     └───────┬───────┘            └───────┬───────┘
             │                            │
             └────────────┬───────────────┘
                          ▼
              ┌───────────────────────┐
              │       UINode          │
              │  Universal UI Tree    │
              │  (type, props, data,  │
              │   children, key)      │
              └───────────┬───────────┘
                          │
    ┌─────────┬───────────┼───────────┬─────────┬─────────────┐
    ▼         ▼           ▼           ▼         ▼             ▼
┌───────┐ ┌───────┐ ┌─────────┐ ┌─────────┐ ┌──────┐ ┌─────────────┐
│ TEXT  │ │  MD   │ │  ASCII  │ │ UNICODE │ │ ANSI │ │ INTERACTIVE │
│Tier 1 │ │Tier 2 │ │ Tier 3  │ │ Tier 4  │ │Tier 5│ │   Tier 6    │
└───────┘ └───────┘ └─────────┘ └─────────┘ └──────┘ └─────────────┘
```

### Core Types

```typescript
// The universal UI tree node
interface UINode {
  type: string                    // Component type ('text', 'box', 'table', etc.)
  props: Record<string, unknown>  // Component configuration
  children?: UINode[]             // Nested components
  data?: unknown                  // Bound query data for data-driven components
  key?: string                    // React-style reconciliation key
}

// Rendering capability level
type RenderTier = 'text' | 'markdown' | 'ascii' | 'unicode' | 'ansi' | 'interactive'

// Context passed during rendering
interface RenderContext {
  tier: RenderTier
  width: number      // Terminal width in columns
  height: number     // Terminal height in rows
  depth: number      // Current nesting depth
  theme: ThemeTokens // Semantic color tokens
  interactive: boolean
}
```

## Package Exports

The package provides several entry points for different use cases:

| Entry Point | Description |
|-------------|-------------|
| `@mdxui/terminal` | Main entry - CLI API, components, hooks, compiler, parser |
| `@mdxui/terminal/renderers` | All tier renderers (text, markdown, ascii, unicode, ansi, interactive) |
| `@mdxui/terminal/data` | Data layer with TanStack DB-like API |
| `@mdxui/terminal/components` | Terminal UI components |
| `@mdxui/terminal/keyboard` | Keyboard and focus management |
| `@mdxui/terminal/theme` | Theme utilities and color support |
| `@mdxui/terminal/storybook` | Storybook integration helpers |

## The 6 Render Tiers

| Tier | Use Case | Capabilities | Example Output |
|------|----------|--------------|----------------|
| **text** | Logs, piping, CI | Plain text only | `Users: 1234, API Calls: 45K` |
| **markdown** | AI agents, MCP | Tables, links, formatting | `\| Users \| 1,234 \| +12% \|` |
| **ascii** | Legacy terminals | ASCII box drawing (`+`, `-`, `\|`) | `+------+-------+` |
| **unicode** | Modern terminals | Unicode box drawing | `┌──────┬───────┐` |
| **ansi** | Full terminal | Colors, bold, dim | Colored output with ANSI escapes |
| **interactive** | Human TUI | Keyboard, focus, real-time | Full interactive application |

### Using Renderers

Import renderers from the dedicated entry point:

```typescript
import {
  renderText,
  renderMarkdown,
  renderASCII,
  renderUnicode,
  renderANSI,
  createInteractiveRenderer
} from '@mdxui/terminal/renderers'

// Compile JSX to UINode tree
import { compileJSX } from '@mdxui/terminal'
const uiTree = compileJSX(<Dashboard metrics={data} />)

// Render to different tiers
const textOutput = renderText(uiTree)           // Tier 1: Plain text
const mdOutput = renderMarkdown(uiTree)         // Tier 2: Markdown
const asciiOutput = renderASCII(uiTree)         // Tier 3: ASCII art
const unicodeOutput = renderUnicode(uiTree)     // Tier 4: Unicode
const ansiOutput = renderANSI(uiTree)           // Tier 5: ANSI colors
// Tier 6: Interactive requires a renderer instance
```

## JSX Compiler

The compiler converts React JSX trees into UINode trees. It handles:

- Fragment flattening
- Null/undefined/boolean child filtering (React semantics)
- Key preservation for list reconciliation
- Deep tree support via iterative compilation

```typescript
import { compileJSX, compileJSXDeep } from '@mdxui/terminal'

// Standard compilation (recursive)
const node = compileJSX(
  <Box padding={2}>
    <Text bold>Hello</Text>
    <Text>World</Text>
  </Box>
)
// Result:
// {
//   type: 'Box',
//   props: { padding: 2 },
//   children: [
//     { type: 'Text', props: { bold: true }, children: ['Hello'] },
//     { type: 'Text', props: {}, children: ['World'] }
//   ]
// }

// For very deep trees (>1000 levels), use iterative version
const deepNode = compileJSXDeep(veryDeepElement)
```

## JSON Parser

Parse JSON strings or objects into validated UINode trees with Zod schemas.

```typescript
import { parseUINode, ParseError } from '@mdxui/terminal'

// Parse JSON string
const node = parseUINode('{"type":"text","props":{"content":"Hello"}}')

// Parse object (validates structure)
const node = parseUINode({
  type: 'table',
  props: { columns: [{ key: 'name', header: 'Name' }] },
  data: [{ name: 'Alice' }, { name: 'Bob' }]
})

// Handle validation errors
try {
  parseUINode({ props: {} }) // Missing 'type'
} catch (error) {
  if (error instanceof ParseError) {
    console.error('Invalid UINode:', error.message)
  }
}
```

## Renderer Examples

### Text Renderer (Tier 1)

Plain text output with no formatting. Ideal for logs, CI output, or piping.

```typescript
import { renderText } from '@mdxui/terminal/renderers'

const output = renderText({
  type: 'dashboard',
  props: { title: 'Metrics' },
  children: [
    { type: 'text', props: { content: 'Active Users: 1,234' } }
  ]
})
// Output:
// Metrics
//
// Active Users: 1,234
```

### Markdown Renderer (Tier 2)

Structured markdown for AI agents consuming via MCP. Tables, links, and formatting preserved.

```typescript
import { renderMarkdown } from '@mdxui/terminal/renderers'

const output = renderMarkdown({
  type: 'table',
  props: {
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'value', header: 'Value' }
    ],
    data: [
      { name: 'Users', value: '1,234' },
      { name: 'Revenue', value: '$45K' }
    ]
  }
})
// Output:
// | Name | Value |
// | --- | --- |
// | Users | 1,234 |
// | Revenue | $45K |
```

### ASCII Renderer (Tier 3)

Pure ASCII characters for maximum compatibility. No unicode, no ANSI codes.

```typescript
import { renderASCII } from '@mdxui/terminal/renderers'

const output = renderASCII({
  type: 'box',
  props: { border: 'single' },
  children: [{ type: 'text', props: { content: 'Hello' } }]
})
// Output:
// +-------+
// | Hello |
// +-------+
```

### Unicode Renderer (Tier 4)

Beautiful box-drawing characters for modern terminals. No colors.

```typescript
import { renderUnicode } from '@mdxui/terminal/renderers'

const output = renderUnicode({
  type: 'box',
  props: { border: 'rounded' },
  children: [{ type: 'text', props: { content: 'Hello' } }]
})
// Output:
// ╭───────╮
// │ Hello │
// ╰───────╯
```

### ANSI Renderer (Tier 5)

Full color support with 16, 256, or truecolor modes. Supports theming and color degradation.

```typescript
import { renderANSI } from '@mdxui/terminal/renderers'

const output = renderANSI(
  { type: 'text', props: { content: 'Error!', color: 'red', bold: true } },
  { colorSupport: 'truecolor', theme: 'dark' }
)
// Output: Bold red text with ANSI escape codes
```

### Interactive Renderer (Tier 6)

Full TUI with keyboard navigation, focus management, and real-time updates.

```typescript
import { createInteractiveRenderer } from '@mdxui/terminal/renderers'

const renderer = await createInteractiveRenderer({
  vimBindings: true,
  wrapFocus: true
})

// Register focusable elements
renderer.registerFocusable('btn-1', { tabIndex: 0, onActivate: handleClick })

// Handle keyboard input
renderer.onKeyPress('enter', () => console.log('Pressed!'))

// Start the TUI
renderer.start()
```

## Supported Components

### Primitives

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `text` | Styled text | `content`, `bold`, `italic`, `color` |
| `box` | Container with borders | `border`, `padding`, `width`, `height` |
| `list` | Bullet or numbered list | `items`, `numbered`, `bullet` |
| `table` | Data table | `columns`, `data`, `headers`, `rows` |
| `code` | Code block | `code`, `language` |
| `link` | Hyperlink | `text`, `href` |
| `button` | Interactive button | `label`, `hotkey`, `action` |

### Layout

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `panel` | Titled panel | `title`, `collapsible`, `collapsed` |
| `card` | Content card | `title`, `border` |
| `sidebar` | Navigation sidebar | `nav`, `sections` |
| `breadcrumb` | Navigation path | `items`, `separator` |
| `dialog` | Modal dialog | `open`, `title`, `actions` |

### Data Display

| Component | Description | Key Props |
|-----------|-------------|-----------|
| `metrics` | Metric cards | `metrics: [{ label, value, trend }]` |
| `badge` | Status badge | `variant`, `children` |
| `progress` | Progress bar | `value`, `max`, `width` |
| `spinner` | Loading indicator | `label`, `frame` |

### Page Templates

| Component | Description |
|-----------|-------------|
| `dashboard` | Dashboard with metrics and panels |
| `settings` | Settings page with sections |
| `hero` | Landing page hero section |
| `features` | Feature showcase |
| `pricing` | Pricing tiers |
| `faq` | FAQ accordion |
| `footer` | Page footer |

## Data Layer

The data layer provides reactive data management with offline support, available via `@mdxui/terminal/data`.

```typescript
import {
  createDB,
  createCollection,
  createDOSync,
  DBProvider,
  useQuery,
  useMutation
} from '@mdxui/terminal/data'
import { z } from 'zod'

// Define schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest'])
})

// Create collection
const usersCollection = createCollection({
  name: 'users',
  schema: UserSchema
})

// Create database with Durable Objects sync
const db = createDB({
  collections: [usersCollection],
  sync: createDOSync({
    namespaceUrl: 'https://api.example.com.ai/do/workspace',
    reconnect: { enabled: true, maxAttempts: 10 }
  })
})

// Use in React components
function UserList() {
  const { data, isLoading } = useQuery({
    from: 'users',
    where: { role: 'admin' }
  })

  const { mutate } = useMutation({
    collection: 'users',
    operation: 'insert'
  })

  if (isLoading) return <Spinner label="Loading users..." />

  return (
    <Table
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' }
      ]}
      data={data}
    />
  )
}
```

### Built-in SaaS Collections

Pre-defined schemas for common SaaS patterns:

```typescript
import {
  UsersCollection,
  APIKeysCollection,
  WebhooksCollection,
  TeamsCollection,
  UsageCollection
} from '@mdxui/terminal/data'

const db = createDB({
  collections: [
    UsersCollection(),
    APIKeysCollection(),
    WebhooksCollection(),
    TeamsCollection(),
    UsageCollection()
  ]
})
```

### Sync Adapter Features

The `createDOSync` adapter provides:

- **WebSocket connection management** with automatic reconnection
- **Exponential backoff** with jitter to prevent thundering herd
- **Offline mutation queue** - changes are queued when offline and synced on reconnect
- **Connection state observable** for UI feedback
- **Conflict resolution strategies** - server-wins, client-wins, merge, throw, or custom

```typescript
const sync = createDOSync({
  namespaceUrl: 'https://api.example.com.ai/do/workspace',
  authToken: 'jwt-token',
  reconnect: {
    enabled: true,
    maxAttempts: 10,
    initialDelay: 1000,
    maxDelay: 30000
  },
  conflictResolution: 'server-wins',
  requestTimeout: 10000
})

// Monitor connection state
sync.onConnectionStateChange((state) => {
  // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
  updateStatusIndicator(state)
})

// Check pending changes
const { count, oldestAt } = sync.getQueueStats()
if (count > 0) {
  showPendingBanner(`${count} changes pending`)
}
```

## Terminal Hooks

| Hook | Status | Description |
|------|--------|-------------|
| `useTerminalSize` | Implemented | Returns terminal dimensions (uses @opentui/react with fallbacks) |
| `useTerminal` | Implemented | Returns terminal context including dimensions and color support |
| `useFocus` | Implemented | Focus management via `@mdxui/terminal/keyboard` |
| `useTheme` | Implemented | Access current theme and colors |
| `useKeyboard` | Implemented | Low-level keyboard event handling |
| `createKeyboardManager` | Implemented | Create keyboard managers with presets (VIM_BINDINGS, COMMON_BINDINGS) |

## API Reference

### Compiler

```typescript
// Compile JSX to UINode (recursive)
function compileJSX(element: React.ReactElement): UINode

// Compile JSX to UINode (iterative, for deep trees)
function compileJSXDeep(element: React.ReactElement): UINode
```

### Parser

```typescript
// Parse JSON string or object to UINode
function parseUINode(input: string | unknown): UINode

// Parse JSON string only
function parseUINodeFromJSON(json: string): UINode

// Error class for parse failures
class ParseError extends Error {}
```

### Renderers (from `@mdxui/terminal/renderers`)

```typescript
// Text tier
function renderText(node: UINode, options?: TextRenderOptions): string

// Markdown tier
function renderMarkdown(node: UINode, options?: MarkdownRenderOptions): string

// ASCII tier
function renderASCII(node: UINode, context?: RenderContext): string

// Unicode tier
function renderUnicode(node: UINode, context?: RenderContext): string

// ANSI tier
function renderANSI(node: UINode, options?: ANSIRenderOptions): string

// Interactive tier
function createInteractiveRenderer(config?: InteractiveRendererConfig): Promise<InteractiveRenderer>
```

### Zod Schemas

```typescript
import { UINodeSchema, RenderTierSchema, ThemeTokensSchema, RenderContextSchema } from '@mdxui/terminal'

// Validate a UINode
const result = UINodeSchema.safeParse(data)
if (result.success) {
  const node: UINode = result.data
}
```

## License

MIT
