/**
 * @mdx-components/tailwind
 *
 * Tailwind CSS components for MDX rendering
 */

export * from './components/Hero'
export * from './components/Features'
export * from './components/CTA'
export * from './components/Form'
export * from './components/Card'
export * from './components/Button'

// Re-export all components as default object for easy importing
import { Hero } from './components/Hero'
import { Features, Feature } from './components/Features'
import { CTA } from './components/CTA'
import { Form, Input, Textarea } from './components/Form'
import { Card } from './components/Card'
import { Button } from './components/Button'

export default {
  Hero,
  Features,
  Feature,
  CTA,
  Form,
  Input,
  Textarea,
  Card,
  Button,
}
