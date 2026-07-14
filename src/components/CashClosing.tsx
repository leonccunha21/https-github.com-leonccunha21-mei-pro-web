import React, { useState, useMemo } from 'react';
import { Sale, CashSession, CashWithdrawal } from '../types';
import { roundCurrency } from '../lib/currency';
import {
  Wallet, Plus, DollarSign, ArrowDownCircle, CheckCircle2,
  X, Clock, AlertCircle, Calculator
} from 'lucide-react';

interface CashClosingProps {
  sales: Sale[];
  sessions: CashSession[];
  onSaveSessions: (sessions: CashSession[]) => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  money: 'Dinheiro',
  pix: 'PIX',
  card_credit: 'Cartão de Crédito',
  card_debit: 'Cartão de Débito',
  transfer: 'Transferência',
  other: 'Outros',
};

const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

export default function CashClosing({ sales, sessions, onSaveSessions }: CashClosingProps) {
  const [openBalance, setOpenBalance] = useState('0');
  const [closeBalance, setCloseBalance] = useState('');
  const [showOpen, setShowOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');

  const sorted = useMemo(() => [...sessions].sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime()), [sessions]);
  const openSession = sessions.find(s => s.status === 'open') || null;

  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

  // Soma por forma de pagamento (somente vendas concluídas).
  const buildBreakdown = (list: Sale[]) => {
    const acc: Record<string, number> = {};
    list.filter(s => s.status === 'completed').forEach(s => {
      const key = s.paymentMethod || 'other';
      acc[key] = (acc[key] || 0) + (s.paidAmount ?? s.total);
    });
    return acc;
  };

  const todaySales = useMemo(
    () => sales.filter(s => s.status === 'completed' && isToday(s.date)),
    [sales]
  );

  const periodSales = useMemo(() => {
    if (!openSession) return [];
    const open = new Date(openSession.openDate).getTime();
    return sales.filter(s => s.status === 'completed' && new Date(s.date).getTime() >= open);
  }, [sales, openSession]);

  const cashIn = useMemo(() => {
    if (!openSession) return 0;
    const open = new Date(openSession.openDate).getTime();
    return sales
      .filter(s => s.paymentMethod === 'money' && s.status === 'completed' && new Date(s.date).getTime() >= open)
      .reduce((acc, s) => acc + (s.paidAmount ?? s.total), 0);
  }, [sales, openSession]);

  const withdrawalsTotal = openSession ? openSession.withdrawals.reduce((acc, w) => acc + w.amount, 0) : 0;
  const expected = openSession ? roundCurrency(openSession.openingBalance + cashIn - withdrawalsTotal) : 0;

  const openCash = () => {
    const bal = roundCurrency(Number(openBalance) || 0);
    const session: CashSession = {
      id: `cx_${Date.now()}`,
      openDate: new Date().toISOString(),
      openingBalance: bal,
      status: 'open',
      withdrawals: [],
    };
    onSaveSessions([session, ...sessions]);
    setShowOpen(false);
    setOpenBalance('0');
  };

  const addWithdrawal = () => {
    if (!openSession) return;
    const amount = roundCurrency(Number(withdrawalAmount) || 0);
    if (amount <= 0) return;
    const w: CashWithdrawal = { id: `w_${Date.now()}`, date: new Date().toISOString(), amount, reason: withdrawalReason.trim() || 'Sangria' };
    const updated = sessions.map(s => s.id === openSession.id ? { ...s, withdrawals: [...s.withdrawals, w] } : s);
    onSaveSessions(updated);
    setWithdrawalAmount('');
    setWithdrawalReason('');
  };

  const closeCash = () => {
    if (!openSession) return;
    const counted = roundCurrency(Number(closeBalance) || 0);
    const updated = sessions.map(s => s.id === openSession.id ? {
      ...s,
      status: 'closed' as const,
      closeDate: new Date().toISOString(),
      closingBalance: counted,
      expectedBalance: expected,
      difference: roundCurrency(counted - expected),
    } : s);
    onSaveSessions(updated);
    setCloseBalance('');
  };

  const todayBreakdown = buildBreakdown(todaySales);
  const periodBreakdown = buildBreakdown(periodSales);
  const todayTotal = Object.values(todayBreakdown).reduce((a, b) => a + b, 0);
  const periodTotal = Object.values(periodBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" /> Fechamento de Caixa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Resumo de vendas e controle físico do dinheiro (troco, sangria e fechamento).</p>
        </div>
        {!openSession && (
          <button onClick={() => setShowOpen(true)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" /> Abrir Caixa
          </button>
        )}
      </div>

      {/* Resumo de hoje (sempre visível, mesmo sem caixa aberto) */}
      <BreakdownCard
        title="Resumo de Hoje — todas as vendas"
        data={todayBreakdown}
        total={todayTotal}
        hint="Total de vendas concluídas hoje, por forma de pagamento."
      />

      {openSession ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-2"><Clock className="h-4 w-4" /> Caixa aberto em {new Date(openSession.openDate).toLocaleString('pt-BR')}</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30">Em operação</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Saldo inicial" value={fmt(openSession.openingBalance)} />
            <Stat label="Entradas (dinheiro)" value={fmt(cashIn)} />
            <Stat label="Sangrias" value={fmt(withdrawalsTotal)} accent />
            <Stat label="Esperado no caixa" value={fmt(expected)} highlight />
          </div>

          <BreakdownCard
            title="Vendas no período (todas formas)"
            data={periodBreakdown}
            total={periodTotal}
            hint="Inclui PIX, cartão e transferências — não entra no dinheiro físico do caixa."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Registrar Sangria</label>
              <div className="flex gap-2">
                <input type="number" min="0" step="0.01" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value)} placeholder="Valor" className="w-24 px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden" />
                <input value={withdrawalReason} onChange={e => setWithdrawalReason(e.target.value)} placeholder="Motivo" className="flex-1 px-2 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden" />
                <button onClick={addWithdrawal} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"><ArrowDownCircle className="h-4 w-4" /> Sangrar</button>
              </div>
              {openSession.withdrawals.length > 0 && (
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-1">
                  {openSession.withdrawals.map(w => (
                    <li key={w.id} className="flex justify-between"><span>{w.reason} · {new Date(w.date).toLocaleTimeString('pt-BR')}</span><span className="font-mono">- R$ {w.amount.toFixed(2)}</span></li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Fechar Caixa (contagem física)</label>
              <input type="number" min="0" step="0.01" value={closeBalance} onChange={e => setCloseBalance(e.target.value)} placeholder="Valor contado" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              {closeBalance !== '' && (
                <p className={`text-xs font-bold flex items-center gap-1 ${Math.abs(roundCurrency(Number(closeBalance) - expected)) < 0.01 ? 'text-emerald-600' : 'text-red-500'}`}>
                  <AlertCircle className="h-3.5 w-3.5" /> Diferença: R$ {roundCurrency(Number(closeBalance) - expected).toFixed(2)}
                </p>
              )}
              <button onClick={closeCash} className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                <CheckCircle2 className="h-4 w-4" /> Fechar Caixa
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Calculator className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">Nenhum caixa aberto. Abra o caixa para controlar o dinheiro físico (troco e sangrias).</p>
        </div>
      )}

      {sorted.filter(s => s.status === 'closed').length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Histórico de Fechamentos</h3>
          <div className="space-y-2">
            {sorted.filter(s => s.status === 'closed').map(s => (
              <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{new Date(s.openDate).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs text-slate-400">Esperado R$ {(s.expectedBalance ?? 0).toFixed(2)} · Contado R$ {(s.closingBalance ?? 0).toFixed(2)}</p>
                </div>
                <span className={`text-sm font-bold ${Math.abs(s.difference ?? 0) < 0.01 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {s.difference && s.difference < 0 ? '' : '+'}R$ {(s.difference ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Wallet className="h-4 w-4" /> Abrir Caixa</h2>
              <button onClick={() => setShowOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Saldo inicial (troco)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="number" min="0" step="0.01" value={openBalance} onChange={e => setOpenBalance(e.target.value)} className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button onClick={() => setShowOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">Cancelar</button>
              <button onClick={openCash} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer">Abrir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-base font-bold mt-1 ${highlight ? 'text-indigo-600 dark:text-indigo-400' : accent ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'}`}>{value}</p>
    </div>
  );
}

function BreakdownCard({ title, data, total, hint }: { title: string; data: Record<string, number>; total: number; hint?: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</h3>
        <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">{fmt(total)}</span>
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      {entries.length === 0 ? (
        <p className="text-xs text-slate-400 mt-3">Nenhuma venda concluída neste período.</p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{PAYMENT_LABELS[key] || key}</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{fmt(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
