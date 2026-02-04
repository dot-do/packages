---
name: create-startups
version: 0.1.1
description: Startup Factory CLI - Generate and validate startup ideas with AI
license: MIT
repository: "https://github.com/dotdo-io/db.sb"
homepage: "https://startups.studio"
keywords:
  - startups
  - create
  - cli
  - ai
  - business
downloads:
  monthly: 20
published: "2025-12-17T19:44:45.086Z"
updated: "2025-12-17T19:53:32.885Z"
---

# create-startups

Startup Factory CLI - Generate and validate startup ideas with AI-powered feedback from expert personas.

## Quick Start

```bash
npx create-startups
```

Or with a name:

```bash
npx create-startups "My Startup Idea"
```

## What It Does

`create-startups` is an interactive CLI wizard that guides you through the essential questions every founder should answer:

1. **IDEA** - What's your startup idea?
2. **CUSTOMER** - Who is your target customer?
3. **PROBLEM** - What problem are you solving?
4. **FOUNDER CAPABILITY** - What unique skills do you bring?
5. **FOUNDER INSIGHT** - What do you know that others don't?
6. **FOUNDER MOTIVATION** - Why are you the right person for this?
7. **COMPETITORS** - Who else is solving this problem?
8. **PRODUCT/SERVICE** - What will you build?
9. **NAME** - What will you call it?
10. **DOMAIN** - Do you have a domain?

### AI Agent Feedback

After completing the wizard, you'll receive feedback from four AI personas:

- **Priya** (Product) - Evaluates product-market fit and MVP viability
- **Mark** (Marketing) - Analyzes positioning and customer acquisition
- **Sally** (Sales) - Assesses revenue model and pricing strategy
- **Tom** (Tech) - Reviews technical feasibility and architecture

### Project Generation

The CLI creates a complete startup portfolio project structure:

```
my-startup/
├── .db.sb/
│   └── config.ts           # Database configuration
├── startups/
│   └── my-startup/
│       └── index.mdx       # Main startup document
├── founders/
│   └── founder.mdx         # Founder profile
├── ideas/
│   └── my-startup.mdx      # Idea documentation
├── problems/
│   └── main-problem.mdx    # Problem statement
├── customers/
│   └── target-customer.mdx # Customer segment
├── experiments/            # Validation experiments
├── hypotheses/             # Business hypotheses
└── package.json
```

### GitHub Integration

Optionally connect to GitHub to:
- Authenticate via OAuth (oauth.do)
- Create a private repository
- Push your startup portfolio

## Options

```
Usage: create-startups [options] [name]

Arguments:
  name           Name for your startup portfolio

Options:
  -V, --version  output the version number
  -y, --yes      Skip prompts and use defaults
  --no-git       Skip GitHub integration
  --no-ai        Skip AI agent feedback
  -h, --help     display help for command
```

## Examples

### Full wizard with AI feedback and GitHub

```bash
npx create-startups
```

### Quick local-only mode

```bash
npx create-startups "My SaaS Idea" --no-git --no-ai
```

### Skip GitHub but get AI feedback

```bash
npx create-startups --no-git
```

## Requirements

- Node.js 18+
- Internet connection (for AI feedback and GitHub integration)

## API

The AI feedback uses the [api.sb](https://api.sb) generation API. If the API is unavailable, placeholder feedback with general guidance is provided.

## Related

- [startups.studio](https://startups.studio) - Full startup development platform
- [db.sb](https://github.com/dotdo-io/db.sb) - Business-as-Code database
- [api.sb](https://api.sb) - AI and integration APIs

## License

MIT
