/**
 * PayloadCMS Collection Generator
 * Generates PayloadCMS collection configurations from MDX
 */

import type { CollectionDefinition, FieldDefinition } from '../schemas'

export interface GeneratePayloadOptions {
  typescript?: boolean
  includeTimestamps?: boolean
}

/**
 * Generate PayloadCMS collection config from MDX definition
 */
export function generatePayloadCollection(definition: CollectionDefinition, options: GeneratePayloadOptions = {}): string {
  const { collection, fields, timestamps = true, auth, admin, hooks, access, versions, defaultSort } = definition

  const config: any = {
    slug: collection,
    fields: fields.map((field) => generateField(field)),
  }

  if (timestamps !== undefined) {
    config.timestamps = timestamps
  }

  if (auth) {
    config.auth = true
  }

  if (admin) {
    config.admin = admin
  }

  if (hooks) {
    config.hooks = generateHooks(hooks)
  }

  if (access) {
    config.access = access
  }

  if (versions) {
    config.versions = { drafts: true }
  }

  if (defaultSort) {
    config.defaultSort = defaultSort
  }

  // Generate TypeScript code
  if (options.typescript !== false) {
    return `import { CollectionConfig } from 'payload'

export const ${toPascalCase(collection)}: CollectionConfig = ${JSON.stringify(config, null, 2)}
`
  }

  // Generate JavaScript code
  return `export default ${JSON.stringify(config, null, 2)}
`
}

/**
 * Generate field configuration
 */
function generateField(field: FieldDefinition): any {
  const config: any = {
    name: field.name,
    type: field.type,
  }

  if (field.label) config.label = field.label
  if (field.required) config.required = field.required
  if (field.unique) config.unique = field.unique
  if (field.index) config.index = field.index
  if (field.defaultValue !== undefined) config.defaultValue = field.defaultValue

  // Type-specific fields
  if (field.minLength) config.minLength = field.minLength
  if (field.maxLength) config.maxLength = field.maxLength
  if (field.min !== undefined) config.min = field.min
  if (field.max !== undefined) config.max = field.max

  if (field.options) {
    config.options = field.options.map((opt) => (typeof opt === 'string' ? { label: opt, value: opt } : opt))
  }

  if (field.relationTo) config.relationTo = field.relationTo
  if (field.hasMany) config.hasMany = field.hasMany

  if (field.fields && field.fields.length > 0) {
    config.fields = field.fields.map((f) => generateField(f))
  }

  if (field.admin) {
    config.admin = field.admin
  }

  return config
}

/**
 * Generate hooks configuration
 */
function generateHooks(hooks: any): string {
  const hookFunctions: string[] = []

  for (const [hookName, functionNames] of Object.entries(hooks)) {
    if (Array.isArray(functionNames) && functionNames.length > 0) {
      hookFunctions.push(`  ${hookName}: [${functionNames.map((fn) => `${fn}`).join(', ')}]`)
    }
  }

  return `{
${hookFunctions.join(',\n')}
}`
}

/**
 * Generate multiple collections
 */
export function generatePayloadCollections(definitions: CollectionDefinition[], options: GeneratePayloadOptions = {}): Map<string, string> {
  const collections = new Map<string, string>()

  for (const definition of definitions) {
    const slug = definition.collection
    const code = generatePayloadCollection(definition, options)
    collections.set(slug, code)
  }

  return collections
}

/**
 * Generate index file that exports all collections
 */
export function generateCollectionsIndex(collectionSlugs: string[]): string {
  const imports = collectionSlugs.map((slug) => `import { ${toPascalCase(slug)} } from './${slug}'`).join('\n')

  const exports = collectionSlugs.map((slug) => `  ${toPascalCase(slug)}`).join(',\n')

  return `${imports}

export const collections = [
${exports}
]
`
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
