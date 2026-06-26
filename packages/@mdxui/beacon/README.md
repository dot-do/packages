---
name: "@mdxui/beacon"
version: 7.0.0
description: Site template components for mdxui - landing pages, hero sections, and marketing components
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://mdxui.dev"
keywords:
  - mdxui
  - react
  - landing-page
  - hero
  - marketing
  - components
  - templates
downloads:
  monthly: 1130
published: "2025-12-23T12:36:45.467Z"
updated: "2026-01-29T23:13:11.164Z"
---

# @mdxui/beacon

Site template components for mdxui - landing pages, waitlist pages, blog templates, and marketing components.

## Installation

```bash
npm install @mdxui/beacon @mdxui/primitives @mdxui/themes
# or
pnpm add @mdxui/beacon @mdxui/primitives @mdxui/themes
```

## Quick Start

### Landing Page

```tsx
import { Site } from '@mdxui/themes'
import { LandingPage, Hero, Features, Pricing, FAQs } from '@mdxui/beacon'

export default function HomePage() {
  return (
    <Site theme="stripe" mode="system">
      <LandingPage
        header={{
          logo: <Logo />,
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
          ],
        }}
        hero={{
          title: 'Build faster with',
          highlightedText: 'mdxui',
          description: 'Production-ready components for your next project.',
        }}
        features={{
          items: [
            { iconName: 'Zap', title: 'Fast', description: 'Lightning fast.' },
            { iconName: 'Shield', title: 'Secure', description: 'Built secure.' },
          ],
        }}
        pricing={{
          tiers: [
            { name: 'Free', price: '$0', features: ['Basic features'] },
            { name: 'Pro', price: '$29', features: ['All features'] },
          ],
        }}
      />
    </Site>
  )
}
```

### Waitlist Page

```tsx
import { Site } from '@mdxui/themes'
import { WaitlistPage } from '@mdxui/beacon'
import { Logo } from '@mdxui/beacon/shared'

export default function LaunchPage() {
  return (
    <Site theme="cyan" mode="dark">
      <WaitlistPage
        heroConfig={{
          variant: 'code-side',
          eyebrow: 'Coming Soon',
          title: 'Ship faster with AI',
          subtitle: 'Join the waitlist for early access.',
          source: 'my-product', // Optional: for analytics tracking
          code: {
            code: `const app = createApp()
app.deploy()`,
            language: 'typescript',
          },
        }}
        navbar={{
          logo: <Logo brandName="MyApp" />,
          links: [{ label: 'Docs', href: '/docs' }],
        }}
        faq={{
          heading: 'FAQ',
          items: [
            { id: '1', question: 'When will it launch?', answer: 'Q1 2025' },
          ],
        }}
      />
    </Site>
  )
}
```

#### Hero Variants

Each variant extends the base hero props (`eyebrow`, `title`, `subtitle`, `source`, etc.) with variant-specific props:

```tsx
// Simple - just text
heroConfig={{ variant: 'simple', title: '...', subtitle: '...' }}

// Code variants - add `code` prop
heroConfig={{
  variant: 'code-side', // or 'code-stacked', 'code-side-highlights'
  title: '...',
  code: { code: '...', language: 'typescript', filename: 'app.ts' },
}}

// Video variants - add `video` prop
heroConfig={{
  variant: 'video-side', // or 'video-stacked'
  title: '...',
  video: { videoId: 'dQw4w9WgXcQ' },
}}

// Image variants - add `image` prop
heroConfig={{
  variant: 'image-side', // or 'image-stacked'
  title: '...',
  image: { src: '/hero.png', alt: 'Hero image' },
}}

// Cards variant - add `cards` prop
heroConfig={{
  variant: 'cards',
  title: '...',
  cards: {
    left: [{ content: <Card1 /> }],
    right: { top: [{ content: <Card2 /> }], bottom: [{ content: <Card3 /> }] },
  },
}}
```

#### WaitlistPage Props

| Prop | Type | Description |
|------|------|-------------|
| `heroConfig` | `WaitlistHeroConfig` | Hero section configuration (required) |
| `navbar` | `NavbarProps \| null` | Navbar props, or `null` to hide |
| `footer` | `FooterProps \| null` | Footer props, or `null` to hide |
| `faq` | `FaqProps \| null` | FAQ section props, or `null` to hide |
| `bento` | `BentoProps \| null` | Bento grid section, or `null` to hide |
| `highlight` | `HighlightProps \| null` | Highlight section, or `null` to hide |
| `children` | `ReactNode` | Additional sections after hero |
| `className` | `string` | Additional class for page container |

#### Hero Props (inherited by all variants)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `eyebrow` | `string` | `'Introducing'` | Small text above title |
| `title` | `string` | - | Main heading (required) |
| `subtitle` | `string` | - | Description text |
| `alignment` | `'left' \| 'center'` | `'left'` | Text alignment |
| `source` | `string` | `'home'` | Analytics source identifier |
| `inputPlaceholder` | `string` | `'Enter your email'` | Form input placeholder |
| `buttonText` | `string` | `'Join waitlist'` | Submit button text |
| `successMessage` | `string` | `"You're on the list!"` | Success message |
| `onSubmit` | `(email: string) => Promise<...>` | - | Custom submit handler |
| `onSuccess` | `() => void` | - | Callback after success |
| `background` | `BackgroundVariant` | `'none'` | Background style |

### Blog Page

```tsx
import { Site } from '@mdxui/themes'
import { BlogPage } from '@mdxui/beacon'

export default function Blog() {
  return (
    <Site theme="stripe" mode="system">
      <BlogPage
        title="Blog"
        description="Latest updates and insights"
        posts={posts}
        tags={['Engineering', 'Product', 'Company']}
      />
    </Site>
  )
}
```

## Pages

Complete page templates that combine multiple sections:

| Component | Description |
|-----------|-------------|
| `WaitlistPage` | Launch/waitlist page with 9 hero variants |
| `BlogPage` | Blog listing with filtering and pagination |
| `BlogPostPage` | Individual blog post with TOC and related posts |

### WaitlistPage Hero Variants

- `simple` - Clean text-focused hero
- `code-side` - Code snippet beside text
- `code-stacked` - Code snippet below text
- `code-side-highlights` - Code with line highlights
- `video-side` - Video beside text
- `video-stacked` - Video below text
- `image-side` - Image beside text
- `image-stacked` - Image below text
- `cards` - Animated floating cards

## Layout Components

| Component | Description |
|-----------|-------------|
| `LandingPage` / `Site` | Full landing page wrapper |
| `LandingLayout` | Layout with header/footer |
| `Header` | Navigation header with links and CTA |
| `Footer` | Site footer with link groups |

## Hero Variants

| Component | Description |
|-----------|-------------|
| `Hero` | Default hero section |
| `HeroCentered` | Centered text hero |
| `HeroAnimated` | Animated hero with effects |
| `HeroGradient` | Gradient background hero |
| `HeroImageBeside` | Hero with side image |
| `HeroVideoBelow` | Hero with video below |
| `HeroCodeBelow` | Hero with code snippet |

## Section Components

| Component | Description |
|-----------|-------------|
| `Features` | Feature grid/list |
| `Pricing` | Pricing table with tiers |
| `FAQs` | Accordion FAQ section |
| `Testimonials` | Customer testimonials |
| `Stats` | Statistics display |
| `CTA` | Call-to-action section |
| `LogoCloud` | Partner/client logos |
| `FeatureGrid` | Grid of feature cards |
| `Directory` | Directory listing |

## Waitlist Sections

Import from `@mdxui/beacon/sections/waitlist` or use the namespace:

```tsx
import { waitlist } from '@mdxui/beacon'

// Use waitlist.HeroCodeSide, waitlist.Faq, etc.
```

| Component | Description |
|-----------|-------------|
| `WaitlistForm` | Email capture form |
| `HeroSimple` | Clean text hero |
| `HeroCodeSide` | Code beside text |
| `HeroCodeStacked` | Code below text |
| `HeroCodeSideHighlights` | Code with highlights |
| `HeroVideoSide` | Video beside text |
| `HeroVideoStacked` | Video below text |
| `HeroImageSide` | Image beside text |
| `HeroImageStacked` | Image below text |
| `HeroCards` | Animated cards hero |
| `Navbar` | Waitlist-specific navbar |
| `Footer` | Waitlist-specific footer |
| `Faq` | FAQ accordion |
| `Bento` | Bento grid layout |
| `Highlight` | Feature highlights |
| `CodeWindow` | Code display window |
| `YouTubeEmbed` | YouTube video embed |

## Blog Sections

Import from `@mdxui/beacon/sections/blog`:

| Component | Description |
|-----------|-------------|
| `BlogCard` | Blog post card |
| `BlogGrid` | Grid of blog cards |
| `BlogHeader` | Blog page header |
| `TagFilter` | Tag filtering UI |
| `BlogAuthor` | Author bio section |
| `BlogPostHeader` | Post header with metadata |
| `TableOfContents` | Sidebar TOC |
| `ReadMoreSection` | Related posts section |

## Animation Components

| Component | Description |
|-----------|-------------|
| `Marquee` | Infinite scroll marquee |
| `StickyScroll` | Scroll-triggered reveals |
| `DynamicIsland` | iOS-style dynamic island |
| `NotificationIsland` | Notification popups |

## Templates

Pre-configured page templates:

| Template | Description |
|----------|-------------|
| `APITemplate` | API documentation page |
| `APIHtTemplate` | API.ht style template |
| `DirectoryTemplate` | Directory listing page |
| `TemplateWrapper` | Base template wrapper |

## Shared Utilities

| Export | Description |
|--------|-------------|
| `Highlighter` | Syntax highlighting (Shiki) |
| `CodeTabs` | Tabbed code blocks |
| `CodeBlock` | Single code block |
| `Terminal` | Terminal display |
| `Hatch` | Background pattern |
| `MarkdownContent` | Render markdown |
| `resolveIcon` | Icon name to component |

## Gradients & Utils

```tsx
import { getGradientFromSeed, formatDate } from '@mdxui/beacon'

// Generate consistent gradient from string
const gradient = getGradientFromSeed('user-123')

// Format dates
const formatted = formatDate(new Date())
```

## MDX Components Export

Use with MDX providers:

```tsx
import { components } from '@mdxui/beacon'
import { MDXProvider } from '@mdx-js/react'

<MDXProvider components={components}>
  <Content />
</MDXProvider>
```

## Peer Dependencies

- `react` ^18.0.0 || ^19.0.0
- `@mdxui/primitives` - Base UI components
- `@mdxui/themes` - Theme provider and Site wrapper

## Links

- [Documentation](https://mdxui.dev)
- [GitHub](https://github.com/dot-do/ui)
- [npm](https://www.npmjs.com/package/@mdxui/beacon)

## Architecture

@mdxui/beacon sits at the **template layer** - implementing the `SiteComponents` interface from mdxui for marketing sites and landing pages.

```
┌─────────────────────────────────────────────────────────────────┐
│                      mdxui (interfaces)                          │
│   SiteComponents interface defines: Hero, Features, Pricing...   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ implements
┌─────────────────────────────────────────────────────────────────┐
│                  @mdxui/primitives (raw UI)                      │
│   Button, Card, Dialog - base building blocks                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓ uses
┌─────────────────────────────────────────────────────────────────┐
│            ★ @mdxui/beacon (site templates) ← YOU ARE HERE       │
│   Hero, Features, Pricing, CTA, Testimonials, Blog...            │
│   Implements SiteComponents for marketing sites                  │
└─────────────────────────────────────────────────────────────────┘
```

### Relationship to Other Packages

| Package | Relationship |
|---------|--------------|
| `mdxui` | Implements `SiteComponents` interface |
| `@mdxui/primitives` | Uses for base UI components |
| `@mdxui/themes` | Uses for theming (`<Site theme="..." />`) |
| `@mdxui/blocks` | Alternative/additional marketing blocks |
| `saaskit` | Generates sites using beacon components |

### Key Principle

@mdxui/beacon provides **complete page templates** for marketing sites. Components are designed for:
- AI-generatable content (clear prop schemas)
- Theme-agnostic styling (works with any @mdxui/themes preset)
- Composable sections (mix and match Hero + Features + Pricing)

## License

MIT
