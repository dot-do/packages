/**
 * Features Component - Tailwind
 */
import { createElement as h } from 'react'

export interface FeatureItem {
  icon?: string
  title: string
  description: string
}

export interface FeaturesProps {
  title?: string
  subtitle?: string
  features?: FeatureItem[]
  children?: React.ReactNode
}

export const Features = ({ title, subtitle, features = [], children }: FeaturesProps) =>
  h(
    'section',
    {
      className: 'py-20 bg-gray-50',
    },
    h(
      'div',
      {
        className: 'container mx-auto px-4',
      },
      title &&
        h(
          'h2',
          {
            className: 'text-4xl font-bold text-center mb-4',
          },
          title
        ),
      subtitle &&
        h(
          'p',
          {
            className: 'text-xl text-gray-600 text-center mb-12',
          },
          subtitle
        ),
      children && h('div', { className: 'mb-12' }, children),
      features.length > 0 &&
        h(
          'div',
          {
            className: 'grid md:grid-cols-3 gap-8',
          },
          ...features.map((feature, i) =>
            h(
              'div',
              {
                key: i,
                className: 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow',
              },
              feature.icon &&
                h(
                  'div',
                  {
                    className: 'text-4xl mb-4',
                  },
                  feature.icon
                ),
              h(
                'h3',
                {
                  className: 'text-xl font-semibold mb-2',
                },
                feature.title
              ),
              h(
                'p',
                {
                  className: 'text-gray-600',
                },
                feature.description
              )
            )
          )
        )
    )
  )

export const Feature = ({ icon, title, description }: FeatureItem) =>
  h(
    'div',
    {
      className: 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow',
    },
    icon &&
      h(
        'div',
        {
          className: 'text-4xl mb-4',
        },
        icon
      ),
    h(
      'h3',
      {
        className: 'text-xl font-semibold mb-2',
      },
      title
    ),
    h(
      'p',
      {
        className: 'text-gray-600',
      },
      description
    )
  )
