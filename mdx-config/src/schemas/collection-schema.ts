import { z } from 'zod'

/**
 * PayloadCMS collection schema
 * Defines the structure for collection MDX frontmatter
 */

export const fieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum([
      'text',
      'textarea',
      'email',
      'number',
      'date',
      'checkbox',
      'select',
      'radio',
      'relationship',
      'upload',
      'richText',
      'array',
      'group',
      'blocks',
      'code',
      'json',
      'point',
      'row',
      'collapsible',
      'tabs',
    ]),
    label: z.string().optional(),
    required: z.boolean().optional(),
    unique: z.boolean().optional(),
    index: z.boolean().optional(),
    defaultValue: z.any().optional(),
    admin: z
      .object({
        description: z.string().optional(),
        placeholder: z.string().optional(),
        readOnly: z.boolean().optional(),
        hidden: z.boolean().optional(),
        condition: z.string().optional(),
      })
      .optional(),
    // Type-specific fields
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.union([z.string(), z.object({ label: z.string(), value: z.string() })])).optional(),
    relationTo: z.string().optional(),
    hasMany: z.boolean().optional(),
    fields: z.array(z.lazy(() => fieldSchema)).optional(),
  })
)

export const hookSchema = z.object({
  beforeChange: z.array(z.string()).optional(),
  afterChange: z.array(z.string()).optional(),
  beforeRead: z.array(z.string()).optional(),
  afterRead: z.array(z.string()).optional(),
  beforeDelete: z.array(z.string()).optional(),
  afterDelete: z.array(z.string()).optional(),
  beforeValidate: z.array(z.string()).optional(),
  afterValidate: z.array(z.string()).optional(),
})

export const adminConfigSchema = z.object({
  useAsTitle: z.string().optional(),
  defaultColumns: z.array(z.string()).optional(),
  group: z.string().optional(),
  hidden: z.boolean().optional(),
  description: z.string().optional(),
  preview: z.string().optional(),
})

export const accessSchema = z.object({
  create: z.string().optional(),
  read: z.string().optional(),
  update: z.string().optional(),
  delete: z.string().optional(),
})

export const collectionSchema = z.object({
  collection: z.string().describe('Collection slug'),
  labels: z
    .object({
      singular: z.string().optional(),
      plural: z.string().optional(),
    })
    .optional(),
  fields: z.array(fieldSchema),
  timestamps: z.boolean().optional().default(true),
  auth: z.boolean().optional(),
  admin: adminConfigSchema.optional(),
  hooks: hookSchema.optional(),
  access: accessSchema.optional(),
  versions: z.boolean().optional(),
  defaultSort: z.string().optional(),
})

export type CollectionDefinition = z.infer<typeof collectionSchema>
export type FieldDefinition = z.infer<typeof fieldSchema>
export type HookDefinition = z.infer<typeof hookSchema>
