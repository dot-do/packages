---
name: "@mdxui/widgets"
version: 6.1.0
description: Complex, interactive UI widgets for building applications.
license: MIT
downloads:
  monthly: 365
published: "2024-12-24T13:34:16.765Z"
updated: "2026-01-29T23:13:46.268Z"
---

# @mdxui/widgets

Complex, interactive UI widgets for building applications.

## Installation

```bash
pnpm add @mdxui/widgets
```

## Widgets

| Widget | Description | Import |
|--------|-------------|--------|
| **Calendar** | Event calendar with day/week/month views | `@mdxui/widgets/calendar` |
| **ChatBox** | AI chat interface with streaming support | `@mdxui/widgets/chatbox` |
| **Editor** | Rich text editors (Markdown, Code, WYSIWYG, Block, MDX, Email) | `@mdxui/widgets/editor` |
| **KanbanBoard** | Drag-and-drop kanban board | `@mdxui/widgets/kanban-board` |
| **LinkShortener** | URL shortening interface | `@mdxui/widgets/link-shortener` |
| **Onboarding** | Multi-step wizard with field components | `@mdxui/widgets/onboarding` |
| **SearchBox** | Command palette search (⌘K) | `@mdxui/widgets/searchbox` |
| **SecretsManager** | Environment variable/secrets management | `@mdxui/widgets/secrets-manager` |
| **SmartDateTimePicker** | Natural language date/time input | `@mdxui/widgets/smart-datetime-picker` |
| **SurveyBuilder** | Drag-and-drop survey/form builder | `@mdxui/widgets/survey-builder` |

## Usage

### Main Entry

Import everything from the main entry:

```tsx
import { ChatBox, Editor, Calendar, KanbanBoard } from '@mdxui/widgets'
import { SearchProvider, SearchPalette, SearchTrigger } from '@mdxui/widgets'
import { OnboardingWizard, BooleanField, TextInputField } from '@mdxui/widgets'
```

### Subpath Imports (Tree-Shaking)

For smaller bundles, use subpath imports:

```tsx
import { Calendar } from '@mdxui/widgets/calendar'
import { ChatBox } from '@mdxui/widgets/chatbox'
import { SearchProvider, SearchPalette, SearchTrigger } from '@mdxui/widgets/searchbox'
import { KanbanBoard } from '@mdxui/widgets/kanban-board'
```

### Editor Components

Individual editors can be imported directly:

```tsx
import { MarkdownEditor } from '@mdxui/widgets/editor/markdown'
import { CodeEditor } from '@mdxui/widgets/editor/code'
import { WYSIWYGEditor } from '@mdxui/widgets/editor/wysiwyg'
import { BlockEditor } from '@mdxui/widgets/editor/block'
import { MDXEditor } from '@mdxui/widgets/editor/mdx'
import { EmailBuilder } from '@mdxui/widgets/editor/email'
```

### Hooks

```tsx
import { useAutosave } from '@mdxui/widgets/hooks/use-autosave'
import { useMediaQuery } from '@mdxui/widgets/hooks/use-media-query'
import { useEditorLayout } from '@mdxui/widgets/hooks/use-editor-layout'
```

## Storybook

View live examples and documentation:

```bash
# From monorepo root
pnpm storybook
```

Then navigate to **Widgets** in the sidebar.

## Styles

Import the widget styles in your app:

```tsx
import '@mdxui/widgets/styles.css'
```
