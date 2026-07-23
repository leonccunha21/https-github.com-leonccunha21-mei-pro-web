import { useState, useMemo } from 'react';
import { MovimentoCaixa } from '../types';
import { newId } from '../localDb';
import { DollarSign, TrendingUp, TrendingDown, Search, Plus, X, Trash2, Pencil, BarChart2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  movimentos: MovimentoCaixa[];
  setMovimentos?: (m: MovimentoCaixa[]) => void;
}

const PAGAMENTO_CORES: Record<string, string> = {
  pix: '#10b981',
  dinheiro: '#3b82f6',
  cartao_credito: '#a855f7',
  cartao_debito: '#f59e0b',
  transferencia: '#64748b',
};
const PAGAMENTO_LABELS: Record<string, string> = {
  pix: 'Pix', dinheiro: 'Dinheiro',
  cartao_credito: 'Crédito', cartao_debito: 'Débito', transferencia: 'Transfer.',
};

export default function Caixa({ movimentos, setMovimentos }: Props) {
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0, 7));
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [busca, setBusca] = useState('');
  const [showGrafico, setShowGrafico] = useState(true);
  const [confirmExcluirId, setConfirmExcluirId] = useState<string | null>(null);

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

  // Dados do gráfico de barras por dia
  const dadosDiarios = useMemo(() => {
    const [ano, mes] = filtroMes.split('-').map(Number);
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const dias: { dia: number; entrada: number; saida: number }[] = [];
    for (let d = 1; d <= diasNoMes; d++) {
      const dataStr = `${filtroMes}-${String(d).padStart(2, '0')}`;
      const entrada = movimentos.filter((m) => m.data === dataStr && m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
      const saida = movimentos.filter((m) => m.data === dataStr && m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
      dias.push({ dia: d, entrada, saida });
    }
    return dias;
  }, [movimentos, filtroMes]);

  const maxDiario = useMemo(() => Math.max(...dadosDiarios.map((d) => Math.max(d.entrada, d.saida)), 1), [dadosDiarios]);

  // Formas de pagamento nas entradas do mês
  const pagamentoStats = useMemo(() => {
    const entradasMes = movimentos.filter((m) => m.data.startsWith(filtroMes) && m.tipo === 'entrada');
    const totalEntradas = entradasMes.reduce((s, m) => s + m.valor, 0);
    const map = new Map<string, number>();
    for (const m of entradasMes) {
      const k = m.formaPagamento || 'dinheiro';
      map.set(k, (map.get(k) || 0) + m.valor);
    }
    return Array.from(map.entries())
      .map(([forma, valor]) => ({ forma, valor, pct: totalEntradas > 0 ? (valor / totalEntradas) * 100 : 0 }))
      .sort((a, b) => b.valor - a.valor);
  }, [movimentos, filtroMes]);

  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ tipo: 'saida' as 'entrada' | 'saida', descricao: '', valor: '', categoria: 'despesa' as MovimentoCaixa['categoria'], formaPagamento: 'dinheiro' as MovimentoCaixa['formaPagamento'] });

  const exportarCSV = () => {
    const linhas = [
      ['Data', 'Tipo', 'Descrição', 'Categoria', 'Forma Pagamento', 'Valor'].join(';'),
      ...filtered.map((m) => [
        new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR'),
        m.tipo === 'entrada' ? 'Entrada' : 'Saída',
        `"${m.descricao.replace(/"/g, '""')}"`,
        m.categoria,
        m.formaPagamento ? (PAGAMENTO_LABELS[m.formaPagamento] || m.formaPagamento) : '',
        m.valor.toFixed(2).replace('.', ','),
      ].join(';')),
    ];
    const blob = new Blob(['\uFEFF' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caixa-${filtroMes}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} lançamentos exportados`);
  };

  const abrirNovaModal = () => {
    setEditandoId(null);
    setForm({ tipo: 'saida', descricao: '', valor: '', categoria: 'despesa', formaPagamento: 'dinheiro' });
    setShowModal(true);
  };

  const abrirEdicao = (m: MovimentoCaixa) => {
    setEditandoId(m.id);
    setForm({ tipo: m.tipo, descricao: m.descricao, valor: m.valor.toString(), categoria: m.categoria, formaPagamento: m.formaPagamento || 'dinheiro' });
    setShowModal(true);
  };

  const salvarMovimento = () => {
    if (!form.descricao.trim() || !form.valor) { toast.error('Descrição e valor são obrigatórios'); return; }
    const valor = parseFloat(form.valor);
    if (isNaN(valor) || valor <= 0) { toast.error('Valor inválido'); return; }
    if (editandoId) {
      setMovimentos?.(movimentos.map(m => m.id === editandoId ? { ...m, tipo: form.tipo, descricao: form.descricao, valor, categoria: form.categoria, formaPagamento: form.formaPagamento } : m));
      toast.success('Lançamento atualizado');
    } else {
      const novo: MovimentoCaixa = {
        id: newId('mov'), data: new Date().toISOString().slice(0, 10),
        tipo: form.tipo, descricao: form.descricao, valor,
        categoria: form.categoria, formaPagamento: form.formaPagamento,
        createdAt: new Date().toISOString(),
      };
      setMovimentos?.([...movimentos, novo]);
      toast.success(`${form.tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada`);
    }
    setShowModal(false);
    setEditandoId(null);
    setForm({ tipo: 'saida', descricao: '', valor: '', categoria: 'despesa', formaPagamento: 'dinheiro' });
  };

  // Ticket médio
  const ticketMedio = useMemo(() => {
    const ents = movimentos.filter((m) => m.data.startsWith(filtroMes) && m.tipo === 'entrada' && m.categoria === 'servico');
    return ents.length > 0 ? ents.reduce((s, m) => s + m.valor, 0) / ents.length : 0;
  }, [movimentos, filtroMes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Caixa</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGrafico(!showGrafico)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${showGrafico ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <BarChart2 className="h-3.5 w-3.5" /> Gráficos
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Exportar extrato como CSV"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          {setMovimentos && (
            <button onClick={abrirNovaModal} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
              <Plus className="h-4 w-4" /> Lançar
            </button>
          )}
        </div>
      </div>

      {/* Cards totais */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Entradas</p>
          <p className="text-xl font-bold text-emerald-600">R$ {totals.entradas.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Saídas</p>
          <p className="text-xl font-bold text-rose-600">R$ {totals.saidas.toFixed(2)}</p>
        </div>
        <div className={`rounded-2xl p-4 border ${totals.saldo >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50'}`}>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Saldo</p>
          <p className={`text-xl font-bold ${totals.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            R$ {totals.saldo.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Ticket médio */}
      {ticketMedio > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-fuchsia-600 shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Ticket médio dos serviços:</span>
          <span className="text-sm font-bold text-fuchsia-600">R$ {ticketMedio.toFixed(2)}</span>
        </div>
      )}

      {/* Gráficos */}
      {showGrafico && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Barras por dia */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Receita por dia</p>
            <div className="flex items-end gap-0.5 h-24 overflow-x-auto pb-1">
              {dadosDiarios.filter((d) => d.entrada > 0 || d.saida > 0).length === 0
                ? <p className="text-xs text-slate-400 w-full text-center self-center">Sem movimentos no mês</p>
                : dadosDiarios.map((d) => {
                  const hE = d.entrada > 0 ? Math.max(4, Math.round((d.entrada / maxDiario) * 88)) : 0;
                  const hS = d.saida > 0 ? Math.max(4, Math.round((d.saida / maxDiario) * 88)) : 0;
                  return (
                    <div key={d.dia} className="flex flex-col items-center gap-0.5 shrink-0" style={{ minWidth: '10px', flex: '1' }} title={`Dia ${d.dia}: +R$${d.entrada.toFixed(0)} -R$${d.saida.toFixed(0)}`}>
                      <div className="flex items-end gap-px w-full justify-center">
                        {hE > 0 && <div className="rounded-t w-[45%] bg-emerald-400 dark:bg-emerald-500" style={{ height: `${hE}px` }} />}
                        {hS > 0 && <div className="rounded-t w-[45%] bg-rose-400 dark:bg-rose-500" style={{ height: `${hS}px` }} />}
                        {hE === 0 && hS === 0 && <div className="w-[45%]" style={{ height: '2px' }} />}
                      </div>
                      <span className="text-[8px] text-slate-400 leading-none">{d.dia}</span>
                    </div>
                  );
                })
              }
            </div>
            <div className="flex gap-3 mt-2">
              <span className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />Entradas</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400"><span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />Saídas</span>
            </div>
          </div>

          {/* Formas de pagamento */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Formas de pagamento</p>
            {pagamentoStats.length === 0
              ? <p className="text-xs text-slate-400 text-center py-6">Sem entradas no mês</p>
              : (
                <div className="space-y-2.5">
                  {pagamentoStats.map(({ forma, valor, pct }) => (
                    <div key={forma}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{PAGAMENTO_LABELS[forma] || forma}</span>
                        <span className="text-xs text-slate-500">R$ {valor.toFixed(0)} · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: PAGAMENTO_CORES[forma] || '#94a3b8' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Filtros */}
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

      {/* Lista de movimentos */}
      <div className="space-y-2">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.tipo === 'entrada' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
              {m.tipo === 'entrada' ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-rose-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{m.descricao}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
                {m.formaPagamento && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: PAGAMENTO_CORES[m.formaPagamento] || '#94a3b8' }}
                  >
                    {PAGAMENTO_LABELS[m.formaPagamento] || m.formaPagamento}
                  </span>
                )}
              </div>
            </div>
            <p className={`text-sm font-bold shrink-0 ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {m.tipo === 'entrada' ? '+' : '-'}R$ {m.valor.toFixed(2)}
            </p>
            {setMovimentos && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => abrirEdicao(m)} className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20" title="Editar">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setConfirmExcluirId(m.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Excluir">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">Nenhum movimento encontrado.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editandoId ? 'Editar Movimento' : 'Lançar Movimento'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setForm({ ...form, tipo: 'entrada', categoria: 'servico' })} className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${form.tipo === 'entrada' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>+ Entrada</button>
                <button onClick={() => setForm({ ...form, tipo: 'saida', categoria: 'despesa' })} className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${form.tipo === 'saida' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>− Saída</button>
              </div>
              <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição *" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="Valor (R$) *" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as MovimentoCaixa['categoria'] })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                <option value="servico">Serviço</option>
                <option value="produto">Produto</option>
                <option value="despesa">Despesa</option>
                <option value="outro">Outro</option>
              </select>
              <select value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as MovimentoCaixa['formaPagamento'] })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={salvarMovimento} className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold">Registrar</button>
            </div>
          </div>
        </div>
      )}

      {confirmExcluirId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setConfirmExcluirId(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-3">
              <Trash2 className="h-5 w-5 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Excluir lançamento?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmExcluirId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button
                onClick={() => { setMovimentos?.(movimentos.filter((x) => x.id !== confirmExcluirId)); toast.success('Lançamento excluído'); setConfirmExcluirId(null); }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold"
              >Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
