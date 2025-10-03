# Integration Guide: @dot-do/payload-experiments

Complete guide for integrating the A/B testing framework into Services.Delivery and other Payload projects.

## Table of Contents

1. [Installation](#installation)
2. [Payload Configuration](#payload-configuration)
3. [API Routes](#api-routes)
4. [Server Components](#server-components)
5. [Client Components](#client-components)
6. [Tracking Conversions](#tracking-conversions)
7. [Viewing Results](#viewing-results)
8. [Advanced Usage](#advanced-usage)
9. [Troubleshooting](#troubleshooting)

## Installation

### Step 1: Install Package

```bash
pnpm add @dot-do/payload-experiments
```

### Step 2: Add to Payload Config

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { Experiments, Analytics } from '@dot-do/payload-experiments/collections'

export default buildConfig({
  collections: [
    // Your existing collections
    Users,
    Pages,
    Services,

    // Add experiment collections
    Experiments,
    Analytics,
  ],
  // ... rest of config
})
```

### Step 3: Run Migrations

```bash
# Generate types
pnpm payload generate:types

# If you have migrations enabled
pnpm payload migrate
```

## Payload Configuration

### Multi-Tenant Setup (Optional)

If using multi-tenancy, add tenant field to experiments:

```typescript
// collections/Experiments.ts
import { Experiments as BaseExperiments } from '@dot-do/payload-experiments/collections'
import type { CollectionConfig } from 'payload'

export const Experiments: CollectionConfig = {
  ...BaseExperiments,
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    ...BaseExperiments.fields,
  ],
}
```

### Custom Access Control

```typescript
export const Experiments: CollectionConfig = {
  ...BaseExperiments,
  access: {
    read: () => true, // Public
    create: ({ req: { user } }) => !!user, // Authenticated
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
}
```

## API Routes

### Step 1: Create Tracking Endpoint

```typescript
// app/api/experiments/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { trackEvent, getEventMetadataFromRequest } from '@dot-do/payload-experiments'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const {
      experimentId,
      variantIndex,
      event,
      customEventName,
      sessionId,
      userId,
      metadata = {},
    } = body

    // Enrich metadata from request
    const enrichedMetadata = {
      ...getEventMetadataFromRequest(request),
      ...metadata,
    }

    // Track event
    const result = await trackEvent(
      payload,
      experimentId,
      variantIndex,
      event,
      sessionId,
      {
        userId,
        customEventName,
        metadata: enrichedMetadata,
      }
    )

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
```

### Step 2: Create Stats Endpoint (Optional)

```typescript
// app/api/experiments/[id]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getExperimentStats } from '@dot-do/payload-experiments'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config })
    const stats = await getExperimentStats(payload, params.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
```

## Server Components

### Pattern 1: Get Active Experiment

```typescript
// app/services/[slug]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { getActiveExperiment } from '@dot-do/payload-experiments'
import { ExperimentWrapper } from './ExperimentWrapper'

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const payload = await getPayload({ config })

  // Get service
  const service = await payload.find({
    collection: 'services',
    where: { slug: { equals: params.slug } },
  })

  // Get active experiment for this page
  const experiment = await getActiveExperiment(
    payload,
    `/services/${params.slug}`
  )

  if (!experiment) {
    // No experiment, render default
    return <ServicePageDefault service={service.docs[0]} />
  }

  // Render experiment
  return (
    <ExperimentWrapper
      experiment={experiment}
      service={service.docs[0]}
    />
  )
}
```

### Pattern 2: Multiple Experiments on Same Page

```typescript
// app/pricing/page.tsx
export default async function PricingPage() {
  const payload = await getPayload({ config })

  // Get experiments for different sections
  const heroExperiment = await getActiveExperiment(payload, '/pricing/hero')
  const pricingExperiment = await getActiveExperiment(payload, '/pricing/tiers')
  const ctaExperiment = await getActiveExperiment(payload, '/pricing/cta')

  return (
    <>
      {heroExperiment && <HeroExperiment experiment={heroExperiment} />}
      {pricingExperiment && <PricingExperiment experiment={pricingExperiment} />}
      {ctaExperiment && <CTAExperiment experiment={ctaExperiment} />}
    </>
  )
}
```

## Client Components

### Pattern 1: Full Integration

```typescript
// components/ExperimentWrapper.tsx
'use client'

import {
  ExperimentProvider,
  ExperimentTracker,
  useExperiment,
  Variant,
} from '@dot-do/payload-experiments/components'

export function ExperimentWrapper({ experiment, service }) {
  return (
    <ExperimentProvider
      experimentId={experiment.id}
      variants={experiment.variants}
      loading={<ServicePageSkeleton />}
    >
      {({ variantIndex, variantConfig, sessionId }) => (
        <>
          {/* Auto-track page views */}
          <ExperimentTracker
            experimentId={experiment.id}
            variantIndex={variantIndex}
            sessionId={sessionId}
          />

          {/* Render variant-specific content */}
          <ServicePageContent
            service={service}
            variantConfig={variantConfig}
          />
        </>
      )}
    </ExperimentProvider>
  )
}
```

### Pattern 2: Conditional Rendering

```typescript
// components/PricingSection.tsx
'use client'

import { ExperimentProvider, Variant } from '@dot-do/payload-experiments/components'

export function PricingSection({ experiment, service }) {
  return (
    <ExperimentProvider experimentId={experiment.id} variants={experiment.variants}>
      {/* Control */}
      <Variant index={0}>
        <PricingControl service={service} />
      </Variant>

      {/* Variant A - Higher Price */}
      <Variant index={1}>
        <PricingHighPrice service={service} />
      </Variant>

      {/* Variant B - Subscription Model */}
      <Variant index={2}>
        <PricingSubscription service={service} />
      </Variant>
    </ExperimentProvider>
  )
}
```

### Pattern 3: Dynamic Content

```typescript
// components/ServiceCard.tsx
'use client'

import { useExperiment } from '@dot-do/payload-experiments/components'

export function ServiceCard({ service }) {
  const { variantConfig, isReady } = useExperiment()

  if (!isReady) {
    return <CardSkeleton />
  }

  return (
    <div className="service-card">
      {/* Use variant-specific values */}
      <h2>{variantConfig.headline || service.title}</h2>
      <p>{variantConfig.description || service.description}</p>
      <div className="pricing">
        <span className="price">{variantConfig.price || service.price}</span>
        <span className="period">{variantConfig.period || 'one-time'}</span>
      </div>
      <ul>
        {(variantConfig.features || service.features).map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <CTAButton config={variantConfig.cta} />
    </div>
  )
}
```

## Tracking Conversions

### Pattern 1: Button Click

```typescript
'use client'

import { useExperimentTracking } from '@dot-do/payload-experiments/components'

export function PurchaseButton({ service }) {
  const { trackConversion } = useExperimentTracking()

  const handlePurchase = async () => {
    // Track conversion BEFORE navigation
    trackConversion({
      service: service.slug,
      revenue: service.price,
    })

    // Proceed with checkout
    window.location.href = `/checkout?service=${service.slug}`
  }

  return (
    <button onClick={handlePurchase}>
      Buy Now - ${service.price}
    </button>
  )
}
```

### Pattern 2: Form Submission

```typescript
'use client'

import { useExperimentTracking } from '@dot-do/payload-experiments/components'

export function WaitlistForm() {
  const { trackSubmit, trackConversion } = useExperimentTracking()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Track form submission
    trackSubmit({ form: 'waitlist' })

    // Submit to API
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      body: new FormData(e.target),
    })

    if (response.ok) {
      // Track successful conversion
      trackConversion({ form: 'waitlist', status: 'success' })
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Pattern 3: Custom Event

```typescript
'use client'

import { useExperimentTracking } from '@dot-do/payload-experiments/components'

export function VideoPlayer({ video }) {
  const { trackCustomEvent } = useExperimentTracking()

  const handleVideoComplete = () => {
    trackCustomEvent('video_complete', {
      videoId: video.id,
      duration: video.duration,
      completionRate: 100,
    })
  }

  return (
    <video onEnded={handleVideoComplete}>
      <source src={video.url} />
    </video>
  )
}
```

### Pattern 4: Multi-Step Funnel

```typescript
// Track progression through funnel
export function CheckoutFunnel() {
  const { trackClick, trackSubmit, trackConversion } = useExperimentTracking()

  return (
    <>
      {/* Step 1: Service Selection */}
      <ServiceSelector onSelect={() => trackClick({ step: 'service-select' })} />

      {/* Step 2: Details Form */}
      <DetailsForm onSubmit={() => trackSubmit({ step: 'details' })} />

      {/* Step 3: Payment (Final Conversion) */}
      <PaymentForm onSuccess={() => trackConversion({ step: 'payment' })} />
    </>
  )
}
```

## Viewing Results

### Method 1: Payload Admin

1. Go to **Experiments** collection
2. Click on an experiment
3. View **Stats** field (cached)
4. Check **Winning Variant** and **Confidence Level**

### Method 2: API Endpoint

```typescript
// Fetch real-time stats
const response = await fetch(`/api/experiments/${experimentId}/stats`)
const { stats, winner } = await response.json()

console.log('Stats:', stats)
console.log('Winner:', winner.index, `(${winner.confidence}% confidence)`)
```

### Method 3: Custom Dashboard

```typescript
// app/admin/experiments/[id]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { getExperimentStats } from '@dot-do/payload-experiments'

export default async function ExperimentDashboard({ params }) {
  const payload = await getPayload({ config })
  const { experiment, stats, winner } = await getExperimentStats(payload, params.id)

  return (
    <div className="dashboard">
      <h1>{experiment.name}</h1>

      {/* Variants Table */}
      <table>
        <thead>
          <tr>
            <th>Variant</th>
            <th>Views</th>
            <th>Conversions</th>
            <th>Rate</th>
            <th>Lift</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr key={index}>
              <td>{stat.name}</td>
              <td>{stat.views}</td>
              <td>{stat.conversions}</td>
              <td>{(stat.conversionRate * 100).toFixed(2)}%</td>
              <td>
                {index === 0
                  ? 'Control'
                  : `${((stat.conversionRate / stats[0].conversionRate - 1) * 100).toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Winner */}
      {winner.sufficientData && winner.index !== null && (
        <div className="winner">
          <h2>Winner: {stats[winner.index].name}</h2>
          <p>Confidence: {winner.confidence.toFixed(1)}%</p>
        </div>
      )}
    </div>
  )
}
```

## Advanced Usage

### Scheduled Stats Updates (Cron)

```typescript
// app/api/cron/update-experiment-stats/route.ts
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { updateExperimentStats } from '@dot-do/payload-experiments'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  // Get all running experiments
  const experiments = await payload.find({
    collection: 'experiments',
    where: { status: { equals: 'running' } },
    limit: 1000,
  })

  // Update stats for each
  for (const experiment of experiments.docs) {
    await updateExperimentStats(payload, experiment.id)
  }

  return NextResponse.json({
    success: true,
    updated: experiments.docs.length,
  })
}
```

**Cloudflare Cron Trigger:**

```toml
# wrangler.toml
[triggers]
crons = ["*/15 * * * *"] # Every 15 minutes
```

### Multi-Page Experiments

Track conversions across different pages:

```typescript
// Page 1: Landing
<ExperimentTracker
  experimentId="landing-to-checkout"
  variantIndex={variantIndex}
  sessionId={sessionId}
  autoTrackView={true}
/>

// Page 2: Checkout (different route)
// Retrieve session and variant from cookies
const sessionId = getOrCreateSessionId()
const variantIndex = getOrAssignVariant('landing-to-checkout', [50, 50])

// Track conversion
const { trackConversion } = useExperimentTracking()
trackConversion({ page: 'checkout', revenue: 99 })
```

### Segment Analysis

Filter analytics by device, location, etc:

```typescript
const { experiment, stats, winner } = await getExperimentStats(payload, experimentId)

// Get all analytics events
const analytics = await payload.find({
  collection: 'experiment-analytics',
  where: {
    experiment: { equals: experimentId },
  },
  limit: 50000,
})

// Segment by device
const mobileEvents = analytics.docs.filter(
  (e) => e.metadata?.device?.type === 'mobile'
)
const desktopEvents = analytics.docs.filter(
  (e) => e.metadata?.device?.type === 'desktop'
)

// Calculate stats per segment
const mobileStats = calculateStatsFromEvents(mobileEvents)
const desktopStats = calculateStatsFromEvents(desktopEvents)
```

## Troubleshooting

### Issue 1: Variants Not Persisting

**Symptom:** User sees different variant on each page load

**Solution:**
```typescript
// Check cookies are enabled
console.log(document.cookie)

// Check variant cookie exists
import Cookies from 'js-cookie'
console.log(Cookies.get(`exp_variant_${experimentId}`))

// Force specific domain for cookies
Cookies.set('test', 'value', { domain: '.yourdomain.com' })
```

### Issue 2: Events Not Tracking

**Symptom:** No records in `experiment-analytics` collection

**Solution:**
```typescript
// 1. Check tracking endpoint exists
fetch('/api/experiments/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentId: 'test',
    variantIndex: 0,
    event: 'view',
    sessionId: 'test-session',
  }),
})

// 2. Check CORS if using different domain
// Add to API route:
export async function POST(request: NextRequest) {
  // ... existing code
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}

// 3. Add error handling
<ExperimentTracker
  {...props}
  onError={(error) => {
    console.error('Tracking failed:', error)
    // Send to error monitoring (Sentry, etc.)
  }}
/>
```

### Issue 3: No Winner Detected

**Symptom:** `winner.index` is always `null`

**Solution:**
```typescript
// Check if there's enough data
const { stats, winner } = await getExperimentStats(payload, experimentId)

console.log('Sufficient data:', winner.sufficientData)
console.log('Current confidence:', winner.confidence)

// Check individual variant stats
stats.forEach((stat) => {
  console.log(`${stat.name}:`, {
    views: stat.views,
    conversions: stat.conversions,
    rate: (stat.conversionRate * 100).toFixed(2) + '%',
  })
})

// Lower thresholds temporarily for testing
const testResult = determineWinner(
  stats,
  10,   // Lower minimum sample size
  80    // Lower confidence threshold
)
```

### Issue 4: Experiment Not Found

**Symptom:** `getActiveExperiment()` returns `null`

**Solution:**
```typescript
// 1. Check experiment exists and is running
const all = await payload.find({
  collection: 'experiments',
  where: { targetPage: { equals: '/your-page' } },
})
console.log('All experiments for page:', all.docs)

// 2. Check status is 'running'
// 3. Check dates (startDate <= now, endDate >= now or null)
// 4. Check targetPage matches exactly (case-sensitive)
```

## Next Steps

1. ✅ Install package
2. ✅ Configure Payload collections
3. ✅ Create API routes
4. ✅ Implement server components
5. ✅ Implement client components
6. ✅ Test locally
7. ✅ Deploy to production
8. ✅ Create first experiment
9. ✅ Monitor results
10. ✅ Iterate and optimize

---

**Need Help?**
- GitHub Issues: https://github.com/dot-do/packages/issues
- Documentation: https://packages.dot.do/payload-experiments
- Email: support@dot.do
