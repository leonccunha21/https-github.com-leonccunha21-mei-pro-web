import { useState, useMemo } from 'react';
import { MovimentoCaixa } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Search } from 'lucide-react';

interface Props {
  movimentos: MovimentoCaixa[];
}

export default function Caixa({ movimentos }: Props) {
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0, 7));
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [busca, setBusca] = useState('');

  const filtered = useMemo(() => {
    return movimentos.filter((m) => {
      if (!m.data.startsWith(filtroMes)) return false;
      if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false;
      if (busca && !m.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.data.localeCompare(a.data));
  }, [movimentos, filtroMes, filtroTipo, busca]);

  const totals = useMemo(() => {
    const entradas = filtered.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
    const saidas = filtered.filter((m) => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-fuchsia-600" />
        <h2 className="text-xl font-bold">Caixa</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Entradas</p>
          <p className="text-xl font-bold text-emerald-600">R$ {totals.entradas.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Saídas</p>
          <p className="text-xl font-bold text-rose-600">R$ {totals.saidas.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Saldo</p>
          <p className={`text-xl font-bold ${totals.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            R$ {totals.saldo.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input type="month" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
        <div className="flex gap-1">
          {(['todos', 'entrada', 'saida'] as const).map((t) => (
            <button key={t} onClick={() => setFiltroTipo(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filtroTipo === t ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.tipo === 'entrada' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
              {m.tipo === 'entrada' ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-rose-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{m.descricao}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                {m.formaPagamento && ` · ${m.formaPagamento.replace('_', ' ')}`}
              </p>
            </div>
            <p className={`text-sm font-bold ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {m.tipo === 'entrada' ? '+' : '-'}R$ {m.valor.toFixed(2)}
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">Nenhum movimento encontrado.</p>
        )}
      </div>
    </div>
  );
}
