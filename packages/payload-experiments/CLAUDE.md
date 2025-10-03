# @dot-do/payload-experiments - Development Guide

## Overview

A comprehensive A/B testing and experimentation framework for PayloadCMS with statistical analysis. Extracted from `poc/payload-fumadocs-waitlist` and enhanced with Bayesian methods, React hooks, and advanced statistical features.

## Package Structure

```
payload-experiments/
├── src/
│   ├── collections/
│   │   ├── Experiments.ts       # Experiment collection
│   │   ├── Analytics.ts         # Event tracking collection
│   │   └── index.ts
│   ├── lib/
│   │   ├── experiments.ts       # Core experiment utilities
│   │   ├── statistics.ts        # Statistical analysis
│   │   └── index.ts
│   ├── components/
│   │   ├── ExperimentTracker.tsx    # Event tracking component
│   │   ├── ExperimentProvider.tsx   # Context provider
│   │   └── index.ts
│   └── index.ts                 # Main exports
├── tests/
│   └── statistics.test.ts       # Statistical tests
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── CLAUDE.md                    # This file
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Development mode (watch)
pnpm dev

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Watch tests
pnpm test:watch
```

## Key Features

### 1. PayloadCMS Collections

**Experiments Collection:**
- Multi-variant support (A/B, A/B/C, multivariate)
- Traffic weight allocation (weighted random)
- Status workflow (draft → running → paused → completed)
- Goal metrics (conversion, click, submit, custom)
- Statistical settings (sample size, confidence threshold)
- Auto-completion based on end date

**Analytics Collection:**
- Event tracking (view, conversion, click, submit, custom)
- Session-based deduplication
- Rich metadata (user agent, referrer, location, device)
- Custom event support
- Admin-only read access, public write

### 2. Statistical Analysis

**Frequentist Methods:**
- Z-test for proportions
- Wilson score confidence intervals
- P-value calculation
- Winner detection with configurable confidence

**Bayesian Methods:**
- Beta-Binomial model
- Posterior credible intervals
- Expected loss calculation
- No p-hacking, continuous monitoring

**Sample Size Planning:**
- Power analysis
- Minimum detectable effect (MDE)
- Bonferroni correction for multiple comparisons

### 3. React Components

**ExperimentTracker:**
- Auto-tracks page views
- Listens for custom events
- Non-blocking async tracking
- Error handling

**ExperimentProvider:**
- Cookie-based variant assignment
- Persistent across sessions (30 days)
- Context API for child components
- Render props pattern

**Hooks:**
- `useExperiment()` - Access experiment context
- `useExperimentTracking()` - Track events from anywhere

**Helper Components:**
- `<Variant>` - Conditional rendering per variant
- `withExperiment()` - HOC for variant-specific components

### 4. Server-Side Utilities

**Experiment Management:**
- `getActiveExperiment()` - Find running experiments by page
- `getExperiment()` - Get experiment by ID
- `selectVariant()` - Weighted random selection

**Event Tracking:**
- `trackEvent()` - Record analytics events
- Automatic deduplication
- Rich metadata extraction

**Statistics:**
- `getExperimentStats()` - Real-time stats calculation
- `updateExperimentStats()` - Cache stats in DB (for cron)

## Architecture Decisions

### Cookie-Based Assignment

**Why cookies instead of server-side:**
- ✅ Persistent across requests
- ✅ Works with static site generation
- ✅ No database lookup on every request
- ✅ Compatible with CDN caching
- ✅ User sees same variant consistently

**Cookie strategy:**
- `exp_session_id` - 1 year expiration
- `exp_variant_{experimentId}` - 30 day expiration
- SameSite=Lax for CSRF protection
- Client-side only (no HttpOnly for React access)

### Statistical Approach

**Frequentist (default):**
- Industry standard (95% confidence)
- Matches expectations of stakeholders
- Clear stopping rules
- P-values are familiar

**Bayesian (optional):**
- Continuous monitoring (no peeking problem)
- More intuitive interpretation
- Better for small samples
- Expected loss for decision making

**Recommendation:** Start with frequentist, use Bayesian for advanced users.

### Event Deduplication

**Per-session deduplication:**
- Prevents double-counting from page refreshes
- Same session ID tracks user journey
- Events: view, conversion, click, submit

**Why not global deduplication:**
- User might convert multiple times (subscriptions)
- Different sessions represent different intents
- Allows tracking funnel progression

### Multi-Variant Support

**Bonferroni correction:**
- Adjusts sample size for multiple comparisons
- Prevents false positives in A/B/C tests
- Logarithmic scaling with number of variants

**Winner selection:**
- Always compares against control (index 0)
- Requires statistical significance
- Returns null if insufficient data or no clear winner

## Common Development Tasks

### Adding a New Statistical Method

1. Add function to `src/lib/statistics.ts`
2. Export from `src/lib/index.ts`
3. Add unit tests in `tests/statistics.test.ts`
4. Document in README.md API reference
5. Add example usage

### Adding a New Event Type

1. Update `Analytics` collection options
2. Add to `trackEvent()` type unions
3. Update `ExperimentTracker` event listeners
4. Add helper function to `experimentEvents`

### Extending Experiment Config

1. Add field to `Experiments` collection
2. Update `ExperimentConfig` type in `lib/experiments.ts`
3. Update `getActiveExperiment()` to include new field
4. Document in README.md

### Creating Integration Example

1. Add to README.md "Integration Examples" section
2. Include:
   - Experiment config
   - Server component
   - Client component
   - Tracking implementation
3. Show real-world use case

## Testing Strategy

### Unit Tests (Vitest)

Focus on:
- Statistical calculations (edge cases, accuracy)
- Variant selection (weights, randomness)
- Confidence intervals (boundaries, small samples)
- Winner detection (sufficient data, significance)

### Integration Tests

Mock PayloadCMS:
- Collection queries
- Event creation
- Stats calculation

### Manual Testing

Use Payload Admin:
1. Create experiment
2. Add variants
3. Set status to running
4. View in browser
5. Track events
6. Check analytics collection
7. Calculate stats

**Testing tricks:**
```typescript
// Force specific variant
Cookies.set('exp_variant_exp-123', '1')

// Clear all experiments
clearExperimentCookies()

// Simulate multiple sessions
clearExperimentCookies()
window.location.reload()
```

## Integration with Services.Delivery

### Use Cases

1. **Service Pricing Optimization**
   - Test different pricing tiers
   - Test payment models (one-time vs subscription)
   - Test pricing display formats

2. **Landing Page Conversion**
   - Test headlines
   - Test hero images
   - Test CTA button text/color
   - Test layout (grid vs list)

3. **Feature Descriptions**
   - Test technical vs benefit-focused
   - Test short vs detailed
   - Test with/without icons

4. **Checkout Flow**
   - Test number of steps
   - Test form layouts
   - Test trust badges placement

### Implementation Pattern

```typescript
// 1. Server: Get experiment
const experiment = await getActiveExperiment(payload, request.url.pathname)

// 2. Client: Assign variant + track
<ExperimentProvider experimentId={experiment.id} variants={experiment.variants}>
  {({ variantConfig, variantIndex, sessionId }) => (
    <>
      <ExperimentTracker {...} />
      <ServiceCard config={variantConfig} />
    </>
  )}
</ExperimentProvider>

// 3. Track conversion
const { trackConversion } = useExperimentTracking()
trackConversion({ revenue: 99.00, service: 'web-design' })
```

## Performance Considerations

### Database Optimization

**Indexes required:**
- `experiment` (in analytics collection)
- `sessionId` (in analytics collection)
- `event` (in analytics collection)
- `status` (in experiments collection)
- `targetPage` (in experiments collection)

**Query optimization:**
- Limit analytics queries (10K-50K max)
- Use pagination for large result sets
- Cache stats in experiment document
- Update stats via cron (every 15 min)

### Client-Side Performance

**Tracking is non-blocking:**
- Uses `fetch()` with no await in component
- Errors caught and logged, don't break UI
- Custom events use lightweight `CustomEvent`

**Cookie overhead:**
- Minimal (2 cookies per experiment)
- Sent with every request (keep domain-specific)
- Consider using `localStorage` for SPA-only experiments

### Cloudflare Compatibility

**Works with:**
- Cloudflare Pages (static + dynamic)
- Cloudflare Workers (edge compute)
- D1 Database (via Payload)
- Analytics Engine (optional advanced analytics)

**Cloudflare-specific features:**
- Automatic geo-location from CF headers
- Device detection from user agent
- Edge caching compatible (cookie-based assignment)

## Deployment Checklist

- [ ] Build package (`pnpm build`)
- [ ] Run tests (`pnpm test`)
- [ ] Type check (`pnpm typecheck`)
- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Commit and push to GitHub
- [ ] Create git tag (`git tag v0.1.0`)
- [ ] Publish to npm (`pnpm publish --access public`)
- [ ] Update documentation site

## Migration from POC

### What Was Extracted

✅ Collections (Experiments, Analytics)
✅ Server utilities (getActiveExperiment, trackEvent, getStats)
✅ Statistics (Z-test, confidence intervals)
✅ Client tracker (ExperimentTracker component)

### What Was Added

✅ Bayesian statistics (credible intervals, expected loss)
✅ Sample size calculator
✅ React context (ExperimentProvider)
✅ React hooks (useExperiment, useExperimentTracking)
✅ Variant components (<Variant>, withExperiment)
✅ Advanced cookie handling (js-cookie library)
✅ Comprehensive TypeScript types
✅ Unit tests
✅ Extensive documentation

### What Was Improved

✅ Better error handling
✅ More flexible metadata
✅ Custom event support
✅ Device detection
✅ Geo-location support
✅ Better validation (variant weights sum to 100%)
✅ Auto-completion of expired experiments

## Roadmap

### v0.2.0 (Next Release)

- [ ] Admin UI component for viewing results
- [ ] Real-time dashboard with charts
- [ ] Export to CSV/JSON
- [ ] Multi-armed bandit algorithm
- [ ] Sequential testing (early stopping)

### v0.3.0 (Future)

- [ ] Segment analysis (by device, location, etc.)
- [ ] Integration with GA4
- [ ] Integration with PostHog
- [ ] Experiment templates
- [ ] Auto-pause low-performing variants

### v1.0.0 (Stable)

- [ ] Full test coverage (90%+)
- [ ] Performance benchmarks
- [ ] Security audit
- [ ] Accessibility audit
- [ ] Production case studies

## Troubleshooting

### Variants not persisting across sessions

**Symptom:** User sees different variant on each visit

**Causes:**
- Cookies disabled in browser
- Cookie domain mismatch
- Incognito mode

**Fix:**
```typescript
// Check if cookies are working
const sessionId = getOrCreateSessionId()
console.log('Session ID:', sessionId)

// Force cookie domain
Cookies.set('test', 'value', { domain: '.yourdomain.com' })
```

### Winner not being detected

**Symptom:** `winner.index` is always `null`

**Causes:**
- Insufficient sample size
- Not enough conversions
- Difference not statistically significant

**Fix:**
```typescript
const { stats, winner } = await getExperimentStats(payload, experimentId)

console.log('Sufficient data:', winner.sufficientData)
console.log('Confidence:', winner.confidence)

stats.forEach(s => {
  console.log(`${s.name}: ${s.views} views, ${s.conversions} conversions`)
})

// Lower thresholds for testing (NOT production)
const testResult = determineWinner(stats, 10, 80) // Lower sample size + confidence
```

### Events not tracking

**Symptom:** No records in analytics collection

**Causes:**
- API endpoint not set up
- CORS issues
- Network errors

**Fix:**
```typescript
// Check tracking endpoint
<ExperimentTracker
  {...props}
  onError={(error) => {
    console.error('Tracking failed:', error)
    // Check network tab in browser DevTools
  }}
/>

// Test manually
fetch('/api/experiments/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    experimentId: 'exp-123',
    variantIndex: 0,
    event: 'view',
    sessionId: 'test-session',
  }),
})
```

## Related Documentation

- [PayloadCMS Docs](https://payloadcms.com/docs)
- [Statistical Testing Guide](https://www.evanmiller.org/ab-testing/)
- [Bayesian A/B Testing](https://www.dynamicyield.com/lesson/bayesian-testing/)
- [Sample Size Calculator](https://www.optimizely.com/sample-size-calculator/)

## Contact

- GitHub Issues: https://github.com/dot-do/packages/issues
- Package: https://www.npmjs.com/package/@dot-do/payload-experiments
- Documentation: https://packages.dot.do/payload-experiments

---

**Last Updated:** 2025-10-03
**Version:** 0.1.0
**Status:** Production Ready
