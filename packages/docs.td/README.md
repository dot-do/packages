---
name: docs.td
version: 0.0.4
description: Multi-tenant documentation platform for npm packages
license: MIT
repository: "https://github.com/nathanclevenger/.td"
homepage: "https://github.com/nathanclevenger/.td/tree/main/packages/docs.td#readme"
keywords:
  - documentation
  - fumadocs
  - npm
  - multi-tenant
  - cloudflare-workers
downloads:
  monthly: 11
published: "2026-01-05T11:52:47.275Z"
updated: "2026-01-05T17:10:47.125Z"
---

# docs.td

Multi-tenant documentation platform for npm packages. Automatically generate beautiful documentation sites from your package's README and docs folder, powered by [Fumadocs](https://fumadocs.vercel.app/).

## Overview

docs.td transforms your npm package documentation into a fully-featured documentation website with zero configuration. It automatically discovers your README, docs folder, and MDX files, then generates a multi-tenant documentation site that can be deployed to Cloudflare.

### Why docs.td?

- **Zero Config Required** - Works out of the box with standard npm package conventions
- **Multi-Tenant Architecture** - Each package gets its own subdomain (`your-package.docs.td`)
- **Fumadocs Integration** - Built on Fumadocs for a polished, modern documentation experience
- **Smart README Parsing** - Automatically extracts badges, code examples, and table of contents from your README
- **Cloudflare Deployment** - Deploy to the edge with Cloudflare Workers and Pages

## Features

- **Automatic Documentation Discovery**
  - Parses README.md and extracts sections, badges, and code examples
  - Discovers docs folder with MDX/MD files
  - Supports meta.json for custom page ordering
  - Respects frontmatter for page metadata

- **Multi-Tenant Hosting**
  - Each package gets a unique subdomain
  - Scoped packages supported (`@org/package` becomes `org-package.docs.td`)
  - Custom domain support

- **Theming & Customization**
  - 5 built-in theme presets (default, ocean, forest, sunset, monochrome)
  - Custom colors, fonts, and code highlighting
  - Dark mode support out of the box
  - Override files for custom layouts and styling

- **Modern Documentation Features**
  - Full-text search
  - Table of contents
  - Code copy buttons
  - Edit on GitHub links
  - Last updated timestamps

## Installation

```bash
npm install docs.td
```

Or with your preferred package manager:

```bash
pnpm add docs.td
yarn add docs.td
bun add docs.td
```

## Quick Start

### 1. Initialize Configuration (Optional)

```bash
npx docs.td init
```

This creates a `docs.td/` folder with default configuration files.

### 2. Preview Your Documentation

```bash
npx docs.td preview
```

This builds your documentation and starts a local preview server at `http://localhost:3000`.

### 3. Deploy to Production

```bash
npx docs.td deploy
```

Your documentation will be available at `https://your-package.docs.td`.

## CLI Commands

### `docs.td build [package]`

Build documentation for a package.

```bash
docs.td build                    # Build current directory
docs.td build ./my-package       # Build specific package
docs.td build -o ./dist          # Custom output directory
docs.td build -c docs.td.json    # Use config file
docs.td build -t my-subdomain    # Custom tenant ID
docs.td build --watch            # Watch mode
docs.td build -v                 # Verbose output
```

**Options:**

| Option | Description |
|--------|-------------|
| `-o, --output <dir>` | Output directory for built files |
| `-c, --config <file>` | Path to configuration file |
| `-t, --tenant <id>` | Tenant ID (subdomain) |
| `-v, --verbose` | Enable verbose output |
| `--watch` | Watch for changes and rebuild |

### `docs.td preview [package]`

Start a local preview server for your documentation.

```bash
docs.td preview                  # Preview current directory
docs.td preview -p 8080          # Custom port
docs.td preview -H 0.0.0.0       # Custom host
docs.td preview --open           # Open browser automatically
docs.td preview -v               # Verbose output
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Port number | `3000` |
| `-H, --host <host>` | Host address | `localhost` |
| `--open` | Open browser automatically | `false` |
| `-v, --verbose` | Enable verbose output | `false` |

### `docs.td deploy [package]`

Deploy documentation to Cloudflare.

```bash
docs.td deploy                   # Deploy current directory
docs.td deploy -t my-subdomain   # Custom tenant ID
docs.td deploy --dry-run         # Preview deployment
docs.td deploy -v                # Verbose output
```

**Options:**

| Option | Description |
|--------|-------------|
| `-t, --tenant <id>` | Tenant ID (subdomain) |
| `--dry-run` | Show what would be deployed without deploying |
| `-v, --verbose` | Enable verbose output |

**Note:** Requires [wrangler](https://developers.cloudflare.com/workers/wrangler/) to be installed and authenticated.

### `docs.td init`

Initialize docs.td configuration in your project.

```bash
docs.td init                     # Create docs.td folder
docs.td init -f                  # Overwrite existing config
```

**Options:**

| Option | Description |
|--------|-------------|
| `-f, --force` | Overwrite existing configuration |

This creates:

```
docs.td/
├── theme.json    # Theme configuration
├── layout.json   # Layout configuration
└── index.mdx     # Custom landing page
```

### `docs.td info [package]`

Display documentation information for a package.

```bash
docs.td info                     # Show info for current directory
docs.td info ./my-package        # Show info for specific package
```

This displays:
- Package metadata (name, version, description)
- README analysis (sections, badges)
- Documentation folder contents
- Generated page structure
- Preview URL

## Configuration

docs.td can be configured in multiple ways:

1. **`docs.td/` folder** - Configuration files in a dedicated folder
2. **`docs.td.json`** - Single JSON configuration file
3. **`package.json`** - Add a `"docs.td"` field to your package.json

### Configuration Schema

```typescript
interface DocsConfig {
  // Build configuration
  build?: {
    outDir?: string;        // Output directory (default: "dist")
    tenantDir?: string;     // Tenant builds directory (default: "tenants")
    staticDir?: string;     // Static assets directory (default: "static")
    cacheDir?: string;      // Cache directory (default: ".cache")
  };

  // Theme configuration
  theme?: {
    preset?: 'default' | 'ocean' | 'forest' | 'sunset' | 'monochrome' | 'custom';
    colors?: {
      primary?: string;     // Primary color (hex, e.g., "#0070f3")
      secondary?: string;   // Secondary color
      accent?: string;      // Accent color
      background?: string;  // Background color
      foreground?: string;  // Text color
      muted?: string;       // Muted text color
      border?: string;      // Border color
    };
    fonts?: {
      sans?: string;        // Sans-serif font stack
      mono?: string;        // Monospace font stack
      heading?: string;     // Heading font stack
    };
    darkMode?: boolean;     // Enable dark mode (default: true)
    codeHighlight?: 'github-dark' | 'github-light' | 'one-dark-pro' |
                    'dracula' | 'nord' | 'vitesse-dark' | 'vitesse-light';
  };

  // Layout configuration
  layout?: {
    sidebar?: {
      width?: number;           // Sidebar width in pixels (200-400, default: 280)
      collapsible?: boolean;    // Allow collapsing (default: true)
      defaultCollapsed?: boolean;
      showIcons?: boolean;      // Show page icons (default: true)
    };
    nav?: {
      logo?: string | null;     // Logo URL or path
      links?: Array<{
        title: string;
        href: string;
        external?: boolean;
      }>;
      github?: string | null;   // GitHub repository URL
      search?: boolean;         // Show search (default: true)
    };
    footer?: {
      show?: boolean;           // Show footer (default: true)
      copyright?: string | null;
      links?: Array<{
        title: string;
        href: string;
        external?: boolean;
      }>;
    };
    toc?: {
      show?: boolean;           // Show table of contents (default: true)
      depth?: number;           // Heading depth 1-6 (default: 3)
      title?: string;           // TOC title (default: "On this page")
    };
  };

  // SEO configuration
  seo?: {
    titleTemplate?: string;         // Title template (default: "%s | Documentation")
    defaultDescription?: string;    // Default meta description
    ogImage?: string | null;        // Open Graph image URL
    twitterCard?: 'summary' | 'summary_large_image';
  };

  // Features
  features?: {
    search?: boolean;           // Enable search (default: true)
    editOnGithub?: boolean;     // Show edit links (default: true)
    lastUpdated?: boolean;      // Show last updated (default: true)
    feedback?: boolean;         // Enable feedback widget (default: false)
    copyCode?: boolean;         // Code copy button (default: true)
  };

  // Multi-tenancy
  tenant?: {
    domain?: string;            // Custom domain
    subdomainSuffix?: string;   // Subdomain suffix (default: ".docs.td")
  };
}
```

### Example Configuration

**docs.td.json:**

```json
{
  "theme": {
    "preset": "ocean",
    "colors": {
      "primary": "#0891b2"
    },
    "darkMode": true,
    "codeHighlight": "github-dark"
  },
  "layout": {
    "nav": {
      "github": "https://github.com/your-org/your-package",
      "links": [
        { "title": "Blog", "href": "https://blog.example.com", "external": true }
      ]
    },
    "sidebar": {
      "collapsible": true,
      "width": 300
    }
  },
  "features": {
    "search": true,
    "editOnGithub": true,
    "copyCode": true
  }
}
```

**package.json:**

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "docs.td": {
    "theme": {
      "preset": "default"
    },
    "features": {
      "search": true,
      "editOnGithub": true
    }
  }
}
```

### MDX Frontmatter

Individual pages support frontmatter for metadata:

```mdx
---
title: Getting Started
description: Learn how to get started with our package
order: 1
sidebar_label: Quick Start
sidebar_position: 1
hide_title: false
hide_table_of_contents: false
keywords:
  - getting started
  - tutorial
image: /images/getting-started.png
slug: getting-started
draft: false
unlisted: false
---

# Getting Started

Your content here...
```

### meta.json

Control page ordering in documentation folders:

```json
{
  "title": "Documentation",
  "pages": [
    "getting-started",
    "installation",
    "configuration",
    "api-reference"
  ],
  "defaultOpen": true
}
```

## API Reference

### Core Exports

```typescript
import {
  // Build
  DocsBuilder,
  buildDocs,
  buildMultipleDocs,
  packageNameToTenantId,

  // Discovery
  analyzePackage,
  getConventionSummary,

  // Source
  createNpmSource,
  parseReadme,
  parseReadmeIntoSections,
  extractBadges,
  buildTableOfContents,
  splitReadmeIntoPages,
  extractCodeExamples,
  extractInstallInstructions,

  // Meta generation
  generateMetaFromFiles,
  generateDirectoryMeta,
  generateTreeMeta,
  treeToMeta,
  inferPageOrder,
  generateSidebarItems,

  // Configuration
  DEFAULT_CONFIG,
  THEME_PRESETS,
  mergeConfig,
  getPackageConfig,
  validateDocsConfig,
  validateFrontmatter,
  validateMetaJson,
  parseOverrides,
  applyOverrides,
  generateThemeCss,

  // Templates
  generateLayoutTemplate,
  generatePageTemplate,
  generateDocsPageTemplate,
  generateSourceTemplate,
  generateGlobalsCss,
  generateNextConfigTemplate,
  generateTailwindConfigTemplate,

  // Tenant Output
  writeTenantOutput,
  cleanTenantOutput,
  listTenantBuilds,
  getTenantBuildInfo,

  // Version
  VERSION,
} from 'docs.td';
```

### Worker Exports

For Cloudflare Workers deployment:

```typescript
import {
  // Default worker handler
  default as worker,

  // Router utilities
  extractSubdomain,
  packageNameToSubdomain,
  subdomainToPackageName,
  parseDocsPath,
  buildDocsUrl,
  isValidSubdomain,
  isReservedSubdomain,
  generateUniqueSubdomain,
  matchTenantRoute,
  RESERVED_SUBDOMAINS,

  // Auth utilities
  verifyAuth,
  createJWT,
  hasPermission,
  hasPackageAccess,
  checkRateLimit,
  cleanupRateLimits,
} from 'docs.td/worker';
```

### Type Exports

```typescript
import type {
  // Core types
  MDXFile,
  MetaJson,
  OverrideConfig,
  PackageDocsConvention,
  DocsPage,
  DocsTree,
  BuildOutput,

  // Config types
  DocsConfig,
  DocsConfigInput,
  DocsConfigOutput,
  ThemePreset,
  ThemeColors,
  ThemeFonts,
  CodeHighlightTheme,
  SidebarConfig,
  NavConfig,
  NavLink,
  FooterConfig,
  FooterLink,
  TocConfig,

  // Frontmatter & meta
  MdxFrontmatter,
  MetaJsonType,

  // Override types
  ParsedOverrides,
  LogoOverride,
  LayoutOverride,
  ThemeOverride,
  IndexOverride,

  // Build types
  BuildOptions,
  BuildResult,
  TenantOutputOptions,
  TenantBuildResult,

  // Source types
  FumadocsSource,
  ReadmeSection,
  ParsedReadme,
  TableOfContentsItem,

  // Router types
  DocsPathInfo,
  TenantRoute,

  // Auth types
  AuthResult,
  JWTPayload,
} from 'docs.td';
```

## Examples

### Programmatic Build

```typescript
import { buildDocs, analyzePackage } from 'docs.td';

// Analyze a package
const convention = await analyzePackage('./my-package');
console.log(`Found ${convention.docsFolder?.files.length || 0} doc files`);

// Build documentation
const result = await buildDocs({
  packagePath: './my-package',
  tenantId: 'my-package',
  outputDir: './dist',
  config: {
    theme: { preset: 'ocean' },
    features: { search: true },
  },
  verbose: true,
});

if (result.success) {
  console.log(`Built ${result.pages} pages in ${result.duration}ms`);
} else {
  console.error('Build failed:', result.errors);
}
```

### Custom Source Integration

```typescript
import { createNpmSource, analyzePackage } from 'docs.td';

const convention = await analyzePackage('./my-package');
const source = createNpmSource(convention);

// Access generated pages
for (const page of source.pages) {
  console.log(`${page.slug.join('/')} - ${page.title}`);
}

// Get page tree for navigation
console.log(source.pageTree);
```

### README Parsing

```typescript
import { parseReadme, extractCodeExamples, extractInstallInstructions } from 'docs.td';

const readmeContent = await fs.readFile('./README.md', 'utf-8');

const parsed = parseReadme(readmeContent);
console.log('Title:', parsed.title);
console.log('Sections:', parsed.sections.map(s => s.title));
console.log('Badges:', parsed.badges.length);

const codeExamples = extractCodeExamples(readmeContent);
console.log('Code examples:', codeExamples.length);

const installInstructions = extractInstallInstructions(readmeContent);
console.log('Install command:', installInstructions);
```

### Configuration Validation

```typescript
import { validateDocsConfig, validateFrontmatter } from 'docs.td';

// Validate docs configuration
try {
  const config = validateDocsConfig({
    theme: { preset: 'ocean' },
    features: { search: true },
  });
  console.log('Valid config:', config);
} catch (error) {
  console.error('Invalid config:', error);
}

// Validate MDX frontmatter
try {
  const frontmatter = validateFrontmatter({
    title: 'My Page',
    order: 1,
    draft: false,
  });
  console.log('Valid frontmatter:', frontmatter);
} catch (error) {
  console.error('Invalid frontmatter:', error);
}
```

### Multi-Package Build

```typescript
import { buildMultipleDocs } from 'docs.td';

const packages = [
  { packagePath: './packages/core', tenantId: 'myorg-core' },
  { packagePath: './packages/cli', tenantId: 'myorg-cli' },
  { packagePath: './packages/utils', tenantId: 'myorg-utils' },
];

const results = await buildMultipleDocs(packages);

for (const result of results) {
  if (result.success) {
    console.log(`${result.tenantId}: ${result.pages} pages built`);
  } else {
    console.error(`${result.tenantId}: failed - ${result.errors.join(', ')}`);
  }
}
```

## Project Structure

docs.td follows standard npm package conventions:

```
my-package/
├── package.json           # Package metadata (name, version, description)
├── README.md              # Main documentation (parsed automatically)
├── docs/                  # Documentation folder (optional)
│   ├── meta.json          # Page ordering
│   ├── getting-started.mdx
│   ├── installation.md
│   └── api/
│       ├── meta.json
│       └── overview.mdx
└── docs.td/               # Configuration overrides (optional)
    ├── theme.json
    ├── layout.json
    └── index.mdx          # Custom landing page
```

## Architecture

### Package Structure

```
packages/docs.td/
├── src/
│   ├── index.ts                    # Main entry point with all exports
│   ├── cli/                        # CLI implementation
│   │   ├── index.ts                # CLI entry point (docs.td command)
│   │   └── commands/               # CLI command handlers
│   │       ├── build.ts            # Build command
│   │       ├── preview.ts          # Preview server command
│   │       ├── deploy.ts           # Cloudflare deployment command
│   │       ├── init.ts             # Project initialization command
│   │       └── info.ts             # Package info command
│   ├── core/                       # Core library
│   │   ├── discovery/              # Package discovery and analysis
│   │   │   ├── types.ts            # Core type definitions
│   │   │   ├── conventions.ts      # File/folder naming conventions
│   │   │   └── analyzer.ts         # Package structure analyzer
│   │   ├── source/                 # Documentation source processing
│   │   │   ├── npm-source.ts       # Fumadocs source adapter
│   │   │   ├── readme-parser.ts    # README.md parsing utilities
│   │   │   └── meta-generator.ts   # meta.json generation
│   │   ├── config/                 # Configuration handling
│   │   │   ├── defaults.ts         # Default configuration values
│   │   │   ├── schema.ts           # Zod validation schemas
│   │   │   └── overrides.ts        # Override file parsing
│   │   └── build/                  # Build pipeline
│   │       ├── builder.ts          # Main DocsBuilder class
│   │       └── tenant-output.ts    # Tenant-specific output generation
│   ├── templates/                  # Template generators
│   │   └── index.ts                # React/Next.js template generators
│   └── worker/                     # Cloudflare Worker
│       ├── index.ts                # Worker entry point
│       ├── router.ts               # Request routing utilities
│       └── auth.ts                 # Authentication utilities
├── dist/                           # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── wrangler.jsonc                  # Cloudflare Worker configuration
```

### Build Pipeline

1. **Discovery Phase** (`analyzer.ts`)
   - Validates package directory contains `package.json`
   - Extracts metadata (name, version, description, repository)
   - Finds README file using pattern matching
   - Discovers `docs/` folder with MDX files
   - Locates override files in `docs.td/` folder

2. **Source Creation** (`npm-source.ts`)
   - Parses README into sections
   - Processes MDX files from docs folder
   - Generates page structure and navigation tree
   - Creates Fumadocs-compatible source object

3. **Configuration Merge** (`defaults.ts`, `overrides.ts`)
   - Starts with default configuration
   - Merges package.json `docs.td` field
   - Applies override files (theme.json, layout.json)
   - Validates final configuration with Zod schemas

4. **Template Generation** (`templates/index.ts`)
   - Generates Next.js layout and page components
   - Creates Fumadocs source configuration
   - Outputs Tailwind CSS with theme variables
   - Produces sitemap.xml and robots.txt

5. **Output Writing** (`tenant-output.ts`)
   - Creates tenant-specific directory structure
   - Writes template files and MDX content
   - Generates manifest.json for the worker
   - Creates static assets (HTML, CSS, JSON)

### Cloudflare Worker

The Cloudflare Worker handles multi-tenant routing and serves documentation:

```typescript
// Worker entry point structure
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Extract subdomain from hostname
    // 2. Validate request path (prevent traversal)
    // 3. Handle CORS preflight if needed
    // 4. Route to API handler or static assets
    // 5. Apply caching and security headers
  }
}
```

**Worker Features:**

- **Subdomain Routing**: Routes `package-name.docs.td` to tenant assets
- **Path Validation**: Prevents directory traversal attacks
- **CORS Support**: Configurable allowed origins
- **API Endpoints**: Health check, manifest, pages, and search
- **Caching**: Aggressive caching for static assets
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options

**API Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check with environment info |
| `/api/manifest` | GET | Package manifest (name, version, pages) |
| `/api/pages` | GET | All documentation pages |
| `/api/search?q=query` | GET | Full-text search across pages |

### File Conventions

docs.td automatically discovers documentation using these conventions:

| Type | Patterns (priority order) |
|------|--------------------------|
| README | `README.md`, `README.mdx`, `readme.md`, `readme.mdx`, `Readme.md`, `Readme.mdx` |
| Docs Folder | `docs`, `documentation`, `doc`, `.docs` |
| Meta Files | `meta.json`, `_meta.json`, `_meta.js`, `_meta.ts` |
| MDX Files | `*.mdx`, `*.md` |
| Override Folder | `docs.td`, `.docs.td` |

**Ignored Directories:**
`node_modules`, `.git`, `.github`, `dist`, `build`, `coverage`, `.next`, `.cache`

### Default Page Order

When no `meta.json` is provided, pages are automatically ordered:

1. `index`
2. `getting-started`
3. `installation`
4. `quickstart`
5. `usage`
6. `api`
7. `examples`
8. `faq`
9. `changelog`
10. `contributing`

Pages not in this list are sorted alphabetically after.

## Security

### Path Validation

All request paths are validated to prevent directory traversal:

```typescript
function validatePath(pathname: string): boolean {
  // Rejects: "..", "//", null bytes
  if (pathname.includes('..')) return false;
  if (pathname.includes('//')) return false;
  if (pathname.includes('\0')) return false;
  return true;
}
```

### Authentication

The worker supports API key and JWT authentication for write operations:

```typescript
// API Key authentication
headers: { 'X-API-Key': 'your-secret-key' }

// JWT Bearer token
headers: { 'Authorization': 'Bearer <jwt-token>' }
```

**JWT Payload Structure:**

```typescript
interface JWTPayload {
  sub: string;           // User ID
  iat: number;           // Issued at timestamp
  exp: number;           // Expiration timestamp
  permissions?: string[]; // ['read', 'write', 'admin']
  packageAccess?: string[]; // ['*'] or ['package-name']
}
```

### Rate Limiting

Simple in-memory rate limiting is available:

```typescript
import { checkRateLimit } from 'docs.td/worker';

const { allowed, remaining, resetAt } = checkRateLimit(
  clientIP,    // Rate limit key
  100,         // Max requests
  60000        // Window in milliseconds
);
```

### Content Security Policy

All responses include CSP headers:

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
frame-ancestors 'none';
```

## Advanced Usage

### Custom Worker Configuration

Deploy with custom wrangler configuration:

```toml
# wrangler.toml
name = "docs-td-custom"
main = "worker/index.js"
compatibility_date = "2024-12-01"

[assets]
directory = "./"
binding = "ASSETS"

[vars]
ENVIRONMENT = "production"
ALLOWED_ORIGINS = "https://example.com,https://app.example.com"

[[routes]]
pattern = "*.custom-docs.com"
zone_name = "custom-docs.com"
```

### Theme Presets Reference

| Preset | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| default | `#0070f3` | `#7928ca` | `#ff0080` |
| ocean | `#0891b2` | `#06b6d4` | `#22d3ee` |
| forest | `#059669` | `#10b981` | `#34d399` |
| sunset | `#dc2626` | `#f97316` | `#fbbf24` |
| monochrome | `#18181b` | `#3f3f46` | `#71717a` |

### File Size Limits

| Limit | Value |
|-------|-------|
| Max MDX file size | 1 MB |
| Max total docs size | 10 MB |
| Max file count | 500 files |

## Troubleshooting

### Common Issues

**"package.json not found"**
- Ensure you're running docs.td from a directory containing package.json
- Specify the package path explicitly: `docs.td build ./path/to/package`

**"wrangler is not installed"**
- Install wrangler globally: `npm install -g wrangler`
- Authenticate with Cloudflare: `wrangler login`

**"Too many documentation files"**
- docs.td limits to 500 files per package
- Consider consolidating smaller files or using a monorepo structure

**Build fails with "Invalid configuration"**
- Check your docs.td.json or package.json `docs.td` field
- Validate color values are proper hex codes (e.g., `#0070f3`)
- Ensure all required fields have correct types

## Requirements

- Node.js 20+ (LTS recommended)
- [wrangler](https://developers.cloudflare.com/workers/wrangler/) (for deployment)

## Contributing

Contributions are welcome! Please see the main repository's contributing guidelines.

## License

MIT
