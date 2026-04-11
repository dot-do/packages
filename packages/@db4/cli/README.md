---
name: "@db4/cli"
version: 0.1.2
description: Command line interface for db4
license: MIT
repository: "https://github.com/dot-do/db4"
homepage: "https://db4.ai"
keywords:
  - db4
  - cli
  - cloudflare
  - workers
  - durable-objects
downloads:
  monthly: 11
published: "2026-01-20T11:28:43.483Z"
updated: "2026-01-23T17:20:06.492Z"
---

# @db4/cli

([GitHub](https://github.com/dot-do/db4/tree/main/packages/cli), [npm](https://www.npmjs.com/package/@db4/cli))

**Cloudflare deployment shouldn't require a PhD in wrangler.toml.** You want an edge database. Instead, you're debugging binding syntax, managing migration scripts by hand, and praying your local setup matches production.

Four commands. Zero configuration.

## Three Steps to the Edge

### 1. Initialize

```bash
npx db4 init
```

Choose your template:
- **minimal** - Simple projects
- **default** - Recommended setup
- **full** - R2, sharding, replication

```bash
db4 init --template full --force
```

### 2. Develop

```bash
db4 dev
```

Local Miniflare server with real Durable Objects. Same SQLite storage, same API, same behavior as production.

```
Dev server: http://localhost:8787
  Health:   /health
  API:      /api/<collection>
```

```bash
db4 dev --port 3000 --verbose
```

### 3. Deploy

```bash
db4 deploy
```

Generates wrangler.toml, creates the worker entry, deploys. Done.

```bash
db4 deploy --dry-run        # Preview only
db4 deploy --env staging    # Target environment
db4 deploy --force          # Overwrite existing
```

## Migrations

Create:

```bash
db4 migrate create add_users_table
```

```typescript
// migrations/20260118120000_add_users_table.ts
import type { MigrationContext } from '@db4/core';

export async function up(ctx: MigrationContext): Promise<void> {
  await ctx.sql`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL
  )`;
}

export async function down(ctx: MigrationContext): Promise<void> {
  await ctx.sql`DROP TABLE IF EXISTS users`;
}

export default { up, down };
```

Run:

```bash
db4 migrate up              # Apply pending
db4 migrate up --steps 2    # Apply N migrations
db4 migrate status          # Check state
db4 migrate down            # Rollback last
db4 migrate down --steps 3  # Rollback N migrations
```

## Installation

```bash
npm install -g @db4/cli

# Or use npx
npx db4 init
```

## Command Reference

| Command | Description |
|---------|-------------|
| `db4 init` | Initialize project |
| `db4 dev` | Start local server |
| `db4 deploy` | Deploy to Cloudflare |
| `db4 migrate up` | Run migrations |
| `db4 migrate down` | Rollback migrations |
| `db4 migrate status` | Show status |
| `db4 migrate create <name>` | Create migration |

### Global Options

| Option | Description |
|--------|-------------|
| `--help, -h` | Show help |
| `--version, -V` | Show version |
| `--verbose, -v` | Verbose output |
| `--quiet, -q` | Suppress output |
| `--profile` | Performance profiling |

## Programmatic API

Every command is a typed function:

```typescript
import { init, dev, deploy, migrateUp, migrateStatus, migrateCreate } from '@db4/cli';

// Initialize
await init({ cwd: './my-project', template: 'default' });

// Develop
const server = await dev({ port: 8787, verbose: true });
await server.stop();

// Deploy
const { url } = await deploy({ environment: 'production' });

// Migrate
const status = await migrateStatus({ cwd: process.cwd() });
await migrateCreate({ cwd: process.cwd(), name: 'add_users_table' });
```

## The Outcome

**With @db4/cli:** Zero to deployed edge database in five minutes. `init`, `dev`, `deploy`. Ship it.

**Without:** Manual wrangler.toml. Cryptic binding errors. Separate local and production configs. Migration tracking in a spreadsheet. Every deploy a ritual of hope.

## Related Packages

- [@db4/core](../core) - Core types and engine
- [@db4/schema](../schema) - IceType schema compiler
- [@db4/do](../do) - Durable Object implementation

## License

MIT
