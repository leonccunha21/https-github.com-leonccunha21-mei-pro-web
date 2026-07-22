import { useState } from 'react';
import { ClienteManicure, AgendamentoManicure } from '../types';
import { newId } from '../localDb';
import { Users, Plus, Search, Phone, Trash2, Edit3, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  clientes: ClienteManicure[];
  agendamentos: AgendamentoManicure[];
  setClientes: (c: ClienteManicure[]) => void;
}

export default function Clientes({ clientes, agendamentos, setClientes }: Props) {
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', endereco: '', observacoes: '', indicadoPor: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(busca))
  );

  const openNew = () => {
    setEditId(null); setForm({ nome: '', telefone: '', email: '', endereco: '', observacoes: '', indicadoPor: '' });
    setShowModal(true);
  };

  const openEdit = (c: ClienteManicure) => {
    setEditId(c.id); setForm({ nome: c.nome, telefone: c.telefone || '', email: c.email || '', endereco: c.endereco || '', observacoes: c.observacoes || '', indicadoPor: c.indicadoPor || '' });
    setShowModal(true);
  };

  const save = () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editId) {
      setClientes(clientes.map((c) => c.id === editId ? { ...c, ...form, updatedAt: new Date().toISOString() } : c));
      toast.success('Cliente atualizado');
    } else {
      const novo: ClienteManicure = { id: newId('cli'), nome: form.nome, telefone: form.telefone || undefined, email: form.email || undefined, endereco: form.endereco || undefined, observacoes: form.observacoes || undefined, indicadoPor: form.indicadoPor || undefined, createdAt: new Date().toISOString() };
      setClientes([...clientes, novo]);
      toast.success('Cliente cadastrado');
    }
    setShowModal(false);
  };

  const excluir = (id: string) => {
    // BUG-FIX: bloqueava exclusão se o cliente tinha QUALQUER agendamento histórico
    // (incluindo concluídos/cancelados). Agora só bloqueia se tiver agendamentos
    // futuros ou pendentes (agendado/confirmado/em_andamento).
    const temAgendamentoAtivo = agendamentos.some(
      (a) => a.clienteId === id && (a.status === 'agendado' || a.status === 'confirmado' || a.status === 'em_andamento')
    );
    if (temAgendamentoAtivo) { toast.error('Cliente possui agendamentos ativos. Conclua ou cancele-os primeiro.'); setShowDeleteConfirm(null); return; }
    setClientes(clientes.filter((c) => c.id !== id));
    toast.success('Cliente removido');
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Clientes</h2>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{clientes.length}</span>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((c) => {
          const qtdAgendamentos = agendamentos.filter((a) => a.clienteId === c.id).length;
          return (
            <div key={c.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">{c.nome.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.nome}</p>
                {c.telefone && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" /> {c.telefone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{qtdAgendamentos}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => setShowDeleteConfirm(c.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
            {busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <div className="space-y-3">
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome *" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Endereço" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input value={form.indicadoPor} onChange={(e) => setForm({ ...form, indicadoPor: e.target.value })} placeholder="Indicado por" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações" rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold">{editId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-rose-600 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Tem certeza que deseja remover este cliente?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm">Cancelar</button>
              <button onClick={() => excluir(showDeleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
