/**
 * Generate a unique referral code
 * Format: REF-XXXXXXXX (uppercase alphanumeric)
 */
export function generateReferralCode(): string {
  return `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^REF-[A-Z0-9]{8}$/.test(code)
}
