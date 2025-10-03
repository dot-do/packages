import type { CollectionConfig } from 'payload'

export const Analytics: CollectionConfig = {
  slug: 'experiment-analytics',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['experiment', 'variant', 'event', 'createdAt'],
    description: 'Event tracking for A/B tests and experiments',
  },
  access: {
    read: ({ req: { user } }) => !!user, // Admin-only read
    create: () => true, // Allow public tracking via API
  },
  fields: [
    {
      name: 'experiment',
      type: 'relationship',
      relationTo: 'experiments',
      required: true,
      index: true,
      label: 'Experiment',
      admin: {
        description: 'The experiment this event belongs to',
      },
    },
    {
      name: 'variant',
      type: 'number',
      required: true,
      index: true,
      label: 'Variant Index',
      admin: {
        description: 'Index of the variant shown (0-based)',
      },
    },
    {
      name: 'event',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Page View', value: 'view' },
        { label: 'Conversion', value: 'conversion' },
        { label: 'Click', value: 'click' },
        { label: 'Form Submission', value: 'submit' },
        { label: 'Custom Event', value: 'custom' },
      ],
      admin: {
        description: 'Type of event tracked',
      },
    },
    {
      name: 'customEventName',
      type: 'text',
      label: 'Custom Event Name',
      admin: {
        condition: (data) => data.event === 'custom',
        description: 'Name of the custom event (e.g., "purchase", "signup_complete")',
      },
    },
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      index: true,
      label: 'Session ID',
      admin: {
        description: 'Unique session identifier for deduplication',
      },
    },
    {
      name: 'userId',
      type: 'text',
      label: 'User ID',
      admin: {
        description: 'Optional authenticated user ID',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      label: 'Event Metadata',
      fields: [
        {
          name: 'userAgent',
          type: 'text',
          label: 'User Agent',
        },
        {
          name: 'referrer',
          type: 'text',
          label: 'Referrer URL',
        },
        {
          name: 'pathname',
          type: 'text',
          label: 'Page Path',
        },
        {
          name: 'timestamp',
          type: 'date',
          label: 'Event Timestamp',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'location',
          type: 'group',
          label: 'Geographic Location',
          fields: [
            { name: 'country', type: 'text', label: 'Country' },
            { name: 'region', type: 'text', label: 'Region' },
            { name: 'city', type: 'text', label: 'City' },
            { name: 'timezone', type: 'text', label: 'Timezone' },
          ],
        },
        {
          name: 'device',
          type: 'group',
          label: 'Device Information',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Desktop', value: 'desktop' },
                { label: 'Mobile', value: 'mobile' },
                { label: 'Tablet', value: 'tablet' },
                { label: 'Unknown', value: 'unknown' },
              ],
            },
            { name: 'browser', type: 'text', label: 'Browser' },
            { name: 'os', type: 'text', label: 'Operating System' },
            { name: 'screenSize', type: 'text', label: 'Screen Resolution' },
          ],
        },
        {
          name: 'custom',
          type: 'json',
          label: 'Custom Data',
          admin: {
            description: 'Additional custom event data (JSON object)',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data }) => {
        // Auto-set timestamp if not provided
        if (!data.metadata?.timestamp) {
          if (!data.metadata) data.metadata = {}
          data.metadata.timestamp = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
