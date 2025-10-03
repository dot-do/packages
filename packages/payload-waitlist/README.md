# @dot-do/payload-waitlist

Reusable waitlist system for PayloadCMS with referral tracking, position assignment, and email notifications.

## Features

✅ **Auto-assigned position** - Sequential position based on signup order per tenant
✅ **Unique referral codes** - Automatically generated for viral growth
✅ **Referral tracking** - Count referrals and reward users
✅ **Status workflow** - waiting → invited → accepted
✅ **Multi-tenant support** - Isolated waitlists per tenant
✅ **Customizable metadata** - Company, role, use case, source fields
✅ **React components** - Pre-built form and success page
✅ **TypeScript** - Full type safety
✅ **Email hooks** - Trigger notifications on signup and referral

## Installation

```bash
pnpm add @dot-do/payload-waitlist
```

**Peer Dependencies:**
- `payload` ^3.0.0
- `react` ^18.0.0 || ^19.0.0

## Quick Start

### 1. Add Collection to PayloadCMS

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { createWaitlistCollection } from '@dot-do/payload-waitlist/collection'

export default buildConfig({
  collections: [
    // Your existing collections
    createWaitlistCollection({
      tenantCollection: 'tenants', // or 'organizations'
      onWaitlistJoin: async (entry) => {
        // Send welcome email
        await sendEmail({
          to: entry.email,
          subject: 'Welcome to the waitlist!',
          body: `You're #${entry.position} in line. Your referral code: ${entry.referralCode}`,
        })
      },
      onReferral: async (referrer, referred) => {
        // Reward referrer
        console.log(`${referrer.email} referred ${referred.email}!`)
      },
    }),
  ],
})
```

### 2. Create API Endpoint

```typescript
// app/api/waitlist/route.ts (Next.js)
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { handleWaitlistSignup } from '@dot-do/payload-waitlist/api'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const payload = await getPayload({ config })

  const result = await handleWaitlistSignup(body, {
    payload,
    onSuccess: async (entry) => {
      // Optional: Additional actions on success
      console.log(`New signup: ${entry.email}`)
    },
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
```

### 3. Use React Components

```tsx
// app/waitlist/page.tsx
'use client'

import { useState } from 'react'
import { WaitlistForm, WaitlistSuccess } from '@dot-do/payload-waitlist/components'

export default function WaitlistPage() {
  const [success, setSuccess] = useState<{ position: number; referralCode: string } | null>(null)

  if (success) {
    return (
      <WaitlistSuccess
        position={success.position}
        referralCode={success.referralCode}
        referralBaseUrl="https://example.com/waitlist"
      />
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Join the Waitlist</h1>
      <WaitlistForm
        tenantId="your-tenant-id"
        onSuccess={(data) => setSuccess(data)}
      />
    </div>
  )
}
```

## Configuration

### Collection Options

```typescript
interface WaitlistConfig {
  /** Collection slug (default: 'waitlist') */
  slug?: string

  /** Tenant collection name (default: 'tenants') */
  tenantCollection?: string

  /** Enable metadata fields (default: true) */
  enableMetadata?: boolean

  /** Metadata field options */
  metadataFields?: {
    company?: boolean
    role?: boolean
    useCase?: boolean
    source?: boolean
  }

  /** Custom status options */
  statusOptions?: Array<{ label: string; value: string }>

  /** Email notification hook */
  onWaitlistJoin?: (entry: WaitlistEntry) => Promise<void>

  /** Referral reward hook */
  onReferral?: (referrer: WaitlistEntry, referred: WaitlistEntry) => Promise<void>
}
```

### Component Props

**WaitlistForm:**
```typescript
interface WaitlistFormProps {
  tenantId: string | number
  onSuccess?: (data: { position: number; referralCode: string }) => void
  className?: string
  showCompany?: boolean
  showUseCase?: boolean
  showSource?: boolean
}
```

**WaitlistSuccess:**
```typescript
interface WaitlistSuccessProps {
  position: number
  referralCode: string
  showPosition?: boolean
  successMessage?: string
  className?: string
  referralBaseUrl?: string
}
```

## API Reference

### `handleWaitlistSignup(request, options)`

Handle waitlist signup requests.

**Parameters:**
- `request: WaitlistAPIRequest` - Signup data
- `options: WaitlistHandlerOptions` - Handler configuration

**Returns:**
- `Promise<WaitlistAPIResponse>` - Result with position and referral code

**Example:**
```typescript
const result = await handleWaitlistSignup(
  {
    email: 'user@example.com',
    name: 'John Doe',
    tenant: 'tenant-123',
    metadata: {
      company: 'Acme Inc',
      useCase: 'Building SaaS',
      source: 'search',
    },
  },
  {
    payload,
    validateEmail: async (email) => {
      // Custom email validation
      return !email.includes('spam')
    },
  }
)
```

### `getWaitlistStats(payload, tenantId, collectionSlug)`

Get waitlist statistics for a tenant.

**Returns:**
```typescript
{
  total: number
  waiting: number
  invited: number
  accepted: number
}
```

### `findByReferralCode(payload, referralCode, collectionSlug)`

Find a waitlist entry by referral code.

## Customization

### Custom Metadata Fields

```typescript
createWaitlistCollection({
  metadataFields: {
    company: true,
    role: false,        // Disable role field
    useCase: true,
    source: true,
  },
})
```

### Custom Status Options

```typescript
createWaitlistCollection({
  statusOptions: [
    { label: 'Waiting', value: 'waiting' },
    { label: 'Invited', value: 'invited' },
    { label: 'Active', value: 'active' },
    { label: 'Churned', value: 'churned' },
  ],
})
```

### Email Notifications

```typescript
createWaitlistCollection({
  onWaitlistJoin: async (entry) => {
    await sendEmail({
      to: entry.email,
      template: 'waitlist-welcome',
      data: {
        name: entry.name,
        position: entry.position,
        referralCode: entry.referralCode,
      },
    })
  },
  onReferral: async (referrer, referred) => {
    await sendEmail({
      to: referrer.email,
      template: 'referral-success',
      data: {
        referralCount: referrer.referralCount,
      },
    })
  },
})
```

## Migration from POC

If you're migrating from `poc/payload-fumadocs-waitlist`:

1. **Install package:**
   ```bash
   pnpm add @dot-do/payload-waitlist
   ```

2. **Replace collection:**
   ```diff
   - import { Waitlist } from './collections/Waitlist'
   + import { createWaitlistCollection } from '@dot-do/payload-waitlist/collection'

     collections: [
   -   Waitlist,
   +   createWaitlistCollection(),
     ]
   ```

3. **Replace API handler:**
   ```diff
   - // Custom implementation
   + import { handleWaitlistSignup } from '@dot-do/payload-waitlist/api'
   ```

4. **Replace components:**
   ```diff
   - import { WaitlistForm } from '@/components/waitlist/WaitlistForm'
   + import { WaitlistForm } from '@dot-do/payload-waitlist/components'
   ```

## Services.Delivery Integration

See [examples/services-delivery-integration.md](./examples/services-delivery-integration.md) for complete integration guide.

## Testing

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build
pnpm build
```

## License

MIT

## Support

- **Issues**: [GitHub Issues](https://github.com/dot-do/packages/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dot-do/packages/discussions)
- **Documentation**: [Full Docs](https://github.com/dot-do/packages/tree/main/packages/payload-waitlist)

---

**Built with ❤️ by [dot-do](https://github.com/dot-do)**
