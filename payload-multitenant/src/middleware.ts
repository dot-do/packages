import { NextRequest, NextResponse } from 'next/server'

/**
 * Multi-Tenant Middleware
 *
 * Detects tenant from hostname and adds tenant context to request headers.
 * This middleware runs before all requests and enables domain-based routing.
 *
 * Flow:
 * 1. Extract hostname from request
 * 2. Store in x-tenant-hostname header
 * 3. Routes can use getCurrentTenant() to fetch tenant data
 *
 * Usage:
 * ```typescript
 * // middleware.ts
 * export { middleware, config } from '@dot-do/payload-multitenant/middleware'
 * ```
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl

  // Skip middleware for admin panel and API routes
  // These should be accessed via platform domain, not tenant domains
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Store hostname in header for server components to access
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-hostname', hostname)

  // Optional: Add tenant detection logic here
  // For more advanced use cases, you might want to:
  // 1. Query database to check if domain is valid
  // 2. Redirect to default tenant if domain not found
  // 3. Check tenant status and show maintenance page if suspended

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

/**
 * Middleware Configuration
 *
 * Matches all routes except static files and Next.js internals.
 * Customize this to your needs.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

/**
 * Custom domain detection for advanced use cases
 *
 * Example: Detect if hostname is a custom domain vs platform subdomain
 */
export function isCustomDomain(hostname: string, platformDomain: string = 'services.delivery'): boolean {
  // Remove port if present
  const domain = hostname.split(':')[0]

  // Check if it's NOT a subdomain of the platform domain
  return !domain.endsWith(`.${platformDomain}`) && domain !== platformDomain
}

/**
 * Extract subdomain from hostname
 *
 * Example: "acme.services.delivery" → "acme"
 */
export function getSubdomain(hostname: string, platformDomain: string = 'services.delivery'): string | null {
  const domain = hostname.split(':')[0]

  if (!domain.endsWith(`.${platformDomain}`)) {
    return null
  }

  const subdomain = domain.replace(`.${platformDomain}`, '')
  return subdomain
}

/**
 * Advanced middleware with custom domain support
 *
 * Use this version if you want to handle custom domains differently
 * from platform subdomains.
 */
export function createAdvancedMiddleware(options: {
  platformDomain: string
  redirectToDefaultOnNotFound?: boolean
  defaultTenant?: string
}) {
  return async function advancedMiddleware(request: NextRequest) {
    const hostname = request.headers.get('host') || ''
    const url = request.nextUrl

    // Skip middleware for admin and API
    if (
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/api/admin') ||
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api/auth')
    ) {
      return NextResponse.next()
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-hostname', hostname)

    // Detect domain type
    const custom = isCustomDomain(hostname, options.platformDomain)
    const subdomain = getSubdomain(hostname, options.platformDomain)

    requestHeaders.set('x-tenant-is-custom-domain', custom ? 'true' : 'false')
    if (subdomain) {
      requestHeaders.set('x-tenant-subdomain', subdomain)
    }

    // Optional: Redirect logic
    // You can implement database lookup here to validate tenant exists
    // and redirect to default tenant or show 404 if not found

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
}

/**
 * Example: Redirect middleware
 *
 * Redirects invalid domains to default tenant or 404 page
 */
export function createRedirectMiddleware(options: {
  platformDomain: string
  defaultTenant: string
  validateTenant?: (hostname: string) => Promise<boolean>
}) {
  return async function redirectMiddleware(request: NextRequest) {
    const hostname = request.headers.get('host') || ''
    const url = request.nextUrl

    // Skip middleware for admin and API
    if (
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/api/admin') ||
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api/auth')
    ) {
      return NextResponse.next()
    }

    // Validate tenant if validation function provided
    if (options.validateTenant) {
      const isValid = await options.validateTenant(hostname)

      if (!isValid) {
        // Redirect to default tenant
        const defaultUrl = new URL(
          request.url.replace(hostname, `${options.defaultTenant}.${options.platformDomain}`)
        )
        return NextResponse.redirect(defaultUrl)
      }
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-tenant-hostname', hostname)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
}
