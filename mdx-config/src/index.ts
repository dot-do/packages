/**
 * MDX Config
 * MDX-driven platform configuration system
 */

// Parser
export { parseMDX, parseMDXFile, parseMDXDirectory, extractCodeBlocks, parseFrontmatter, detectMDXType } from './parser'
export type { ParsedMDX, ParserOptions, CodeBlock, MDXType } from './parser'

// Validators
export { validate, validateService, validateCollection, validateWorkflow, validateWorker, checkRequiredFields, validateRelationships, validateBatch } from './validators'
export type { ValidationResult, ValidationError, RelationshipValidationOptions, BatchValidationResult } from './validators'

// Schemas
export * from './schemas'

// Generators
export { generatePayloadCollection, generatePayloadCollections, generateCollectionsIndex } from './generators/payload'
export { generateWorker, generateWranglerConfig, generateServiceWorker } from './generators/worker'
export { generateServiceTypes, generateCollectionTypes, generateWorkflowTypes } from './generators/types'
export type { GeneratePayloadOptions, GenerateWorkerOptions } from './generators'
