import type { CollectionConfig } from 'payload'

export const Experiments: CollectionConfig = {
  slug: 'experiments',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'startDate', 'winningVariant', 'confidenceLevel'],
    description: 'A/B tests and multivariate experiments with statistical analysis',
  },
  access: {
    read: () => true, // Public read for active experiments
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Experiment Name',
      admin: {
        description: 'Descriptive name for this experiment (e.g., "Pricing Page Headline Test")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'What are you testing and why? Document your hypothesis.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Running', value: 'running' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: {
        description: 'Experiment lifecycle status',
      },
    },
    {
      name: 'targetPage',
      type: 'text',
      label: 'Target Page Path',
      admin: {
        description: 'URL path where this experiment runs (e.g., "/pricing", "/landing/product-a")',
      },
    },
    {
      name: 'variants',
      type: 'array',
      label: 'Variants',
      minRows: 2,
      required: true,
      admin: {
        description: 'Minimum 2 variants required. First is typically the control.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Variant Name',
          admin: {
            description: 'e.g., "Control", "Variant A", "High Price", "New CTA"',
          },
        },
        {
          name: 'weight',
          type: 'number',
          required: true,
          defaultValue: 50,
          min: 0,
          max: 100,
          label: 'Traffic Weight (%)',
          admin: {
            description: 'Percentage of traffic allocated to this variant. Must sum to 100%.',
          },
        },
        {
          name: 'config',
          type: 'json',
          label: 'Variant Configuration',
          admin: {
            description: 'JSON object with variant-specific overrides (text, images, layout, etc.)',
          },
        },
      ],
      validate: (value) => {
        if (!value || value.length < 2) {
          return 'At least 2 variants are required'
        }
        const totalWeight = value.reduce((sum, v) => sum + (v.weight || 0), 0)
        if (Math.abs(totalWeight - 100) > 0.01) {
          return `Variant weights must sum to 100% (currently ${totalWeight}%)`
        }
        return true
      },
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the experiment begins running',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When the experiment should stop (optional)',
      },
    },
    {
      name: 'goalMetric',
      type: 'select',
      label: 'Primary Goal Metric',
      defaultValue: 'conversion',
      options: [
        { label: 'Conversion Rate', value: 'conversion' },
        { label: 'Click-Through Rate', value: 'click' },
        { label: 'Form Submission Rate', value: 'submit' },
        { label: 'Custom Event', value: 'custom' },
      ],
      admin: {
        description: 'The primary metric to optimize for',
      },
    },
    {
      name: 'customGoalEvent',
      type: 'text',
      label: 'Custom Goal Event Name',
      admin: {
        condition: (data) => data.goalMetric === 'custom',
        description: 'Custom event name to track (e.g., "purchase", "signup_complete")',
      },
    },
    {
      name: 'minimumSampleSize',
      type: 'number',
      label: 'Minimum Sample Size',
      defaultValue: 100,
      min: 10,
      admin: {
        description: 'Minimum number of views per variant before declaring a winner',
      },
    },
    {
      name: 'confidenceThreshold',
      type: 'number',
      label: 'Confidence Threshold (%)',
      defaultValue: 95,
      min: 80,
      max: 99,
      admin: {
        description: 'Statistical confidence required to declare a winner (typically 95%)',
      },
    },
    {
      name: 'winningVariant',
      type: 'number',
      label: 'Winning Variant Index',
      admin: {
        readOnly: true,
        description: 'Automatically determined based on statistical analysis',
      },
    },
    {
      name: 'confidenceLevel',
      type: 'number',
      label: 'Statistical Confidence (%)',
      admin: {
        readOnly: true,
        description: 'Current confidence level in the winning variant',
      },
    },
    {
      name: 'stats',
      type: 'json',
      label: 'Experiment Statistics',
      admin: {
        readOnly: true,
        description: 'Cached statistics for each variant (updated periodically)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Auto-complete experiments past their end date
        if (data.endDate && new Date(data.endDate) < new Date() && data.status === 'running') {
          data.status = 'completed'
        }

        // Validate status transitions
        if (operation === 'update') {
          if (data.status === 'running' && !data.startDate) {
            data.startDate = new Date().toISOString()
          }
        }

        return data
      },
    ],
  },
}
