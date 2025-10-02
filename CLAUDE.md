# CLAUDE.md - @dot-do/packages Development Guidelines

## Overview

This is a public monorepo containing miscellaneous npm packages for the dot-do organization. Packages are independently versioned using Changesets and published to npm with automated workflows.

## Tech Stack

- **pnpm 8+** - Fast, disk-efficient package manager with workspace support
- **Turborepo** - Build orchestration with intelligent caching
- **Changesets** - Independent versioning and automated publishing
- **TypeScript 5.3+** - Strict mode, no `any` types
- **Vitest** - Fast unit testing framework
- **tsup** - Bundle packages for ESM/CJS with type definitions
- **ESLint + Prettier** - Code quality and consistent formatting

## Development Workflow

### Setting Up Development Environment

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development mode (watch mode)
pnpm run dev
```

### Working on a Package

```bash
# Build specific package
pnpm --filter @dot-do/logger build

# Test specific package
pnpm --filter @dot-do/logger test

# Dev mode for specific package
pnpm --filter @dot-do/logger dev

# Lint specific package
pnpm --filter @dot-do/logger lint
```

### Creating a New Package

1. **Create directory structure**

```bash
mkdir -p packages/my-package/src packages/my-package/tests
```

2. **Create package.json** (copy from existing package and modify)

Key fields:
- `name`: `@dot-do/my-package`
- `version`: Start at `0.1.0`
- `publishConfig.access`: `"public"`
- `scripts`: Include `build`, `dev`, `test`, `lint`, `typecheck`, `clean`
- `exports`: Dual CJS/ESM with type definitions

3. **Create tsconfig.json**

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

4. **Implement package in `src/index.ts`**

5. **Write tests in `tests/`**

6. **Create README.md** with usage examples

7. **Run `pnpm install`** to add package to workspace

### Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests for specific package
pnpm --filter @dot-do/logger test

# Run tests with coverage
pnpm --filter @dot-do/logger test -- --coverage
```

**Test Requirements:**
- Minimum 80% coverage
- Test all public APIs
- Test edge cases and error handling
- Use descriptive test names

### Building

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter @dot-do/logger build

# Clean build outputs
pnpm run clean
```

Builds are handled by **tsup**:
- Outputs CJS (`.js`) and ESM (`.mjs`) formats
- Generates TypeScript declarations (`.d.ts`)
- No bundling of dependencies
- Source maps included

### Linting & Formatting

```bash
# Lint all packages
pnpm run lint

# Format all code
pnpm run format

# Check formatting without modifying
pnpm run format:check

# Type check all packages
pnpm run typecheck
```

**Code Style:**
- Prettier with 160 character line width
- Single quotes, no semicolons
- Horizontal code layout preferred
- ESLint with TypeScript rules
- No `any` types (use `unknown` with type guards)

## Versioning & Publishing

### Changesets Workflow

When you make changes to a package:

```bash
# 1. Make your changes to package(s)
# ...

# 2. Create a changeset
pnpm changeset

# Follow prompts:
# - Select which packages changed (spacebar to select)
# - Select bump type (major | minor | patch)
# - Write a summary of changes

# 3. Commit changeset
git add .changeset
git commit -m "feat: add new feature"

# 4. Push and create PR
git push origin feature/my-feature
```

### Automated Publishing Process

1. **Developer** creates PR with changes + changeset
2. **CI** runs tests, lints, builds on PR
3. **PR merged** to main
4. **Changesets bot** creates "Version Packages" PR
   - Updates package versions
   - Updates CHANGELOGs
   - Removes consumed changesets
5. **Maintainer** reviews and merges "Version Packages" PR
6. **GitHub Action** automatically:
   - Builds packages
   - Publishes to npm
   - Creates GitHub releases
   - Adds git tags

### Version Bump Types

- **Patch** (0.1.0 → 0.1.1) - Bug fixes, minor changes, no breaking changes
- **Minor** (0.1.0 → 0.2.0) - New features, backward compatible
- **Major** (0.1.0 → 1.0.0) - Breaking changes

### Manual Publishing (Emergency Only)

```bash
# Version packages
pnpm run version-packages

# Review changes in package.json and CHANGELOG.md

# Build and publish
pnpm run build
pnpm run release
```

## Package Structure

Every package should follow this structure:

```
packages/my-package/
├── src/
│   └── index.ts           # Main entry point
├── tests/
│   └── my-package.test.ts # Tests
├── package.json           # Package manifest
├── tsconfig.json          # TypeScript config
├── README.md              # Usage docs
└── dist/                  # Build output (gitignored)
    ├── index.js           # CJS output
    ├── index.mjs          # ESM output
    └── index.d.ts         # Type definitions
```

## Turborepo Pipelines

Configured in `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Key Concepts:**
- `^build` - Run dependencies' build first
- `dependsOn` - Task dependencies
- `outputs` - Cached outputs
- `cache: false` - Don't cache (tests, dev mode)
- `persistent: true` - Long-running tasks (dev mode)

## Workspace Dependencies

Reference other packages in the monorepo:

```json
{
  "dependencies": {
    "@dot-do/types": "workspace:*"
  }
}
```

The `workspace:*` protocol:
- Links to local package during development
- Replaced with actual version on publish
- Ensures correct dependency resolution

## GitHub Actions

### CI Workflow (`.github/workflows/ci.yml`)

Triggers on: Push to main, Pull requests

Steps:
1. Checkout code
2. Setup pnpm and Node.js
3. Install dependencies
4. Type check all packages
5. Lint all packages
6. Format check
7. Build all packages
8. Run all tests

### Release Workflow (`.github/workflows/changesets.yml`)

Triggers on: Push to main

Steps:
1. Checkout code with full history
2. Setup pnpm and Node.js
3. Install dependencies
4. Build packages
5. Run Changesets Action:
   - If changesets exist → Create "Version Packages" PR
   - If "Version Packages" PR merged → Publish to npm

**Required Secrets:**
- `NPM_TOKEN` - npm automation token for publishing

## Common Tasks

### Add Dependency to Package

```bash
# Add dependency to specific package
pnpm --filter @dot-do/logger add zod

# Add dev dependency
pnpm --filter @dot-do/logger add -D @types/node

# Add workspace dependency
pnpm --filter @dot-do/logger add @dot-do/types@workspace:*
```

### Update Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific dependency
pnpm update typescript

# Interactive update
pnpm update -i
```

### Debug Build Issues

```bash
# Clean and rebuild
pnpm run clean
pnpm run build

# Build with verbose output
pnpm --filter @dot-do/logger run build -- --verbose

# Check tsup configuration
cat packages/logger/package.json | grep -A 5 '"build"'
```

### Debug Test Issues

```bash
# Run tests with verbose output
pnpm --filter @dot-do/logger test -- --reporter=verbose

# Run specific test file
pnpm --filter @dot-do/logger test tests/logger.test.ts

# Run tests in watch mode
pnpm --filter @dot-do/logger test:watch
```

## Best Practices

### Code Quality

1. **Type Safety**
   - Use strict TypeScript mode
   - No `any` types (use `unknown` and type guards)
   - Export all public types
   - Document complex types with JSDoc

2. **Testing**
   - Test all public APIs
   - Include edge cases
   - Test error handling
   - Aim for 80%+ coverage
   - Use descriptive test names

3. **Documentation**
   - Clear README with examples
   - JSDoc comments for public APIs
   - Usage examples in tests
   - Document breaking changes in changesets

4. **Dependencies**
   - Keep dependencies minimal
   - Prefer peer dependencies when appropriate
   - No unused dependencies
   - Audit regularly for security

### Package Design

1. **Keep Packages Focused**
   - Single responsibility principle
   - Small, composable packages
   - Clear boundaries

2. **Exports**
   - Export only public APIs
   - Use named exports (not default)
   - Document all exports

3. **Backwards Compatibility**
   - Avoid breaking changes
   - Deprecate before removing
   - Follow semantic versioning strictly

4. **Performance**
   - Tree-shakeable exports
   - No side effects in imports
   - Lazy load heavy dependencies

### Versioning Guidelines

- **Patch** - Bug fixes, docs, internal refactoring
- **Minor** - New features, new exports, backward compatible
- **Major** - Breaking changes, removed exports, API changes

**Breaking Changes:**
- Renamed exports
- Changed function signatures
- Removed functions/types
- Changed behavior (even if signature same)

**Not Breaking:**
- Adding new exports
- Adding optional parameters
- Internal refactoring
- Documentation changes

## Troubleshooting

### Build Failures

```bash
# Clear Turborepo cache
rm -rf .turbo

# Clear all node_modules
pnpm clean
pnpm install

# Rebuild from scratch
pnpm run clean
pnpm run build
```

### Type Errors

```bash
# Generate types
pnpm --filter @dot-do/logger run build

# Check types
pnpm run typecheck

# Check specific package
pnpm --filter @dot-do/logger run typecheck
```

### Publishing Issues

1. **Check npm token** is valid in GitHub secrets
2. **Verify package.json** has `publishConfig.access: "public"`
3. **Check package name** is available on npm
4. **Verify version** is higher than published version

### Changeset Issues

```bash
# Remove all changesets and start fresh
rm -rf .changeset/*.md

# Recreate changeset
pnpm changeset
```

## Useful Commands Reference

```bash
# Workspace
pnpm install                          # Install all dependencies
pnpm --filter <package> <command>     # Run command in specific package

# Development
pnpm run dev                          # Start all packages in watch mode
pnpm run build                        # Build all packages
pnpm run test                         # Run all tests

# Quality
pnpm run lint                         # Lint all packages
pnpm run typecheck                    # Type check all packages
pnpm run format                       # Format all code

# Changesets
pnpm changeset                        # Create changeset
pnpm changeset status                 # Check changeset status
pnpm run version-packages             # Apply changesets
pnpm run release                      # Publish packages

# Turborepo
pnpm turbo run build                  # Build with Turbo
pnpm turbo run build --force          # Build without cache
pnpm turbo run test --no-cache        # Test without cache
```

## Support

- **Issues**: [GitHub Issues](https://github.com/dot-do/packages/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dot-do/packages/discussions)
- **Root README**: [README.md](./README.md)

---

**Last Updated**: 2025-01-15
**Managed By**: Claude Code (AI Project Manager)
