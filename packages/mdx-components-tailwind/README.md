# @mdx-components/tailwind

Tailwind CSS components for MDX rendering.

## Components

### Hero
Full-width hero section with title, subtitle, CTA, and optional image.

```tsx
<Hero 
  title="Welcome" 
  subtitle="Build amazing landing pages"
  cta="Get Started"
  ctaLink="/signup"
/>
```

### Features
Grid of feature cards with icons, titles, and descriptions.

```tsx
<Features 
  title="Why Choose Us"
  features={[
    { icon: "⚡", title: "Fast", description: "Lightning fast performance" },
    { icon: "🔒", title: "Secure", description: "Bank-level security" },
    { icon: "📱", title: "Mobile", description: "Works on any device" }
  ]}
/>
```

### CTA (Call to Action)
Prominent call-to-action section with primary and secondary buttons.

```tsx
<CTA 
  title="Ready to get started?"
  description="Join thousands of happy customers"
  primaryText="Start Free Trial"
  primaryLink="/signup"
  secondaryText="Learn More"
  secondaryLink="/about"
/>
```

### Form
Form wrapper with inputs and textarea components.

```tsx
<Form title="Contact Us" submitText="Send Message">
  <Input name="name" label="Name" required />
  <Input name="email" type="email" label="Email" required />
  <Textarea name="message" label="Message" required />
</Form>
```

### Card
Content card with image, title, and footer.

```tsx
<Card 
  title="Article Title"
  image="/image.jpg"
  footer={<Button>Read More</Button>}
>
  Article content goes here...
</Card>
```

### Button
Styled button with multiple variants and sizes.

```tsx
<Button variant="primary" size="lg" href="/signup">
  Get Started
</Button>
```

## Installation

```bash
pnpm add @mdx-components/tailwind
```

## Usage

```typescript
import { Hero, Features, CTA } from '@mdx-components/tailwind'
```

## Tailwind CSS

This package requires Tailwind CSS to be configured in your project.

```bash
pnpm add tailwindcss
```

## License

MIT
