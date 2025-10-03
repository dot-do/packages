# @dot-do/payload-experiments

A comprehensive A/B testing and experimentation framework for PayloadCMS with statistical analysis, cookie-based variant assignment, and real-time conversion tracking.

## Features

✅ **PayloadCMS Collections** - Drop-in experiment and analytics collections
✅ **Statistical Analysis** - Z-tests, confidence intervals, Bayesian methods
✅ **Cookie-Based Assignment** - Persistent variant assignment across sessions
✅ **React Components** - `<ExperimentTracker>`, `<ExperimentProvider>`, `<Variant>`
✅ **Server-Side Utilities** - Experiment management, event tracking, stats calculation
✅ **Real-Time Tracking** - Page views, conversions, clicks, custom events
✅ **Multi-Variant Support** - A/B, A/B/C, multivariate testing
✅ **Confidence Scoring** - Automatic winner detection with statistical significance
✅ **Sample Size Calculator** - Plan experiments for statistical power

## Installation

```bash
pnpm add @dot-do/payload-experiments
```

## Quick Start

### 1. Add Collections to Payload Config

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { Experiments, Analytics } from '@dot-do/payload-experiments/collections'

export default buildConfig({
  collections: [
    Experiments,
    Analytics,
    // ... your other collections
  ],
})
```

### 2. Create an Experiment

Via Payload Admin:

1. Go to **Experiments** → **Add New**
2. Set name: "Pricing Page Headline Test"
3. Set target page: "/pricing"
4. Add variants:
   - Control: 50% weight, `{ "headline": "Start for Free" }`
   - Variant A: 50% weight, `{ "headline": "Try it Free Today" }`
5. Set status: **Running**
6. Save

### 3. Server-Side: Get Active Experiment

```typescript
// app/pricing/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { getActiveExperiment, getOrAssignVariant } from '@dot-do/payload-experiments'

export default async function PricingPage() {
  const payload = await getPayload({ config })
  const experiment = await getActiveExperiment(payload, '/pricing')

  if (!experiment) {
    // No active experiment, show default
    return <DefaultPricingPage />
  }

  // Variant assignment happens client-side for cookie persistence
  return (
    <ExperimentWrapper
      experimentId={experiment.id}
      variants={experiment.variants}
    />
  )
}
```

### 4. Client-Side: Track Events

```tsx
// components/PricingPage.tsx
'use client'

import { ExperimentProvider, ExperimentTracker, useExperimentTracking, useExperiment } from '@dot-do/payload-experiments/components'

export function ExperimentWrapper({ experimentId, variants }) {
  return (
    <ExperimentProvider experimentId={experimentId} variants={variants}>
      {({ variantIndex, variantConfig, sessionId }) => (
        <>
          {/* Auto-track page views */}
          <ExperimentTracker
            experimentId={experimentId}
            variantIndex={variantIndex}
            sessionId={sessionId}
          />

          {/* Render variant-specific content */}
          <PricingPageContent config={variantConfig} />
        </>
      )}
    </ExperimentProvider>
  )
}

function PricingPageContent({ config }) {
  const { trackConversion } = useExperimentTracking()

  return (
    <div>
      <h1>{config.headline}</h1>
      <button onClick={() => trackConversion({ plan: 'pro' })}>
        Sign Up
      </button>
    </div>
  )
}
```

### 5. View Results

```typescript
// Admin dashboard or API endpoint
import { getExperimentStats } from '@dot-do/payload-experiments'

const { stats, winner } = await getExperimentStats(payload, experimentId)

stats.forEach((stat, index) => {
  console.log(`${stat.name}:`)
  console.log(`  Views: ${stat.views}`)
  console.log(`  Conversions: ${stat.conversions}`)
  console.log(`  Conversion Rate: ${(stat.conversionRate * 100).toFixed(2)}%`)
})

if (winner.sufficientData && winner.index !== null) {
  console.log(`Winner: ${stats[winner.index].name} (${winner.confidence.toFixed(1)}% confidence)`)
} else {
  console.log('Not enough data yet or no significant difference')
}
```

## Core Concepts

### Experiments

An **Experiment** defines:
- **Target Page** - Where the test runs (e.g., `/pricing`, `/landing/product-a`)
- **Variants** - 2+ variations with traffic weights and config overrides
- **Goal Metric** - What to optimize (conversion, click, submit, custom)
- **Status** - Draft → Running → Completed
- **Statistical Settings** - Minimum sample size, confidence threshold

### Variants

Each **Variant** has:
- **Name** - e.g., "Control", "Variant A", "High Price"
- **Weight** - Traffic percentage (must sum to 100%)
- **Config** - JSON object with variant-specific overrides

```typescript
{
  name: "Variant A",
  weight: 50,
  config: {
    headline: "Try it Free Today",
    cta: "Start Free Trial",
    price: "$29/month",
    features: ["Feature 1", "Feature 2", "Feature 3"]
  }
}
```

### Events

Track these events:
- **view** - Page view (auto-tracked)
- **conversion** - Primary goal (e.g., signup, purchase)
- **click** - Button or link click
- **submit** - Form submission
- **custom** - Any custom event

Events are deduplicated per session by default.

### Statistical Analysis

The framework uses:
- **Z-test for proportions** - Compare conversion rates between variants
- **Confidence intervals** - Wilson score interval for small samples
- **P-values** - Two-tailed test for statistical significance
- **Winner detection** - Automatic with configurable confidence threshold (default 95%)

## API Reference

### Server-Side Functions

#### `getActiveExperiment(payload, targetPage, options?)`

Get the currently running experiment for a page.

```typescript
const experiment = await getActiveExperiment(payload, '/pricing', {
  locale: 'en',
})
```

#### `getExperiment(payload, experimentId)`

Get experiment by ID.

```typescript
const experiment = await getExperiment(payload, 'experiment-id-123')
```

#### `selectVariant(experiment)`

Select a variant based on traffic weights (weighted random).

```typescript
const variantIndex = selectVariant(experiment)
```

#### `trackEvent(payload, experimentId, variantIndex, event, sessionId, options?)`

Track an analytics event.

```typescript
await trackEvent(payload, experimentId, variantIndex, 'conversion', sessionId, {
  userId: 'user-123',
  metadata: {
    userAgent: request.headers.get('user-agent'),
    referrer: request.headers.get('referer'),
  },
})
```

#### `getExperimentStats(payload, experimentId)`

Calculate real-time statistics and determine winner.

```typescript
const { experiment, stats, winner } = await getExperimentStats(payload, experimentId)
```

#### `updateExperimentStats(payload, experimentId)`

Update cached stats in the experiment document (call periodically via cron).

```typescript
await updateExperimentStats(payload, experimentId)
```

### Statistical Functions

#### `calculateConversionRate(conversions, views)`

Calculate conversion rate with Wilson confidence interval.

```typescript
const { rate, confidenceInterval } = calculateConversionRate(25, 100)
// rate: 0.25
// confidenceInterval: { lower: 0.17, upper: 0.35 }
```

#### `zTestProportions(controlConv, controlViews, variantConv, variantViews)`

Z-test for comparing two proportions.

```typescript
const { zScore, pValue } = zTestProportions(25, 100, 35, 100)
// zScore: 1.58
// pValue: 0.114
```

#### `compareVariants(control, variant, confidenceThreshold)`

Full statistical comparison.

```typescript
const result = compareVariants(
  { name: 'Control', views: 1000, conversions: 50, conversionRate: 0.05 },
  { name: 'Variant A', views: 1000, conversions: 70, conversionRate: 0.07 },
  95
)
// {
//   isSignificant: true,
//   confidence: 97.2,
//   pValue: 0.028,
//   zScore: 2.19,
//   relativeLift: 40.0,  // 40% improvement
//   absoluteLift: 2.0    // 2 percentage points
// }
```

#### `determineWinner(variants, minimumSampleSize, confidenceThreshold)`

Determine winning variant across multiple variants.

```typescript
const { winnerIndex, confidence, results, sufficientData } = determineWinner(
  [
    { name: 'Control', views: 1000, conversions: 50, conversionRate: 0.05 },
    { name: 'Variant A', views: 1000, conversions: 70, conversionRate: 0.07 },
    { name: 'Variant B', views: 1000, conversions: 65, conversionRate: 0.065 },
  ],
  100,
  95
)
```

#### `calculateSampleSize(baselineRate, mde, alpha, power, numVariants)`

Calculate required sample size.

```typescript
const recommendation = calculateSampleSize(
  0.05,    // 5% baseline conversion rate
  0.20,    // 20% minimum detectable effect
  0.05,    // 5% significance level
  0.80,    // 80% statistical power
  2        // 2 variants (A/B test)
)
// {
//   perVariant: 1570,
//   total: 3140,
//   daysEstimate: 2  // at 1000 views/day/variant
// }
```

### React Components

#### `<ExperimentTracker>`

Auto-tracks page views and listens for conversion events.

```tsx
<ExperimentTracker
  experimentId="exp-123"
  variantIndex={0}
  sessionId="session-abc"
  trackingEndpoint="/api/experiments/track"
  autoTrackView={true}
  onError={(error) => console.error(error)}
/>
```

#### `<ExperimentProvider>`

Manages variant assignment and provides context.

```tsx
<ExperimentProvider
  experimentId="exp-123"
  variants={[
    { name: 'Control', weight: 50, config: { headline: 'A' } },
    { name: 'Variant A', weight: 50, config: { headline: 'B' } },
  ]}
  fallbackVariant={0}
  loading={<Skeleton />}
>
  {({ variantIndex, variantConfig, sessionId }) => (
    <MyComponent config={variantConfig} />
  )}
</ExperimentProvider>
```

#### `<Variant>`

Render content for specific variant.

```tsx
<ExperimentProvider experimentId="exp-123" variants={variants}>
  <Variant index={0}>
    <ControlVersion />
  </Variant>
  <Variant index={1}>
    <VariantAVersion />
  </Variant>
</ExperimentProvider>
```

#### `useExperiment()`

Hook to access experiment context.

```tsx
function MyComponent() {
  const { experimentId, variantIndex, variantConfig, sessionId, isReady } = useExperiment()

  if (!isReady) return <Skeleton />

  return <div>{variantConfig.headline}</div>
}
```

#### `useExperimentTracking()`

Hook for tracking events.

```tsx
function SignupButton() {
  const { trackConversion } = useExperimentTracking()

  return (
    <button onClick={() => trackConversion({ plan: 'pro' })}>
      Sign Up
    </button>
  )
}
```

### Helper Functions

#### `getOrCreateSessionId(cookieName?)`

Get or create session ID in cookies.

```typescript
const sessionId = getOrCreateSessionId('exp_session_id')
```

#### `getOrAssignVariant(experimentId, weights)`

Get or assign variant with cookie persistence.

```typescript
const variantIndex = getOrAssignVariant('exp-123', [50, 50])
```

#### `clearExperimentCookies(experimentId?)`

Clear experiment cookies (useful for testing).

```typescript
clearExperimentCookies('exp-123') // Clear specific experiment
clearExperimentCookies()          // Clear all experiments
```

## Integration Examples

### Example 1: Service Pricing A/B Test

Test different pricing tiers and messaging.

```typescript
// 1. Create experiment in Payload Admin
const experiment = {
  name: 'Service Pricing Test',
  targetPage: '/services/web-design',
  variants: [
    {
      name: 'Control',
      weight: 50,
      config: {
        price: '$999',
        period: 'one-time',
        features: ['5 pages', '1 revision', '2-week delivery'],
      },
    },
    {
      name: 'Subscription Model',
      weight: 50,
      config: {
        price: '$99',
        period: 'per month',
        features: ['Unlimited pages', 'Unlimited revisions', 'Priority support'],
      },
    },
  ],
  goalMetric: 'conversion',
  status: 'running',
}

// 2. Server component
export default async function ServicePage() {
  const payload = await getPayload({ config })
  const experiment = await getActiveExperiment(payload, '/services/web-design')

  return <ServicePageClient experiment={experiment} />
}

// 3. Client component
'use client'

function ServicePageClient({ experiment }) {
  if (!experiment) {
    return <DefaultServicePage />
  }

  return (
    <ExperimentProvider experimentId={experiment.id} variants={experiment.variants}>
      {({ variantConfig, variantIndex, sessionId }) => (
        <>
          <ExperimentTracker
            experimentId={experiment.id}
            variantIndex={variantIndex}
            sessionId={sessionId}
          />
          <ServicePricing config={variantConfig} />
        </>
      )}
    </ExperimentProvider>
  )
}

function ServicePricing({ config }) {
  const { trackConversion } = useExperimentTracking()

  return (
    <div>
      <h2>Web Design Service</h2>
      <div className="pricing">
        <span className="price">{config.price}</span>
        <span className="period">{config.period}</span>
      </div>
      <ul>
        {config.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button onClick={() => trackConversion({ service: 'web-design' })}>
        Get Started
      </button>
    </div>
  )
}
```

### Example 2: Landing Page Layout Test

Test different hero section layouts.

```typescript
const experiment = {
  name: 'Hero Section Layout',
  targetPage: '/landing/product-launch',
  variants: [
    {
      name: 'Image Left',
      weight: 33,
      config: { layout: 'image-left', image: '/hero-1.jpg' },
    },
    {
      name: 'Image Right',
      weight: 33,
      config: { layout: 'image-right', image: '/hero-2.jpg' },
    },
    {
      name: 'Center',
      weight: 34,
      config: { layout: 'center', image: '/hero-3.jpg' },
    },
  ],
  goalMetric: 'submit',
}
```

### Example 3: CTA Button Test

Test button text and color.

```typescript
const experiment = {
  name: 'CTA Button Optimization',
  targetPage: '/pricing',
  variants: [
    {
      name: 'Control',
      weight: 50,
      config: { text: 'Start Free Trial', color: 'blue' },
    },
    {
      name: 'Urgency',
      weight: 50,
      config: { text: 'Get Started Now', color: 'red' },
    },
  ],
  goalMetric: 'click',
}

// Usage
<button
  style={{ backgroundColor: variantConfig.color }}
  onClick={() => {
    trackClick({ button: 'cta' })
    trackConversion({ source: 'pricing-cta' })
  }}
>
  {variantConfig.text}
</button>
```

### Example 4: Feature Description Test

Test how features are described.

```typescript
const experiment = {
  name: 'Feature Description',
  targetPage: '/features',
  variants: [
    {
      name: 'Technical',
      weight: 50,
      config: {
        description: 'Advanced AI-powered automation with real-time sync',
      },
    },
    {
      name: 'Benefit-Focused',
      weight: 50,
      config: {
        description: 'Save 10 hours per week with automated workflows',
      },
    },
  ],
  goalMetric: 'conversion',
}
```

### Example 5: Multi-Page Experiment

Track conversions across multiple pages.

```typescript
// On landing page - track view
<ExperimentTracker
  experimentId="exp-123"
  variantIndex={variantIndex}
  sessionId={sessionId}
/>

// On checkout page - track conversion
useEffect(() => {
  const { trackConversion } = useExperimentTracking()
  trackConversion({ revenue: 99.00, plan: 'pro' })
}, [])
```

## Statistical Methodology

### Frequentist Approach (Default)

**Z-Test for Proportions:**
- Compares conversion rates between control and variants
- Uses pooled proportion for standard error calculation
- Two-tailed test for statistical significance
- Returns p-value and z-score

**Confidence Intervals:**
- Wilson score interval (better for small samples)
- 95% confidence by default (configurable)
- Handles edge cases (0%, 100% conversion rates)

**Winner Detection:**
- Requires minimum sample size per variant (default: 100)
- Requires confidence threshold (default: 95%)
- Compares all variants against control
- Returns winner only if statistically significant

### Bayesian Approach (Optional)

**Beta-Binomial Model:**
- Conjugate prior for conversion rates
- Posterior credible intervals
- Expected loss calculation
- No p-values, uses probability distributions

```typescript
import { bayesianCredibleInterval, calculateExpectedLoss } from '@dot-do/payload-experiments'

const credible = bayesianCredibleInterval(25, 100)
// { mean: 0.252, lower: 0.17, upper: 0.35 }

const losses = calculateExpectedLoss([
  { conversions: 50, views: 1000 },
  { conversions: 70, views: 1000 },
])
// [0.02, 0.00] - Variant 2 has lowest expected loss
```

### Sample Size Planning

**Key Parameters:**
- **Baseline Rate** - Current conversion rate
- **MDE** - Minimum Detectable Effect (e.g., 20% relative improvement)
- **Alpha** - Significance level (default: 5%)
- **Power** - Statistical power (default: 80%)

**Example:**
```typescript
const { perVariant, total, daysEstimate } = calculateSampleSize(
  0.05,  // 5% baseline
  0.20,  // Detect 20% improvement (5% → 6%)
  0.05,  // 5% significance
  0.80,  // 80% power
  2      // A/B test
)
// Needs 1570 visitors per variant
// Total: 3140 visitors
// Estimate: 2 days at 1000 visitors/day/variant
```

## Performance Considerations

### Database Queries

**Optimize analytics queries:**
- Index on `experiment`, `sessionId`, `event` fields
- Use pagination for large result sets
- Cache experiment stats (update via cron)

```typescript
// Update stats every 15 minutes via cron
export async function cronHandler() {
  const payload = await getPayload({ config })
  const experiments = await payload.find({
    collection: 'experiments',
    where: { status: { equals: 'running' } },
  })

  for (const exp of experiments.docs) {
    await updateExperimentStats(payload, exp.id)
  }
}
```

### Client-Side Performance

**Tracking is non-blocking:**
- Events sent asynchronously
- No impact on page load
- Failed tracking doesn't break UI

**Cookie storage:**
- Minimal overhead (2 cookies per experiment)
- 30-day expiration for variant assignment
- 1-year expiration for session ID

### Cloudflare Integration

**Works seamlessly with:**
- Cloudflare Pages
- Cloudflare Workers
- D1 Database (via Payload)
- Analytics Engine (optional)

```typescript
// Cloudflare-specific metadata
const metadata = getEventMetadataFromRequest(request)
// Includes: CF-IPCountry, CF-Region, CF-City, CF-Timezone
```

## Testing

### Unit Tests

```bash
pnpm test
```

### Manual Testing

```typescript
import { clearExperimentCookies } from '@dot-do/payload-experiments'

// Reset experiment for testing
clearExperimentCookies('exp-123')

// Force specific variant
Cookies.set('exp_variant_exp-123', '1') // Force variant 1
```

### Debugging

```typescript
// Enable tracking logs
<ExperimentTracker
  {...props}
  onError={(error) => {
    console.error('Tracking error:', error)
    // Send to error monitoring service
  }}
/>
```

## Migration from POC

This package was extracted from `poc/payload-fumadocs-waitlist` with enhancements:

✅ **Added** - Bayesian statistical methods
✅ **Added** - Sample size calculator
✅ **Added** - Expected loss calculation
✅ **Added** - `<ExperimentProvider>` and `<Variant>` components
✅ **Added** - `useExperiment()` and `useExperimentTracking()` hooks
✅ **Enhanced** - More robust cookie handling with `js-cookie`
✅ **Enhanced** - Better TypeScript types
✅ **Enhanced** - Comprehensive documentation

## Roadmap

- [ ] Admin UI for viewing experiment results
- [ ] Real-time dashboard with charts
- [ ] Integration with analytics platforms (GA4, PostHog)
- [ ] Multi-armed bandit algorithm (dynamic traffic allocation)
- [ ] Sequential testing (early stopping)
- [ ] Segment analysis (by device, location, etc.)
- [ ] Experiment templates

## License

MIT

## Support

- GitHub Issues: https://github.com/dot-do/packages/issues
- Documentation: https://packages.dot.do/payload-experiments
