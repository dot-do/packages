---
name: "@mdxui/zero"
version: 6.0.1
description: Zero Email components for mdxui - AI-powered email client UI
license: MIT
downloads:
  monthly: 131
published: "2026-01-24T14:38:23.846Z"
updated: "2026-02-12T20:57:14.387Z"
---

# @mdxui/zero

AI-powered email client components for mdxui. Provides a complete email application UI including mail lists, thread display, composition, and dashboard layouts.

## Installation

```bash
pnpm add @mdxui/zero
```

## Quick Start

```tsx
import { MailZeroPage } from '@mdxui/zero'

function App() {
  return (
    <MailZeroPage
      initialThreads={threads}
      initialFolders={folders}
      initialLabels={labels}
      user={{ name: 'John', email: 'john@example.com.ai' }}
    />
  )
}
```

## Package Structure

```
@mdxui/zero
├── /mail          # Core mail components
│   ├── MailList       # Thread list with selection
│   ├── MailItem       # Individual thread item
│   ├── ThreadDisplay  # Full thread view
│   └── MessageView    # Single message display
├── /compose       # Email composition
│   └── EmailComposer  # Full compose UI with toolbar
├── /dashboard     # Layout components
│   ├── MailShell      # Three-panel resizable layout
│   └── MailSidebar    # Folder/label navigation
├── /landing       # Landing page components
└── /pages         # Complete page compositions
    └── MailZeroPage   # Full email app with state
```

## Components

### MailZeroPage

Complete email application with internal state management. Use this for a full email experience.

```tsx
import { MailZeroPage } from '@mdxui/zero'

<MailZeroPage
  initialThreads={threads}
  initialFolders={folders}
  initialLabels={labels}
  initialFolderId="inbox"
  user={{ name: 'John Doe', email: 'john@example.com.ai' }}
/>
```

All interactions (reply, archive, delete, etc.) are handled internally. Check the browser console for action logs.

### MailShell

Three-panel resizable layout combining sidebar, mail list, and thread display. Use when you need custom state management.

```tsx
import { MailShell } from '@mdxui/zero/dashboard'

<MailShell
  // Sidebar props
  folders={folders}
  activeFolderId="inbox"
  onFolderClick={(folderId) => setActiveFolder(folderId)}

  // List props
  threads={threads}
  onThreadClick={(thread) => setActiveThread(thread)}

  // Thread display props
  activeThread={activeThread}
  onReply={(messageId) => openComposer({ replyTo: messageId })}
  onArchive={() => archiveThread(activeThread.id)}
/>
```

### MailList

Thread list with selection, virtualization, and keyboard navigation.

```tsx
import { MailList } from '@mdxui/zero/mail'

<MailList
  threads={threads}
  selectedIds={selectedIds}
  activeId={activeId}
  selectionMode="multiple"
  displayMode="comfortable"
  onThreadClick={(thread) => setActiveThread(thread)}
  onSelectionChange={(ids) => setSelectedIds(ids)}
/>
```

### ThreadDisplay

Full thread view with message list and actions.

```tsx
import { ThreadDisplay } from '@mdxui/zero/mail'

<ThreadDisplay
  thread={thread}
  onReply={(messageId) => openComposer({ replyTo: messageId })}
  onReplyAll={(messageId) => openComposer({ replyAllTo: messageId })}
  onForward={(messageId) => openComposer({ forward: messageId })}
  onSnooze={(isoDate) => snoozeThread(thread.id, isoDate)}
  onMove={(folderId) => moveThread(thread.id, folderId)}
  onLabel={(labelIds) => labelThread(thread.id, labelIds)}
/>
```

### EmailComposer

Rich email composition with toolbar, recipient input, and AI assistance.

```tsx
import { EmailComposer } from '@mdxui/zero/compose'

<EmailComposer
  mode="compose"
  initialDraft={{ to: [], subject: '', body: '' }}
  onSend={(draft) => sendEmail(draft)}
  onSaveDraft={(draft) => saveDraft(draft)}
  onDiscard={() => closeComposer()}
/>
```

## Callback Signatures

All callbacks receive appropriate context:

| Callback | Signature | Context |
|----------|-----------|---------|
| `onReply` | `(messageId: string) => void` | Reply to specific message |
| `onReplyAll` | `(messageId: string) => void` | Reply-all to specific message |
| `onForward` | `(messageId: string) => void` | Forward specific message |
| `onSnooze` | `(isoDate: string) => void` | Snooze until date |
| `onMove` | `(folderId: string) => void` | Move to folder |
| `onLabel` | `(labelIds: string[]) => void` | Toggle labels |
| `onThreadClick` | `(thread: Thread) => void` | Thread object |
| `onFolderClick` | `(folderId: string) => void` | Folder ID |

Thread-level actions (archive, delete, spam, star, print) are void callbacks - the parent tracks the active thread.

## Types

Types are defined in `mdxui` package:

```tsx
import type {
  MailThread as Thread,
  MailMessage as Message,
  Folder,
  MailLabel as Label,
  MailShellProps,
  ThreadDisplayProps,
  MailListProps,
} from 'mdxui'
```

## Development

```bash
# Type check
pnpm --filter @mdxui/zero typecheck

# Run Storybook
pnpm storybook

# Visual regression tests (requires Storybook running)
pnpm --filter @mdxui/zero test:visual

# Update visual baselines
pnpm --filter @mdxui/zero test:visual:update
```

## Current Limitations

This package currently provides **UI components only**. It lacks the full app infrastructure found in [Mail-0/Zero](https://github.com/Mail-0/Zero):

- No react-router integration
- No state management (jotai/react-query)
- No data layer / API integration
- No proper page routing

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the target architecture and implementation plan.

## Credits

Components ported from [Mail-0/Zero](https://github.com/Mail-0/Zero), an AI-powered email client.
