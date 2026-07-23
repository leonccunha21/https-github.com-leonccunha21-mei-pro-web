import { useState, useMemo } from 'react';
import { MovimentoCaixa } from '../types';
import { newId } from '../localDb';
import { DollarSign, TrendingUp, TrendingDown, Search, Plus, X, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  movimentos: MovimentoCaixa[];
  setMovimentos?: (m: MovimentoCaixa[]) => void;
}

export default function Caixa({ movimentos, setMovimentos }: Props) {
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

  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ tipo: 'saida' as 'entrada' | 'saida', descricao: '', valor: '', categoria: 'despesa' as MovimentoCaixa['categoria'], formaPagamento: 'dinheiro' as MovimentoCaixa['formaPagamento'] });

  const abrirNovaModal = () => {
    setEditandoId(null);
    setForm({ tipo: 'saida', descricao: '', valor: '', categoria: 'despesa', formaPagamento: 'dinheiro' });
    setShowModal(true);
  };

  const abrirEdicao = (m: MovimentoCaixa) => {
    setEditandoId(m.id);
    setForm({
      tipo: m.tipo,
      descricao: m.descricao,
      valor: m.valor.toString(),
      categoria: m.categoria,
      formaPagamento: m.formaPagamento || 'dinheiro'
    });
    setShowModal(true);
  };

  const salvarMovimento = () => {
    if (!form.descricao.trim() || !form.valor) { toast.error('Descrição e valor são obrigatórios'); return; }
    const valor = parseFloat(form.valor);
    if (isNaN(valor) || valor <= 0) { toast.error('Valor inválido'); return; }

    if (editandoId) {
      const editado = movimentos.map(m => m.id === editandoId ? {
        ...m, tipo: form.tipo, descricao: form.descricao, valor, categoria: form.categoria, formaPagamento: form.formaPagamento
      } : m);
      setMovimentos?.(editado);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Caixa</h2>
        </div>
        {setMovimentos && (
          <button onClick={abrirNovaModal} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
            <Plus className="h-4 w-4" /> Lançar movimento
          </button>
        )}
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
            {setMovimentos && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => abrirEdicao(m)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                  title="Editar lançamento"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => { if (window.confirm('Excluir este lançamento?')) setMovimentos(movimentos.filter((x) => x.id !== m.id)); }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  title="Excluir lançamento"
                >
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
                <button onClick={() => setForm({ ...form, tipo: 'entrada', categoria: 'servico' })} className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${form.tipo === 'entrada' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  + Entrada
                </button>
                <button onClick={() => setForm({ ...form, tipo: 'saida', categoria: 'despesa' })} className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${form.tipo === 'saida' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  − Saída
                </button>
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
    </div>
  );
}
