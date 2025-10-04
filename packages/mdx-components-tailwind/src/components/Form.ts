/**
 * Form Component - Tailwind
 */
import { createElement as h } from 'react'

export interface FormProps {
  title?: string
  description?: string
  action?: string
  method?: string
  submitText?: string
  children?: React.ReactNode
}

export const Form = ({ title, description, action = '#', method = 'POST', submitText = 'Submit', children }: FormProps) =>
  h(
    'section',
    {
      className: 'py-20',
    },
    h(
      'div',
      {
        className: 'container mx-auto px-4',
      },
      h(
        'div',
        {
          className: 'max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg',
        },
        title &&
          h(
            'h2',
            {
              className: 'text-3xl font-bold mb-4',
            },
            title
          ),
        description &&
          h(
            'p',
            {
              className: 'text-gray-600 mb-6',
            },
            description
          ),
        h(
          'form',
          {
            action,
            method,
            className: 'space-y-4',
          },
          children,
          h(
            'button',
            {
              type: 'submit',
              className: 'w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors',
            },
            submitText
          )
        )
      )
    )
  )

export interface InputProps {
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  label?: string
}

export const Input = ({ name, type = 'text', placeholder, required, label }: InputProps) =>
  h(
    'div',
    null,
    label &&
      h(
        'label',
        {
          htmlFor: name,
          className: 'block text-sm font-medium text-gray-700 mb-1',
        },
        label
      ),
    h('input', {
      type,
      name,
      id: name,
      placeholder,
      required,
      className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    })
  )

export interface TextareaProps {
  name: string
  placeholder?: string
  required?: boolean
  label?: string
  rows?: number
}

export const Textarea = ({ name, placeholder, required, label, rows = 4 }: TextareaProps) =>
  h(
    'div',
    null,
    label &&
      h(
        'label',
        {
          htmlFor: name,
          className: 'block text-sm font-medium text-gray-700 mb-1',
        },
        label
      ),
    h('textarea', {
      name,
      id: name,
      placeholder,
      required,
      rows,
      className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    })
  )
