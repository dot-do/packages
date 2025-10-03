'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { getOrCreateSessionId, getOrAssignVariant } from './ExperimentTracker'

export interface ExperimentContextValue {
  experimentId: string | number | null
  variantIndex: number
  variantConfig: any
  sessionId: string
  isReady: boolean
}

const ExperimentContext = createContext<ExperimentContextValue | undefined>(undefined)

export interface ExperimentProviderProps {
  children: ReactNode | ((context: ExperimentContextValue) => ReactNode)
  experimentId: string | number
  variants: Array<{ name: string; weight: number; config?: any }>
  fallbackVariant?: number
  loading?: ReactNode
}

/**
 * Experiment Provider Component
 *
 * Manages variant assignment and provides context to child components
 * Handles cookie-based persistence and weight-based selection
 */
export function ExperimentProvider({ children, experimentId, variants, fallbackVariant = 0, loading }: ExperimentProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [variantIndex, setVariantIndex] = useState<number>(fallbackVariant)

  useEffect(() => {
    // Client-side only - assign variant and session
    const sid = getOrCreateSessionId()
    const weights = variants.map((v) => v.weight)
    const index = getOrAssignVariant(experimentId, weights)

    setSessionId(sid)
    setVariantIndex(index)
    setIsReady(true)
  }, [experimentId, variants])

  const value: ExperimentContextValue = {
    experimentId: isReady ? experimentId : null,
    variantIndex,
    variantConfig: variants[variantIndex]?.config || {},
    sessionId,
    isReady,
  }

  if (!isReady && loading) {
    return <>{loading}</>
  }

  if (typeof children === 'function') {
    return <ExperimentContext.Provider value={value}>{children(value)}</ExperimentContext.Provider>
  }

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>
}

/**
 * Hook to access experiment context
 */
export function useExperiment(): ExperimentContextValue {
  const context = useContext(ExperimentContext)
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider')
  }
  return context
}

/**
 * Component to render different variants
 */
export interface VariantProps {
  index: number
  children: ReactNode
}

export function Variant({ index, children }: VariantProps) {
  const { variantIndex, isReady } = useExperiment()

  if (!isReady || variantIndex !== index) {
    return null
  }

  return <>{children}</>
}

/**
 * Higher-order component for variant-specific rendering
 */
export function withExperiment<P extends object>(
  Component: React.ComponentType<P & { variantConfig: any }>,
  experimentId: string | number,
  variants: Array<{ name: string; weight: number; config?: any }>
) {
  return function ExperimentWrapper(props: P) {
    return (
      <ExperimentProvider experimentId={experimentId} variants={variants}>
        {({ variantConfig }) => <Component {...props} variantConfig={variantConfig} />}
      </ExperimentProvider>
    )
  }
}
