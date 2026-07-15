---
name: startup-names
version: 0.1.6
description: Name your startup. Own the brand.
license: MIT
keywords:
  - naming
  - startup
  - branding
  - domains
  - business
downloads:
  monthly: 14
published: "2025-12-17T20:54:11.360Z"
updated: "2025-12-17T20:54:11.607Z"
---

# startup-names

Name your startup. Own the brand.

## Quick Start

```bash
npx startup-names "marketplace for freelance designers"
```

```
✓ Designly         designly.hq.sb (free)      designly.io ($29)
✓ CreativeHub      creativehub.hq.sb (free)   creativehub.co ($49)
✓ PixelMatch       pixelmatch.hq.sb (free)    pixelmatch.io ($29)
✓ Artisan          artisan.hq.sb (free)       artisan.design ($89)
✓ Briefcase        briefcase.hq.sb (free)     briefcase.io ($29)
```

## Install

```bash
npm install startup-names
```

## CLI

```bash
# Generate startup names
startup-names "marketplace for freelance designers"

# Industry-specific
startup-names "fintech for small business" --industry fintech
startup-names "AI for healthcare" --industry health

# Tone
startup-names "legal services" --tone professional
startup-names "pet products" --tone playful

# More options
startup-names "your idea" --count 20
startup-names "your idea" --style abstract

# Full branding
startup-names "your idea" --full  # Name + tagline + logo concept
```

## SDK

```typescript
import { startup } from 'startup-names'

// Generate names
const results = await startup.generate({
  description: 'marketplace for freelance designers',
  count: 10
})

// Generate with industry context
const results = await startup.generate({
  description: 'AI-powered legal document review',
  industry: 'legal',
  tone: 'professional',
  style: 'brandable'
})

// Full brand package
const brand = await startup.fullBrand({
  description: 'marketplace for designers',
  name: 'Designly'
})
// {
//   name: 'Designly',
//   tagline: 'Where design meets opportunity',
//   logoIdea: 'Abstract D with creative flourish',
//   colorPalette: ['#6366F1', '#F43F5E', '#FFFFFF'],
//   domains: { free: 'designly.hq.sb', paid: [...] }
// }
```

## Naming Styles

### Abstract
Invented, memorable: `Figma`, `Notion`, `Slack`

```typescript
const names = await startup.generate({
  description: 'design collaboration',
  style: 'abstract'
})
```

### Compound
Two concepts merged: `Airbnb`, `YouTube`, `Facebook`

```typescript
const names = await startup.generate({
  description: 'home sharing',
  style: 'compound'
})
```

### Evocative
Suggests the benefit: `Zoom`, `Stripe`, `Calm`

```typescript
const names = await startup.generate({
  description: 'video conferencing',
  style: 'evocative'
})
```

### Founder-style
Personal touch: `Warby Parker`, `Ben & Jerry's`

```typescript
const names = await startup.generate({
  description: 'eyewear',
  style: 'founder',
  founderNames: ['Alice', 'Bob']
})
```

## Industry Presets

```typescript
// Fintech
const names = await startup.generate({
  description: 'payments for freelancers',
  industry: 'fintech'
})
// Prioritizes: trust, security, professionalism

// Health
const names = await startup.generate({
  description: 'mental health app',
  industry: 'health'
})
// Prioritizes: calm, care, wellness

// Developer tools
const names = await startup.generate({
  description: 'CI/CD platform',
  industry: 'devtools'
})
// Prioritizes: speed, reliability, technical
```

## Brand Variations

```typescript
// Check name across variations
const variations = await startup.variations('acme')
// {
//   exact: 'acme.com',
//   prefixed: ['getacme.com', 'useacme.com', 'tryacme.com'],
//   suffixed: ['acmehq.com', 'acmeapp.com', 'acmeio.com'],
//   free: ['acme.hq.sb', 'acme.io.sb']
// }
```

## MCP Server

```json
{
  "mcpServers": {
    "startup-names": {
      "command": "npx",
      "args": ["startup-names", "mcp"]
    }
  }
}
```

> "Name my fintech startup"
> "Generate playful names for a pet subscription service"
> "Create a full brand for my marketplace idea"

## Integration

```typescript
import { startup } from 'startup-names'
import { domains } from 'builder.domains'
import { landing } from 'landing-page'

// Full startup launch
const brand = await startup.fullBrand({
  description: 'marketplace for designers'
})

await domains.claim(brand.domains.free)
const page = await landing.generate({
  product: brand.name,
  tagline: brand.tagline,
  colors: brand.colorPalette
})
await landing.deploy(page, { domain: brand.domains.free })
```

## License

MIT
