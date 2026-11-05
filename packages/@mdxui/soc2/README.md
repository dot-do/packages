---
name: "@mdxui/soc2"
version: 6.0.0
description: SOC2 compliance components for trust centers and compliance portals
license: MIT
downloads:
  monthly: 25
published: "2026-01-24T14:38:06.139Z"
updated: "2026-01-24T14:38:06.429Z"
---

# @mdxui/soc2

SOC2 compliance components for building trust centers (public) and compliance portals (internal).

## Installation

```bash
pnpm add @mdxui/soc2
```

## Overview

This package provides two sets of components:

- **Site Components** (`@mdxui/soc2/site`) - Public-facing trust center pages
- **App Components** (`@mdxui/soc2/app`) - Internal compliance management portal

Both integrate with Payload CMS via auto-wiring for data management.

## Quick Start

### Public Trust Center

```tsx
import type { SOC2SiteComponents } from '@mdxui/soc2/site'
import {
  TrustCenter,
  TrustHero,
  Certifications,
  SecurityPractices,
  InheritanceShowcase,
} from '@mdxui/soc2/site/components'

export default function TrustCenterPage() {
  return (
    <TrustCenter config={trustCenterConfig}>
      <TrustHero
        companyName="Acme Inc"
        title="Security & Compliance"
        description="Your data security is our top priority"
        certifications={certifications}
      />
      <Certifications certifications={certifications} />
      <SecurityPractices practices={securityPractices} />
      <InheritanceShowcase summary={inheritanceSummary} />
    </TrustCenter>
  )
}
```

### Internal Compliance Portal

```tsx
import type { SOC2AppComponents } from '@mdxui/soc2/app'
import {
  CompliancePortal,
  ComplianceDashboard,
  ControlsView,
  CUECView,
} from '@mdxui/soc2/app/components'

export default function CompliancePage() {
  return (
    <CompliancePortal userRole="admin">
      <ComplianceDashboard
        posture={compliancePosture}
        upcomingTasks={tasks}
        recentEvents={events}
      />
    </CompliancePortal>
  )
}
```

### Customer Compliance View (Platform Customers)

```tsx
import { CustomerComplianceView, CUECView } from '@mdxui/soc2/app/components'

// Show customers what they inherit and what they need to do
export default function CustomerCompliancePage() {
  return (
    <>
      <CustomerComplianceView
        inheritance={inheritanceSummary}
        inheritedControls={inheritedControls}
        cuecs={customerCuecs}
        progress={75}
      />
      <CUECView
        cuecs={customerCuecs}
        onComplete={handleComplete}
        onAcknowledge={handleAcknowledge}
      />
    </>
  )
}
```

## Site Components

### Layout
| Component | Description |
|-----------|-------------|
| `TrustCenter` | Root wrapper with header/footer |
| `TrustHero` | Hero section with certification badges |

### Certifications & Compliance
| Component | Description |
|-----------|-------------|
| `Certifications` | Grid of certification cards |
| `ComplianceBadge` | Status badge (valid/expired/pending) |
| `AuditTimeline` | Past audit history |

### Security Information
| Component | Description |
|-----------|-------------|
| `SecurityPractices` | Security measures grid |
| `SubProcessors` | GDPR sub-processor table |
| `SecurityFAQ` | Accordion FAQ |
| `SecurityContact` | Contact info & bug bounty |

### Platform Inheritance
| Component | Description |
|-----------|-------------|
| `InheritanceShowcase` | Shows what customers inherit |
| `CUECChecklist` | Minimal customer responsibilities |
| `ReportRequestForm` | Request SOC2 reports |

## App Components

### Layout & Dashboard
| Component | Description |
|-----------|-------------|
| `CompliancePortal` | Root wrapper with role context |
| `ComplianceDashboard` | Overview with metrics & tasks |

### Controls Management
| Component | Description |
|-----------|-------------|
| `ControlsView` | Browse/filter controls list |
| `ControlCard` | Individual control card |
| `ControlDetail` | Full control view (props only) |

### Evidence Management
| Component | Description |
|-----------|-------------|
| `EvidenceView` | Evidence list with filters |
| `EvidenceCard` | Evidence item card |
| `EvidenceTasks` | Collection task list (props only) |

### Customer Portal
| Component | Description |
|-----------|-------------|
| `CustomerComplianceView` | Inheritance overview |
| `CUECView` | CUEC management list |
| `CUECItem` | Interactive CUEC checklist item |
| `InheritedControlsView` | Platform controls list (props only) |

### Visualization
| Component | Description |
|-----------|-------------|
| `ScoreGauge` | Circular progress gauge |
| `CategoryProgress` | TSC category progress bars |
| `ActivityFeed` | Compliance events timeline |
| `StatusBreakdown` | Control status chart (props only) |

## Types

```typescript
import type {
  // Controls
  Control,
  ControlCategory,
  CUEC,
  InheritedControl,
  TrustServicesCriteria,
  ControlStatus,
  ControlOwnership,

  // Evidence
  Evidence,
  EvidenceTask,
  EvidenceSummary,
  EvidenceType,

  // Compliance
  Audit,
  Finding,
  CompliancePosture,
  ComplianceEvent,
  InheritanceSummary,
  TrustCenterConfig,
  Certification,
  SubProcessor,
} from '@mdxui/soc2/types'
```

## Auto-Wiring

Components auto-wire to Payload CMS collections:

### Site Collections
| Component | Collection | Default Query |
|-----------|------------|---------------|
| `Certifications` | `certifications` | `sort: -issuedAt, valid: true` |
| `SubProcessors` | `subProcessors` | `sort: name` |
| `AuditTimeline` | `audits` | `sort: -periodEnd, limit: 5` |
| `SecurityFAQ` | `securityFaq` | `sort: order` |

### App Collections
| Component | Collection | Default Query |
|-----------|------------|---------------|
| `ControlsView` | `controls` | `sort: controlId` |
| `EvidenceView` | `evidence` | `sort: -collectedAt` |
| `EvidenceTasks` | `evidenceTasks` | `overdue: true` |
| `AuditView` | `audits` | `sort: -periodEnd` |
| `FindingsView` | `findings` | `status: !remediated` |
| `ActivityFeed` | `complianceEvents` | `sort: -timestamp` |
| `CUECView` | `cuecs` | `sort: controlId` |

## Platform Compliance Inheritance

The key value proposition: customers building on your platform inherit your SOC2 controls.

```
┌─────────────────────────────────────────────────────┐
│              Your Platform (SOC2 Certified)          │
├─────────────────────────────────────────────────────┤
│  Infrastructure │ Auth/IAM │ Audit Logs │ Encryption │
│    Controls     │ Controls │  Controls  │  Controls  │
└────────────────────────┬────────────────────────────┘
                         │ Inherited
                         ▼
┌─────────────────────────────────────────────────────┐
│              Customer's Business                     │
├─────────────────────────────────────────────────────┤
│  Only needs to implement CUECs:                     │
│  • Configure team access                            │
│  • Disable terminated employees                     │
│  • Review permissions periodically                  │
└─────────────────────────────────────────────────────┘
```

## Trust Services Criteria (TSC)

Supports all five SOC2 categories:
- **Security** - Protection against unauthorized access
- **Availability** - System availability for operation
- **Processing Integrity** - Complete, accurate processing
- **Confidentiality** - Information designated confidential
- **Privacy** - Personal information handling

## License

MIT
