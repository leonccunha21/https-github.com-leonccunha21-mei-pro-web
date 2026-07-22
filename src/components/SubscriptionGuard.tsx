import { useState, useEffect, type ReactNode } from 'react';
import { isActive, getSubscription, type Subscription } from '../lib/subscription';
import PlansPage from './PlansPage';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  uid: string
  email: string
  children: ReactNode
  /**
   * Se true, o usuário NÃO precisa ter assinatura ativa.
   * Usado para quem está configurando a conta pela primeira vez.
   */
  allowUnsubscribed?: boolean
}

export default function SubscriptionGuard({ uid, email, children, allowUnsubscribed }: SubscriptionGuardProps) {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [showPlans, setShowPlans] = useState(false)

  useEffect(() => {
    if (allowUnsubscribed) { setLoading(false); return }
    let cancelled = false
    ;(async () => {
      try {
        const sub = await getSubscription(uid)
        if (cancelled) return
        setSubscription(sub)
        if (sub && isActive(sub.status)) {
          return // all good
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [uid, email, allowUnsubscribed])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (showPlans) {
    return (
      <PlansPage
        uid={uid}
        email={email}
        currentPlan={subscription?.planId}
        onBack={() => setShowPlans(false)}
      />
    )
  }

  // User has active subscription or is allowed unsubscribed
  if (subscription && isActive(subscription.status)) {
    return <>{children}</>
  }

  // No subscription at all — show plans on first render
  if (!subscription) {
    return (
      <PlansPage
        uid={uid}
        email={email}
        onBack={() => { if (!allowUnsubscribed) setShowPlans(true) }}
      />
    )
  }

  // Subscription expired / canceled
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⏰</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Assinatura necessária</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Sua assinatura expirou ou foi cancelada. Renove para continuar usando os sistemas.
        </p>
        <button
          onClick={() => setShowPlans(true)}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Ver planos
        </button>
      </div>
    </div>
  )
}
