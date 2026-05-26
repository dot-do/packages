---
name: "@mdxui/tanstack"
version: 0.2.0
description: A highly opinionated, MDX-first framework for static pre-rendering, SPA, and SSR — powered by TanStack Start, deployed anywhere or on Cloudflare Workers.
license: MIT
downloads:
  monthly: 59
published: "2026-02-12T20:57:13.913Z"
updated: "2026-02-12T22:40:31.430Z"
---

# @mdxui/tanstack

A highly opinionated, MDX-first framework for static pre-rendering, SPA, and SSR — powered by TanStack Start, deployed anywhere or on Cloudflare Workers.

Declare what you need in one config. Get docs, blog, landing pages, app shells, theming, and dark mode — with zero route files and zero imports in MDX.

## Quick Start

```bash
pnpm add @mdxui/tanstack
```

```ts
// vite.config.ts — this is all you need
import { tanstackApp } from '@mdxui/tanstack'

export default tanstackApp({
  config: {
    site: { name: 'My App' },
    docs: true,
    blog: true,
    landing: true,
  }
})
```

```bash
vite dev    # Development
vite build  # Production build
```

No `src/routes/` needed — routes are generated automatically.

## What You Get

| Config Key | What It Does |
|------------|-------------|
| `docs: true` | Fumadocs site from `content/docs/` with prerendering |
| `blog: true` | Blog from `content/blog/` with tags, reading time, related posts |
| `landing: true` | Landing pages from `content/landing/` with full component registry |
| `app: '/app'` | SPA shell at `/app/*` for authenticated features |
| `admin: '/admin'` | Admin panel shell (same as app) |
| `cloudflare: {}` | Cloudflare Workers deployment with static assets + SSR |

**Batteries included.** One install gives you TanStack Start, MDX compilation, Tailwind CSS, fumadocs, and 200+ UI components. The only peer dependencies are `react`, `react-dom`, and `vite`.

## Directory Structure

```
project/
├── vite.config.ts            # tanstackApp() — the only config file
├── wrangler.jsonc             # Optional — for Cloudflare deployment
├── content/
│   ├── docs/                 # MDX documentation pages
│   │   ├── index.mdx
│   │   └── getting-started.mdx
│   ├── blog/                 # MDX blog posts
│   │   ├── index.mdx         # Optional blog page config
│   │   └── hello-world.mdx
│   └── landing/              # MDX landing pages
│       ├── index.mdx         # Home page (/)
│       ├── pricing.mdx       # /pricing
│       └── terms.mdx         # /terms
├── app/routes/               # Custom app routes (SPA)
└── .tanstack/                # Generated (gitignored)
    └── routes/               # Auto-generated route files
```

## Configuration

All fields are optional. Defaults work out of the box.

```ts
import { tanstackApp } from '@mdxui/tanstack'

export default tanstackApp({
  config: {
    // Site metadata
    site: {
      name: 'OAuth.do',
      description: 'OAuth as a Service',
      logo: '/logo.svg',
      theme: 'stripe',              // Any @mdxui/themes preset
      mode: 'system',               // 'light' | 'dark' | 'system'
      layout: {
        navbar: {
          component: 'Navbar17',     // or 'Navbar5'
          menu: [
            { name: 'Docs', link: '/docs' },
            { name: 'Blog', link: '/blog' },
          ],
          githubUrl: 'https://github.com/...',
          primaryCta: { text: 'Get Started', url: '/app' },
        },
        footer: {
          component: 'FooterSmall', // or 'Footer7', 'FooterLarge'
          domain: 'oauth.do',
          legalLinks: [
            { name: 'Terms', href: '/terms' },
            { name: 'Privacy', href: '/privacy' },
          ],
        },
        background: {
          noise: true,
          grid: false,
          glow: false,
        },
      },
    },

    // Content types (boolean for defaults, or object for customization)
    docs: true,
    blog: true,
    landing: true,

    // SPA shells
    app: '/app',

    // Deployment
    cloudflare: {},
  },

  // Vite config overrides
  vite: {
    server: { port: 4000 },
  },
})
```

### Separate Config File

If you prefer, you can use a separate `tanstack.config.ts`:

```ts
// tanstack.config.ts
import { defineConfig } from '@mdxui/tanstack'

export default defineConfig({
  site: { name: 'My App' },
  docs: true,
  blog: true,
  landing: true,
})
```

```ts
// vite.config.ts
import { tanstackApp } from '@mdxui/tanstack'

export default tanstackApp()
```

## Content Authoring

### Blog Posts

MDX files in `content/blog/`. Components are auto-registered — no imports needed.

```mdx
---
title: Getting Started with TanStack
description: Learn how to build modern web apps
date: 2024-01-15
author:
  name: John Doe
  image: /authors/john.jpg
tags: [tutorial, tanstack]
image: /images/blog/intro.jpg
featured: true
---

# Getting Started

<Callout type="tip">
  Components work without imports!
</Callout>

Write your content here. Code blocks get copy buttons automatically.
```

Available frontmatter: `title`, `description`, `date`, `author`, `tags`, `image`, `featured`, `draft`, `series`, `seo`, and more. See the [blog schema](src/schemas/blog.ts) for the full list.

### Landing Pages

MDX files in `content/landing/`. `index.mdx` becomes the homepage.

```mdx
---
title: "Welcome to My App"
---

<Hero title="Build faster" description="Ship with confidence" />

<Features features={[
  { title: 'Fast', description: 'Lightning fast builds' },
  { title: 'Secure', description: 'Bank-grade security' },
]} />

<Pricing tiers={[...]} />
<FAQ items={[...]} />
<CTA title="Ready to start?" />
```

All `@mdxui/neo` components (Hero, Features, Pricing, CTA, FAQ, Stats, Logos, Testimonials) are available without imports.

### Frontmatter Overrides

Control layout per-page:

```yaml
---
title: Terms of Service
template: legal        # Wraps in prose styling
showBackground: false  # Disables background effects
---
```

## Cloudflare Workers

Add `cloudflare: {}` to your config and create a `wrangler.jsonc`:

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-app",
  "compatibility_date": "2026-02-12",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@mdxui/tanstack/server",
  "observability": { "enabled": true }
}
```

No worker entry file needed — the built-in server handler takes care of everything.

### Custom Worker Entry (Optional)

If you need middleware, scheduled handlers, queues, or Durable Objects:

```ts
// worker.ts
import handler from '@mdxui/tanstack/server'

export default {
  fetch: handler.fetch,
  async scheduled(event, env, ctx) {
    // Cron handler
  },
}
```

Then point `"main"` in `wrangler.jsonc` to `"./worker.ts"`.

For middleware convenience, `createTanstackHandler` wraps the handler with an `onRequest` hook:

```ts
import { createTanstackHandler } from '@mdxui/tanstack/server'

export default createTanstackHandler({
  onRequest: (request, env, ctx) => {
    if (new URL(request.url).pathname === '/api/health') {
      return new Response(JSON.stringify({ ok: true }))
    }
  },
})
```

## Virtual Modules

Available for advanced use cases:

```ts
import { posts, getPost, getPosts, getAllTags } from 'virtual:mdx-blog/posts'
import { items, getItem } from 'virtual:mdx-content/landing'
import { theme, mode } from 'virtual:@mdxui/tanstack/theme-config'
import { layoutConfig } from 'virtual:@mdxui/tanstack/layout-config'
```

## Custom Content Types

Add arbitrary MDX content sources beyond docs/blog/landing:

```ts
export default tanstackApp({
  config: {
    content: {
      tutorials: { dir: 'content/tutorials', basePath: '/tutorials' },
      changelog: { dir: 'content/changelog', basePath: '/changelog' },
    },
  },
})
```

Access via virtual modules:

```ts
import { items, getItem } from 'virtual:mdx-content/tutorials'
```

## Package Exports

| Import | Purpose |
|--------|---------|
| `@mdxui/tanstack` | Core APIs (`defineConfig`, `tanstackApp`, `createPages`) |
| `@mdxui/tanstack/server` | Worker handler and `createTanstackHandler` |
| `@mdxui/tanstack/mdx` | MDX component registry (`MDXProvider`, registries) |
| `@mdxui/tanstack/components` | UI components (`LandingLayout`, `ProseWrapper`) |
| `@mdxui/tanstack/client` | Type declarations for virtual modules |
| `@mdxui/tanstack/config` | Config utilities (`defineConfig`) |
| `@mdxui/tanstack/routes` | Route helpers (`createRootHead`) |
| `@mdxui/tanstack/plugin` | Vite plugin (`tanstack()`) for custom setups |
| `@mdxui/tanstack/vite` | Virtual module plugin factories |

## Peer Dependencies

The only packages you need in your project:

```json
{
  "react": ">=19.0.0",
  "react-dom": ">=19.0.0",
  "vite": ">=6.0.0"
}
```

Everything else — TanStack Start, MDX, Tailwind, fumadocs, Cloudflare, and 200+ UI components — is included.

## License

MIT
