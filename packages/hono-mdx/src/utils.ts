/**
 * Utility functions for hono-mdx
 */

/**
 * Parse frontmatter from MDX content
 *
 * @param content - MDX content with optional frontmatter
 * @returns Object with frontmatter data and content
 */
export function parseFrontmatter(content: string): { data: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content }
  }

  const [, frontmatter, body] = match

  // Simple YAML-like parsing (basic support)
  const data: Record<string, any> = {}
  const lines = frontmatter.split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value: any = line.slice(colonIndex + 1).trim()

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Parse numbers
    if (/^\d+$/.test(value)) {
      value = parseInt(value, 10)
    } else if (/^\d+\.\d+$/.test(value)) {
      value = parseFloat(value)
    }

    // Parse booleans
    if (value === 'true') value = true
    if (value === 'false') value = false

    data[key] = value
  }

  return { data, content: body }
}

/**
 * Merge MDX component sets
 *
 * @param base - Base components
 * @param override - Override components
 * @returns Merged components
 */
export function mergeComponents(...componentSets: Array<Record<string, any> | undefined>): Record<string, any> {
  return Object.assign({}, ...componentSets.filter(Boolean))
}

/**
 * Create HTML response with proper headers
 *
 * @param stream - HTML stream
 * @param options - Response options
 * @returns Response object
 */
export function createHTMLResponse(
  stream: ReadableStream,
  options: {
    status?: number
    statusText?: string
    headers?: Record<string, string>
  } = {}
): Response {
  const { status = 200, statusText = 'OK', headers = {} } = options

  return new Response(stream, {
    status,
    statusText,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      // Required for streaming in Cloudflare Workers
      'Content-Encoding': 'identity',
      ...headers,
    },
  })
}

/**
 * Check if content is MDX (has JSX syntax)
 *
 * @param content - Content to check
 * @returns True if content appears to be MDX
 */
export function isMDX(content: string): boolean {
  // Simple heuristic: check for JSX-like tags
  return /<[A-Z][a-zA-Z0-9]*[\s\/>]/.test(content) || /<[a-z][a-zA-Z0-9-]*[\s\/>]/.test(content)
}

/**
 * Extract title from MDX content
 *
 * @param content - MDX content
 * @returns Title string or undefined
 */
export function extractTitle(content: string): string | undefined {
  // Try frontmatter title first
  const { data } = parseFrontmatter(content)
  if (data.title) return String(data.title)

  // Try first h1 heading
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) return h1Match[1]

  return undefined
}

/**
 * Create error HTML
 *
 * @param error - Error object
 * @param development - Whether in development mode
 * @returns Error HTML string
 */
export function createErrorHTML(error: Error, development: boolean = false): string {
  if (development) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MDX Compilation Error</title>
  <style>
    body { font-family: monospace; padding: 2rem; background: #1e1e1e; color: #d4d4d4; }
    h1 { color: #ff6b6b; }
    pre { background: #2d2d2d; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    .stack { color: #888; }
  </style>
</head>
<body>
  <h1>MDX Compilation Error</h1>
  <p>${error.message}</p>
  ${error.stack ? `<pre class="stack">${error.stack}</pre>` : ''}
</body>
</html>
`
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; text-align: center; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Something went wrong</h1>
  <p>Please try again later.</p>
</body>
</html>
`
}

/**
 * Measure execution time
 *
 * @param fn - Function to measure
 * @returns Result and duration
 */
export async function measure<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  const result = await fn()
  const duration = Date.now() - start
  return { result, duration }
}
