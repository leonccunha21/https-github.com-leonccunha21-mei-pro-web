import { useState } from 'react';
import { AgendamentoManicure, ClienteManicure, ServicoManicure, MovimentoCaixa, StatusAgendamento } from '../types';
import { newId } from '../localDb';
import { Calendar, Plus, Clock, Check, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  agendamentos: AgendamentoManicure[];
  clientes: ClienteManicure[];
  servicos: ServicoManicure[];
  setAgendamentos: (a: AgendamentoManicure[]) => void;
  setMovimentos: (m: MovimentoCaixa[]) => void;
  movimentos: MovimentoCaixa[];
}

const STATUS_MAP: Record<StatusAgendamento, { label: string; color: string }> = {
  agendado: { label: 'Agendado', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  confirmado: { label: 'Confirmado', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  em_andamento: { label: 'Em andamento', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  concluido: { label: 'Concluído', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  cancelado: { label: 'Cancelado', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
};

export default function Agendamentos({ agendamentos, clientes, servicos, setAgendamentos, setMovimentos, movimentos }: Props) {
  const [filtroData, setFiltroData] = useState(new Date().toISOString().slice(0, 10));
  const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | 'todos'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ clienteId: '', servicoId: '', data: '', hora: '', observacoes: '' });

  const servicosAtivos = servicos.filter((s) => s.ativo);

  const filtered = agendamentos.filter((a) => {
    if (a.data !== filtroData) return false;
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false;
    return true;
  }).sort((a, b) => a.hora.localeCompare(b.hora));

  const openNew = () => {
    setEditId(null);
    setForm({ clienteId: '', servicoId: '', data: filtroData, hora: '', observacoes: '' });
    setShowModal(true);
  };

  const openEdit = (a: AgendamentoManicure) => {
    setEditId(a.id);
    setForm({ clienteId: a.clienteId, servicoId: a.servicoId, data: a.data, hora: a.hora, observacoes: a.observacoes || '' });
    setShowModal(true);
  };

  const save = () => {
    if (!form.clienteId || !form.servicoId || !form.data || !form.hora) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    const cliente = clientes.find((c) => c.id === form.clienteId);
    const servico = servicosAtivos.find((s) => s.id === form.servicoId);
    if (!cliente || !servico) { toast.error('Cliente ou serviço inválido'); return; }

    if (editId) {
      setAgendamentos(agendamentos.map((a) => a.id === editId ? {
        ...a, clienteId: form.clienteId, clienteNome: cliente.nome,
        servicoId: form.servicoId, servicoNome: servico.nome, valor: servico.preco,
        data: form.data, hora: form.hora, observacoes: form.observacoes,
        updatedAt: new Date().toISOString(),
      } : a));
      toast.success('Agendamento atualizado');
    } else {
      const novo: AgendamentoManicure = {
        id: newId('agd'), clienteId: form.clienteId, clienteNome: cliente.nome,
        servicoId: form.servicoId, servicoNome: servico.nome, valor: servico.preco,
        data: form.data, hora: form.hora, status: 'agendado',
        observacoes: form.observacoes, createdAt: new Date().toISOString(),
      };
      setAgendamentos([...agendamentos, novo]);
      toast.success('Agendamento criado');
    }
    setShowModal(false);
  };

  const mudarStatus = (id: string, novoStatus: StatusAgendamento) => {
    const ag = agendamentos.find((a) => a.id === id);
    if (!ag) return;

    setAgendamentos(agendamentos.map((a) => a.id === id ? { ...a, status: novoStatus, updatedAt: new Date().toISOString() } : a));

    if (novoStatus === 'concluido') {
      const jaTem = movimentos.some((m) => m.agendamentoId === id);
      if (!jaTem) {
        const mov: MovimentoCaixa = {
          id: newId('mov'), data: new Date().toISOString().slice(0, 10),
          tipo: 'entrada', descricao: `${ag.servicoNome} - ${ag.clienteNome}`,
          valor: ag.valor, categoria: 'servico', formaPagamento: 'dinheiro',
          clienteId: ag.clienteId, agendamentoId: ag.id, createdAt: new Date().toISOString(),
        };
        setMovimentos([...movimentos, mov]);
      }
    }
    toast.success(`Status alterado para "${STATUS_MAP[novoStatus].label}"`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Agenda</h2>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" /> Novo Agendamento
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="date" value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        <div className="flex gap-1 flex-wrap">
          {(['todos', 'agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filtroStatus === s
                  ? 'bg-fuchsia-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'todos' ? 'Todos' : STATUS_MAP[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((ag) => (
          <div key={ag.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="text-center shrink-0">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{ag.hora.slice(0, 5)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{ag.clienteNome}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{ag.servicoNome} · R$ {ag.valor.toFixed(2)}</p>
                {ag.observacoes && <p className="text-xs text-slate-400 mt-0.5 truncate">{ag.observacoes}</p>}
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${STATUS_MAP[ag.status].color}`}>
                {STATUS_MAP[ag.status].label}
              </span>
              {ag.status === 'agendado' && (
                <div className="flex gap-1">
                  <button onClick={() => mudarStatus(ag.id, 'confirmado')} className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200" title="Confirmar"><Check className="h-3.5 w-3.5" /></button>
                  <button onClick={() => mudarStatus(ag.id, 'cancelado')} className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200" title="Cancelar"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}
              {ag.status === 'confirmado' && (
                <button onClick={() => mudarStatus(ag.id, 'concluido')} className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200" title="Concluir"><Check className="h-3.5 w-3.5" /></button>
              )}
              <button onClick={() => openEdit(ag)} className="p-1.5 rounded-lg text-slate-400 hover:text-fuchsia-600"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">Nenhum agendamento para esta data.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
            <div className="space-y-3">
              <select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select value={form.servicoId} onChange={(e) => setForm({ ...form, servicoId: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                <option value="">Selecione o serviço</option>
                {servicosAtivos.map((s) => <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco.toFixed(2)}</option>)}
              </select>
              <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações" rows={2} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold">{editId ? 'Atualizar' : 'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
