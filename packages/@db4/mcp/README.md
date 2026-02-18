---
name: "@db4/mcp"
version: 0.1.2
description: Model Context Protocol (MCP) server for db4 - enables AI agents to interact with db4 databases
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - mcp
  - model-context-protocol
  - ai
  - claude
  - llm
  - database
  - tools
downloads:
  monthly: 212
published: "2026-01-20T11:32:07.678Z"
updated: "2026-01-23T17:20:27.621Z"
---

# @db4/mcp

([GitHub](https://github.com/dot-do/db4/tree/main/packages/mcp), [npm](https://www.npmjs.com/package/@db4/mcp))

**Your AI assistant can't see your data.**

Claude writes brilliant code--until it needs your database. Then the workflow breaks: "Can you paste the schema?" "Show me those records." "What about the related table?" You become the copy-paste bridge between AI and data, hitting context limits, losing conversation flow, watching productivity drain away.

`@db4/mcp` fixes this. One MCP server. Direct database access. Claude queries your data, explores your schema, and delivers real answers--no manual bridging required.

## Quick Start

### 1. Install

```bash
npm install @db4/mcp
```

### 2. Start the Server

```bash
# Development
npx db4-mcp --url http://localhost:8787

# Production (read-only recommended)
npx db4-mcp --url https://db.yourapp.com --read-only
```

### 3. Connect Claude

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "db4": {
      "command": "npx",
      "args": ["db4-mcp", "--url", "http://localhost:8787"]
    }
  }
}
```

That's it. Ask Claude anything:

> "Show me users who signed up last week"
> "Find products with inventory under 10"
> "What's average order value by segment?"

## Available Tools

| Tool | What It Does |
|------|--------------|
| `db4_ask` | Natural language queries |
| `db4_semantic_search` | Find documents by meaning |
| `db4_get_context` | RAG-ready context retrieval |
| `db4_query` | SQL-like queries with filters |
| `db4_search` | Full-text search with highlights |
| `db4_list` | Browse with filters and pagination |
| `db4_get` | Fetch documents by ID |
| `db4_create` | Create documents |
| `db4_update` | Modify documents |
| `db4_delete` | Remove documents |
| `db4_schema` | Explore database structure |
| `db4_explain` | Understand query execution |

## Without vs. With

**Without `@db4/mcp`:**
1. Claude asks for schema
2. You copy-paste tables
3. Claude asks for data
4. You run queries, copy results
5. Claude asks for related records
6. More queries, more copying
7. Context limit--start over

**With `@db4/mcp`:**
1. Ask Claude anything
2. Claude queries directly
3. Real answers, full context

Seven steps become three. Manual labor becomes conversation.

## Configuration

```bash
db4-mcp [options]

Options:
  -u, --url <url>           Server URL (default: http://localhost:8787)
  -r, --read-only           Disable mutations
  -c, --collections <list>  Restrict to specific collections
  -m, --max-results <n>     Max results per query (default: 100)
  -n, --name <name>         Server name for MCP
  -h, --help                Show help

Environment:
  DB4_URL                   Default server URL
```

### Examples

```bash
# Development
db4-mcp --url http://localhost:8787

# Production with restrictions
db4-mcp --url https://db.example.com --read-only --collections users,orders

# Using environment variable
DB4_URL=https://db.example.com db4-mcp --read-only
```

## Programmatic Usage

```typescript
import { createClient } from '@db4/client';
import { createMcpServer } from '@db4/mcp';

const client = createClient({ baseUrl: 'http://localhost:8787' });
const mcp = createMcpServer({ client });

await mcp.connectStdio();
```

### Server Variants

```typescript
import {
  createMcpServer,
  createReadOnlyMcpServer,
  createMinimalMcpServer,
  createCollectionMcpServer,
} from '@db4/mcp';

// Full access
const full = createMcpServer({ client });

// Read-only (no mutations)
const readOnly = createReadOnlyMcpServer(client);

// Minimal (read-only, no SQL, limited results)
const minimal = createMinimalMcpServer(client);

// Specific collections only
const restricted = createCollectionMcpServer(client, ['users', 'orders']);
```

### Fine-Grained Permissions

```typescript
const mcp = createMcpServer({
  client,
  permissions: {
    allowMutations: false,
    allowSqlQueries: false,
    collections: ['users'],
    excludeCollections: ['logs'],
    maxResults: 50,
  },
  schema: {
    expose: 'minimal',
    descriptions: {
      'users': 'Application user accounts',
      'users.email': 'Primary email address',
    },
  },
});
```

## AI Framework Integration

Export tool definitions for direct API use:

```typescript
import { createMcpServer, toAnthropicTools, toOpenAITools } from '@db4/mcp';

const mcp = createMcpServer({ client });

const anthropicTools = toAnthropicTools(mcp);
const openaiTools = toOpenAITools(mcp);
```

With Anthropic SDK:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();
const tools = toAnthropicTools(mcp);

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  tools,
  messages: [
    { role: 'user', content: 'Find users who signed up this week' }
  ],
});
```

## Resources

| Resource | Content |
|----------|---------|
| `db4://schema` | Complete database schema |
| `db4://capabilities` | Permissions and enabled tools |
| `db4://examples` | Query examples and operators |
| `db4://collection/{name}/schema` | Collection-specific schema |
| `db4://ai-context` | AI-optimized schema with hints |

## Security

1. **Use read-only in production**: `--read-only` prevents accidents
2. **Restrict collections**: Expose only what's needed
3. **Set result limits**: Prevent runaway queries
4. **Use HTTPS**: Always TLS in production
5. **Network isolation**: Keep MCP server near db4

## Example Session

**You**: "Analyze user retention. Find users inactive for 30 days who were active in week one."

**Claude**: *Queries users, filters by login and signup activity, returns analysis*

**You**: "Create a re-engagement segment for them."

**Claude**: *Creates segment document with user IDs and campaign metadata*

No copy-paste. No context switching. Just conversation.

## API Reference

### Exports

```typescript
// Server factories
export { createMcpServer } from '@db4/mcp';
export { createReadOnlyMcpServer } from '@db4/mcp';
export { createMinimalMcpServer } from '@db4/mcp';
export { createCollectionMcpServer } from '@db4/mcp';

// Tool conversion
export { toAnthropicTools, toOpenAITools } from '@db4/mcp';

// Error handling
export { McpToolError, McpErrorCodes } from '@db4/mcp';

// Registration (custom servers)
export { registerDb4Tools } from '@db4/mcp';
export { registerDb4Resources, registerCollectionResources } from '@db4/mcp';
export { registerAITools, registerAIContextResource } from '@db4/mcp';
```

### Types

```typescript
import type {
  // Configuration
  CreateMcpServerOptions,
  Db4McpServer,
  McpServerConfig,
  McpPermissions,
  McpSchemaConfig,
  ToolDefinition,

  // Tool inputs
  QueryToolInput,
  SearchToolInput,
  GetToolInput,
  ListToolInput,
  CreateToolInput,
  UpdateToolInput,
  DeleteToolInput,
  SchemaToolInput,
  ExplainToolInput,
  AskToolInput,
  SemanticSearchToolInput,
  GetContextToolInput,

  // Tool results
  QueryToolResult,
  SearchToolResult,
  SearchResultItem,
  GetToolResult,
  ListToolResult,
  CreateToolResult,
  UpdateToolResult,
  DeleteToolResult,
  SchemaToolResult,
  SchemaField,
  SchemaCollection,
  ExplainToolResult,
  AskToolResult,
  SemanticSearchToolResult,
  GetContextToolResult,
  AIContextResource,

  // Errors
  McpError,
  McpErrorCode,
} from '@db4/mcp';
```

## Related Packages

- [@db4/client](../client) - Client SDK
- [@db4/core](../core) - Core types
- [@db4/ai](../ai) - AI field generation

## License

MIT
