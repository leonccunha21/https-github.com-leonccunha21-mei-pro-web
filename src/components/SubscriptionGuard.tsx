import { useState, useEffect, type ReactNode } from 'react';
import { isActive, getSubscription, startTrial, getTrialDaysRemaining, type Subscription } from '../lib/subscription';
import PlansPage from './PlansPage';
import { Loader2, Clock, Sparkles } from 'lucide-react';

interface SubscriptionGuardProps {
  uid: string
  email: string
  children: ReactNode
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
      let sub: Subscription | null = null
      try {
        sub = await getSubscription(uid)
      } catch { /* ignore */ }

      if (cancelled) return

      if (!sub) {
        const created = await startTrial(uid, email)
        if (created && !cancelled) sub = created
      }

      if (!cancelled) {
        setSubscription(sub)
        setLoading(false)
      }
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

  if (subscription && isActive(subscription.status)) {
    const daysLeft = getTrialDaysRemaining(subscription.trialEnd)
    return (
      <>
        {subscription.status === 'trialing' && daysLeft > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>
                  Teste grátis — <strong>{daysLeft}</strong> {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
                </span>
              </div>
              <button
                onClick={() => setShowPlans(true)}
                className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors shrink-0"
              >
                Ver planos
              </button>
            </div>
          </div>
        )}
        {children}
      </>
    )
  }

  // Trialing expired → show plans
  if (subscription && subscription.status === 'trialing') {
    return (
      <PlansPage
        uid={uid}
        email={email}
        onBack={() => { if (!allowUnsubscribed) setShowPlans(true) }}
      />
    )
  }

  // No subscription at all (shouldn't happen since we auto-start trial)
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
          <Clock size={28} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Assinatura necessária</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Seu período de teste expirou. Escolha um plano para continuar usando os sistemas.
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
