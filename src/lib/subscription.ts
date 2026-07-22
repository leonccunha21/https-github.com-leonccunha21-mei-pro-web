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
    const res = await fetch(`${API_BASE}/api/create-checkout`, {
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

export function getTrialDaysRemaining(trialEnd?: string): number {
  if (!trialEnd) return 0
  const end = new Date(trialEnd).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
}

export async function startTrial(uid: string, email: string): Promise<Subscription | null> {
  try {
    const res = await fetch(`${API_BASE}/api/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email }),
    })
    if (!res.ok) return null
    return (await res.json()) as Subscription
  } catch {
    return null
  }
}

export async function createPortalSession(uid: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/create-portal`, {
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
