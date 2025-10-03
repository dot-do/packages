import type { Payload } from 'payload'
import type { WaitlistAPIRequest, WaitlistAPIResponse } from '../types'

export interface WaitlistHandlerOptions {
  payload: Payload
  collectionSlug?: string
  validateEmail?: (email: string) => boolean | Promise<boolean>
  onSuccess?: (entry: any) => void | Promise<void>
  onError?: (error: Error) => void | Promise<void>
}

/**
 * Handle waitlist signup requests
 *
 * This function validates input, checks for duplicates, creates the entry,
 * and returns the position and referral code.
 *
 * @param request - Waitlist signup request
 * @param options - Handler configuration
 * @returns API response with position and referral code
 *
 * @example
 * ```typescript
 * // Next.js API route
 * import { getPayload } from 'payload'
 * import { handleWaitlistSignup } from '@dot-do/payload-waitlist/api'
 * import config from '@payload-config'
 *
 * export async function POST(request: NextRequest) {
 *   const body = await request.json()
 *   const payload = await getPayload({ config })
 *
 *   const result = await handleWaitlistSignup(body, {
 *     payload,
 *     onSuccess: async (entry) => {
 *       await sendWelcomeEmail(entry.email, entry.position)
 *     }
 *   })
 *
 *   if (!result.success) {
 *     return NextResponse.json({ error: result.error }, { status: 400 })
 *   }
 *
 *   return NextResponse.json(result)
 * }
 * ```
 */
export async function handleWaitlistSignup(
  request: WaitlistAPIRequest,
  options: WaitlistHandlerOptions
): Promise<WaitlistAPIResponse> {
  const { payload, collectionSlug = 'waitlist', validateEmail, onSuccess, onError } = options

  try {
    const { email, name, tenant, metadata, referredBy } = request

    // Validate required fields
    if (!email || !tenant) {
      return {
        success: false,
        error: 'Email and tenant are required',
      }
    }

    // Custom email validation if provided
    if (validateEmail) {
      const isValid = await validateEmail(email)
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid email address',
        }
      }
    }

    // Check if email already exists for this tenant
    const existing = await payload.find({
      collection: collectionSlug,
      where: {
        email: { equals: email },
        tenant: { equals: tenant },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return {
        success: false,
        error: 'This email is already on the waitlist',
      }
    }

    // Find referrer if referral code provided
    let referrerId: string | number | undefined
    if (referredBy) {
      const referrer = await payload.find({
        collection: collectionSlug,
        where: {
          referralCode: { equals: referredBy },
        },
        limit: 1,
      })

      if (referrer.docs.length > 0) {
        referrerId = referrer.docs[0].id
      }
    }

    // Create waitlist entry
    const entry = await payload.create({
      collection: collectionSlug,
      data: {
        email,
        name,
        tenant,
        metadata,
        status: 'waiting',
        ...(referrerId && { referredBy: referrerId }),
      },
    })

    // Call success hook if provided
    if (onSuccess) {
      await onSuccess(entry)
    }

    return {
      success: true,
      position: entry.position,
      referralCode: entry.referralCode,
    }
  } catch (error) {
    // Call error hook if provided
    if (onError && error instanceof Error) {
      await onError(error)
    }

    console.error('Waitlist signup error:', error)
    return {
      success: false,
      error: 'Failed to join waitlist',
    }
  }
}

/**
 * Get waitlist statistics for a tenant
 */
export async function getWaitlistStats(
  payload: Payload,
  tenantId: string | number,
  collectionSlug = 'waitlist'
) {
  const [total, waiting, invited, accepted] = await Promise.all([
    payload.count({
      collection: collectionSlug,
      where: { tenant: { equals: tenantId } },
    }),
    payload.count({
      collection: collectionSlug,
      where: { tenant: { equals: tenantId }, status: { equals: 'waiting' } },
    }),
    payload.count({
      collection: collectionSlug,
      where: { tenant: { equals: tenantId }, status: { equals: 'invited' } },
    }),
    payload.count({
      collection: collectionSlug,
      where: { tenant: { equals: tenantId }, status: { equals: 'accepted' } },
    }),
  ])

  return {
    total: total.totalDocs,
    waiting: waiting.totalDocs,
    invited: invited.totalDocs,
    accepted: accepted.totalDocs,
  }
}

/**
 * Find a waitlist entry by referral code
 */
export async function findByReferralCode(
  payload: Payload,
  referralCode: string,
  collectionSlug = 'waitlist'
) {
  const result = await payload.find({
    collection: collectionSlug,
    where: {
      referralCode: { equals: referralCode },
    },
    limit: 1,
  })

  return result.docs[0] || null
}
