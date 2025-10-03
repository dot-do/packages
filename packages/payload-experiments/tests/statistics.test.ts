import { describe, it, expect } from 'vitest'
import { calculateConversionRate, zTestProportions, compareVariants, determineWinner, calculateSampleSize, bayesianCredibleInterval } from '../src/lib/statistics'

describe('Statistics', () => {
  describe('calculateConversionRate', () => {
    it('calculates basic conversion rate', () => {
      const result = calculateConversionRate(25, 100)
      expect(result.rate).toBe(0.25)
    })

    it('calculates confidence interval', () => {
      const result = calculateConversionRate(25, 100)
      expect(result.confidenceInterval.lower).toBeGreaterThan(0.15)
      expect(result.confidenceInterval.upper).toBeLessThan(0.35)
    })

    it('handles zero conversions', () => {
      const result = calculateConversionRate(0, 100)
      expect(result.rate).toBe(0)
      expect(result.confidenceInterval.lower).toBe(0)
    })

    it('handles zero views', () => {
      const result = calculateConversionRate(0, 0)
      expect(result.rate).toBe(0)
      expect(result.confidenceInterval.lower).toBe(0)
      expect(result.confidenceInterval.upper).toBe(0)
    })
  })

  describe('zTestProportions', () => {
    it('detects significant difference', () => {
      const result = zTestProportions(50, 1000, 70, 1000)
      expect(result.pValue).toBeLessThan(0.05) // Significant at 95% level
      expect(result.zScore).toBeGreaterThan(1.96)
    })

    it('detects no significant difference', () => {
      const result = zTestProportions(50, 1000, 52, 1000)
      expect(result.pValue).toBeGreaterThan(0.05) // Not significant
    })

    it('handles identical proportions', () => {
      const result = zTestProportions(50, 1000, 50, 1000)
      expect(result.zScore).toBeCloseTo(0, 1)
      expect(result.pValue).toBeCloseTo(1, 1)
    })

    it('handles zero sample size', () => {
      const result = zTestProportions(0, 0, 50, 1000)
      expect(result.zScore).toBe(0)
      expect(result.pValue).toBe(1)
    })
  })

  describe('compareVariants', () => {
    it('identifies winning variant with high confidence', () => {
      const control = { name: 'Control', views: 1000, conversions: 50, conversionRate: 0.05 }
      const variant = { name: 'Variant A', views: 1000, conversions: 70, conversionRate: 0.07 }

      const result = compareVariants(control, variant, 95)

      expect(result.isSignificant).toBe(true)
      expect(result.confidence).toBeGreaterThan(95)
      expect(result.relativeLift).toBeCloseTo(40, 0) // 40% improvement
      expect(result.absoluteLift).toBeCloseTo(2, 0) // 2 percentage points
    })

    it('identifies no winner with insufficient data', () => {
      const control = { name: 'Control', views: 50, conversions: 2, conversionRate: 0.04 }
      const variant = { name: 'Variant A', views: 50, conversions: 3, conversionRate: 0.06 }

      const result = compareVariants(control, variant, 95)

      expect(result.isSignificant).toBe(false)
      expect(result.confidence).toBeLessThan(95)
    })

    it('calculates negative lift for worse variant', () => {
      const control = { name: 'Control', views: 1000, conversions: 70, conversionRate: 0.07 }
      const variant = { name: 'Variant A', views: 1000, conversions: 50, conversionRate: 0.05 }

      const result = compareVariants(control, variant, 95)

      expect(result.relativeLift).toBeLessThan(0)
      expect(result.absoluteLift).toBeLessThan(0)
    })
  })

  describe('determineWinner', () => {
    it('determines winner in A/B test', () => {
      const variants = [
        { name: 'Control', views: 1000, conversions: 50, conversionRate: 0.05 },
        { name: 'Variant A', views: 1000, conversions: 70, conversionRate: 0.07 },
      ]

      const result = determineWinner(variants, 100, 95)

      expect(result.sufficientData).toBe(true)
      expect(result.winnerIndex).toBe(1) // Variant A wins
      expect(result.confidence).toBeGreaterThan(95)
    })

    it('determines winner in A/B/C test', () => {
      const variants = [
        { name: 'Control', views: 1000, conversions: 50, conversionRate: 0.05 },
        { name: 'Variant A', views: 1000, conversions: 60, conversionRate: 0.06 },
        { name: 'Variant B', views: 1000, conversions: 80, conversionRate: 0.08 },
      ]

      const result = determineWinner(variants, 100, 95)

      expect(result.sufficientData).toBe(true)
      expect(result.winnerIndex).toBe(2) // Variant B wins
    })

    it('returns no winner with insufficient data', () => {
      const variants = [
        { name: 'Control', views: 50, conversions: 2, conversionRate: 0.04 },
        { name: 'Variant A', views: 50, conversions: 3, conversionRate: 0.06 },
      ]

      const result = determineWinner(variants, 100, 95)

      expect(result.sufficientData).toBe(false)
      expect(result.winnerIndex).toBe(null)
    })

    it('returns control when no variant beats it', () => {
      const variants = [
        { name: 'Control', views: 1000, conversions: 70, conversionRate: 0.07 },
        { name: 'Variant A', views: 1000, conversions: 50, conversionRate: 0.05 },
        { name: 'Variant B', views: 1000, conversions: 60, conversionRate: 0.06 },
      ]

      const result = determineWinner(variants, 100, 95)

      expect(result.sufficientData).toBe(true)
      expect(result.winnerIndex).toBe(0) // Control wins
    })
  })

  describe('calculateSampleSize', () => {
    it('calculates sample size for standard A/B test', () => {
      const result = calculateSampleSize(0.05, 0.20, 0.05, 0.80, 2)

      expect(result.perVariant).toBeGreaterThan(1000)
      expect(result.total).toBe(result.perVariant * 2)
      expect(result.daysEstimate).toBeGreaterThan(1)
    })

    it('requires larger sample for smaller effect sizes', () => {
      const small = calculateSampleSize(0.05, 0.10, 0.05, 0.80, 2) // 10% MDE
      const large = calculateSampleSize(0.05, 0.30, 0.05, 0.80, 2) // 30% MDE

      expect(small.perVariant).toBeGreaterThan(large.perVariant)
    })

    it('requires larger sample for more variants', () => {
      const ab = calculateSampleSize(0.05, 0.20, 0.05, 0.80, 2) // A/B
      const abc = calculateSampleSize(0.05, 0.20, 0.05, 0.80, 3) // A/B/C

      expect(abc.perVariant).toBeGreaterThan(ab.perVariant)
    })
  })

  describe('bayesianCredibleInterval', () => {
    it('calculates credible interval', () => {
      const result = bayesianCredibleInterval(25, 100)

      expect(result.mean).toBeGreaterThan(0.2)
      expect(result.mean).toBeLessThan(0.3)
      expect(result.lower).toBeGreaterThan(0)
      expect(result.upper).toBeLessThan(1)
      expect(result.lower).toBeLessThan(result.mean)
      expect(result.upper).toBeGreaterThan(result.mean)
    })

    it('handles zero conversions', () => {
      const result = bayesianCredibleInterval(0, 100)

      expect(result.mean).toBeLessThan(0.05)
      expect(result.lower).toBe(0)
    })

    it('handles high conversion rate', () => {
      const result = bayesianCredibleInterval(95, 100)

      expect(result.mean).toBeGreaterThan(0.9)
      expect(result.upper).toBe(1)
    })
  })
})
