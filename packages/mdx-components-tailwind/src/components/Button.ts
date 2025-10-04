/**
 * Button Component - Tailwind
 */
import { createElement as h } from 'react'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: React.ReactNode
}

export const Button = ({ variant = 'primary', size = 'md', href, children }: ButtonProps) => {
  const baseClasses = 'inline-block font-semibold rounded-lg transition-colors'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`

  if (href) {
    return h('a', { href, className }, children)
  }

  return h('button', { className }, children)
}
