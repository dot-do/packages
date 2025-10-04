/**
 * Card Component - Tailwind
 */
import { createElement as h } from 'react'

export interface CardProps {
  title?: string
  image?: string
  imageAlt?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}

export const Card = ({ title, image, imageAlt, children, footer }: CardProps) =>
  h(
    'div',
    {
      className: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow',
    },
    image &&
      h('img', {
        src: image,
        alt: imageAlt || title || 'Card image',
        className: 'w-full h-48 object-cover',
      }),
    h(
      'div',
      {
        className: 'p-6',
      },
      title &&
        h(
          'h3',
          {
            className: 'text-xl font-semibold mb-2',
          },
          title
        ),
      children && h('div', { className: 'text-gray-600' }, children)
    ),
    footer &&
      h(
        'div',
        {
          className: 'px-6 py-4 bg-gray-50 border-t border-gray-100',
        },
        footer
      )
  )
