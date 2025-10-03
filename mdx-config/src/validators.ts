/**
 * MDX Configuration Validators
 * Validates parsed MDX against schemas
 */

import { ZodError, z } from 'zod'
import { serviceSchema, collectionSchema, workflowSchema, workerSchema } from './schemas'
import type { ParsedMDX, MDXType } from './parser'
import { detectMDXType } from './parser'

export interface ValidationResult {
  valid: boolean
  type: MDXType
  errors?: ValidationError[]
  data?: any
}

export interface ValidationError {
  path: string
  message: string
  code: string
}

/**
 * Validate parsed MDX against appropriate schema
 */
export function validate(parsed: ParsedMDX): ValidationResult {
  const type = detectMDXType(parsed.frontmatter)

  try {
    let schema: z.ZodType<any>
    switch (type) {
      case 'service':
        schema = serviceSchema
        break
      case 'collection':
        schema = collectionSchema
        break
      case 'workflow':
        schema = workflowSchema
        break
      case 'worker':
        schema = workerSchema
        break
      default:
        return {
          valid: false,
          type: 'unknown',
          errors: [{ path: 'type', message: 'Unknown MDX type. Must contain service, collection, workflow, or worker key.', code: 'UNKNOWN_TYPE' }],
        }
    }

    const data = schema.parse(parsed.frontmatter)

    return {
      valid: true,
      type,
      data,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        valid: false,
        type,
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      }
    }

    return {
      valid: false,
      type,
      errors: [{ path: 'unknown', message: String(error), code: 'VALIDATION_ERROR' }],
    }
  }
}

/**
 * Validate specific type
 */
export function validateService(frontmatter: Record<string, any>) {
  return serviceSchema.safeParse(frontmatter)
}

export function validateCollection(frontmatter: Record<string, any>) {
  return collectionSchema.safeParse(frontmatter)
}

export function validateWorkflow(frontmatter: Record<string, any>) {
  return workflowSchema.safeParse(frontmatter)
}

export function validateWorker(frontmatter: Record<string, any>) {
  return workerSchema.safeParse(frontmatter)
}

/**
 * Check for required fields
 */
export function checkRequiredFields(parsed: ParsedMDX): ValidationError[] {
  const errors: ValidationError[] = []
  const { frontmatter } = parsed

  // Check if any type key exists
  if (!frontmatter.service && !frontmatter.collection && !frontmatter.workflow && !frontmatter.worker) {
    errors.push({
      path: 'type',
      message: 'Frontmatter must contain one of: service, collection, workflow, or worker',
      code: 'MISSING_TYPE',
    })
  }

  return errors
}

/**
 * Validate relationships between configurations
 * For example, check if referenced collections exist
 */
export interface RelationshipValidationOptions {
  collections?: Set<string>
  services?: Set<string>
  workers?: Set<string>
}

export function validateRelationships(parsed: ParsedMDX, options: RelationshipValidationOptions = {}): ValidationError[] {
  const errors: ValidationError[] = []
  const type = detectMDXType(parsed.frontmatter)

  if (type === 'collection') {
    const { fields } = parsed.frontmatter

    // Check relationship fields
    if (Array.isArray(fields)) {
      fields.forEach((field: any, index: number) => {
        if (field.type === 'relationship' && field.relationTo) {
          if (options.collections && !options.collections.has(field.relationTo)) {
            errors.push({
              path: `fields[${index}].relationTo`,
              message: `Referenced collection "${field.relationTo}" does not exist`,
              code: 'INVALID_RELATIONSHIP',
            })
          }
        }
      })
    }
  }

  return errors
}

/**
 * Batch validate multiple files
 */
export interface BatchValidationResult {
  total: number
  valid: number
  invalid: number
  results: Map<string, ValidationResult>
}

export function validateBatch(parsedFiles: Map<string, ParsedMDX>): BatchValidationResult {
  const results = new Map<string, ValidationResult>()
  let valid = 0
  let invalid = 0

  for (const [path, parsed] of parsedFiles) {
    const result = validate(parsed)
    results.set(path, result)

    if (result.valid) {
      valid++
    } else {
      invalid++
    }
  }

  return {
    total: parsedFiles.size,
    valid,
    invalid,
    results,
  }
}
