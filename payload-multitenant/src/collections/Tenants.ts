import type { CollectionConfig } from 'payload'

/**
 * Tenants Collection
 *
 * Core collection for multi-tenant architecture.
 * Each tenant gets isolated data, custom branding, and billing configuration.
 *
 * Features:
 * - Domain-based tenant detection (primary + additional domains)
 * - Custom branding (logo, colors, fonts)
 * - Billing configuration (Stripe Connect)
 * - Feature flags (SSO, API access, analytics)
 * - Workers for Platforms namespace management
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'domain', 'status', 'plan'],
    group: 'Platform',
  },
  access: {
    read: () => true, // All tenants visible (filtered by middleware)
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    // Basic Information
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tenant Name',
      admin: {
        description: 'Organization or company name',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly identifier (e.g., acme-corp)',
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) return value
            return value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        description: 'Tenant status affects access and visibility',
      },
    },

    // Domain Configuration
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      label: 'Primary Domain',
      admin: {
        description: 'Primary domain for this tenant (e.g., acme.services.delivery)',
      },
    },
    {
      name: 'additionalDomains',
      type: 'array',
      label: 'Additional Domains',
      admin: {
        description: 'Other domains that should resolve to this tenant',
      },
      fields: [
        {
          name: 'domain',
          type: 'text',
          required: true,
          label: 'Domain',
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
          label: 'Verified',
          admin: {
            description: 'Domain ownership verified',
          },
        },
      ],
    },

    // Branding Configuration
    {
      name: 'branding',
      type: 'group',
      label: 'Branding',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo',
          admin: {
            description: 'Company logo (SVG or PNG recommended)',
          },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: 'Favicon',
          admin: {
            description: '32x32 or 64x64 favicon',
          },
        },
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Primary Color',
          admin: {
            description: 'Hex color code (e.g., #3B82F6)',
          },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          label: 'Secondary Color',
          admin: {
            description: 'Hex color code for accents',
          },
        },
        {
          name: 'font',
          type: 'select',
          options: [
            { label: 'Inter', value: 'inter' },
            { label: 'Roboto', value: 'roboto' },
            { label: 'Open Sans', value: 'open-sans' },
            { label: 'Lato', value: 'lato' },
            { label: 'Montserrat', value: 'montserrat' },
          ],
          defaultValue: 'inter',
          label: 'Font Family',
        },
        {
          name: 'customCSS',
          type: 'textarea',
          label: 'Custom CSS',
          admin: {
            description: 'Additional CSS for advanced customization',
          },
        },
      ],
    },

    // Site Settings
    {
      name: 'siteSettings',
      type: 'group',
      label: 'Site Settings',
      fields: [
        {
          name: 'siteTitle',
          type: 'text',
          label: 'Site Title',
          admin: {
            description: 'Used in page titles and meta tags',
          },
        },
        {
          name: 'siteDescription',
          type: 'textarea',
          label: 'Site Description',
          admin: {
            description: 'Meta description for SEO',
          },
        },
        {
          name: 'socialImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Default Social Share Image',
          admin: {
            description: 'Open Graph image (1200x630 recommended)',
          },
        },
        {
          name: 'supportEmail',
          type: 'email',
          label: 'Support Email',
        },
        {
          name: 'privacyPolicyUrl',
          type: 'text',
          label: 'Privacy Policy URL',
        },
        {
          name: 'termsOfServiceUrl',
          type: 'text',
          label: 'Terms of Service URL',
        },
      ],
    },

    // Billing Configuration
    {
      name: 'billing',
      type: 'group',
      label: 'Billing',
      fields: [
        {
          name: 'stripeAccountId',
          type: 'text',
          label: 'Stripe Connect Account ID',
          admin: {
            description: 'Automatically populated when Stripe Connect is set up',
            readOnly: true,
          },
        },
        {
          name: 'stripeStatus',
          type: 'select',
          options: [
            { label: 'Not Connected', value: 'not_connected' },
            { label: 'Pending Verification', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Restricted', value: 'restricted' },
          ],
          defaultValue: 'not_connected',
          label: 'Stripe Status',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'platformFee',
          type: 'number',
          defaultValue: 15,
          min: 0,
          max: 50,
          label: 'Platform Fee (%)',
          admin: {
            description: 'Percentage of revenue taken by platform (0-50%)',
          },
        },
        {
          name: 'monthlyFee',
          type: 'number',
          defaultValue: 500,
          min: 0,
          label: 'Monthly Platform Fee ($)',
          admin: {
            description: 'Fixed monthly fee for platform access',
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
            { label: 'GBP', value: 'gbp' },
          ],
          defaultValue: 'usd',
          label: 'Currency',
        },
      ],
    },

    // Plan & Features
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'starter',
      options: [
        { label: 'Starter', value: 'starter' },
        { label: 'Professional', value: 'professional' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      label: 'Plan',
    },
    {
      name: 'features',
      type: 'group',
      label: 'Features',
      fields: [
        {
          name: 'customDomain',
          type: 'checkbox',
          defaultValue: false,
          label: 'Custom Domain',
          admin: {
            description: 'Allow custom domain configuration',
          },
        },
        {
          name: 'sso',
          type: 'checkbox',
          defaultValue: false,
          label: 'Single Sign-On (SSO)',
          admin: {
            description: 'Enable WorkOS SSO for this tenant',
          },
        },
        {
          name: 'apiAccess',
          type: 'checkbox',
          defaultValue: true,
          label: 'API Access',
          admin: {
            description: 'Enable REST API and GraphQL access',
          },
        },
        {
          name: 'analytics',
          type: 'checkbox',
          defaultValue: true,
          label: 'Analytics Dashboard',
          admin: {
            description: 'Access to analytics and reporting',
          },
        },
        {
          name: 'whiteLabel',
          type: 'checkbox',
          defaultValue: false,
          label: 'White-Label',
          admin: {
            description: 'Hide platform branding (Enterprise only)',
          },
        },
      ],
    },

    // Workers for Platforms
    {
      name: 'namespace',
      type: 'group',
      label: 'Workers for Platforms',
      admin: {
        description: 'Cloudflare Workers for Platforms configuration',
      },
      fields: [
        {
          name: 'namespaceId',
          type: 'text',
          label: 'Namespace ID',
          admin: {
            description: 'Dispatch namespace ID (auto-populated)',
            readOnly: true,
          },
        },
        {
          name: 'namespaceStatus',
          type: 'select',
          options: [
            { label: 'Not Provisioned', value: 'not_provisioned' },
            { label: 'Provisioning', value: 'provisioning' },
            { label: 'Active', value: 'active' },
            { label: 'Failed', value: 'failed' },
          ],
          defaultValue: 'not_provisioned',
          label: 'Namespace Status',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'durableObjectId',
          type: 'text',
          label: 'Durable Object ID',
          admin: {
            description: 'DO SQLite database ID (auto-populated)',
            readOnly: true,
          },
        },
        {
          name: 'workerUrl',
          type: 'text',
          label: 'Worker URL',
          admin: {
            description: 'Deployed worker URL (auto-populated)',
            readOnly: true,
          },
        },
      ],
    },

    // Limits & Quotas
    {
      name: 'limits',
      type: 'group',
      label: 'Limits & Quotas',
      fields: [
        {
          name: 'maxUsers',
          type: 'number',
          defaultValue: 10,
          min: 1,
          label: 'Max Users',
          admin: {
            description: 'Maximum number of users in this tenant',
          },
        },
        {
          name: 'maxServices',
          type: 'number',
          defaultValue: 50,
          min: 1,
          label: 'Max Services',
          admin: {
            description: 'Maximum number of services in marketplace',
          },
        },
        {
          name: 'maxStorageGB',
          type: 'number',
          defaultValue: 10,
          min: 1,
          label: 'Max Storage (GB)',
          admin: {
            description: 'Maximum storage for media and data',
          },
        },
        {
          name: 'maxApiCallsPerDay',
          type: 'number',
          defaultValue: 10000,
          min: 100,
          label: 'Max API Calls Per Day',
        },
      ],
    },

    // Metadata
    {
      name: 'metadata',
      type: 'group',
      label: 'Metadata',
      admin: {
        condition: (data) => data?.status === 'active',
      },
      fields: [
        {
          name: 'industry',
          type: 'select',
          options: [
            { label: 'Technology', value: 'technology' },
            { label: 'Finance', value: 'finance' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'E-commerce', value: 'ecommerce' },
            { label: 'Education', value: 'education' },
            { label: 'Other', value: 'other' },
          ],
          label: 'Industry',
        },
        {
          name: 'companySize',
          type: 'select',
          options: [
            { label: '1-10', value: '1-10' },
            { label: '11-50', value: '11-50' },
            { label: '51-200', value: '51-200' },
            { label: '201-500', value: '201-500' },
            { label: '500+', value: '500+' },
          ],
          label: 'Company Size',
        },
        {
          name: 'country',
          type: 'text',
          label: 'Country',
        },
        {
          name: 'timezone',
          type: 'text',
          label: 'Timezone',
          admin: {
            description: 'IANA timezone (e.g., America/New_York)',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-generate slug from name if not provided
        if (operation === 'create' && !data.slug && data.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        }

        return data
      },
    ],
  },
  timestamps: true,
}
