import { useState, useEffect } from 'react';
import { Stethoscope, ShoppingBag, Loader2, Check, ArrowLeft, Ticket, Sparkles } from 'lucide-react';
import { createCheckoutSession } from '../lib/subscription';

interface PlansPageProps {
  uid: string
  email: string
  currentPlan?: string
  onBack: () => void
}

const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
  annual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || '',
}

export default function PlansPage({ uid, email, currentPlan, onBack }: PlansPageProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [showCouponInput, setShowCouponInput] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      window.history.replaceState({}, '', window.location.pathname)
      window.location.reload()
    }
  }, [])

  const handleCheckout = async (priceId: string, label: string) => {
    setBusy(label)
    setError(null)
    try {
      const url = await createCheckoutSession(uid, email, priceId, couponApplied ? coupon : undefined)
      if (!url) { setError('Erro ao criar sessão de pagamento. Tente novamente.'); return }
      window.location.href = url
    } catch {
      setError('Erro de conexão com o servidor.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-6">
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-2xl mb-4">
            <span className="text-white font-bold text-xl">MP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Escolha seu plano
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Acesso completo a todos os sistemas. Cancele quando quiser.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 text-center text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg py-2 px-3">
            {error}
          </div>
        )}

        {currentPlan && (
          <div className="max-w-md mx-auto mb-8 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                Plano atual: {currentPlan === 'monthly' ? 'Mensal' : 'Anual'}
              </p>
              <ManageSubscriptionButton uid={uid} />
            </div>
          </div>
        )}

        {/* Coupon code */}
        <div className="max-w-md mx-auto mb-8">
          {!showCouponInput ? (
            <button
              onClick={() => setShowCouponInput(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mx-auto"
            >
              <Ticket size={16} /> Tem um código de desconto?
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-1.5">
              <Ticket size={18} className="text-slate-400 shrink-0" />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="flex-1 bg-transparent text-sm font-mono font-bold uppercase tracking-widest outline-none py-2"
                maxLength={20}
              />
              <button
                onClick={() => { setCouponApplied(true); setShowCouponInput(false) }}
                disabled={!coupon}
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-3 py-1.5 rounded-lg"
              >
                Aplicar
              </button>
              <button onClick={() => { setShowCouponInput(false); setCoupon(''); setCouponApplied(false) }} className="text-xs text-slate-400 hover:text-slate-600 px-1">
                ✕
              </button>
            </div>
          )}
          {couponApplied && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-2">
              Cupom <span className="font-bold">{coupon}</span> aplicado! O desconto será calculado no Stripe.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* Monthly */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 border-indigo-500 dark:border-indigo-400 p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Popular
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Mensal</h3>
                <p className="text-xs text-slate-500">Faturamento mensal</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">R$ 29</p>
            <p className="text-xs text-slate-500 mb-6">/mês</p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 flex-1 mb-6">
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Todos os sistemas</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Sincronia na nuvem</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Suporte prioritário</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Cancele quando quiser</li>
            </ul>
            <button
              onClick={() => handleCheckout(PRICE_IDS.monthly, 'monthly')}
              disabled={busy !== null}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {busy === 'monthly' ? <Loader2 size={16} className="animate-spin" /> : null}
              Assinar Mensal
            </button>
          </div>

          {/* Annual */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/40 flex items-center justify-center text-fuchsia-600">
                <Stethoscope size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Anual</h3>
                <p className="text-xs text-slate-500">2 meses grátis</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">R$ 290</p>
            <p className="text-xs text-slate-500 mb-6">/ano (R$ 24,17/mês)</p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 flex-1 mb-6">
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Todos os sistemas</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Sincronia na nuvem</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Suporte prioritário</li>
              <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> Economia de 2 meses</li>
            </ul>
            <button
              onClick={() => handleCheckout(PRICE_IDS.annual, 'annual')}
              disabled={busy !== null}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {busy === 'annual' ? <Loader2 size={16} className="animate-spin" /> : null}
              Assinar Anual
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
            Pagamento processado pelo Stripe. Aceitamos cartão de crédito, débito e PIX (via Stripe).
            Ao assinar, você concorda com os termos de uso.
          </p>
        </div>
      </div>
    </div>
  )
}

function ManageSubscriptionButton({ uid }: { uid: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleManage = async () => {
    setBusy(true)
    setError(null)
    try {
      const { createPortalSession } = await import('../lib/subscription')
      const url = await createPortalSession(uid)
      if (!url) { setError('Erro ao abrir gerenciamento.'); return }
      window.location.href = url
    } catch {
      setError('Erro de conexão.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleManage}
        disabled={busy}
        className="text-xs text-emerald-600 hover:text-emerald-700 underline mt-1 disabled:opacity-50"
      >
        {busy ? 'Abrindo...' : 'Gerenciar assinatura'}
      </button>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  )
}
