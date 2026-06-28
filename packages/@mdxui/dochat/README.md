---
name: "@mdxui/dochat"
version: 3.0.1
description: AI chat components for MDXUI - build conversational AI experiences
license: MIT
downloads:
  monthly: 56
published: "2026-01-24T14:38:33.124Z"
updated: "2026-01-24T14:38:33.403Z"
---

# @mdxui/dochat

AI chat components for building conversational experiences with MDXUI.

## Installation

```bash
pnpm add @mdxui/dochat @mdxui/primitives
```

## Components

### Chatbot Components
- `PromptInput` - Composable chat input with attachments, model selector
- `Message` - User/assistant message display with markdown support
- `Conversation` - Thread container with auto-scroll
- `CodeBlock` - Syntax highlighted code with copy button
- `Reasoning` - Collapsible thinking/reasoning sections
- `Sources` - Expandable source citations
- `Suggestion` - Suggestion chips with horizontal scroll
- `Tool` - Tool call status indicators
- `Loader` - Typing/thinking indicators

## Usage

```tsx
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from '@mdxui/dochat/chatbot'

export function ChatInput() {
  return (
    <PromptInput onSubmit={(message) => console.log(message)}>
      <PromptInputBody>
        <PromptInputTextarea placeholder="Ask anything..." />
      </PromptInputBody>
      <PromptInputFooter>
        <div />
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  )
}
```
