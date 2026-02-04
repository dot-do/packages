---
name: "@mdxui/themes"
version: 6.0.0
description: Design tokens, CSS variables, and theme management for mdxui
license: MIT
repository: "https://github.com/dot-do/ui"
homepage: "https://github.com/dot-do/ui/tree/main/packages/themes#readme"
keywords:
  - themes
  - design-tokens
  - css-variables
  - dark-mode
  - light-mode
  - theme-switcher
  - zustand
  - react
  - tailwind
  - mdxui
downloads:
  monthly: 487
published: "2025-12-23T12:36:30.274Z"
updated: "2026-01-24T14:38:21.263Z"
---

# @mdxui/themes

Design tokens, CSS variables, and theme management for mdxui applications.

## Installation

```bash
npm install @mdxui/themes
# or
pnpm add @mdxui/themes
# or
yarn add @mdxui/themes
```

## Features

- **Site wrapper component** for automatic theme context and styling
- **30 built-in theme presets** with light and dark mode support
- **Zustand-powered state management** with localStorage persistence
- **FOUC prevention** with SSR-compatible theme script
- **CSS variable system** for easy customization
- **TypeScript-first** with full type safety and autocomplete

## Quick Start

### Using the Site Component (Recommended)

The `Site` component is the simplest way to add theming to your application. It wraps your content and provides theme context, CSS variables, and dark mode support:

```tsx
// Next.js App Router (layout.tsx)
import { Site } from '@mdxui/themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Site.Head theme="stripe" mode="system" />
      </head>
      <body>
        <Site theme="stripe" mode="system">
          {children}
        </Site>
      </body>
    </html>
  )
}
```

#### Site Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `ThemePreset` | `'cyan'` | Theme preset to use |
| `mode` | `ThemeMode` | `'system'` | Theme mode: `'light'`, `'dark'`, or `'system'` |
| `name` | `string` | - | Site name for metadata |
| `domain` | `string` | - | Site domain |
| `className` | `string` | - | Additional CSS classes |

#### Site.Head Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `ThemeMode` | `'system'` | Default theme mode |
| `nonce` | `string` | - | CSP nonce for inline scripts |

#### useSite Hook

Access site configuration from any component:

```tsx
import { useSite } from '@mdxui/themes'

function MyComponent() {
  const { config } = useSite()
  return <div>Site: {config.name}</div>
}
```

### Manual Setup (Advanced)

For more control, you can set up theming manually:

#### 1. Add the Theme Script (Prevents Flash)

Add `ThemeScript` to your document head to prevent flash of unstyled content:

```tsx
// Next.js App Router (layout.tsx)
import { ThemeScript } from '@mdxui/themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### 2. Import a Theme CSS File

```tsx
// Import a theme preset
import '@mdxui/themes/css/stripe.css'

// Or dynamically based on selection
import `@mdxui/themes/css/${themeName}.css`
```

#### 3. Use the Theme Store

```tsx
import { useThemeStore } from '@mdxui/themes'

function ThemeToggle() {
  const { preset, mode, setPreset, setMode } = useThemeStore()

  return (
    <div>
      <select value={preset} onChange={(e) => setPreset(e.target.value)}>
        <option value="stripe">Stripe</option>
        <option value="linear">Linear</option>
        <option value="anthropic">Anthropic</option>
      </select>

      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}
```

## Available Themes

30 built-in theme presets, each with light and dark mode:

| Theme | Description |
|-------|-------------|
| `anthropic` | Anthropic brand colors |
| `arc` | Arc browser inspired |
| `airbnb` | Airbnb brand colors |
| `aurora` | Northern lights palette |
| `blueprint` | Technical blueprint style |
| `bubblegum` | Playful pink tones |
| `bumble` | Bumble brand colors |
| `cappuccino` | Warm coffee tones |
| `clay` | Earthy clay palette |
| `cyan` | Vibrant cyan accent |
| `dev` | Developer-focused theme |
| `dusk` | Sunset gradient tones |
| `ember` | Warm ember/fire colors |
| `frost` | Cool icy blues |
| `linear` | Linear app inspired |
| `midnight` | Deep midnight blues |
| `mocha` | Rich mocha browns |
| `monica` | Monica brand colors |
| `mono` | Monochrome grayscale |
| `neural` | AI/neural network style |
| `notation` | Notion-inspired theme |
| `notepad` | Classic notepad style |
| `obsidian` | Obsidian app inspired |
| `phosphor` | Phosphor green terminal |
| `polaris` | Shopify Polaris colors |
| `sage` | Soft sage greens |
| `star` | Starry night palette |
| `starlink` | SpaceX Starlink theme |
| `stripe` | Stripe brand colors |
| `x` | X/Twitter brand colors |

## Usage Patterns

### Static Theme (CSS Import)

For applications with a single theme:

```tsx
// Import once at app root
import '@mdxui/themes/css/stripe.css'

function App() {
  return <div className="dark">Dark mode content</div>
}
```

### Dynamic Theme Switching

For applications that need runtime theme changes:

```tsx
import { useThemeStore, themePresets } from '@mdxui/themes'
import { useEffect } from 'react'

function App() {
  const { initialize } = useThemeStore()

  useEffect(() => {
    initialize() // Sets up system preference listener
  }, [initialize])

  return <ThemeSelector />
}

function ThemeSelector() {
  const { preset, setPreset } = useThemeStore()

  return (
    <select value={preset} onChange={(e) => setPreset(e.target.value)}>
      {themePresets.map((theme) => (
        <option key={theme} value={theme}>{theme}</option>
      ))}
    </select>
  )
}
```

### Server-Side Rendering

For SSR frameworks, use the theme script to prevent hydration mismatch:

```tsx
// Next.js Pages Router (_document.tsx)
import { ThemeScript } from '@mdxui/themes'

export default function Document() {
  return (
    <Html suppressHydrationWarning>
      <Head>
        <ThemeScript defaultMode="system" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

### Apply Theme to Specific Element

For isolated theme contexts (iframes, portals, previews):

```tsx
import { applyThemeToElement } from '@mdxui/themes'

function Preview({ theme, mode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      applyThemeToElement(ref.current, theme, mode)
    }
  }, [theme, mode])

  return <div ref={ref}>Themed content</div>
}
```

### Access Raw CSS Content

For programmatic CSS manipulation:

```tsx
import { getThemeCSS, themeCSS } from '@mdxui/themes'

// Get CSS for a specific theme
const stripeCSS = getThemeCSS('stripe')

// Access all themes
Object.entries(themeCSS).forEach(([name, css]) => {
  console.log(`Theme: ${name}, CSS length: ${css.length}`)
})
```

### Parse Theme Variables

Extract CSS variables for custom processing:

```tsx
import { parseThemeCSS, getThemeCSS } from '@mdxui/themes'

const css = getThemeCSS('stripe')
const { light, dark } = parseThemeCSS(css)

console.log(light['--primary']) // Primary color in light mode
console.log(dark['--primary'])  // Primary color in dark mode
```

## API Reference

### Types

```tsx
type ThemePreset = 'stripe' | 'linear' | 'anthropic' | ... // 30 presets
type Theme = ThemePreset | string // Allows custom themes
type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  preset: ThemePreset
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
}

interface ThemeStore extends ThemeState {
  setPreset: (preset: ThemePreset) => void
  setMode: (mode: ThemeMode) => void
  applyTheme: () => void
  initialize: () => void
}
```

### Hooks

#### `useSite()`

Access site configuration from within a Site provider. Throws if used outside of Site.

```tsx
const { config } = useSite()

// config contains:
// - name: string | undefined
// - domain: string | undefined
// - theme: ThemePreset | undefined
// - mode: ThemeMode | undefined
```

#### `useSiteOptional()`

Same as useSite, but returns null instead of throwing if used outside of Site.

```tsx
const context = useSiteOptional()
if (context) {
  console.log(context.config.name)
}
```

#### `useThemeStore()`

Zustand store hook for theme state management.

```tsx
const {
  preset,        // Current theme preset
  mode,          // Current mode setting
  resolvedMode,  // Computed mode (light/dark)
  setPreset,     // Change theme preset
  setMode,       // Change mode
  applyTheme,    // Manually apply current theme
  initialize,    // Initialize store and listeners
} = useThemeStore()
```

### Components

#### `<Site />`

Root wrapper component that provides theme context and styling.

```tsx
<Site
  theme="stripe"           // Theme preset
  mode="system"            // 'light' | 'dark' | 'system'
  name="My Site"           // Optional site name
  domain="example.com.ai"     // Optional domain
  className="custom-class" // Optional additional classes
>
  {children}
</Site>
```

#### `<Site.Head />`

Head component for FOUC prevention. Place in your document `<head>`.

```tsx
<Site.Head
  mode="system"            // Default mode
  nonce={cspNonce}         // Optional CSP nonce
/>
```

#### `<ThemeScript />`

SSR-safe script component for FOUC prevention (used internally by Site.Head).

```tsx
<ThemeScript
  defaultMode="system"     // Default: 'system'
  storageKey="theme-state" // Default: 'do-theme-state'
  nonce={cspNonce}         // Optional CSP nonce
/>
```

### Functions

#### `applyThemeToElement(element, preset, mode)`

Apply theme CSS variables to a specific DOM element.

#### `getThemeCSS(preset)`

Get raw CSS string for a theme preset.

#### `parseThemeCSS(css)`

Parse CSS string into light/dark variable objects.

#### `isThemePreset(string)`

Type guard to check if string is a valid preset.

#### `getResolvedMode(mode)`

Resolve 'system' mode to actual 'light' or 'dark'.

### Constants

```tsx
import {
  themePresets,      // Array of all preset names
  themeNames,        // Map of preset to display name
  defaultThemeState, // Default state object
  THEME_STORAGE_KEY, // LocalStorage key
  DARK_MODE_CLASS,   // CSS class for dark mode ('dark')
} from '@mdxui/themes'
```

## CSS Variables

Each theme defines CSS custom properties on `:root` (light) and `.dark` (dark mode):

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... and more */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

Use in your CSS/Tailwind:

```css
.my-button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

## Integration with Tailwind CSS

The themes work seamlessly with Tailwind CSS v4:

```css
/* globals.css */
@import "tailwindcss";
@import "@mdxui/themes/css/stripe.css";
```

Or with Tailwind v3, extend your config:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... etc
      },
    },
  },
}
```

## License

MIT
