import { z } from 'zod'

/**
 * Service definition schema
 * Defines the structure for service MDX frontmatter
 */

export const pricingTierSchema = z.object({
  tier: z.string(),
  price: z.union([z.number(), z.string()]),
  included: z.union([z.string(), z.number()]).optional(),
  features: z.array(z.string()).optional(),
})

export const functionInputSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().optional(),
  description: z.string().optional(),
})

export const functionOutputSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
})

export const serviceFunctionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  input: z.union([
    z.array(functionInputSchema),
    z.record(z.string()),
  ]).optional(),
  output: z.union([
    z.array(functionOutputSchema),
    z.record(z.string()),
  ]).optional(),
  implementation: z.string().optional(),
})

export const serviceSchema = z.object({
  service: z.string().describe('Service name'),
  category: z.string().describe('Service category'),
  description: z.string().optional().describe('Service description'),
  version: z.string().optional().default('1.0.0'),
  pricing: z.array(pricingTierSchema).optional(),
  integrations: z.array(z.string()).optional(),
  functions: z.array(serviceFunctionSchema).optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  license: z.string().optional().default('MIT'),
})

export type ServiceDefinition = z.infer<typeof serviceSchema>
export type PricingTier = z.infer<typeof pricingTierSchema>
export type ServiceFunction = z.infer<typeof serviceFunctionSchema>
