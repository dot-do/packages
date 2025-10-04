/**
 * CTA (Call to Action) Component - Tailwind
 */
import { createElement as h } from 'react'

export interface CTAProps {
  title?: string
  description?: string
  primaryText?: string
  primaryLink?: string
  secondaryText?: string
  secondaryLink?: string
  children?: React.ReactNode
}

export const CTA = ({ title, description, primaryText, primaryLink, secondaryText, secondaryLink, children }: CTAProps) =>
  h(
    'section',
    {
      className: 'py-20 bg-blue-600 text-white',
    },
    h(
      'div',
      {
        className: 'container mx-auto px-4',
      },
      h(
        'div',
        {
          className: 'max-w-3xl mx-auto text-center',
        },
        title &&
          h(
            'h2',
            {
              className: 'text-4xl font-bold mb-4',
            },
            title
          ),
        description &&
          h(
            'p',
            {
              className: 'text-xl mb-8 text-blue-100',
            },
            description
          ),
        children && h('div', { className: 'mb-8' }, children),
        (primaryText || secondaryText) &&
          h(
            'div',
            {
              className: 'flex flex-col sm:flex-row gap-4 justify-center',
            },
            primaryText &&
              h(
                'a',
                {
                  href: primaryLink || '#',
                  className: 'inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors',
                },
                primaryText
              ),
            secondaryText &&
              h(
                'a',
                {
                  href: secondaryLink || '#',
                  className: 'inline-block border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors',
                },
                secondaryText
              )
          )
      )
    )
  )
