import Stripe from 'stripe'
import type { Tenant } from './tenant'

/**
 * Stripe Connect Billing
 *
 * Manages billing for multi-tenant marketplace using Stripe Connect.
 * Each tenant gets a Stripe Connect account for accepting payments.
 *
 * Revenue Model:
 * - Platform takes percentage fee (default: 15%)
 * - Monthly platform access fee (default: $500)
 * - Usage-based fees (API calls, storage, etc.)
 *
 * Features:
 * - Automated revenue sharing
 * - Monthly recurring billing
 * - Usage tracking and invoicing
 * - Payout automation
 */

export interface BillingConfig {
  stripeSecretKey: string
  platformAccountId?: string
  defaultPlatformFee?: number // %
  defaultMonthlyFee?: number // $
}

export interface ConnectAccountResult {
  success: boolean
  accountId?: string
  onboardingUrl?: string
  error?: string
}

export interface PaymentResult {
  success: boolean
  chargeId?: string
  platformFee?: number
  netAmount?: number
  error?: string
}

/**
 * Initialize Stripe client
 */
function getStripeClient(config: BillingConfig): Stripe {
  return new Stripe(config.stripeSecretKey, {
    apiVersion: '2025-01-27.acacia',
    typescript: true,
  })
}

/**
 * Create Stripe Connect account for tenant
 *
 * Sets up Express Connect account for tenant to receive payments.
 * Returns onboarding URL for completing setup.
 *
 * @param tenant - Tenant object
 * @param config - Billing configuration
 * @returns Connect account result with onboarding URL
 */
export async function createConnectAccount(
  tenant: Tenant,
  config: BillingConfig,
  options?: {
    email?: string
    country?: string
  }
): Promise<ConnectAccountResult> {
  try {
    const stripe = getStripeClient(config)

    // Create Express Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: options?.country || 'US',
      email: options?.email || tenant.siteSettings?.supportEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: tenant.name,
        url: `https://${tenant.domain}`,
      },
      metadata: {
        tenant_id: tenant.id.toString(),
        tenant_slug: tenant.slug,
      },
    })

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://${tenant.domain}/admin/billing/refresh`,
      return_url: `https://${tenant.domain}/admin/billing/complete`,
      type: 'account_onboarding',
    })

    return {
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Connect account',
    }
  }
}

/**
 * Get Connect account status
 *
 * @param accountId - Stripe Connect account ID
 * @param config - Billing configuration
 * @returns Account status
 */
export async function getConnectAccountStatus(
  accountId: string,
  config: BillingConfig
): Promise<{
  status: 'not_connected' | 'pending' | 'active' | 'restricted'
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requiresAction: boolean
}> {
  try {
    const stripe = getStripeClient(config)
    const account = await stripe.accounts.retrieve(accountId)

    let status: 'not_connected' | 'pending' | 'active' | 'restricted' = 'pending'

    if (account.charges_enabled && account.payouts_enabled) {
      status = 'active'
    } else if (account.requirements && account.requirements.currently_due && account.requirements.currently_due.length > 0) {
      status = 'pending'
    } else if (!account.charges_enabled || !account.payouts_enabled) {
      status = 'restricted'
    }

    return {
      status,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      requiresAction: (account.requirements?.currently_due?.length || 0) > 0,
    }
  } catch {
    return {
      status: 'not_connected',
      chargesEnabled: false,
      payoutsEnabled: false,
      requiresAction: false,
    }
  }
}

/**
 * Process marketplace payment
 *
 * Charges customer and distributes revenue:
 * - Platform fee goes to platform account
 * - Net amount goes to tenant account
 *
 * @param tenant - Tenant object
 * @param config - Billing configuration
 * @param payment - Payment details
 * @returns Payment result
 */
export async function processMarketplacePayment(
  tenant: Tenant,
  config: BillingConfig,
  payment: {
    amount: number // in cents
    currency: string
    customerId?: string
    paymentMethodId?: string
    description?: string
    metadata?: Record<string, string>
  }
): Promise<PaymentResult> {
  try {
    if (!tenant.billing?.stripeAccountId) {
      return {
        success: false,
        error: 'Tenant does not have Stripe Connect account set up',
      }
    }

    const stripe = getStripeClient(config)

    // Calculate platform fee
    const platformFeePercent = tenant.billing.platformFee || config.defaultPlatformFee || 15
    const platformFee = Math.round((payment.amount * platformFeePercent) / 100)
    const netAmount = payment.amount - platformFee

    // Create payment intent with application fee
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: payment.amount,
        currency: payment.currency,
        customer: payment.customerId,
        payment_method: payment.paymentMethodId,
        description: payment.description,
        metadata: {
          tenant_id: tenant.id.toString(),
          tenant_slug: tenant.slug,
          ...payment.metadata,
        },
        application_fee_amount: platformFee,
        transfer_data: {
          destination: tenant.billing.stripeAccountId,
        },
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      },
      {
        stripeAccount: tenant.billing.stripeAccountId,
      }
    )

    return {
      success: paymentIntent.status === 'succeeded',
      chargeId: paymentIntent.id,
      platformFee: platformFee / 100, // Convert to dollars
      netAmount: netAmount / 100, // Convert to dollars
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    }
  }
}

/**
 * Charge monthly platform fee
 *
 * Charges tenant for monthly platform access.
 * Run this monthly via cron job or scheduled worker.
 *
 * @param tenant - Tenant object
 * @param config - Billing configuration
 * @returns Payment result
 */
export async function chargeMonthlyPlatformFee(tenant: Tenant, config: BillingConfig): Promise<PaymentResult> {
  try {
    if (!tenant.billing?.stripeAccountId) {
      return {
        success: false,
        error: 'No Stripe account configured',
      }
    }

    const stripe = getStripeClient(config)

    // Get monthly fee
    const monthlyFee = tenant.billing.monthlyFee || config.defaultMonthlyFee || 500
    const currency = tenant.billing.currency || 'usd'

    // Create invoice item
    const invoiceItem = await stripe.invoiceItems.create(
      {
        customer: tenant.billing.stripeAccountId,
        amount: monthlyFee * 100, // Convert to cents
        currency,
        description: `${tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan - Monthly Platform Fee`,
      },
      {
        stripeAccount: tenant.billing.stripeAccountId,
      }
    )

    // Create and finalize invoice
    const invoice = await stripe.invoices.create(
      {
        customer: tenant.billing.stripeAccountId,
        auto_advance: true,
      },
      {
        stripeAccount: tenant.billing.stripeAccountId,
      }
    )

    await stripe.invoices.finalizeInvoice(invoice.id, {}, { stripeAccount: tenant.billing.stripeAccountId })

    return {
      success: true,
      chargeId: invoiceItem.id,
      platformFee: monthlyFee,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to charge monthly fee',
    }
  }
}

/**
 * Track usage for billing
 *
 * Records usage events for usage-based billing.
 * Can be used for API calls, storage, bandwidth, etc.
 *
 * @param tenant - Tenant object
 * @param config - Billing configuration
 * @param usage - Usage details
 */
export async function trackUsage(
  tenant: Tenant,
  config: BillingConfig,
  usage: {
    type: 'api_calls' | 'storage' | 'bandwidth' | 'custom'
    quantity: number
    timestamp?: number
    metadata?: Record<string, string>
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!tenant.billing?.stripeAccountId) {
      return { success: false, error: 'No Stripe account configured' }
    }

    const stripe = getStripeClient(config)

    // Create usage record
    // This would typically be associated with a subscription item
    // For now, we'll just create a metered billing item

    await stripe.invoiceItems.create(
      {
        customer: tenant.billing.stripeAccountId,
        amount: 0, // Will be calculated based on usage
        currency: tenant.billing.currency || 'usd',
        description: `${usage.type}: ${usage.quantity} units`,
        metadata: {
          usage_type: usage.type,
          quantity: usage.quantity.toString(),
          timestamp: (usage.timestamp || Date.now()).toString(),
          ...usage.metadata,
        },
      },
      {
        stripeAccount: tenant.billing.stripeAccountId,
      }
    )

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track usage',
    }
  }
}

/**
 * Get billing analytics
 *
 * Returns revenue, fees, and usage stats for a tenant.
 *
 * @param tenant - Tenant object
 * @param config - Billing configuration
 * @param period - Time period (e.g., 'month', 'year')
 * @returns Billing analytics
 */
export async function getBillingAnalytics(
  tenant: Tenant,
  config: BillingConfig,
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<{
  totalRevenue: number
  platformFees: number
  netRevenue: number
  transactionCount: number
  averageTransactionValue: number
}> {
  try {
    if (!tenant.billing?.stripeAccountId) {
      return {
        totalRevenue: 0,
        platformFees: 0,
        netRevenue: 0,
        transactionCount: 0,
        averageTransactionValue: 0,
      }
    }

    const stripe = getStripeClient(config)

    // Calculate time range
    const now = Math.floor(Date.now() / 1000)
    const periods = {
      day: 86400,
      week: 604800,
      month: 2592000,
      year: 31536000,
    }
    const startTime = now - periods[period]

    // Get charges for period
    const charges = await stripe.charges.list(
      {
        created: {
          gte: startTime,
        },
        limit: 100,
      },
      {
        stripeAccount: tenant.billing.stripeAccountId,
      }
    )

    // Calculate metrics
    const totalRevenue = charges.data.reduce((sum, charge) => sum + (charge.amount_captured || 0), 0) / 100
    const platformFees =
      charges.data.reduce((sum, charge) => sum + (charge.application_fee_amount || 0), 0) / 100
    const netRevenue = totalRevenue - platformFees
    const transactionCount = charges.data.length
    const averageTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0

    return {
      totalRevenue,
      platformFees,
      netRevenue,
      transactionCount,
      averageTransactionValue,
    }
  } catch {
    return {
      totalRevenue: 0,
      platformFees: 0,
      netRevenue: 0,
      transactionCount: 0,
      averageTransactionValue: 0,
    }
  }
}

/**
 * Example: Usage in API route
 *
 * ```typescript
 * // app/api/billing/connect/route.ts
 * import { createConnectAccount } from '@dot-do/payload-multitenant/lib/billing'
 * import { getCurrentTenant } from '@dot-do/payload-multitenant/lib/tenant'
 * import config from '@payload-config'
 *
 * export async function POST(req: Request) {
 *   const tenant = await getCurrentTenant(config)
 *
 *   if (!tenant) {
 *     return Response.json({ error: 'Tenant not found' }, { status: 404 })
 *   }
 *
 *   const result = await createConnectAccount(tenant, {
 *     stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
 *   }, {
 *     email: tenant.siteSettings?.supportEmail,
 *     country: 'US',
 *   })
 *
 *   if (!result.success) {
 *     return Response.json({ error: result.error }, { status: 500 })
 *   }
 *
 *   // Update tenant with Stripe account ID
 *   await payload.update({
 *     collection: 'tenants',
 *     id: tenant.id,
 *     data: {
 *       billing: {
 *         stripeAccountId: result.accountId,
 *         stripeStatus: 'pending',
 *       },
 *     },
 *   })
 *
 *   return Response.json({
 *     accountId: result.accountId,
 *     onboardingUrl: result.onboardingUrl,
 *   })
 * }
 * ```
 */
