# @dot-do/packages

Public monorepo for miscellaneous npm packages with independent versioning.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@dot-do/logger](./packages/logger) | `0.1.0` | Lightweight logging utility with structured logging support |
| [@dot-do/types](./packages/types) | `0.1.0` | Shared TypeScript types for dot-do packages |

## Tech Stack

- **pnpm Workspaces** - Monorepo package management
- **Turborepo** - Build system and task orchestration
- **Changesets** - Independent versioning and changelog generation
- **TypeScript** - Type safety across all packages
- **Vitest** - Fast unit testing framework
- **ESLint + Prettier** - Code quality and formatting

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/dot-do/packages.git
cd packages

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test
```

### Development

```bash
# Start development mode (watch mode for all packages)
pnpm run dev

# Run tests in watch mode
pnpm run test:watch

# Lint code
pnpm run lint

# Format code
pnpm run format

# Type check
pnpm run typecheck
```

## Creating a New Package

1. **Create package directory**

```bash
mkdir -p packages/my-package/src packages/my-package/tests
cd packages/my-package
```

2. **Create `package.json`**

```json
{
  "name": "@dot-do/my-package",
  "version": "0.1.0",
  "description": "My awesome package",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/**/*.ts",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "keywords": ["my-package"],
  "author": "dot-do",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/dot-do/packages.git",
    "directory": "packages/my-package"
  },
  "files": ["dist"],
  "devDependencies": {
    "@types/node": "^20.11.5",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3",
    "vitest": "^1.2.1"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

3. **Create `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

4. **Create `src/index.ts`**

Write your package code here.

5. **Create tests**

Write tests in `tests/` directory using Vitest.

6. **Add to workspace**

The package will be automatically detected by pnpm workspace (configured in `pnpm-workspace.yaml`).

7. **Install dependencies**

```bash
cd ../..
pnpm install
```

## Versioning & Publishing

We use [Changesets](https://github.com/changesets/changesets) for managing versions and changelogs.

### Creating a Changeset

When you make changes to a package:

```bash
# Create a changeset describing your changes
pnpm changeset

# Follow the prompts:
# 1. Select which packages changed
# 2. Select bump type (major, minor, patch)
# 3. Write a summary of changes

# Commit the changeset
git add .changeset
git commit -m "Add changeset for my changes"
```

### Automated Publishing Workflow

1. **Make changes** to one or more packages
2. **Create changeset** using `pnpm changeset`
3. **Commit and push** to a branch
4. **Create PR** to main
5. **Merge PR** to main
6. **Changesets bot** automatically creates a "Version Packages" PR
7. **Review and merge** the "Version Packages" PR
8. **Packages are automatically published** to npm
9. **GitHub releases** are automatically created

### Manual Publishing (Not Recommended)

```bash
# Version packages based on changesets
pnpm run version-packages

# Build and publish
pnpm run build
pnpm run release
```

## Workspace Structure

```
.
├── .changeset/                 # Changesets configuration and pending changesets
├── .github/
│   └── workflows/
│       ├── ci.yml             # CI workflow (test, lint, build)
│       └── changesets.yml     # Release workflow (automated publishing)
├── packages/
│   ├── logger/                # @dot-do/logger package
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── types/                 # @dot-do/types package
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── .../                   # Additional packages
├── node_modules/              # Shared dependencies
├── .eslintrc.js               # Shared ESLint config
├── .prettierrc                # Shared Prettier config
├── turbo.json                 # Turborepo pipeline configuration
├── pnpm-workspace.yaml        # pnpm workspace configuration
├── tsconfig.base.json         # Shared TypeScript config
├── package.json               # Root package.json
├── README.md                  # This file
└── CLAUDE.md                  # Developer guidelines
```

## Turborepo Pipelines

Configured in `turbo.json`:

- **build** - Builds all packages (depends on dependencies being built first)
- **test** - Runs tests (depends on build)
- **lint** - Lints code
- **typecheck** - Type checks all packages
- **dev** - Development mode (watch mode)

Turborepo automatically:
- Runs tasks in dependency order
- Caches build outputs
- Parallelizes independent tasks
- Skips unchanged packages

## Scripts

### Root-level Scripts

- `pnpm run build` - Build all packages
- `pnpm run dev` - Start development mode for all packages
- `pnpm run test` - Run tests for all packages
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run lint` - Lint all packages
- `pnpm run typecheck` - Type check all packages
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check code formatting
- `pnpm run clean` - Clean all build outputs
- `pnpm changeset` - Create a new changeset
- `pnpm run version-packages` - Version packages based on changesets
- `pnpm run release` - Publish packages to npm

### Package-specific Scripts

Run scripts in a specific package:

```bash
pnpm --filter @dot-do/logger build
pnpm --filter @dot-do/logger test
pnpm --filter @dot-do/types dev
```

## CI/CD

### GitHub Actions

- **CI Workflow** (`.github/workflows/ci.yml`)
  - Runs on every push and PR
  - Type checks, lints, builds, and tests all packages
  - Uses Turborepo for caching and parallelization

- **Release Workflow** (`.github/workflows/changesets.yml`)
  - Runs on push to main
  - Creates "Version Packages" PR when changesets exist
  - Publishes packages to npm when "Version Packages" PR is merged
  - Creates GitHub releases

### Required Secrets

Add these secrets in GitHub repository settings:

- `NPM_TOKEN` - npm access token with publish permissions
  - Generate at: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
  - Type: Automation

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** to one or more packages
4. **Create a changeset** (`pnpm changeset`)
5. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## Code Quality

### Type Safety

- All packages use TypeScript with strict mode
- No `any` types allowed (use `unknown` with type guards)
- Shared `tsconfig.base.json` for consistency

### Testing

- Minimum 80% test coverage required
- Use Vitest for all tests
- Write tests in `tests/` directory

### Code Style

- Prettier for automated formatting (width: 160, single quotes, no semicolons)
- ESLint for linting
- Horizontal code style preferred

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/dot-do/packages/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dot-do/packages/discussions)
- **Documentation**: See individual package READMEs

## Related Repositories

- [@dot-do/sdk](https://github.com/dot-do/sdk) - Generated SDK packages
- [@dot-do/api](https://github.com/dot-do/api) - API server
- [@dot-do/db](https://github.com/dot-do/db) - Database layer
- [@dot-do/ai](https://github.com/dot-do/ai) - AI utilities

---

**Managed by**: Claude Code (AI Project Manager)
**Last Updated**: 2025-01-15
