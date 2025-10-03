import type { CollectionConfig } from 'payload'

export interface WaitlistEntry {
  id: string | number
  email: string
  name?: string
  tenant: string | number
  position: number
  referralCode: string
  referredBy?: string | number
  referralCount: number
  metadata?: {
    company?: string
    role?: string
    useCase?: string
    source?: 'search' | 'social' | 'referral' | 'other'
  }
  status: 'waiting' | 'invited' | 'accepted'
  invitedAt?: string
  acceptedAt?: string
  createdAt: string
  updatedAt: string
}

export interface WaitlistConfig {
  /** Collection slug (default: 'waitlist') */
  slug?: string
  /** Tenant collection name (default: 'tenants') */
  tenantCollection?: string
  /** Enable metadata fields (default: true) */
  enableMetadata?: boolean
  /** Metadata field options */
  metadataFields?: {
    company?: boolean
    role?: boolean
    useCase?: boolean
    source?: boolean
  }
  /** Custom status options */
  statusOptions?: Array<{ label: string; value: string }>
  /** Email notification hook */
  onWaitlistJoin?: (entry: WaitlistEntry) => Promise<void>
  /** Referral reward hook */
  onReferral?: (referrer: WaitlistEntry, referred: WaitlistEntry) => Promise<void>
}

export interface WaitlistFormProps {
  tenantId: string | number
  onSuccess?: (data: { position: number; referralCode: string }) => void
  className?: string
  showCompany?: boolean
  showUseCase?: boolean
  showSource?: boolean
}

export interface WaitlistSuccessProps {
  position: number
  referralCode: string
  showPosition?: boolean
  successMessage?: string
  className?: string
  referralBaseUrl?: string
}

export interface WaitlistAPIRequest {
  email: string
  name?: string
  tenant: string | number
  metadata?: {
    company?: string
    role?: string
    useCase?: string
    source?: string
  }
  referredBy?: string
}

export interface WaitlistAPIResponse {
  success: boolean
  position?: number
  referralCode?: string
  error?: string
}
