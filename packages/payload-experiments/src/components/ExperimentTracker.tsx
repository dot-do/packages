'use client'

import { useEffect, useRef } from 'react'
import Cookies from 'js-cookie'

export interface ExperimentTrackerProps {
  experimentId: string | number
  variantIndex: number
  sessionId: string
  trackingEndpoint?: string
  autoTrackView?: boolean
  onError?: (error: Error) => void
}

/**
 * Client-side experiment tracker component
 *
 * Automatically tracks page views and listens for conversion events
 * Uses custom events for triggering conversions from other components
 */
export function ExperimentTracker({
  experimentId,
  variantIndex,
  sessionId,
  trackingEndpoint = '/api/experiments/track',
  autoTrackView = true,
  onError,
}: ExperimentTrackerProps) {
  const hasTrackedView = useRef(false)

  useEffect(() => {
    // Track page view (once per mount)
    if (autoTrackView && !hasTrackedView.current) {
      trackEvent('view')
      hasTrackedView.current = true
    }

    // Listen for conversion events
    const handleConversion = (event: Event) => {
      const customEvent = event as CustomEvent
      trackEvent('conversion', customEvent.detail)
    }

    const handleClick = (event: Event) => {
      const customEvent = event as CustomEvent
      trackEvent('click', customEvent.detail)
    }

    const handleSubmit = (event: Event) => {
      const customEvent = event as CustomEvent
      trackEvent('submit', customEvent.detail)
    }

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent
      trackEvent('custom', customEvent.detail)
    }

    window.addEventListener('experiment:conversion', handleConversion)
    window.addEventListener('experiment:click', handleClick)
    window.addEventListener('experiment:submit', handleSubmit)
    window.addEventListener('experiment:custom', handleCustomEvent)

    return () => {
      window.removeEventListener('experiment:conversion', handleConversion)
      window.removeEventListener('experiment:click', handleClick)
      window.removeEventListener('experiment:submit', handleSubmit)
      window.removeEventListener('experiment:custom', handleCustomEvent)
    }
  }, [experimentId, variantIndex, sessionId, autoTrackView])

  async function trackEvent(event: 'view' | 'conversion' | 'click' | 'submit' | 'custom', detail?: any) {
    try {
      const metadata = {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        pathname: window.location.pathname,
        timestamp: new Date().toISOString(),
        device: {
          screenSize: `${window.screen.width}x${window.screen.height}`,
        },
        custom: detail,
      }

      const response = await fetch(trackingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experimentId,
          variantIndex,
          event,
          customEventName: detail?.eventName,
          sessionId,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error(`Tracking failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to track experiment event:', error)
      onError?.(error as Error)
    }
  }

  return null // This is a tracking-only component
}

/**
 * Hook for accessing experiment tracking functions
 */
export function useExperimentTracking() {
  return {
    trackConversion: (detail?: any) => {
      window.dispatchEvent(new CustomEvent('experiment:conversion', { detail }))
    },
    trackClick: (detail?: any) => {
      window.dispatchEvent(new CustomEvent('experiment:click', { detail }))
    },
    trackSubmit: (detail?: any) => {
      window.dispatchEvent(new CustomEvent('experiment:submit', { detail }))
    },
    trackCustomEvent: (eventName: string, detail?: any) => {
      window.dispatchEvent(new CustomEvent('experiment:custom', { detail: { eventName, ...detail } }))
    },
  }
}

/**
 * Helper functions for triggering events from non-React code
 */
export const experimentEvents = {
  conversion: (detail?: any) => {
    window.dispatchEvent(new CustomEvent('experiment:conversion', { detail }))
  },
  click: (detail?: any) => {
    window.dispatchEvent(new CustomEvent('experiment:click', { detail }))
  },
  submit: (detail?: any) => {
    window.dispatchEvent(new CustomEvent('experiment:submit', { detail }))
  },
  custom: (eventName: string, detail?: any) => {
    window.dispatchEvent(new CustomEvent('experiment:custom', { detail: { eventName, ...detail } }))
  },
}

/**
 * Get or create session ID in cookies
 */
export function getOrCreateSessionId(cookieName: string = 'exp_session_id'): string {
  let sessionId = Cookies.get(cookieName)

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    Cookies.set(cookieName, sessionId, {
      expires: 365, // 1 year
      sameSite: 'lax',
    })
  }

  return sessionId
}

/**
 * Get or assign variant for experiment (with cookie persistence)
 */
export function getOrAssignVariant(experimentId: string | number, variantWeights: number[]): number {
  const cookieName = `exp_variant_${experimentId}`
  const existing = Cookies.get(cookieName)

  if (existing !== undefined) {
    return parseInt(existing, 10)
  }

  // Select variant based on weights
  const random = Math.random() * 100
  let cumulative = 0
  let variantIndex = 0

  for (let i = 0; i < variantWeights.length; i++) {
    cumulative += variantWeights[i]
    if (random <= cumulative) {
      variantIndex = i
      break
    }
  }

  // Store in cookie for 30 days
  Cookies.set(cookieName, variantIndex.toString(), {
    expires: 30,
    sameSite: 'lax',
  })

  return variantIndex
}

/**
 * Clear experiment cookies (useful for testing)
 */
export function clearExperimentCookies(experimentId?: string | number) {
  if (experimentId) {
    Cookies.remove(`exp_variant_${experimentId}`)
  } else {
    // Clear all experiment cookies
    const allCookies = Cookies.get()
    Object.keys(allCookies).forEach((key) => {
      if (key.startsWith('exp_variant_') || key === 'exp_session_id') {
        Cookies.remove(key)
      }
    })
  }
}
