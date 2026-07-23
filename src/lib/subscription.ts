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

function getAuthToken(): string {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
      try {
        const val = JSON.parse(localStorage.getItem(key) || '{}');
        if (val.access_token) return val.access_token;
      } catch {}
    }
  }
  return '';
}

function authHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export function isActive(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing'
}

export async function getSubscription(uid: string, signal?: AbortSignal): Promise<Subscription | null> {
  try {
    const res = await fetch(`${API_BASE}/api/subscription?uid=${encodeURIComponent(uid)}`, {
      headers: authHeaders(),
      signal
    })
    if (!res.ok) { console.error('getSubscription HTTP', res.status); return null }
    return (await res.json()) as Subscription
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    console.error('getSubscription error:', e)
    return null
  }
}

export async function createCheckoutSession(uid: string, email: string, priceId: string, coupon?: string): Promise<string | null> {
  try {
    const body: Record<string, string> = { uid, email, priceId }
    if (coupon) body.coupon = coupon
    const res = await fetch(`${API_BASE}/api/create-checkout`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
    if (!res.ok) { console.error('createCheckoutSession HTTP', res.status); return null }
    const data = await res.json()
    return data.url as string
  } catch (e) {
    console.error('createCheckoutSession error:', e)
    return null
  }
}

export function getTrialDaysRemaining(trialEnd?: string): number {
  if (!trialEnd) return 0
  const end = new Date(trialEnd).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
}

export async function startTrial(uid: string, email: string, signal?: AbortSignal): Promise<Subscription | null> {
  try {
    const res = await fetch(`${API_BASE}/api/subscription`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ uid, email }),
      signal,
    })
    if (!res.ok) { console.error('startTrial HTTP', res.status); return null }
    return (await res.json()) as Subscription
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    console.error('startTrial error:', e)
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
    if (!res.ok) { console.error('createPortalSession HTTP', res.status); return null }
    const data = await res.json()
    return data.url as string
  } catch (e) {
    console.error('createPortalSession error:', e)
    return null
  }
}
