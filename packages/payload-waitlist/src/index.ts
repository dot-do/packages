/**
 * @dot-do/payload-waitlist
 *
 * Reusable waitlist system for PayloadCMS with referral tracking
 *
 * @example
 * ```typescript
 * // In payload.config.ts
 * import { createWaitlistCollection } from '@dot-do/payload-waitlist/collection'
 *
 * export default buildConfig({
 *   collections: [
 *     createWaitlistCollection({
 *       tenantCollection: 'organizations',
 *       onWaitlistJoin: async (entry) => {
 *         await sendWelcomeEmail(entry.email, entry.position)
 *       }
 *     })
 *   ]
 * })
 *
 * // In Next.js API route
 * import { handleWaitlistSignup } from '@dot-do/payload-waitlist/api'
 *
 * export async function POST(request: NextRequest) {
 *   const body = await request.json()
 *   const payload = await getPayload({ config })
 *
 *   const result = await handleWaitlistSignup(body, { payload })
 *   return NextResponse.json(result)
 * }
 *
 * // In React component
 * import { WaitlistForm } from '@dot-do/payload-waitlist/components'
 *
 * export function Waitlist() {
 *   return <WaitlistForm tenantId="123" onSuccess={(data) => { ... }} />
 * }
 * ```
 */

export * from './types'
export * from './utils/generateReferralCode'
export { createWaitlistCollection } from './collection'
export { handleWaitlistSignup, getWaitlistStats, findByReferralCode } from './api'
export { WaitlistForm, WaitlistSuccess } from './components'
