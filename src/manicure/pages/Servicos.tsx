import { useState } from 'react';
import { ServicoManicure } from '../types';
import { newId } from '../localDb';
import { Scissors, Plus, Edit3, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  servicos: ServicoManicure[];
  setServicos: (s: ServicoManicure[]) => void;
}

const CATEGORIAS = [
  { value: 'unhas', label: 'Unhas' },
  { value: 'podologia', label: 'Podologia' },
  { value: 'estetica', label: 'Estética' },
  { value: 'maquiagem', label: 'Maquiagem' },
  { value: 'outro', label: 'Outro' },
] as const;

export default function Servicos({ servicos, setServicos }: Props) {
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', duracaoMinutos: '30', categoria: 'unhas' });

  const filtered = servicos.filter((s) => s.nome.toLowerCase().includes(busca.toLowerCase()));

  const openNew = () => {
    setEditId(null); setForm({ nome: '', descricao: '', preco: '', duracaoMinutos: '30', categoria: 'unhas' });
    setShowModal(true);
  };

  const openEdit = (s: ServicoManicure) => {
    setEditId(s.id); setForm({ nome: s.nome, descricao: s.descricao || '', preco: String(s.preco), duracaoMinutos: String(s.duracaoMinutos), categoria: s.categoria || 'unhas' });
    setShowModal(true);
  };

  const save = () => {
    if (!form.nome.trim() || !form.preco) { toast.error('Nome e preço são obrigatórios'); return; }
    const preco = parseFloat(form.preco);
    if (isNaN(preco) || preco <= 0) { toast.error('Preço inválido'); return; }
    if (editId) {
      setServicos(servicos.map((s) => s.id === editId ? { ...s, nome: form.nome, descricao: form.descricao || undefined, preco, duracaoMinutos: parseInt(form.duracaoMinutos) || 30, categoria: form.categoria as ServicoManicure['categoria'], updatedAt: new Date().toISOString() } : s));
      toast.success('Serviço atualizado');
    } else {
      const novo: ServicoManicure = { id: newId('ser'), nome: form.nome, descricao: form.descricao || undefined, preco, duracaoMinutos: parseInt(form.duracaoMinutos) || 30, categoria: form.categoria as ServicoManicure['categoria'], ativo: true, createdAt: new Date().toISOString() };
      setServicos([...servicos, novo]);
      toast.success('Serviço cadastrado');
    }
    setShowModal(false);
  };

  const toggleAtivo = (id: string) => {
    setServicos(servicos.map((s) => s.id === id ? { ...s, ativo: !s.ativo, updatedAt: new Date().toISOString() } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Scissors className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Serviços</h2>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{servicos.length}</span>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" /> Novo Serviço
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar serviço..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
      </div>

      <div className="grid gap-3">
        {filtered.map((s) => (
          <div key={s.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 border ${s.ativo ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 opacity-50'}`}>
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100">{s.nome}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {s.categoria && CATEGORIAS.find((c) => c.value === s.categoria)?.label}
                  {s.duracaoMinutos && ` · ${s.duracaoMinutos} min`}
                </p>
                {s.descricao && <p className="text-xs text-slate-400 mt-1">{s.descricao}</p>}
              </div>
              <p className="text-lg font-bold text-emerald-600">R$ {s.preco.toFixed(2)}</p>
              <button onClick={() => toggleAtivo(s.id)} className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${s.ativo ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {s.ativo ? 'Ativo' : 'Inativo'}
              </button>
              <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20"><Edit3 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
            {busca ? 'Nenhum serviço encontrado.' : 'Nenhum serviço cadastrado.'}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editId ? 'Editar Serviço' : 'Novo Serviço'}</h3>
            <div className="space-y-3">
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do serviço *" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input type="number" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} placeholder="Preço (R$) *" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input type="number" value={form.duracaoMinutos} onChange={(e) => setForm({ ...form, duracaoMinutos: e.target.value })} placeholder="Duração (minutos)" min="1" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição" rows={2} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold">{editId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
