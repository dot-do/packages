---
name: "@dotdo/landing"
version: 6.0.0
description: Landing page components for .do platform sites
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://github.com/dot-do/ui#readme"
downloads:
  monthly: 9
published: "2026-01-24T14:37:55.012Z"
updated: "2026-01-24T14:37:55.217Z"
---

# @dotdo/landing

Landing page components for .do platform sites (functions.do, database.do, etc.).

## Installation

```bash
pnpm add @dotdo/landing @mdxui/primitives @mdxui/themes
```

## Quick Start

```tsx
import { PrimitivePage } from '@dotdo/landing/templates'
import { Site } from '@mdxui/themes'

export default function FunctionsDoPage() {
  return (
    <Site theme="cyan" mode="dark">
      <PrimitivePage
        hero={{
          title: 'Typesafe Functions',
          description: 'Build and deploy serverless functions with full type safety.',
          codeSnippet: `import { fn } from 'functions.do'

const hello = fn('hello', async (name: string) => {
  return \`Hello, \${name}!\`
})`,
          primaryAction: { label: 'Get Started', href: '/docs' },
          secondaryAction: { label: 'View on GitHub', href: '/github' },
        }}
        features={{
          title: 'Why Functions.do?',
          items: [
            { icon: Zap, title: 'Fast', description: 'Cold starts under 50ms' },
            { icon: Shield, title: 'Secure', description: 'End-to-end encryption' },
            { icon: Code, title: 'Typesafe', description: 'Full TypeScript support' },
          ],
        }}
        faq={{
          title: 'FAQ',
          items: [
            { question: 'How do I deploy?', answer: 'Run `fn deploy` in your terminal.' },
          ],
        }}
      />
    </Site>
  )
}
```

## Templates

### PrimitivePage

A complete landing page template for .do primitive sites with hero, features, code tabs, FAQ, and CTA sections.

```tsx
import { PrimitivePage } from '@dotdo/landing/templates'

<PrimitivePage
  hero={{
    title: ReactNode,
    description: ReactNode,
    codeSnippet?: string,
    glowColor?: string,        // e.g., '#00ffff'
    glowIntensity?: number,    // 0-1
    glowOffsetY?: string,      // e.g., '20%'
    primaryAction?: { label: string, href: string },
    secondaryAction?: { label: string, href: string },
  }}
  features={{
    title?: string,
    items: Array<{ icon: ComponentType, title: string, description: string }>,
  }}
  codeTabs={{
    title?: ReactNode,
    tabs: Array<{ label: string, language: string, code: string }>,
  }}
  faq={{
    title?: string,
    items: Array<{ question: string, answer: string }>,
  }}
  cta={{
    title: string,
    description?: string,
    primaryAction?: { label: string, href: string },
  }}
/>
```

### PageWrapper

A utility wrapper for consistent page layout with header/footer.

```tsx
import { PageWrapper } from '@dotdo/landing/templates'
```

## Components

Import individual components for more control:

```tsx
import {
  HeroCode,
  FeaturesBlock,
  CodeTabs,
  Faq,
  Cta,
  Timeline,
  Contact,
  ContactForm,
  CopyInput,
} from '@dotdo/landing/components'
```

### HeroCode

Hero section with syntax-highlighted code snippet and glow effect.

### FeaturesBlock

Grid of feature cards with icons.

### CodeTabs

Tabbed code examples with syntax highlighting (powered by Shiki).

### Faq

Accordion-style FAQ section.

### Cta

Call-to-action section with title, description, and action buttons.

## Backgrounds

Animated background components:

```tsx
import { BgGlow, BgLightRays, LightRays } from '@dotdo/landing/backgrounds'

// CSS glow effect
<BgGlow color="#00ffff" intensity={0.5} />

// WebGL light rays
<BgLightRays origin="top" />
```

## Decorations

Visual decorative elements:

```tsx
import {
  GridCross,
  DecorativeHorizontal,
  DecorativeVertical,
  StripedPattern,
} from '@dotdo/landing/decorations'
```

## Animations

Motion components:

```tsx
import { BrandsMarquee, TextReveal } from '@dotdo/landing/animations'

// Scrolling brand logos
<BrandsMarquee brands={[{ name: 'Acme', logo: <AcmeLogo /> }]} />

// Text that reveals on scroll
<TextReveal text="Build faster with .do" />
```

## Usage with Site

Wrap your page with `Site` from `@mdxui/themes` for theming:

```tsx
import { Site } from '@mdxui/themes'
import { PrimitivePage } from '@dotdo/landing/templates'

<Site theme="cyan" mode="dark">
  <PrimitivePage {...props} />
</Site>
```

## License

MIT
