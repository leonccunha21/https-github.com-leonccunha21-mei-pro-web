import React, { useState, useMemo } from 'react';
import { Product, StoreInfo } from '../types';
import { Users, Plus, Gift, CheckCircle, XCircle, Copy, Share2, TrendingUp, Award, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface Referral {
  id: string;
  referrerName: string;
  referrerPhone: string;
  referredName: string;
  referredPhone: string;
  status: 'pending' | 'completed' | 'expired';
  creditAmount: number;
  createdAt: string;
  completedAt?: string;
  saleId?: string;
}

interface ReferralProgramProps {
  products: Product[];
  storeInfo: StoreInfo;
  onSaleCreated?: () => void;
}

const CREDIT_OPTIONS = [
  { value: 10, label: 'R$ 10', description: 'Crédito para acessórios' },
  { value: 20, label: 'R$ 20', description: 'Crédito para capas e pelúcias' },
  { value: 30, label: 'R$ 30', description: 'Crédito para acessórios premium' },
  { value: 50, label: 'R$ 50', description: 'Crédito para produtos selecionados' },
];

export default function ReferralProgram({ products, storeInfo, onSaleCreated }: ReferralProgramProps) {
  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem('zm_referrals');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [referrerPhone, setReferrerPhone] = useState('');
  const [referredName, setReferredName] = useState('');
  const [referredPhone, setReferredPhone] = useState('');
  const [creditAmount, setCreditAmount] = useState(20);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'expired'>('all');

  const saveReferrals = (data: Referral[]) => {
    setReferrals(data);
    localStorage.setItem('zm_referrals', JSON.stringify(data));
  };

  const addReferral = () => {
    if (!referrerName || !referredName) {
      toast.error('Preencha os nomes');
      return;
    }

    const newReferral: Referral = {
      id: Date.now().toString(),
      referrerName,
      referrerPhone,
      referredName,
      referredPhone,
      status: 'pending',
      creditAmount,
      createdAt: new Date().toISOString(),
    };

    saveReferrals([...referrals, newReferral]);
    setShowAddModal(false);
    setReferrerName('');
    setReferrerPhone('');
    setReferredName('');
    setReferredPhone('');
    toast.success('Indicação registrada!');
  };

  const completeReferral = (id: string) => {
    const updated = referrals.map(r =>
      r.id === id ? { ...r, status: 'completed' as const, completedAt: new Date().toISOString() } : r
    );
    saveReferrals(updated);
    toast.success('Indicação marcada como concluída!');
  };

  const expireReferral = (id: string) => {
    const updated = referrals.map(r =>
      r.id === id ? { ...r, status: 'expired' as const } : r
    );
    saveReferrals(updated);
    toast.success('Indicação marcada como expirada');
  };

  const deleteReferral = (id: string) => {
    saveReferrals(referrals.filter(r => r.id !== id));
    toast.success('Indicação removida');
  };

  const generateShareMessage = () => {
    return `🎉 *Programa de Indicação ${storeInfo.name}!*

Indique um amigo e ambos ganham!

✨ *Como funciona:*
1️⃣ Indique um amigo para comprar na nossa loja
2️⃣ Quando ele comprar, vocês dois ganham crédito
3️⃣ Use o crédito na sua próxima compra

🎁 *Prêmios:*
• Quem indica: R$ ${creditAmount} de crédito
• Quem é indicado: R$ ${creditAmount} de crédito

📞 *Para participar:*
Chame no WhatsApp: ${storeInfo.phone || 'entre em contato'}

*${storeInfo.name}* 🏪`;
  };

  const copyShareMessage = () => {
    navigator.clipboard.writeText(generateShareMessage());
    toast.success('Mensagem copiada!');
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(generateShareMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = referrals.filter(r => {
      const created = new Date(r.createdAt);
      return created.getMonth() === today.getMonth() && created.getFullYear() === today.getFullYear();
    });

    return {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      completed: referrals.filter(r => r.status === 'completed').length,
      expired: referrals.filter(r => r.status === 'expired').length,
      thisMonth: thisMonth.length,
      completedThisMonth: thisMonth.filter(r => r.status === 'completed').length,
      totalCreditsGiven: referrals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.creditAmount * 2, 0),
    };
  }, [referrals]);

  const filteredReferrals = useMemo(() => {
    if (filterStatus === 'all') return referrals;
    return referrals.filter(r => r.status === filterStatus);
  }, [referrals, filterStatus]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Programa de Indicação</h3>
            <p className="text-sm text-slate-500">{stats.pending} indicações pendentes</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={shareWhatsApp}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Indicação
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-rose-600">{stats.pending}</p>
          <p className="text-[10px] text-rose-600">Pendentes</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{stats.completed}</p>
          <p className="text-[10px] text-emerald-600">Concluídas</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-purple-600">R$ {stats.totalCreditsGiven}</p>
          <p className="text-[10px] text-purple-600">Créditos Dados</p>
        </div>
      </div>

      {/* Share Card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-4 text-white">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Divulgue o Programa
        </h4>
        <p className="text-sm opacity-90 mb-3">
          Compartilhe com seus clientes e aumente suas vendas!
        </p>
        <div className="flex gap-2">
          <button
            onClick={copyShareMessage}
            className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'pending', label: 'Pendentes' },
          { value: 'completed', label: 'Concluídas' },
          { value: 'expired', label: 'Expiradas' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value as typeof filterStatus)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
              filterStatus === f.value
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Referrals List */}
      <div className="space-y-2">
        {filteredReferrals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold">Nenhuma indicação encontrada</p>
            <p className="text-sm">Comece compartilhando o programa!</p>
          </div>
        ) : (
          filteredReferrals.map(referral => (
            <div key={referral.id} className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      referral.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      referral.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {referral.status === 'pending' ? '⏳ Pendente' :
                       referral.status === 'completed' ? '✅ Concluída' : '❌ Expirada'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-900">{referral.referrerName}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-slate-900">{referral.referredName}</span>
                  </div>
                  {referral.referrerPhone && (
                    <p className="text-xs text-slate-500 mt-1">
                      📞 {referral.referrerPhone}
                    </p>
                  )}
                  <p className="text-xs text-purple-600 font-semibold mt-1">
                    💰 R$ {referral.creditAmount} de crédito para cada
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {referral.status === 'pending' && (
                    <>
                      <button
                        onClick={() => completeReferral(referral.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                        title="Marcar como concluída"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => expireReferral(referral.id)}
                        className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg"
                        title="Marcar como expirada"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteReferral(referral.id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
                    title="Remover"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Leaderboard */}
      {stats.completed > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top Indicadores
          </h4>
          {Object.entries(
            referrals
              .filter(r => r.status === 'completed')
              .reduce((acc, r) => {
                acc[r.referrerName] = (acc[r.referrerName] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
          )
            .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
            .slice(0, 5)
            .map(([name, count], idx) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''}`}>
                    {idx < 3 ? '' : `#${idx + 1}`}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{name}</span>
                </div>
                <span className="text-sm font-bold text-rose-600">{count} indicações</span>
              </div>
            ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Nova Indicação</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-rose-700 mb-2">Quem Indica (Cliente Atual)</p>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={referrerName}
                  onChange={e => setReferrerName(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-rose-400"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (opcional)"
                  value={referrerPhone}
                  onChange={e => setReferrerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-2">Quem é Indicado (Novo Cliente)</p>
                <input
                  type="text"
                  placeholder="Nome do amigo"
                  value={referredName}
                  onChange={e => setReferredName(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp (opcional)"
                  value={referredPhone}
                  onChange={e => setReferredPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Valor do Crédito</label>
                <div className="grid grid-cols-2 gap-2">
                  {CREDIT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCreditAmount(opt.value)}
                      className={`p-2 rounded-xl border-2 text-left ${
                        creditAmount === opt.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                      <p className="text-[10px] text-slate-500">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={addReferral}
                className="flex-1 px-4 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
