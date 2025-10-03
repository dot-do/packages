// Collections
export { Experiments, Analytics } from './collections'

// Utilities
export {
  getActiveExperiment,
  getExperiment,
  selectVariant,
  trackEvent,
  getExperimentStats,
  updateExperimentStats,
  generateSessionId,
  parseUserAgent,
  getEventMetadataFromRequest,
  type ExperimentConfig,
  type EventMetadata,
} from './lib/experiments'

// Statistics
export {
  calculateConversionRate,
  zTestProportions,
  compareVariants,
  determineWinner,
  calculateSampleSize,
  bayesianCredibleInterval,
  calculateExpectedLoss,
  type VariantStats,
  type StatisticalResult,
  type SampleSizeRecommendation,
} from './lib/statistics'

// Components
export { ExperimentTracker, useExperimentTracking, experimentEvents, getOrCreateSessionId, getOrAssignVariant, clearExperimentCookies, type ExperimentTrackerProps } from './components/ExperimentTracker'

export { ExperimentProvider, useExperiment, Variant, withExperiment, type ExperimentContextValue, type ExperimentProviderProps, type VariantProps } from './components/ExperimentProvider'
