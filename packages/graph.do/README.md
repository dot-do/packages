---
name: graph.do
version: 0.1.0
description: Knowledge graph built on mongo.do with MCP server support
license: MIT
repository: "https://github.com/nathanclevenger/graph.do"
homepage: "https://github.com/nathanclevenger/graph.do#readme"
keywords:
  - knowledge-graph
  - graph-database
  - mcp
  - model-context-protocol
  - mongo.do
  - cloudflare
downloads:
  monthly: 19
published: "2026-01-05T13:00:09.342Z"
updated: "2026-01-05T13:00:09.485Z"
---

# graph.do

Knowledge graph database built on [mongo.do](https://github.com/drivly/mongo.do) with [MCP](https://modelcontextprotocol.io) server support.

## Installation

```bash
npm install graph.do
```

## Usage

```typescript
import { graph } from 'graph.do'

// Create entities
await graph.createEntities([
  { name: 'Alice', entityType: 'Person', observations: ['Works at Acme', 'Lives in NYC'] },
  { name: 'Bob', entityType: 'Person', observations: ['Works at Acme', 'Manages Alice'] },
  { name: 'Acme', entityType: 'Company', observations: ['Tech startup', 'Founded 2020'] }
])

// Create relations
await graph.createRelations([
  { from: 'Alice', to: 'Acme', relationType: 'works_at' },
  { from: 'Bob', to: 'Acme', relationType: 'works_at' },
  { from: 'Bob', to: 'Alice', relationType: 'manages' }
])

// Search the graph
const results = await graph.searchNodes('Acme')

// Read the entire graph
const fullGraph = await graph.readGraph()

// Open specific nodes with their relations
const nodes = await graph.openNodes(['Alice', 'Bob'])
```

## API

### Entities

Entities are nodes in the knowledge graph with:
- `name` - Unique identifier
- `entityType` - Classification (Person, Company, etc.)
- `observations` - Array of facts about the entity

### Relations

Relations are directed edges between entities:
- `from` - Source entity name
- `to` - Target entity name
- `relationType` - Type of relationship (in active voice)

### Methods

| Method | Description |
|--------|-------------|
| `createEntities(entities)` | Create new entities (skips duplicates) |
| `createRelations(relations)` | Create new relations (skips duplicates) |
| `addObservations(observations)` | Add observations to existing entities |
| `deleteEntities(names)` | Delete entities and their relations |
| `deleteObservations(deletions)` | Remove specific observations |
| `deleteRelations(relations)` | Remove specific relations |
| `readGraph()` | Get the complete graph |
| `searchNodes(query)` | Search by name, type, or observation |
| `openNodes(names)` | Get specific entities with inter-relations |

## MCP Server

graph.do includes a Model Context Protocol server for AI agent integration.

### CLI (stdio transport)

```bash
# Uses https://graph.do by default
npx graph.do

# Or with custom URL
npx graph.do --url https://my-graph.workers.dev
```

Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "graph": {
      "command": "npx",
      "args": ["graph.do"]
    }
  }
}
```

### HTTP Transport

Deploy to Cloudflare Workers for HTTP MCP access:

```bash
npm run deploy
```

Endpoints:
- `GET /mcp` - Server info
- `GET /mcp/tools` - List available tools
- `POST /mcp` - JSON-RPC endpoint
- `POST /mcp/tools/:name` - Direct tool calls

## Custom Deployment

graph.do is self-contained - deploy your own instance:

```bash
git clone https://github.com/drivly/graph.do
cd graph.do
npm install
npm run deploy
```

Or use a custom URL programmatically:

```typescript
import { createGraph } from 'graph.do'

const graph = createGraph('https://my-graph.workers.dev')
```

## Architecture

graph.do is built on:
- **[mongo.do](https://github.com/drivly/mongo.do)** - MongoDB-compatible database on Cloudflare Durable Objects
- **SQLite** - Persistent storage via Durable Objects
- **MCP** - Model Context Protocol for AI integration

Data is stored in two collections:
- `entities` - Graph nodes
- `relations` - Graph edges

## License

MIT
