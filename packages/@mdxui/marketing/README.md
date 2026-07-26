---
name: "@mdxui/marketing"
version: 1.0.2
description: Landing page and marketing site components for MDXUI
license: MIT
repository: "https://github.com/ai-primitives/mdxui"
homepage: "https://github.com/ai-primitives/mdxui#readme"
keywords:
  - mdx
  - marketing
  - landing-page
  - react
  - components
downloads:
  monthly: 62
published: "2024-12-24T13:33:47.977Z"
updated: "2024-12-27T17:38:45.129Z"
---

# @mdxui/marketing

Landing page and marketing site components for MDXUI, designed for creating high-converting marketing pages with MDX and YAML-LD frontmatter.

## Installation

```bash
pnpm add @mdxui/marketing
```

## Features

- Landing page layouts
- Hero sections
- Feature grids
- Pricing tables
- Testimonial components
- Call-to-action sections
- Newsletter signup forms
- Analytics integration
- A/B testing support

## Usage

```tsx
import { 
  MarketingLayout, 
  Hero, 
  FeatureGrid,
  PricingTable 
} from '@mdxui/marketing'

// In your MDX file
---
$type: LandingPage
title: Product Landing Page
---

export default function LandingPage({ children }) {
  return (
    <MarketingLayout>
      <Hero
        title="Your Product Name"
        subtitle="The best solution for your needs"
        ctaText="Get Started"
      />
      <FeatureGrid features={features} />
      <PricingTable plans={plans} />
      {children}
    </MarketingLayout>
  )
}
```

## Components

- `MarketingLayout` - Marketing page layout
- `Hero` - Hero section with CTA
- `FeatureGrid` - Feature showcase grid
- `PricingTable` - Pricing comparison table
- `Testimonials` - Customer testimonials
- `Newsletter` - Newsletter signup form
- `CTASection` - Call-to-action sections
- `LogoCloud` - Partner/client logos display

## Related Packages

- `@mdxui/types` - TypeScript type definitions
- `@mdxui/shared` - Shared components and utilities
- `@mdxui/widgets` - Interactive components

## License

MIT © 2024 [Drivly](https://driv.ly) 