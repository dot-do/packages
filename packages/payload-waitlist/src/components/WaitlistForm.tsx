'use client'

import { useState } from 'react'
import type { WaitlistFormProps } from '../types'

/**
 * Waitlist signup form component
 *
 * Features:
 * - Email validation
 * - Optional fields (name, company, use case, source)
 * - Loading states
 * - Error handling
 * - Success callback
 * - Customizable styling
 *
 * @example
 * ```tsx
 * import { WaitlistForm } from '@dot-do/payload-waitlist/components'
 *
 * function WaitlistPage() {
 *   return (
 *     <WaitlistForm
 *       tenantId="123"
 *       onSuccess={(data) => {
 *         router.push(`/success?position=${data.position}&code=${data.referralCode}`)
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function WaitlistForm({
  tenantId,
  onSuccess,
  className = '',
  showCompany = true,
  showUseCase = true,
  showSource = true,
}: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [useCase, setUseCase] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          tenant: tenantId,
          metadata: {
            company,
            useCase,
            source,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to join waitlist')
      }

      const data = await response.json()
      onSuccess?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 max-w-md mx-auto ${className}`}>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="John Doe"
        />
      </div>

      {showCompany && (
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">
            Company
          </label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Acme Inc."
          />
        </div>
      )}

      {showUseCase && (
        <div>
          <label htmlFor="useCase" className="block text-sm font-medium mb-1">
            What will you use this for?
          </label>
          <textarea
            id="useCase"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tell us about your use case..."
            rows={3}
          />
        </div>
      )}

      {showSource && (
        <div>
          <label htmlFor="source" className="block text-sm font-medium mb-1">
            How did you hear about us?
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option</option>
            <option value="search">Search Engine</option>
            <option value="social">Social Media</option>
            <option value="referral">Referral</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Joining...' : 'Join Waitlist'}
      </button>
    </form>
  )
}
