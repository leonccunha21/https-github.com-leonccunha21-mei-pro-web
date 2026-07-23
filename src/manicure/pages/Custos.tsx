import { useState, useMemo } from 'react';
import { MovimentoCaixa } from '../types';
import { newId } from '../localDb';
import { TrendingDown, Plus, Search, X, Pencil, Trash2, PieChart, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  movimentos: MovimentoCaixa[];
  setMovimentos: (m: MovimentoCaixa[]) => void;
}

const CATEGORIAS = [
  { value: 'despesa', label: 'Despesa', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700' },
  { value: 'produto', label: 'Produto', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' },
  { value: 'servico', label: 'Serviço', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' },
  { value: 'outro', label: 'Outro', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600' },
];

export default function Custos({ movimentos, setMovimentos }: Props) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [busca, setBusca] = useState('');
  const [filtroCat, setFiltroCat] = useState<string>('todas');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ descricao: '', valor: '', categoria: 'despesa' as MovimentoCaixa['categoria'] });
  const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null);

  const custos = useMemo(() => {
    const prefix = `${ano}-${String(mes + 1).padStart(2, '0')}`;
    return movimentos.filter((m) => m.tipo === 'saida' && m.data.startsWith(prefix));
  }, [movimentos, mes, ano]);

  const filtered = useMemo(() => {
    return custos.filter((m) => {
      if (filtroCat !== 'todas' && m.categoria !== filtroCat) return false;
      if (busca && !m.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.data.localeCompare(a.data));
  }, [custos, filtroCat, busca]);

  const total = filtered.reduce((s, m) => s + m.valor, 0);

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of custos) {
      map.set(m.categoria, (map.get(m.categoria) || 0) + m.valor);
    }
    return Array.from(map.entries()).map(([cat, valor]) => ({
      categoria: cat,
      label: CATEGORIAS.find((c) => c.value === cat)?.label || cat,
      valor,
      color: CATEGORIAS.find((c) => c.value === cat)?.color || '',
    }));
  }, [custos]);

  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const navigarMes = (dir: number) => {
    let novoMes = mes + dir;
    let novoAno = ano;
    if (novoMes < 0) { novoMes = 11; novoAno--; }
    if (novoMes > 11) { novoMes = 0; novoAno++; }
    setMes(novoMes); setAno(novoAno);
  };

  const openNew = () => {
    setEditId(null);
    setForm({ descricao: '', valor: '', categoria: 'despesa' });
    setShowModal(true);
  };

  const openEdit = (m: MovimentoCaixa) => {
    setEditId(m.id);
    setForm({ descricao: m.descricao, valor: String(m.valor), categoria: m.categoria });
    setShowModal(true);
  };

  const save = () => {
    if (!form.descricao.trim() || !form.valor) { toast.error('Preencha todos os campos'); return; }
    const valor = parseFloat(form.valor);
    if (isNaN(valor) || valor <= 0) { toast.error('Valor inválido'); return; }

    if (editId) {
      setMovimentos(movimentos.map((m) => m.id === editId ? { ...m, descricao: form.descricao, valor, categoria: form.categoria } : m));
      toast.success('Custo atualizado');
    } else {
      const novo: MovimentoCaixa = {
        id: newId('mov'), data: new Date().toISOString().slice(0, 10),
        tipo: 'saida', descricao: form.descricao, valor,
        categoria: form.categoria, formaPagamento: 'dinheiro',
        createdAt: new Date().toISOString(),
      };
      setMovimentos([...movimentos, novo]);
      toast.success('Custo registrado');
    }
    setShowModal(false);
  };

  const excluir = (id: string) => {
    setConfirmExcluir(id);
  };

  const confirmarExclusao = () => {
    if (!confirmExcluir) return;
    setMovimentos(movimentos.filter((m) => m.id !== confirmExcluir));
    toast.success('Custo excluído');
    setConfirmExcluir(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <TrendingDown className="h-6 w-6 text-rose-600" />
          <h2 className="text-xl font-bold">Custos</h2>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" /> Novo Custo
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => navigarMes(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><span className="text-lg">‹</span></button>
          <span className="text-sm font-bold min-w-[100px] text-center">{MESES[mes]} {ano}</span>
          <button onClick={() => navigarMes(1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><span className="text-lg">›</span></button>
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFiltroCat('todas')} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${filtroCat === 'todas' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>Todas</button>
          {CATEGORIAS.map((c) => (
            <button key={c.value} onClick={() => setFiltroCat(c.value)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${filtroCat === c.value ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>{c.label}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-rose-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 col-span-2">
          <p className="text-xs text-slate-500 mb-1">Total de Custos</p>
          <p className="text-2xl font-bold text-rose-600">R$ {total.toFixed(2)}</p>
        </div>
        {porCategoria.map((c) => (
          <div key={c.categoria} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-rose-600">R$ {c.valor.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <TrendingDown className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{m.descricao}</p>
              <p className="text-xs text-slate-500">
                {new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${CATEGORIAS.find((c) => c.value === m.categoria)?.color}`}>
                  {CATEGORIAS.find((c) => c.value === m.categoria)?.label}
                </span>
              </p>
            </div>
            <p className="text-sm font-bold text-rose-600">- R$ {m.valor.toFixed(2)}</p>
            <div className="flex gap-1">
              <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => excluir(m.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">Nenhum custo encontrado.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editId ? 'Editar Custo' : 'Novo Custo'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição *" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500" />
              <input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="Valor (R$) *" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500" />
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as MovimentoCaixa['categoria'] })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500">
                {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm">Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold">{editId ? 'Atualizar' : 'Registrar'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmExcluir && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setConfirmExcluir(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-3">
              <Trash2 className="h-5 w-5 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Excluir custo?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmExcluir(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={confirmarExclusao} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
