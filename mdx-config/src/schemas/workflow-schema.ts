import { z } from 'zod'

/**
 * Workflow definition schema
 * Defines the structure for workflow MDX frontmatter
 */

export const stepSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['function', 'condition', 'loop', 'parallel', 'wait', 'trigger']),
  description: z.string().optional(),
  function: z.string().optional(),
  condition: z.string().optional(),
  steps: z.array(z.lazy(() => stepSchema)).optional(),
  timeout: z.number().optional(),
  retries: z.number().optional(),
  onError: z.enum(['fail', 'continue', 'retry']).optional(),
})

export const triggerSchema = z.object({
  type: z.enum(['manual', 'schedule', 'event', 'webhook', 'queue']),
  schedule: z.string().optional(), // cron expression
  event: z.string().optional(),
  webhook: z.string().optional(),
  queue: z.string().optional(),
})

export const workflowSchema = z.object({
  workflow: z.string().describe('Workflow name'),
  description: z.string().optional(),
  version: z.string().optional().default('1.0.0'),
  trigger: triggerSchema,
  steps: z.array(stepSchema),
  timeout: z.number().optional(),
  retries: z.number().optional(),
  variables: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
})

export type WorkflowDefinition = z.infer<typeof workflowSchema>
export type StepDefinition = z.infer<typeof stepSchema>
export type TriggerDefinition = z.infer<typeof triggerSchema>
