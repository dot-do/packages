import type { Payload } from 'payload'
import { calculateConversionRate, determineWinner, type VariantStats } from './statistics'

export interface ExperimentConfig {
  id: string | number
  name: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  targetPage?: string
  variants: Array<{
    name: string
    weight: number
    config?: any
  }>
  goalMetric: 'conversion' | 'click' | 'submit' | 'custom'
  customGoalEvent?: string
  minimumSampleSize: number
  confidenceThreshold: number
  startDate?: string
  endDate?: string
}

export interface EventMetadata {
  userAgent?: string
  referrer?: string
  pathname?: string
  timestamp?: string
  location?: {
    country?: string
    region?: string
    city?: string
    timezone?: string
  }
  device?: {
    type?: 'desktop' | 'mobile' | 'tablet' | 'unknown'
    browser?: string
    os?: string
    screenSize?: string
  }
  custom?: Record<string, any>
}

/**
 * Get active experiment for a specific page
 */
export async function getActiveExperiment(payload: Payload, targetPage: string, options?: { locale?: string }): Promise<ExperimentConfig | null> {
  const now = new Date().toISOString()

  const result = await payload.find({
    collection: 'experiments',
    where: {
      and: [
        { status: { equals: 'running' } },
        { targetPage: { equals: targetPage } },
        {
          or: [{ startDate: { less_than_equal: now } }, { startDate: { exists: false } }],
        },
        {
          or: [{ endDate: { greater_than: now } }, { endDate: { exists: false } }],
        },
      ],
    },
    limit: 1,
    locale: options?.locale,
  })

  if (result.docs.length === 0) {
    return null
  }

  const doc = result.docs[0]
  return {
    id: doc.id,
    name: doc.name,
    status: doc.status,
    targetPage: doc.targetPage,
    variants: doc.variants,
    goalMetric: doc.goalMetric,
    customGoalEvent: doc.customGoalEvent,
    minimumSampleSize: doc.minimumSampleSize || 100,
    confidenceThreshold: doc.confidenceThreshold || 95,
    startDate: doc.startDate,
    endDate: doc.endDate,
  }
}

/**
 * Get experiment by ID
 */
export async function getExperiment(payload: Payload, experimentId: string | number): Promise<ExperimentConfig | null> {
  try {
    const doc = await payload.findByID({
      collection: 'experiments',
      id: experimentId,
    })

    return {
      id: doc.id,
      name: doc.name,
      status: doc.status,
      targetPage: doc.targetPage,
      variants: doc.variants,
      goalMetric: doc.goalMetric,
      customGoalEvent: doc.customGoalEvent,
      minimumSampleSize: doc.minimumSampleSize || 100,
      confidenceThreshold: doc.confidenceThreshold || 95,
      startDate: doc.startDate,
      endDate: doc.endDate,
    }
  } catch (error) {
    return null
  }
}

/**
 * Select variant based on traffic weights
 *
 * Uses weighted random selection to assign a variant
 */
export function selectVariant(experiment: ExperimentConfig): number {
  const random = Math.random() * 100
  let cumulative = 0

  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.variants[i].weight || 0
    if (random <= cumulative) {
      return i
    }
  }

  // Fallback to first variant (control)
  return 0
}

/**
 * Track experiment event
 *
 * Records an analytics event for the experiment
 */
export async function trackEvent(
  payload: Payload,
  experimentId: string | number,
  variantIndex: number,
  event: 'view' | 'conversion' | 'click' | 'submit' | 'custom',
  sessionId: string,
  options?: {
    userId?: string
    customEventName?: string
    metadata?: EventMetadata
    deduplicateEvent?: boolean
  }
): Promise<any> {
  const { userId, customEventName, metadata, deduplicateEvent = true } = options || {}

  // Check for duplicate events if deduplication is enabled
  if (deduplicateEvent) {
    const existing = await payload.find({
      collection: 'experiment-analytics',
      where: {
        and: [{ experiment: { equals: experimentId } }, { sessionId: { equals: sessionId } }, { event: { equals: event } }],
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return existing.docs[0]
    }
  }

  // Create analytics record
  return await payload.create({
    collection: 'experiment-analytics',
    data: {
      experiment: experimentId,
      variant: variantIndex,
      event,
      customEventName: event === 'custom' ? customEventName : undefined,
      sessionId,
      userId,
      metadata: {
        ...metadata,
        timestamp: metadata?.timestamp || new Date().toISOString(),
      },
    },
  })
}

/**
 * Get experiment statistics
 *
 * Calculates real-time stats for all variants
 */
export async function getExperimentStats(
  payload: Payload,
  experimentId: string | number
): Promise<{
  experiment: ExperimentConfig
  stats: VariantStats[]
  winner: {
    index: number | null
    confidence: number
    sufficientData: boolean
  }
}> {
  // Get experiment config
  const experiment = await getExperiment(payload, experimentId)
  if (!experiment) {
    throw new Error(`Experiment ${experimentId} not found`)
  }

  // Get all analytics events
  const analytics = await payload.find({
    collection: 'experiment-analytics',
    where: {
      experiment: { equals: experimentId },
    },
    limit: 50000, // Adjust based on expected volume
  })

  // Determine goal event type
  const goalEvent = experiment.goalMetric === 'custom' ? 'custom' : experiment.goalMetric

  // Calculate stats per variant
  const stats: VariantStats[] = experiment.variants.map((variant, index) => {
    const variantEvents = analytics.docs.filter((e) => e.variant === index)
    const views = variantEvents.filter((e) => e.event === 'view').length
    const goalEvents = variantEvents.filter((e) => {
      if (goalEvent === 'custom') {
        return e.event === 'custom' && e.customEventName === experiment.customGoalEvent
      }
      return e.event === goalEvent
    }).length

    const { rate, confidenceInterval } = calculateConversionRate(goalEvents, views)

    return {
      name: variant.name,
      views,
      conversions: goalEvents,
      conversionRate: rate,
      confidenceInterval,
    }
  })

  // Determine winner using statistical analysis
  const winnerResult = determineWinner(stats, experiment.minimumSampleSize, experiment.confidenceThreshold)

  return {
    experiment,
    stats,
    winner: {
      index: winnerResult.winnerIndex,
      confidence: winnerResult.confidence,
      sufficientData: winnerResult.sufficientData,
    },
  }
}

/**
 * Update experiment with calculated stats and winner
 *
 * Call this periodically (e.g., via cron job) to update cached stats
 */
export async function updateExperimentStats(payload: Payload, experimentId: string | number): Promise<void> {
  const { stats, winner } = await getExperimentStats(payload, experimentId)

  await payload.update({
    collection: 'experiments',
    id: experimentId,
    data: {
      stats: stats.map((s) => ({
        name: s.name,
        views: s.views,
        conversions: s.conversions,
        conversionRate: s.conversionRate * 100, // Store as percentage
      })),
      winningVariant: winner.index !== null ? winner.index : undefined,
      confidenceLevel: winner.confidence,
    },
  })
}

/**
 * Generate session ID
 *
 * Creates a unique session identifier for tracking
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Parse user agent to detect device type
 */
export function parseUserAgent(
  userAgent: string
): {
  type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser?: string
  os?: string
} {
  const ua = userAgent.toLowerCase()

  // Detect device type
  let type: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop'
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    type = 'mobile'
  } else if (/ipad|android(?!.*mobile)|tablet|kindle/i.test(ua)) {
    type = 'tablet'
  }

  // Detect browser
  let browser: string | undefined
  if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('edg')) browser = 'Edge'
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera'

  // Detect OS
  let os: string | undefined
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

  return { type, browser, os }
}

/**
 * Get enriched event metadata from request
 */
export function getEventMetadataFromRequest(request: Request): EventMetadata {
  const userAgent = request.headers.get('user-agent') || ''
  const referrer = request.headers.get('referer') || ''
  const url = new URL(request.url)

  const device = parseUserAgent(userAgent)

  return {
    userAgent,
    referrer,
    pathname: url.pathname,
    timestamp: new Date().toISOString(),
    device,
    // Location data would typically come from Cloudflare headers or GeoIP service
    location: {
      country: request.headers.get('cf-ipcountry') || undefined,
      // @ts-ignore - Cloudflare specific headers
      region: request.cf?.region || undefined,
      // @ts-ignore
      city: request.cf?.city || undefined,
      // @ts-ignore
      timezone: request.cf?.timezone || undefined,
    },
  }
}
