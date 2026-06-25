---
name: dev.td
version: 0.0.1
description: CLI and SDK for programmatic Claude Code interaction
license: MIT
repository: "https://github.com/tdevs/.td"
homepage: "https://github.com/tdevs/.td/tree/main/packages/dev.td"
keywords:
  - claude
  - claude-code
  - rpc
  - sdk
  - cli
downloads:
  monthly: 16
published: "2026-01-05T16:56:10.823Z"
updated: "2026-01-05T16:56:10.995Z"
---

# dev.td

CLI and SDK for programmatic Claude Code interaction via RPC.

## Overview

`dev.td` provides a complete toolkit for interacting with Claude Code sessions programmatically. Whether you need to automate AI-powered code generation, integrate Claude Code into your development workflow, or build custom tooling, this package offers:

- **TypeScript SDK** - Create and manage Claude Code sessions via RPC with full type safety
- **Command-line interface** - Interact with sessions directly from your terminal
- **Server components** - Run an RPC server on Cloudflare Workers

## Features

### SDK

- Create remote or local Claude Code sessions
- Send prompts and receive structured outputs
- Real-time streaming via WebSocket or batch requests via HTTP
- Automatic reconnection handling
- Full TypeScript support with Zod schema validation

### CLI

- Start new sessions with custom configurations
- Connect to existing sessions
- Send prompts and view outputs
- Interactive mode for conversational workflows
- JSON output for scripting and automation

### Server

- Cloudflare Workers-ready RPC handler
- Session management with automatic cleanup
- WebSocket support for real-time streaming
- CORS configuration out of the box

## Installation

```bash
npm install dev.td
```

## Quick Start

### SDK Usage

```typescript
import { createSession, createLocalSession } from 'dev.td';

// Create a remote session via RPC
const client = await createSession('wss://api.example.com/rpc', {
  workingDirectory: '/path/to/project',
  model: 'claude-sonnet-4.5',
});

// Send a prompt and receive outputs
const outputs = await client.send('Create a new React component');
for (const output of outputs) {
  console.log(output.content);
}

// Close the connection when done
client.close();
```

### CLI Usage

```bash
# Start a new session
dev-td start --directory /path/to/project

# Start a session with an initial prompt
dev-td start "List all TypeScript files" --directory /path/to/project

# Send a prompt to an existing session
dev-td send session_abc123 "Create a new component"

# List all sessions
dev-td list
```

## SDK Reference

### `createSession(url, config, options?)`

Create a new Claude Code session on a remote server.

```typescript
const client = await createSession('wss://api.example.com/rpc', {
  workingDirectory: '/path/to/project',
  model: 'claude-sonnet-4.5',
  systemPrompt: 'You are a helpful coding assistant',
  allowedTools: ['Read', 'Write', 'Bash'],
  maxTokens: 4096,
  timeout: 60000,
});
```

**Returns:** `SessionClient`

### `connectSession(url, sessionId, options?)`

Connect to an existing Claude Code session.

```typescript
const client = await connectSession(
  'wss://api.example.com/rpc',
  'session_abc123'
);

const status = await client.status();
console.log('Session state:', status.state);
```

**Returns:** `SessionClient`

### `connectManager(url, options?)`

Connect to a session manager for managing multiple sessions.

```typescript
const manager = await connectManager('wss://api.example.com/rpc');

// List all sessions
const sessions = await manager.list();

// Create a new session
const client = await manager.create({
  workingDirectory: '/path/to/project',
});

// Connect to an existing session
const existingClient = await manager.connect('session_abc123');

// Destroy a session
await manager.destroy('session_abc123');

manager.close();
```

**Returns:** `ManagerClient`

### `createLocalSession(config)`

Create a local session without RPC (for testing or local use).

```typescript
const client = await createLocalSession({
  workingDirectory: process.cwd(),
  model: 'claude-sonnet-4.5',
});

const outputs = await client.send('List all TypeScript files');
console.log(outputs);
```

**Returns:** `SessionClient`

### SessionClient Interface

| Method | Description |
|--------|-------------|
| `send(prompt: string)` | Send a prompt and get outputs |
| `status()` | Get current session status |
| `cancel()` | Cancel the current operation |
| `context()` | Get session context (files, cwd, git info) |
| `close()` | Close the connection |

### ManagerClient Interface

| Method | Description |
|--------|-------------|
| `create(config)` | Create a new session |
| `connect(sessionId)` | Connect to an existing session |
| `list()` | List all sessions |
| `destroy(sessionId)` | Destroy a session |
| `close()` | Close the connection |

## CLI Commands

### Global Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url <url>` | RPC server URL | `ws://localhost:8787/rpc` |
| `--json` | Output as JSON | `false` |
| `--verbose` | Enable verbose output | `false` |

The URL can also be set via the `DEV_TD_URL` environment variable.

### `start [prompt]`

Start a new Claude Code session.

```bash
dev-td start [prompt] [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --directory <dir>` | Working directory | Current directory |
| `-m, --model <model>` | Model to use | `claude-sonnet-4.5` |
| `-s, --system <prompt>` | System prompt | - |
| `-t, --tools <tools>` | Comma-separated list of allowed tools | - |
| `--max-tokens <n>` | Maximum tokens | - |
| `-i, --interactive` | Start interactive mode after session creation | `false` |

**Examples:**

```bash
# Start a session in the current directory
dev-td start

# Start with an initial prompt
dev-td start "Analyze this codebase"

# Start in a specific directory with a custom model
dev-td start -d /path/to/project -m claude-opus-4.5

# Start in interactive mode
dev-td start -i
```

### `connect <sessionId>`

Connect to an existing session.

```bash
dev-td connect <sessionId> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --interactive` | Start interactive mode | `false` |

**Examples:**

```bash
# Connect to a session
dev-td connect session_abc123

# Connect and enter interactive mode
dev-td connect session_abc123 -i
```

### `send <sessionId> <prompt>`

Send a prompt to a session.

```bash
dev-td send <sessionId> <prompt> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-w, --wait` | Wait for completion and show all output | `false` |

**Examples:**

```bash
# Send a prompt
dev-td send session_abc123 "Create a new component"

# Send and wait for all output
dev-td send session_abc123 "Run the tests" --wait
```

### `status [sessionId]`

Get session status.

```bash
dev-td status [sessionId]
```

**Examples:**

```bash
# Get status of a specific session
dev-td status session_abc123

# Get status as JSON
dev-td status session_abc123 --json
```

### `list`

List all sessions.

```bash
dev-td list [options]
```

Alias: `ls`

| Option | Description | Default |
|--------|-------------|---------|
| `-a, --all` | Show all sessions including completed | `false` |

**Examples:**

```bash
# List active sessions
dev-td list

# List all sessions including completed
dev-td list --all

# List as JSON
dev-td list --json
```

## Server Setup

### Cloudflare Workers

Create an RPC handler for your Cloudflare Worker:

```typescript
// src/index.ts
import { createRpcHandler } from 'dev.td/server';

const handler = createRpcHandler({
  pathPrefix: '/rpc',
  cors: true,
  // IMPORTANT: CORS is restrictive by default (denies all origins).
  // You must explicitly configure allowed origins for cross-origin requests.
  corsConfig: {
    allowedOrigins: ['https://your-app.example.com'],
  },
});

export default {
  fetch: handler,
};
```

### Custom Session Manager

Use a custom session manager with specific options:

```typescript
import { createRpcHandler, createSessionManager } from 'dev.td/server';

const sessionManager = createSessionManager({
  maxSessions: 100,
  sessionTimeout: 3600000, // 1 hour
  cleanupInterval: 60000,  // 1 minute
  onSessionCreated: (session) => {
    console.log('Session created:', session.id);
  },
  onSessionDestroyed: (sessionId) => {
    console.log('Session destroyed:', sessionId);
  },
});

const handler = createRpcHandler({
  sessionManager,
});

export default {
  fetch: handler,
};
```

### RPC Handler Options

| Option | Description | Default |
|--------|-------------|---------|
| `sessionManager` | Custom SessionManager instance | Auto-created |
| `pathPrefix` | Path prefix for RPC endpoints | `/rpc` |
| `cors` | Enable CORS headers | `true` |
| `corsConfig` | CORS configuration (see below) | Restrictive defaults |

### CORS Configuration

CORS is **restrictive by default** - all cross-origin requests are denied until you explicitly configure allowed origins. This is a security best practice.

```typescript
const handler = createRpcHandler({
  corsConfig: {
    // Required: Specify allowed origins
    allowedOrigins: ['https://app.example.com', 'https://admin.example.com'],

    // Optional: Customize allowed methods (default: GET, POST, OPTIONS)
    allowedMethods: ['GET', 'POST', 'OPTIONS'],

    // Optional: Customize allowed headers (default: Content-Type, Authorization)
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],

    // Optional: Preflight cache duration in seconds (default: 86400 / 24 hours)
    maxAge: 86400,

    // Optional: Allow credentials like cookies (default: false)
    allowCredentials: false,
  },
});
```

| CORS Option | Description | Default |
|-------------|-------------|---------|
| `allowedOrigins` | Origins allowed to make cross-origin requests | `[]` (deny all) |
| `allowedMethods` | HTTP methods allowed for CORS requests | `['GET', 'POST', 'OPTIONS']` |
| `allowedHeaders` | Headers allowed in CORS requests | `['Content-Type', 'Authorization']` |
| `maxAge` | Preflight response cache duration (seconds) | `86400` (24 hours) |
| `allowCredentials` | Allow credentials in CORS requests | `false` |

**Security Note:** Using `allowedOrigins: ['*']` allows all origins and is NOT recommended for production. Always specify explicit origins.

### Session Manager Options

| Option | Description | Default |
|--------|-------------|---------|
| `maxSessions` | Maximum concurrent sessions | `100` |
| `sessionTimeout` | Session timeout in ms (0 = no timeout) | `3600000` (1 hour) |
| `cleanupInterval` | Cleanup interval in ms | `60000` (1 minute) |
| `onSessionCreated` | Callback when session is created | - |
| `onSessionDestroyed` | Callback when session is destroyed | - |

## Configuration

### SessionConfig

Configuration options when creating a session:

```typescript
interface SessionConfig {
  // Required: Working directory for the session
  workingDirectory: string;

  // Model to use (default: 'claude-sonnet-4.5')
  model?: 'claude-sonnet-4.5' | 'claude-opus-4.5';

  // Custom system prompt
  systemPrompt?: string;

  // List of allowed tools (e.g., ['Read', 'Write', 'Bash'])
  allowedTools?: string[];

  // Maximum tokens for responses
  maxTokens?: number;

  // Timeout for operations in milliseconds
  timeout?: number;
}
```

### ClientOptions

Options for SDK client connections:

```typescript
interface ClientOptions {
  // Connection type: 'websocket' for streaming, 'http' for batch
  transport?: 'websocket' | 'http';

  // Connection timeout in milliseconds (default: 30000)
  timeout?: number;

  // Auto-reconnect on connection loss (WebSocket only, default: true)
  autoReconnect?: boolean;

  // Maximum reconnection attempts (default: 5)
  maxReconnectAttempts?: number;
}
```

## Error Handling

The SDK provides typed error classes for common error scenarios:

### SessionError

Base error class for all session-related errors.

```typescript
import { SessionError } from 'dev.td';

try {
  await client.send('prompt');
} catch (error) {
  if (error instanceof SessionError) {
    console.error('Session error:', error.message);
    console.error('Error code:', error.code);
    console.error('Session ID:', error.sessionId);
  }
}
```

### SessionNotFoundError

Thrown when attempting to access a session that does not exist.

```typescript
import { SessionNotFoundError } from 'dev.td';

try {
  await connectSession(url, 'invalid_session_id');
} catch (error) {
  if (error instanceof SessionNotFoundError) {
    console.error('Session not found:', error.sessionId);
  }
}
```

### SessionTimeoutError

Thrown when an operation exceeds the configured timeout.

```typescript
import { SessionTimeoutError } from 'dev.td';

try {
  await client.send('long running task');
} catch (error) {
  if (error instanceof SessionTimeoutError) {
    console.error('Operation timed out after', error.message);
  }
}
```

### SessionCancelledError

Thrown when a session operation is cancelled.

```typescript
import { SessionCancelledError } from 'dev.td';

try {
  const promise = client.send('task');
  await client.cancel();
  await promise;
} catch (error) {
  if (error instanceof SessionCancelledError) {
    console.error('Session was cancelled');
  }
}
```

## Types

The SDK exports all types and Zod schemas for runtime validation:

```typescript
// Types
import type {
  Model,
  SessionConfig,
  SessionState,
  SessionStatus,
  OutputType,
  SessionOutput,
  SessionContext,
  SessionInfo,
  SessionEvent,
  SessionEventType,
  ClientOptions,
  SessionClient,
  ManagerClient,
} from 'dev.td';

// Zod schemas for validation
import {
  ModelSchema,
  SessionConfigSchema,
  SessionStateSchema,
  SessionStatusSchema,
  OutputTypeSchema,
  SessionOutputSchema,
  SessionContextSchema,
  SessionInfoSchema,
  SessionEventTypeSchema,
  SessionEventSchema,
} from 'dev.td';
```

### SessionState

Possible session states:

- `idle` - Session is idle, ready for prompts
- `running` - Session is processing a prompt
- `waiting` - Session is waiting for user input
- `completed` - Session has completed
- `error` - Session encountered an error

### OutputType

Types of session outputs:

- `text` - Text response from Claude
- `tool_use` - Tool invocation
- `tool_result` - Result from a tool execution
- `error` - Error message

### SessionOutput

Structure of session outputs:

```typescript
interface SessionOutput {
  type: 'text' | 'tool_use' | 'tool_result' | 'error';
  content: string;
  toolName?: string;      // For tool_use outputs
  toolInput?: object;     // For tool_use outputs
  toolResult?: unknown;   // For tool_result outputs
  timestamp?: Date;
}
```

## License

MIT
