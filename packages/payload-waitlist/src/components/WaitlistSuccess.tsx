'use client'

import type { WaitlistSuccessProps } from '../types'

/**
 * Waitlist success page component
 *
 * Features:
 * - Position display
 * - Referral code sharing
 * - Social media sharing
 * - Copy to clipboard
 * - Customizable styling
 *
 * @example
 * ```tsx
 * import { WaitlistSuccess } from '@dot-do/payload-waitlist/components'
 *
 * function SuccessPage({ searchParams }: { searchParams: { position: string, code: string } }) {
 *   return (
 *     <WaitlistSuccess
 *       position={parseInt(searchParams.position)}
 *       referralCode={searchParams.code}
 *       referralBaseUrl="https://example.com/waitlist"
 *     />
 *   )
 * }
 * ```
 */
export function WaitlistSuccess({
  position,
  referralCode,
  showPosition = true,
  successMessage = 'Thank you for joining our waitlist!',
  className = '',
  referralBaseUrl,
}: WaitlistSuccessProps) {
  // Use current URL if no base URL provided (client-side only)
  const baseUrl = referralBaseUrl || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '')
  const referralUrl = `${baseUrl}?ref=${referralCode}`

  function copyReferralLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl)
      alert('Referral link copied to clipboard!')
    }
  }

  function shareOnTwitter() {
    const text = `I just joined the waitlist! Join me and move up the queue:`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }

  function shareOnLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }

  return (
    <div className={`max-w-md mx-auto text-center space-y-6 ${className}`}>
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold">You're on the list!</h2>
      <p className="text-gray-600">{successMessage}</p>

      {showPosition && (
        <div className="p-6 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Your position</p>
          <p className="text-4xl font-bold text-blue-600">#{position}</p>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-2">Move up the queue!</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share your unique referral link to move up faster
        </p>

        <div className="bg-gray-100 p-3 rounded-lg mb-4 text-sm break-all">
          {referralUrl}
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyReferralLink}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Copy Link
          </button>
          <button
            onClick={shareOnTwitter}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Share on X
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={shareOnLinkedIn}
            className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
          >
            Share on LinkedIn
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        We'll send you updates at the email you provided.
      </p>
    </div>
  )
}
