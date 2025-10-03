/**
 * Cloudflare Worker Generator
 * Generates worker implementations from MDX
 */

import type { WorkerDefinition, ServiceDefinition } from '../schemas'

export interface GenerateWorkerOptions {
  typescript?: boolean
  includeComments?: boolean
}

/**
 * Generate Cloudflare Worker from MDX definition
 */
export function generateWorker(definition: WorkerDefinition, options: GenerateWorkerOptions = {}): string {
  const { worker, routes, bindings, implementation } = definition

  // If implementation is provided in MDX, use it
  if (implementation) {
    return implementation
  }

  // Otherwise generate boilerplate
  const routeHandlers = routes?.map((route) => generateRouteHandler(route)).join('\n\n') ?? ''

  return `/**
 * ${worker} Worker
 * Generated from MDX configuration
 */

import { WorkerEntrypoint } from 'cloudflare:workers'
import { Hono } from 'hono'

export interface Env {
${bindings?.map((b) => `  ${b.name}: any`).join('\n') ?? '  // No bindings'}
}

export class ${toPascalCase(worker)}Service extends WorkerEntrypoint<Env> {
  // RPC methods here
}

const app = new Hono<{ Bindings: Env }>()

${routeHandlers}

app.get('/health', (c) => {
  return c.json({ status: 'ok', worker: '${worker}' })
})

export default {
  fetch: app.fetch,
}
`
}

/**
 * Generate wrangler.jsonc configuration
 */
export function generateWranglerConfig(definition: WorkerDefinition): string {
  const { worker, bindings, durable_objects, compatibility_date, compatibility_flags, node_compat, observability } = definition

  const config: any = {
    name: worker,
    main: 'src/index.ts',
    compatibility_date: compatibility_date || new Date().toISOString().split('T')[0],
  }

  if (compatibility_flags && compatibility_flags.length > 0) {
    config.compatibility_flags = compatibility_flags
  }

  if (node_compat) {
    config.node_compat = true
  }

  // Add bindings
  if (bindings && bindings.length > 0) {
    for (const binding of bindings) {
      switch (binding.type) {
        case 'service':
          if (!config.services) config.services = []
          config.services.push({ binding: binding.name, service: binding.service })
          break
        case 'kv':
          if (!config.kv_namespaces) config.kv_namespaces = []
          config.kv_namespaces.push({ binding: binding.name, id: binding.namespace_id || 'CHANGE_ME' })
          break
        case 'd1':
          if (!config.d1_databases) config.d1_databases = []
          config.d1_databases.push({ binding: binding.name, database_name: binding.name.toLowerCase(), database_id: binding.database_id || 'CHANGE_ME' })
          break
        case 'r2':
          if (!config.r2_buckets) config.r2_buckets = []
          config.r2_buckets.push({ binding: binding.name, bucket_name: binding.bucket_name || binding.name.toLowerCase() })
          break
        case 'queue':
          if (!config.queues) config.queues = { consumers: [] }
          config.queues.consumers.push({ queue: binding.queue_name || binding.name.toLowerCase() })
          break
      }
    }
  }

  // Add durable objects
  if (durable_objects?.bindings && durable_objects.bindings.length > 0) {
    config.durable_objects = {
      bindings: durable_objects.bindings.map((obj) => ({
        name: obj.name,
        class_name: obj.class_name,
        script_name: obj.script_name,
      })),
    }
  }

  // Add observability
  if (observability?.enabled) {
    config.observability = observability
  }

  return JSON.stringify(config, null, 2)
}

/**
 * Generate service worker from service definition
 */
export function generateServiceWorker(definition: ServiceDefinition, options: GenerateWorkerOptions = {}): string {
  const { service, functions } = definition

  const rpcMethods =
    functions
      ?.map(
        (fn) => `
  async ${fn.name}(input: any): Promise<any> {
    // TODO: Implement ${fn.name}
    throw new Error('Not implemented')
  }`
      )
      .join('\n') ?? ''

  const routeHandlers =
    functions
      ?.map(
        (fn) => `
app.post('/${fn.name}', async (c) => {
  const service = new ${toPascalCase(service)}Service(c.env.ctx, c.env)
  const input = await c.req.json()
  const result = await service.${fn.name}(input)
  return c.json({ success: true, data: result })
})`
      )
      .join('\n') ?? ''

  return `/**
 * ${service} Service Worker
 * Generated from service MDX configuration
 */

import { WorkerEntrypoint } from 'cloudflare:workers'
import { Hono } from 'hono'

export interface Env {
  // Add your service bindings here
}

export class ${toPascalCase(service)}Service extends WorkerEntrypoint<Env> {
${rpcMethods}
}

const app = new Hono<{ Bindings: Env }>()

${routeHandlers}

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: '${service}' })
})

export default {
  fetch: app.fetch,
}
`
}

/**
 * Generate route handler
 */
function generateRouteHandler(route: any): string {
  const method = route.method?.toLowerCase() || 'get'

  return `app.${method}('${route.pattern}', async (c) => {
  // TODO: Implement ${route.handler}
  return c.json({ message: 'Not implemented' })
})`
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
