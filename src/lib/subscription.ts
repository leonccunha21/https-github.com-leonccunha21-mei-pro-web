export interface Subscription {
  id: string
  userId: string
  email: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  status: SubscriptionStatus
  planId: string
  trialEnd?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

const API_BASE = import.meta.env.VITE_API_URL || ''

export function isActive(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing'
}

export async function getSubscription(uid: string): Promise<Subscription | null> {
  try {
    const res = await fetch(`${API_BASE}/api/subscription?uid=${encodeURIComponent(uid)}`)
    if (!res.ok) return null
    return (await res.json()) as Subscription
  } catch {
    return null
  }
}

export async function createCheckoutSession(uid: string, email: string, priceId: string, coupon?: string): Promise<string | null> {
  try {
    const body: Record<string, string> = { uid, email, priceId }
    if (coupon) body.coupon = coupon
    const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.url as string
  } catch {
    return null
  }
}

export async function createPortalSession(uid: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stripe/create-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.url as string
  } catch {
    return null
  }
}
