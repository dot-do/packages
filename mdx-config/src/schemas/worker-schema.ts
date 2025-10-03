import { z } from 'zod'

/**
 * Cloudflare Worker configuration schema
 * Defines the structure for worker MDX frontmatter
 */

export const routeSchema = z.object({
  pattern: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']).optional(),
  handler: z.string(),
})

export const bindingSchema = z.object({
  type: z.enum(['service', 'kv', 'd1', 'r2', 'durable_object', 'queue', 'secret', 'var']),
  name: z.string(),
  value: z.string().optional(),
  service: z.string().optional(),
  namespace_id: z.string().optional(),
  database_id: z.string().optional(),
  bucket_name: z.string().optional(),
  class_name: z.string().optional(),
  queue_name: z.string().optional(),
})

export const durableObjectSchema = z.object({
  name: z.string(),
  class_name: z.string(),
  script_name: z.string().optional(),
})

export const workerSchema = z.object({
  worker: z.string().describe('Worker name'),
  description: z.string().optional(),
  routes: z.array(routeSchema).optional(),
  bindings: z.array(bindingSchema).optional(),
  durable_objects: z
    .object({
      bindings: z.array(durableObjectSchema).optional(),
    })
    .optional(),
  compatibility_date: z.string().optional(),
  compatibility_flags: z.array(z.string()).optional(),
  implementation: z.string().optional(),
  node_compat: z.boolean().optional(),
  observability: z
    .object({
      enabled: z.boolean().optional(),
      head_sampling_rate: z.number().optional(),
    })
    .optional(),
})

export type WorkerDefinition = z.infer<typeof workerSchema>
export type RouteDefinition = z.infer<typeof routeSchema>
export type BindingDefinition = z.infer<typeof bindingSchema>
export type DurableObjectDefinition = z.infer<typeof durableObjectSchema>
