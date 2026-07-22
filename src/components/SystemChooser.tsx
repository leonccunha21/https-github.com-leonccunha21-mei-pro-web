import React, { useState, useEffect } from 'react';
import { ShoppingBag, Stethoscope, Sparkles, Loader2, ArrowRight } from 'lucide-react';

const CHOICE_KEY = 'mei_pro_system_choice';

interface SystemChooserProps {
  onChoose: (system: 'store' | 'mounjaro' | 'manicure') => void;
}

const SYSTEMS = [
  {
    id: 'store' as const,
    title: 'ZM Store',
    subtitle: 'Gestão Comercial',
    description: 'Vendas, estoque, caixa, clientes, relatórios e mais',
    icon: ShoppingBag,
    gradient: 'from-indigo-600 to-blue-600',
    shadow: 'shadow-indigo-500/25',
    border: 'hover:border-indigo-400 dark:hover:border-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    id: 'manicure' as const,
    title: 'Manicure PRO',
    subtitle: 'Gestão de Salão',
    description: 'Agendamentos, clientes, serviços, caixa e estoque',
    icon: Sparkles,
    gradient: 'from-fuchsia-600 to-pink-600',
    shadow: 'shadow-fuchsia-500/25',
    border: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-500',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
  },
  {
    id: 'mounjaro' as const,
    title: 'Mounjaro PRO',
    subtitle: 'Controle de Tratamento',
    description: 'Doses, peso, pagamentos, fotos e relatórios',
    icon: Stethoscope,
    gradient: 'from-cyan-600 to-teal-600',
    shadow: 'shadow-cyan-500/25',
    border: 'hover:border-cyan-400 dark:hover:border-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-300',
  },
];

export default function SystemChooser({ onChoose }: SystemChooserProps) {
  const [busyTarget, setBusyTarget] = useState<string | null>(null);

  const escolher = (system: 'store' | 'mounjaro' | 'manicure') => {
    setBusyTarget(system);
    try {
      localStorage.setItem(CHOICE_KEY, system);
    } catch { /* ignore */ }
    if (system === 'mounjaro') {
      window.location.href = '/mounjaro';
      return;
    }
    if (system === 'manicure') {
      window.location.href = '/manicure';
      return;
    }
    onChoose('store');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-lg shadow-indigo-500/25 mb-5">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">
            Bem-vindo ao <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">MEI PRO</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Escolha o sistema que melhor atende seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SYSTEMS.map((sys) => {
            const Icon = sys.icon;
            const isBusy = busyTarget === sys.id;
            return (
              <button
                key={sys.id}
                onClick={() => escolher(sys.id)}
                disabled={busyTarget !== null}
                className={`group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 ${sys.border} ${sys.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sys.gradient} shadow-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100">{sys.title}</h2>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${sys.text}`}>
                  {sys.subtitle}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {sys.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Abrir <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-8">
          Você poderá trocar de sistema a qualquer momento pelo menu de navegação.
        </p>
      </div>
    </div>
  );
}

export function getSystemChoice(): 'store' | 'mounjaro' | 'manicure' | null {
  try {
    const v = localStorage.getItem(CHOICE_KEY);
    return v === 'store' || v === 'mounjaro' || v === 'manicure' ? v : null;
  } catch {
    return null;
  }
}
