import React, { useState, useEffect } from 'react';
import { ShoppingBag, Stethoscope, Loader2 } from 'lucide-react';

const CHOICE_KEY = 'mei_pro_system_choice';

interface SystemChooserProps {
  onChoose: (system: 'store' | 'mounjaro') => void;
}

// Tela inicial: o usuário escolhe qual dos dois sistemas deseja abrir.
// Loja (ZM Store) ou Mounjaro PRO (controle de medicamento).
export default function SystemChooser({ onChoose }: SystemChooserProps) {
  const [busyTarget, setBusyTarget] = useState<'store' | 'mounjaro' | null>(null);

  const escolher = (system: 'store' | 'mounjaro') => {
    setBusyTarget(system);
    try {
      localStorage.setItem(CHOICE_KEY, system);
    } catch { /* ignore */ }
    if (system === 'mounjaro') {
      // Redireciona para o subsite dedicado (mesmo endereço, rota /mounjaro).
      window.location.href = '/mounjaro';
      return;
    }
    onChoose('store');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">Bem-vindo</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Escolha o sistema que deseja abrir</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => escolher('store')}
            disabled={busyTarget !== null}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left disabled:opacity-60"
          >
            <div className="w-14 h-14 shrink-0 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-950 dark:text-slate-100">Sistema da Loja</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gestão comercial · vendas, estoque, caixa, clientes</p>
            </div>
            {busyTarget === 'store'
              ? <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              : <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">→</span>}
          </button>

          <button
            onClick={() => escolher('mounjaro')}
            disabled={busyTarget !== null}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-md transition-all text-left disabled:opacity-60"
          >
            <div className="w-14 h-14 shrink-0 bg-cyan-600 rounded-2xl flex items-center justify-center text-white">
              <Stethoscope className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-950 dark:text-slate-100">Mounjaro PRO</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Controle de medicamento · doses, peso, pagamentos</p>
            </div>
            {busyTarget === 'mounjaro'
              ? <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
              : <span className="text-cyan-600 group-hover:translate-x-1 transition-transform">→</span>}
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Você poderá trocar de sistema a qualquer momento pelo menu.
        </p>
      </div>
    </div>
  );
}

// Decide se deve mostrar o chooser ou pular direto para a loja (já escolhida antes).
export function getSystemChoice(): 'store' | 'mounjaro' | null {
  try {
    const v = localStorage.getItem(CHOICE_KEY);
    return v === 'store' || v === 'mounjaro' ? v : null;
  } catch {
    return null;
  }
}
