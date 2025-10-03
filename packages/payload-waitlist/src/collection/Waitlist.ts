import type { CollectionConfig } from 'payload'
import type { WaitlistConfig } from '../types'
import { generateReferralCode } from '../utils/generateReferralCode'

/**
 * Create a Waitlist collection configuration for PayloadCMS
 *
 * Features:
 * - Auto-assigned position based on signup order
 * - Unique referral code generation
 * - Referral count tracking
 * - Status workflow (waiting → invited → accepted)
 * - Optional metadata fields (company, role, use case, source)
 * - Hooks for email notifications and referral rewards
 *
 * @param config - Optional configuration
 * @returns PayloadCMS CollectionConfig
 *
 * @example
 * ```typescript
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
 * ```
 */
export function createWaitlistCollection(config: WaitlistConfig = {}): CollectionConfig {
  const {
    slug = 'waitlist',
    tenantCollection = 'tenants',
    enableMetadata = true,
    metadataFields = {
      company: true,
      role: true,
      useCase: true,
      source: true,
    },
    statusOptions = [
      { label: 'Waiting', value: 'waiting' },
      { label: 'Invited', value: 'invited' },
      { label: 'Accepted', value: 'accepted' },
    ],
    onWaitlistJoin,
    onReferral,
  } = config

  const metadataSubfields: any[] = []

  if (metadataFields.company) {
    metadataSubfields.push({
      name: 'company',
      type: 'text',
      label: 'Company',
    })
  }

  if (metadataFields.role) {
    metadataSubfields.push({
      name: 'role',
      type: 'text',
      label: 'Role',
    })
  }

  if (metadataFields.useCase) {
    metadataSubfields.push({
      name: 'useCase',
      type: 'textarea',
      label: 'Use Case',
    })
  }

  if (metadataFields.source) {
    metadataSubfields.push({
      name: 'source',
      type: 'select',
      label: 'How did you hear about us?',
      options: [
        { label: 'Search', value: 'search' },
        { label: 'Social Media', value: 'social' },
        { label: 'Referral', value: 'referral' },
        { label: 'Other', value: 'other' },
      ],
    })
  }

  return {
    slug,
    admin: {
      useAsTitle: 'email',
      defaultColumns: ['email', 'name', 'position', 'tenant', 'createdAt'],
    },
    access: {
      read: ({ req: { user } }) => {
        if (user) return true
        return false
      },
      create: () => true, // Allow public submissions
    },
    fields: [
      {
        name: 'email',
        type: 'email',
        required: true,
        unique: true,
        label: 'Email Address',
        index: true,
      },
      {
        name: 'name',
        type: 'text',
        label: 'Name',
      },
      {
        name: 'tenant',
        type: 'relationship',
        relationTo: tenantCollection,
        required: true,
        admin: {
          description: 'Which tenant this signup belongs to',
        },
        index: true,
      },
      {
        name: 'position',
        type: 'number',
        label: 'Position in Queue',
        admin: {
          readOnly: true,
          description: 'Automatically assigned based on signup order',
        },
      },
      {
        name: 'referralCode',
        type: 'text',
        unique: true,
        label: 'Referral Code',
        admin: {
          readOnly: true,
          description: 'Unique code for sharing',
        },
      },
      {
        name: 'referredBy',
        type: 'relationship',
        relationTo: slug,
        label: 'Referred By',
      },
      {
        name: 'referralCount',
        type: 'number',
        defaultValue: 0,
        label: 'Referral Count',
        admin: {
          description: 'Number of successful referrals',
        },
      },
      ...(enableMetadata
        ? [
            {
              name: 'metadata',
              type: 'group' as const,
              label: 'Additional Information',
              fields: metadataSubfields,
            },
          ]
        : []),
      {
        name: 'status',
        type: 'select',
        required: true,
        defaultValue: 'waiting',
        options: statusOptions,
      },
      {
        name: 'invitedAt',
        type: 'date',
        label: 'Invited At',
      },
      {
        name: 'acceptedAt',
        type: 'date',
        label: 'Accepted At',
      },
    ],
    hooks: {
      beforeChange: [
        async ({ data, req, operation }) => {
          // Auto-assign position for new signups
          if (operation === 'create' && !data.position) {
            const count = await req.payload.count({
              collection: slug,
              where: {
                tenant: {
                  equals: data.tenant,
                },
              },
            })
            data.position = count.totalDocs + 1
          }

          // Generate referral code for new signups
          if (operation === 'create' && !data.referralCode) {
            data.referralCode = generateReferralCode()
          }

          return data
        },
      ],
      afterChange: [
        async ({ doc, req, operation, previousDoc }) => {
          // Increment referral count when someone is referred
          if (operation === 'create' && doc.referredBy) {
            const referrer = await req.payload.findByID({
              collection: slug,
              id: doc.referredBy,
            })

            await req.payload.update({
              collection: slug,
              id: doc.referredBy,
              data: {
                referralCount: (referrer.referralCount || 0) + 1,
              },
            })

            // Call referral hook if provided
            if (onReferral) {
              await onReferral(referrer, doc)
            }
          }

          // Call join hook if provided
          if (operation === 'create' && onWaitlistJoin) {
            await onWaitlistJoin(doc)
          }
        },
      ],
    },
  }
}
