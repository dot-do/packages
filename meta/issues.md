# Package Issues

> Auto-generated: 2026-01-26T11:44:31.607Z

**Total packages:** 450
**Direct issues:** 24
**Transitive issues:** 4
**Total excluded:** 28
**Clean packages:** 422

## Install Command

```bash
cd meta && npm install --legacy-peer-deps
```

## Summary by Issue Type

- **workspace dep**: 46 packages
- **wildcard dep**: 17 packages
- **transitive dependency**: 4 packages

## Direct Issues

### @dotdo

#### `@dotdo/db-rpc-server@0.1.6`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@dotdo/db-rpc` | `workspace:*` | workspace protocol |

#### `@dotdo/apis@0.1.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `oauth.do` | `*` | wildcard |
| `rpc.do` | `*` | wildcard |

#### `@dotdo/app-builder@0.1.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@dotdo/db-do-json` | `workspace:*` | workspace protocol |
| `@dotdo/parse-worker` | `workspace:*` | workspace protocol |

### @mdxdb

#### `@mdxdb/payload@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxdb/sqlite` | `workspace:^` | workspace protocol |
| `@mdxdb/clickhouse` | `workspace:^` | workspace protocol |

#### `@mdxdb/fs@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxld/extract` | `workspace:*` | workspace protocol |
| `ai-database` | `workspace:*` | workspace protocol |
| `mdxld` | `workspace:*` | workspace protocol |

#### `@mdxdb/fumadocs@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxdb/fs` | `workspace:*` | workspace protocol |
| `mdxld` | `workspace:*` | workspace protocol |

#### `@mdxdb/clickhouse@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `ai-database` | `workspace:^` | workspace protocol |
| `@mdxld/extract` | `workspace:^` | workspace protocol |
| `@mdxdb/fs` | `workspace:^` | workspace protocol |

#### `@mdxdb/fetch@0.0.1`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxdb/types` | `workspace:*` | workspace protocol |

### @mdxe

#### `@mdxe/deploy@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxe/do` | `workspace:*` | workspace protocol |
| `@mdxe/cloudflare` | `workspace:*` | workspace protocol |
| `@mdxe/github` | `workspace:*` | workspace protocol |
| `@mdxe/vercel` | `workspace:*` | workspace protocol |

#### `@mdxe/payload@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxdb/payload` | `workspace:^` | workspace protocol |
| `@mdxdb/sqlite` | `workspace:^` | workspace protocol |
| `mdxld` | `workspace:^` | workspace protocol |

#### `@mdxe/hono@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxui/fumadocs` | `workspace:*` | workspace protocol |
| `mdxld` | `workspace:*` | workspace protocol |

### @mdxui

#### `@mdxui/fumadocs@1.9.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `mdxld` | `workspace:*` | workspace protocol |
| `@mdxdb/fumadocs` | `workspace:*` | workspace protocol |

#### `@mdxui/marketing@1.0.2`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxui/types` | `*` | wildcard |
| `@mdxui/shared` | `*` | wildcard |
| `@mdxui/widgets` | `*` | wildcard |

#### `@mdxui/dashboard@1.0.2`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxui/shared` | `*` | wildcard |
| `@mdxui/widgets` | `*` | wildcard |

#### `@mdxui/blog@1.0.2`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxui/shared` | `*` | wildcard |

#### `@mdxui/docs@1.0.2`

| Dependency | Version | Issue |
|------------|---------|-------|
| `@mdxui/types` | `*` | wildcard |
| `@mdxui/shared` | `*` | wildcard |
| `@mdxui/widgets` | `*` | wildcard |

### unscoped

#### `bashx.do@0.1.2`

| Dependency | Version | Issue |
|------------|---------|-------|
| `mcp.do` | `*` | wildcard |
| `rpc.do` | `*` | wildcard |

#### `database.do@0.0.1`

| Dependency | Version | Issue |
|------------|---------|-------|
| `apis.do` | `*` | wildcard |

#### `tasks.do@0.0.1`

| Dependency | Version | Issue |
|------------|---------|-------|
| `apis.do` | `*` | wildcard |

#### `duck.do@0.1.0-rc.1`

| Dependency | Version | Issue |
|------------|---------|-------|
| `capnweb` | `*` | wildcard |

#### `sales-builder@0.1.1`

| Dependency | Version | Issue |
|------------|---------|-------|
| `api.sb` | `workspace:*` | workspace protocol |
| `db.sb` | `workspace:*` | workspace protocol |
| `ideal-customer-profile` | `workspace:*` | workspace protocol |
| `storybrand` | `workspace:*` | workspace protocol |
| `jobs-to-be-done` | `workspace:*` | workspace protocol |
| `landing-page` | `workspace:*` | workspace protocol |

#### `services-builder@0.1.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `api.sb` | `workspace:*` | workspace protocol |
| `db.sb` | `workspace:*` | workspace protocol |
| `jobs-to-be-done` | `workspace:*` | workspace protocol |
| `design-sprint` | `workspace:*` | workspace protocol |
| `product-names` | `workspace:*` | workspace protocol |
| `landing-page` | `workspace:*` | workspace protocol |

#### `startup-builder@0.1.0`

| Dependency | Version | Issue |
|------------|---------|-------|
| `api.sb` | `workspace:*` | workspace protocol |
| `db.sb` | `workspace:*` | workspace protocol |
| `foundation-sprint` | `workspace:*` | workspace protocol |
| `lean-canvas` | `workspace:*` | workspace protocol |
| `ideal-customer-profile` | `workspace:*` | workspace protocol |
| `jobs-to-be-done` | `workspace:*` | workspace protocol |
| `storybrand` | `workspace:*` | workspace protocol |
| `startup-names` | `workspace:*` | workspace protocol |
| `landing-page` | `workspace:*` | workspace protocol |

#### `agents.do@0.0.1`

| Dependency | Version | Issue |
|------------|---------|-------|
| `apis.do` | `*` | wildcard |

## Transitive Issues

These packages depend on broken packages:

- `@dotdo/do` → `@dotdo/apis`
- `mdxe` → `@mdxdb/clickhouse`, `@mdxdb/fs`, `@mdxe/deploy`, `@mdxe/hono`, `@mdxe/payload`
- `@mdxui/do` → `@dotdo/do`
- `ai-waitlist` → `mdxe`

## Excluded from Meta-Package

```
@dotdo/db-rpc-server
@dotdo/apis
@dotdo/app-builder
@mdxui/fumadocs
@mdxui/marketing
@mdxui/dashboard
@mdxui/blog
@mdxui/docs
@mdxe/deploy
@mdxe/payload
@mdxe/hono
@mdxdb/payload
@mdxdb/fs
@mdxdb/fumadocs
@mdxdb/clickhouse
@mdxdb/fetch
bashx.do
database.do
tasks.do
duck.do
sales-builder
services-builder
startup-builder
agents.do
@dotdo/do
mdxe
@mdxui/do
ai-waitlist
```
