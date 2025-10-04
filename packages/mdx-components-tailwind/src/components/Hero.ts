/**
 * Hero Component - Tailwind
 */
import { createElement as h } from 'react'

export interface HeroProps {
  title?: string
  subtitle?: string
  cta?: string
  ctaLink?: string
  image?: string
  children?: React.ReactNode
}

export const Hero = ({ title, subtitle, cta, ctaLink, image, children }: HeroProps) =>
  h(
    'section',
    {
      className: 'relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20',
    },
    h(
      'div',
      {
        className: 'container mx-auto px-4',
      },
      h(
        'div',
        {
          className: 'max-w-4xl mx-auto text-center',
        },
        title &&
          h(
            'h1',
            {
              className: 'text-5xl md:text-6xl font-bold mb-6',
            },
            title
          ),
        subtitle &&
          h(
            'p',
            {
              className: 'text-xl md:text-2xl mb-8 text-blue-100',
            },
            subtitle
          ),
        children && h('div', { className: 'mb-8' }, children),
        cta &&
          h(
            'a',
            {
              href: ctaLink || '#',
              className: 'inline-block bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors',
            },
            cta
          ),
        image &&
          h('img', {
            src: image,
            alt: title || 'Hero image',
            className: 'mt-12 rounded-lg shadow-2xl',
          })
      )
    )
  )
