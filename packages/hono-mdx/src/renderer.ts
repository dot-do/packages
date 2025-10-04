/**
 * React Streaming Renderer
 *
 * Renders React components to HTML streams using React 19's streaming APIs
 */

import { renderToReadableStream } from 'react-dom/server'
import { createElement, type ComponentType, type ReactElement } from 'react'
import type { RenderOptions } from './types'

/**
 * Default HTML template
 */
const DEFAULT_TEMPLATE = (content: string, css?: string, scripts?: string[]) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MDX Document</title>
  ${css ? `<style>${css}</style>` : ''}
</head>
<body>
  <div id="root">${content}</div>
  ${scripts?.map((src) => `<script src="${src}" type="module"></script>`).join('\n') || ''}
</body>
</html>
`

/**
 * Render a React component to a ReadableStream
 *
 * @param element - React element to render
 * @param options - Render options
 * @returns ReadableStream of HTML
 */
export async function renderToStream(element: ReactElement, options: RenderOptions = {}): Promise<ReadableStream> {
  const { signal, bootstrapScripts, bootstrapModules } = options

  try {
    const stream = await renderToReadableStream(element, {
      signal,
      bootstrapScripts,
      bootstrapModules,
    })

    return stream
  } catch (error) {
    throw new Error(`Failed to render React component to stream: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Render a React component to a string (non-streaming)
 *
 * @param element - React element to render
 * @returns HTML string
 */
export async function renderToString(element: ReactElement): Promise<string> {
  const stream = await renderToStream(element)
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let html = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      html += decoder.decode(value, { stream: true })
    }
    return html
  } finally {
    reader.releaseLock()
  }
}

/**
 * Render MDX component with props and components
 *
 * @param Component - MDX component to render
 * @param props - Props to pass to component
 * @param components - MDX components to provide
 * @param options - Render options
 * @returns ReadableStream of HTML
 */
export async function renderMDXComponent(
  Component: ComponentType<any>,
  props: Record<string, any> = {},
  components: Record<string, ComponentType<any>> = {},
  options: RenderOptions = {}
): Promise<ReadableStream> {
  // Create MDX provider element with components
  const element = createElement(Component, {
    ...props,
    components: {
      ...components,
      ...props.components,
    },
  })

  return renderToStream(element, options)
}

/**
 * Wrap HTML stream in a complete HTML document
 *
 * @param contentStream - Stream of HTML content
 * @param template - HTML template function
 * @param css - CSS to inject
 * @param scripts - Scripts to inject
 * @returns Complete HTML stream
 */
export function wrapInTemplate(
  contentStream: ReadableStream,
  template: (content: string, css?: string, scripts?: string[]) => string = DEFAULT_TEMPLATE,
  css?: string,
  scripts: string[] = []
): ReadableStream {
  const reader = contentStream.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  let contentHTML = ''
  let headerSent = false

  return new ReadableStream({
    async start(controller) {
      try {
        // Read the content stream
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            // Send complete HTML with template
            const html = template(contentHTML, css, scripts)
            if (!headerSent) {
              controller.enqueue(encoder.encode(html))
            }
            controller.close()
            break
          }

          contentHTML += decoder.decode(value, { stream: true })
        }
      } catch (error) {
        controller.error(error)
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}

/**
 * Stream HTML with progressive rendering
 *
 * Sends HTML in chunks as it becomes available
 *
 * @param contentStream - Stream of HTML content
 * @param template - HTML template function
 * @param css - CSS to inject
 * @param scripts - Scripts to inject
 * @returns Progressive HTML stream
 */
export function streamWithTemplate(
  contentStream: ReadableStream,
  template: (content: string, css?: string, scripts?: string[]) => string = DEFAULT_TEMPLATE,
  css?: string,
  scripts: string[] = []
): ReadableStream {
  const reader = contentStream.getReader()
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let headerSent = false

  return new ReadableStream({
    async start(controller) {
      try {
        // Send HTML header
        const header = template('', css, scripts).split('<div id="root">')[0] + '<div id="root">'
        controller.enqueue(encoder.encode(header))
        headerSent = true

        // Stream content chunks
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            // Send closing tags
            const footer = '</div>\n</body>\n</html>'
            controller.enqueue(encoder.encode(footer))
            controller.close()
            break
          }

          // Forward content chunk
          controller.enqueue(value)
        }
      } catch (error) {
        controller.error(error)
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}
