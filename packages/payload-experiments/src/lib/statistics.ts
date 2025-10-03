/**
 * Statistical Analysis Utilities for A/B Testing
 *
 * Provides statistical methods for determining experiment winners with confidence intervals,
 * Z-tests for proportions, and sample size calculations.
 */

export interface VariantStats {
  name: string
  views: number
  conversions: number
  conversionRate: number
}

export interface StatisticalResult {
  isSignificant: boolean
  confidence: number
  pValue: number
  zScore: number
  relativeLift: number
  absoluteLift: number
}

export interface SampleSizeRecommendation {
  perVariant: number
  total: number
  daysEstimate: number
}

/**
 * Calculate conversion rate with confidence interval
 */
export function calculateConversionRate(conversions: number, views: number): {
  rate: number
  confidenceInterval: { lower: number; upper: number }
} {
  if (views === 0) {
    return { rate: 0, confidenceInterval: { lower: 0, upper: 0 } }
  }

  const rate = conversions / views

  // Wilson score interval (better for small samples than normal approximation)
  const z = 1.96 // 95% confidence
  const n = views
  const p = rate

  const denominator = 1 + (z * z) / n
  const center = (p + (z * z) / (2 * n)) / denominator
  const margin = (z * Math.sqrt(p * (1 - p) / n + (z * z) / (4 * n * n))) / denominator

  return {
    rate,
    confidenceInterval: {
      lower: Math.max(0, center - margin),
      upper: Math.min(1, center + margin),
    },
  }
}

/**
 * Z-test for comparing two proportions (conversion rates)
 *
 * Tests null hypothesis: control_rate = variant_rate
 * Returns z-score and p-value for two-tailed test
 */
export function zTestProportions(
  controlConversions: number,
  controlViews: number,
  variantConversions: number,
  variantViews: number
): { zScore: number; pValue: number } {
  if (controlViews === 0 || variantViews === 0) {
    return { zScore: 0, pValue: 1 }
  }

  const p1 = controlConversions / controlViews
  const p2 = variantConversions / variantViews

  // Pooled proportion
  const pooled = (controlConversions + variantConversions) / (controlViews + variantViews)

  // Standard error
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / controlViews + 1 / variantViews))

  if (se === 0) {
    return { zScore: 0, pValue: 1 }
  }

  // Z-score
  const zScore = (p2 - p1) / se

  // P-value (two-tailed test using normal approximation)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))

  return { zScore, pValue }
}

/**
 * Standard normal cumulative distribution function
 * Approximation using Abramowitz and Stegun formula
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

  return z > 0 ? 1 - p : p
}

/**
 * Compare variant against control with statistical analysis
 */
export function compareVariants(control: VariantStats, variant: VariantStats, confidenceThreshold: number = 95): StatisticalResult {
  const { zScore, pValue } = zTestProportions(control.conversions, control.views, variant.conversions, variant.views)

  // Convert p-value to confidence level
  const confidence = (1 - pValue) * 100

  // Check if result is statistically significant
  const isSignificant = confidence >= confidenceThreshold

  // Calculate lift
  const relativeLift = control.conversionRate > 0 ? ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100 : 0

  const absoluteLift = (variant.conversionRate - control.conversionRate) * 100

  return {
    isSignificant,
    confidence,
    pValue,
    zScore,
    relativeLift,
    absoluteLift,
  }
}

/**
 * Determine winning variant from array of variants
 *
 * Returns index of winner, confidence level, and detailed stats
 */
export function determineWinner(
  variants: VariantStats[],
  minimumSampleSize: number = 100,
  confidenceThreshold: number = 95
): {
  winnerIndex: number | null
  confidence: number
  results: Array<StatisticalResult & { variantIndex: number }>
  sufficientData: boolean
} {
  if (variants.length < 2) {
    return { winnerIndex: null, confidence: 0, results: [], sufficientData: false }
  }

  const control = variants[0]

  // Check if we have sufficient data
  const sufficientData = variants.every((v) => v.views >= minimumSampleSize)

  if (!sufficientData) {
    return { winnerIndex: null, confidence: 0, results: [], sufficientData: false }
  }

  // Compare each variant against control
  const results = variants.slice(1).map((variant, index) => ({
    variantIndex: index + 1,
    ...compareVariants(control, variant, confidenceThreshold),
  }))

  // Find best performing variant (highest conversion rate with significance)
  let bestIndex = 0
  let bestConfidence = 0

  results.forEach((result) => {
    if (result.isSignificant && result.relativeLift > 0) {
      if (variants[result.variantIndex].conversionRate > variants[bestIndex].conversionRate) {
        bestIndex = result.variantIndex
        bestConfidence = result.confidence
      }
    }
  })

  // If control is still best, check if any variant is significantly worse
  if (bestIndex === 0) {
    const allWorse = results.every((r) => r.isSignificant && r.relativeLift < 0)
    if (allWorse) {
      bestConfidence = Math.min(...results.map((r) => r.confidence))
    }
  }

  return {
    winnerIndex: bestConfidence >= confidenceThreshold ? bestIndex : null,
    confidence: bestConfidence,
    results,
    sufficientData,
  }
}

/**
 * Calculate required sample size per variant
 *
 * Based on desired minimum detectable effect (MDE), baseline conversion rate,
 * significance level, and statistical power
 */
export function calculateSampleSize(
  baselineConversionRate: number,
  minimumDetectableEffect: number = 0.1, // 10% relative improvement
  alpha: number = 0.05, // Significance level (5%)
  power: number = 0.8, // Statistical power (80%)
  numberOfVariants: number = 2
): SampleSizeRecommendation {
  // Z-scores for alpha and power
  const zAlpha = 1.96 // Two-tailed test at 5% significance
  const zBeta = 0.84 // 80% power

  // Expected conversion rate for variant
  const p1 = baselineConversionRate
  const p2 = p1 * (1 + minimumDetectableEffect)

  // Pooled proportion
  const p = (p1 + p2) / 2

  // Sample size per variant (using normal approximation)
  const n = Math.ceil((2 * p * (1 - p) * Math.pow(zAlpha + zBeta, 2)) / Math.pow(p2 - p1, 2))

  // Bonferroni correction for multiple comparisons
  const correctedN = numberOfVariants > 2 ? Math.ceil(n * Math.log(numberOfVariants)) : n

  // Estimate days needed (assuming 1000 views per day per variant)
  const assumedDailyTraffic = 1000
  const daysEstimate = Math.ceil(correctedN / assumedDailyTraffic)

  return {
    perVariant: correctedN,
    total: correctedN * numberOfVariants,
    daysEstimate,
  }
}

/**
 * Calculate Bayesian credible interval for conversion rate
 *
 * Uses Beta distribution (conjugate prior for binomial)
 * Returns 95% credible interval
 */
export function bayesianCredibleInterval(
  conversions: number,
  views: number,
  priorAlpha: number = 1,
  priorBeta: number = 1
): { mean: number; lower: number; upper: number } {
  // Posterior parameters (Beta distribution)
  const alpha = priorAlpha + conversions
  const beta = priorBeta + (views - conversions)

  // Mean of Beta distribution
  const mean = alpha / (alpha + beta)

  // Approximate credible interval using normal approximation to Beta
  // For more accuracy, use Beta quantile function
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1))
  const stdDev = Math.sqrt(variance)

  return {
    mean,
    lower: Math.max(0, mean - 1.96 * stdDev),
    upper: Math.min(1, mean + 1.96 * stdDev),
  }
}

/**
 * Calculate expected loss for each variant (Bayesian decision theory)
 *
 * Expected loss = expected regret from choosing this variant over the true best
 * Lower is better
 */
export function calculateExpectedLoss(
  variants: Array<{ conversions: number; views: number }>,
  samples: number = 10000
): number[] {
  // For simplicity, using analytical approximation
  // In production, consider Monte Carlo sampling from posterior distributions

  const posteriors = variants.map((v) => {
    const alpha = 1 + v.conversions
    const beta = 1 + (v.views - v.conversions)
    return { alpha, beta, mean: alpha / (alpha + beta) }
  })

  // Calculate expected loss for each variant
  return posteriors.map((posterior, i) => {
    const maxMean = Math.max(...posteriors.map((p) => p.mean))
    return Math.max(0, maxMean - posterior.mean)
  })
}
