/**
 * TypeScript Type Generator
 * Generates TypeScript types from MDX configurations
 */

import type { ServiceDefinition, CollectionDefinition, WorkflowDefinition } from '../schemas'

/**
 * Generate TypeScript types for service
 */
export function generateServiceTypes(definition: ServiceDefinition): string {
  const { service, functions } = definition

  const functionTypes =
    functions
      ?.map((fn) => {
        const inputType = generateInputType(fn.input)
        const outputType = generateOutputType(fn.output)

        return `export interface ${toPascalCase(fn.name)}Input ${inputType}

export interface ${toPascalCase(fn.name)}Output ${outputType}

export type ${toPascalCase(fn.name)}Function = (input: ${toPascalCase(fn.name)}Input) => Promise<${toPascalCase(fn.name)}Output>
`
      })
      .join('\n') ?? ''

  const serviceMethods =
    functions
      ?.map((fn) => `  ${fn.name}(input: ${toPascalCase(fn.name)}Input): Promise<${toPascalCase(fn.name)}Output>`)
      .join('\n  ') ?? ''

  return `/**
 * ${service} Service Types
 * Generated from service MDX configuration
 */

${functionTypes}

export interface ${toPascalCase(service)}Service {
${serviceMethods}
}
`
}

/**
 * Generate TypeScript types for collection
 */
export function generateCollectionTypes(definition: CollectionDefinition): string {
  const { collection, fields } = definition

  const fieldTypes = fields.map((field) => {
    const type = mapFieldTypeToTS(field.type)
    const optional = field.required ? '' : '?'
    return `  ${field.name}${optional}: ${type}`
  })

  return `/**
 * ${collection} Collection Types
 * Generated from collection MDX configuration
 */

export interface ${toPascalCase(collection)} {
  id: string
${fieldTypes.join('\n')}
  createdAt: Date
  updatedAt: Date
}

export type Create${toPascalCase(collection)}Input = Omit<${toPascalCase(collection)}, 'id' | 'createdAt' | 'updatedAt'>

export type Update${toPascalCase(collection)}Input = Partial<Create${toPascalCase(collection)}Input>
`
}

/**
 * Generate TypeScript types for workflow
 */
export function generateWorkflowTypes(definition: WorkflowDefinition): string {
  const { workflow } = definition

  return `/**
 * ${workflow} Workflow Types
 * Generated from workflow MDX configuration
 */

export interface ${toPascalCase(workflow)}Input {
  // Define input type
  [key: string]: any
}

export interface ${toPascalCase(workflow)}Output {
  // Define output type
  [key: string]: any
}

export type ${toPascalCase(workflow)} = (input: ${toPascalCase(workflow)}Input) => Promise<${toPascalCase(workflow)}Output>
`
}

/**
 * Generate input type from function input schema
 */
function generateInputType(input: any): string {
  if (!input) {
    return '{ [key: string]: any }'
  }

  if (Array.isArray(input)) {
    const fields = input.map((field: any) => {
      const optional = field.required === false ? '?' : ''
      return `  ${field.name}${optional}: ${field.type}`
    })
    return `{\n${fields.join('\n')}\n}`
  }

  if (typeof input === 'object') {
    const fields = Object.entries(input).map(([name, type]) => `  ${name}: ${type}`)
    return `{\n${fields.join('\n')}\n}`
  }

  return '{ [key: string]: any }'
}

/**
 * Generate output type from function output schema
 */
function generateOutputType(output: any): string {
  if (!output) {
    return 'any'
  }

  if (Array.isArray(output)) {
    const fields = output.map((field: any) => `  ${field.name}: ${field.type}`)
    return `{\n${fields.join('\n')}\n}`
  }

  if (typeof output === 'object') {
    const fields = Object.entries(output).map(([name, type]) => `  ${name}: ${type}`)
    return `{\n${fields.join('\n')}\n}`
  }

  return 'any'
}

/**
 * Map PayloadCMS field types to TypeScript types
 */
function mapFieldTypeToTS(fieldType: string): string {
  const typeMap: Record<string, string> = {
    text: 'string',
    textarea: 'string',
    email: 'string',
    number: 'number',
    date: 'Date',
    checkbox: 'boolean',
    select: 'string',
    radio: 'string',
    relationship: 'string | { id: string }',
    upload: 'string | { id: string }',
    richText: 'any',
    array: 'any[]',
    group: 'any',
    blocks: 'any[]',
    code: 'string',
    json: 'any',
    point: '[number, number]',
  }

  return typeMap[fieldType] || 'any'
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}
