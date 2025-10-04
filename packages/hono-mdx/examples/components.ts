/**
 * Custom components example
 */

import { Hono } from 'hono'
import { mdx } from '@dot-do/hono-mdx'
import { createElement } from 'react'

const app = new Hono()

// Define custom components
const Button = ({ children, variant = 'primary' }: { children: React.ReactNode; variant?: string }) =>
  createElement('button', { className: `btn btn-${variant}` }, children)

const Card = ({ title, children }: { title: string; children: React.ReactNode }) =>
  createElement(
    'div',
    { className: 'card' },
    createElement('h3', { className: 'card-title' }, title),
    createElement('div', { className: 'card-body' }, children)
  )

const Alert = ({ type = 'info', children }: { type?: 'info' | 'warning' | 'error'; children: React.ReactNode }) =>
  createElement('div', { className: `alert alert-${type}`, role: 'alert' }, children)

const Code = ({ children, language }: { children: React.ReactNode; language?: string }) =>
  createElement('pre', null, createElement('code', { className: language ? `language-${language}` : '' }, children))

// Use middleware with components
app.use(
  '*',
  mdx({
    components: {
      Button,
      Card,
      Alert,
      Code,
    },
  })
)

// Interactive demo page
app.get('/', (c) => {
  return c.mdx(`
# Component Demo

## Buttons

<Button>Default Button</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>

## Cards

<Card title="Welcome">
  This is a card component with **MDX** inside!

  <Button>Action</Button>
</Card>

<Card title="Features">
  - Easy to use
  - Fully typed
  - Composable
</Card>

## Alerts

<Alert type="info">
  This is an informational alert.
</Alert>

<Alert type="warning">
  Be careful with this action!
</Alert>

<Alert type="error">
  Something went wrong.
</Alert>

## Code

<Code language="typescript">
const greeting = "Hello, World!"
console.log(greeting)
</Code>
  `)
})

// Component with props
app.get('/user/:name', (c) => {
  const name = c.req.param('name')

  return c.mdx(
    `
# User Profile: {name}

<Card title="About">
  Welcome to the profile page for **{name}**.

  <Button>Follow</Button>
  <Button variant="secondary">Message</Button>
</Card>

<Alert type="info">
  This profile is dynamically generated!
</Alert>
  `,
    {
      props: { name },
    }
  )
})

// Custom CSS
app.get('/styled', (c) => {
  return c.mdx(
    `
# Styled Page

<Card title="Custom Styles">
  This page has custom CSS applied!
</Card>
  `,
    {
      css: `
        body {
          font-family: system-ui, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f5f5f5;
        }

        .card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin: 1rem 0;
        }

        .card-title {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          margin: 0.25rem;
        }

        .btn-primary { background: #007bff; color: white; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-success { background: #28a745; color: white; }

        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .alert-info { background: #d1ecf1; color: #0c5460; }
        .alert-warning { background: #fff3cd; color: #856404; }
        .alert-error { background: #f8d7da; color: #721c24; }
      `,
    }
  )
})

export default app
