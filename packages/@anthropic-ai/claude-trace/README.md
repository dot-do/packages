---
name: "@anthropic-ai/claude-trace"
version: 0.1.2
description: OTEL trace viewer for Claude Code sessions
downloads:
  monthly: 65
published: "2025-12-15T20:07:13.006Z"
updated: "2025-12-15T20:15:19.817Z"
---

# claude-trace

View OpenTelemetry traces from Claude Code SDK.

## Installation

```bash
npm install -g @anthropic-ai/claude-trace
```

## Usage

```bash
claude-trace
```

Then run your SDK application with tracing enabled:

```bash
export ENABLE_BETA_TRACING_DETAILED=1
export BETA_TRACING_ENDPOINT=http://localhost:4318
```

## Documentation

See [getting_started.md](./getting_started.md) for detailed setup and API documentation.
