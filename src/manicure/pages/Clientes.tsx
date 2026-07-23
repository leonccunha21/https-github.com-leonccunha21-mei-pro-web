import { useState, useMemo, useEffect } from 'react';
import { ClienteManicure, AgendamentoManicure, MovimentoCaixa } from '../types';
import { newId } from '../localDb';
import { Users, Plus, Search, Phone, Trash2, Edit3, Calendar, X, MessageCircle, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';
import { MensagemTemplate, ManicureWhatsAppInstance, MensagemEnviada, ConfigManicure } from '../types';

interface Props {
  clientes: ClienteManicure[];
  agendamentos: AgendamentoManicure[];
  movimentos?: MovimentoCaixa[];
  setClientes: (c: ClienteManicure[]) => void;
  onWhatsApp?: (ag: AgendamentoManicure) => void;
  templates?: MensagemTemplate[];
  instances?: ManicureWhatsAppInstance[];
  config?: ConfigManicure;
  onAddMensagem?: (m: MensagemEnviada) => void;
}

export default function Clientes({ clientes, agendamentos, movimentos = [], setClientes, onWhatsApp, templates = [], instances = [], config, onAddMensagem }: Props) {
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', endereco: '', observacoes: '', indicadoPor: '', dataNascimento: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [whatsAppTarget, setWhatsAppTarget] = useState<AgendamentoManicure | null>(null);

  const hoje = new Date().toISOString().slice(0, 10);

  // Recebe evento de abrir WhatsApp via customEvent (do App.tsx)
  useEffect(() => {
    const handler = (e: Event) => {
      const ag = (e as CustomEvent<AgendamentoManicure>).detail;
      if (ag) setWhatsAppTarget(ag);
    };
    window.addEventListener('manicure-whatsapp-cliente', handler);
    return () => window.removeEventListener('manicure-whatsapp-cliente', handler);
  }, []);

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(busca))
  );

  // Dados calculados por cliente
  const dadosCliente = useMemo(() => {
    const map = new Map<string, { totalGasto: number; totalVisitas: number; ultimaVisita: string | null; proximoAg: AgendamentoManicure | null }>();
    for (const c of clientes) {
      const ags = agendamentos.filter((a) => a.clienteId === c.id);
      const concluidos = ags.filter((a) => a.status === 'concluido').sort((a, b) => b.data.localeCompare(a.data));
      const futuros = ags
        .filter((a) => a.data >= hoje && a.status !== 'cancelado')
        .sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));
      const totalGasto = movimentos
        .filter((m) => m.clienteId === c.id && m.tipo === 'entrada')
        .reduce((s, m) => s + m.valor, 0);
      map.set(c.id, {
        totalGasto,
        totalVisitas: concluidos.length,
        ultimaVisita: concluidos[0]?.data ?? null,
        proximoAg: futuros[0] ?? null,
      });
    }
    return map;
  }, [clientes, agendamentos, movimentos, hoje]);

  const openNew = () => {
    setEditId(null); setForm({ nome: '', telefone: '', email: '', endereco: '', observacoes: '', indicadoPor: '', dataNascimento: '' });
    setShowModal(true);
  };

  const openEdit = (c: ClienteManicure) => {
    setEditId(c.id); setForm({ nome: c.nome, telefone: c.telefone || '', email: c.email || '', endereco: c.endereco || '', observacoes: c.observacoes || '', indicadoPor: c.indicadoPor || '', dataNascimento: c.dataNascimento || '' });
    setShowModal(true);
  };

  const save = () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return; }
    if (editId) {
      setClientes(clientes.map((c) => c.id === editId ? { ...c, nome: form.nome, telefone: form.telefone || undefined, email: form.email || undefined, endereco: form.endereco || undefined, observacoes: form.observacoes || undefined, indicadoPor: form.indicadoPor || undefined, dataNascimento: form.dataNascimento || undefined, updatedAt: new Date().toISOString() } : c));
      toast.success('Cliente atualizado');
    } else {
      const novo: ClienteManicure = { id: newId('cli'), nome: form.nome, telefone: form.telefone || undefined, email: form.email || undefined, endereco: form.endereco || undefined, observacoes: form.observacoes || undefined, indicadoPor: form.indicadoPor || undefined, dataNascimento: form.dataNascimento || undefined, createdAt: new Date().toISOString() };
      setClientes([...clientes, novo]);
      toast.success('Cliente cadastrada');
    }
    setShowModal(false);
  };

  const excluir = (id: string) => {
    const temAgendamentoAtivo = agendamentos.some(
      (a) => a.clienteId === id && (a.status === 'agendado' || a.status === 'confirmado' || a.status === 'em_andamento')
    );
    if (temAgendamentoAtivo) { toast.error('Cliente possui agendamentos ativos. Conclua ou cancele-os primeiro.'); setShowDeleteConfirm(null); return; }
    setClientes(clientes.filter((c) => c.id !== id));
    toast.success('Cliente removida');
    setShowDeleteConfirm(null);
  };

  const perfilCliente = perfilId ? clientes.find((c) => c.id === perfilId) : null;
  const perfilDados = perfilId ? dadosCliente.get(perfilId) : null;
  const perfilHistorico = perfilId
    ? agendamentos
        .filter((a) => a.clienteId === perfilId && a.status === 'concluido')
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, 10)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Clientes</h2>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{clientes.length}</span>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" /> Nova Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome ou telefone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
      </div>

      <div className="grid gap-3">
        {filtered.map((c) => {
          const d = dadosCliente.get(c.id);
          const proximo = d?.proximoAg;
          return (
            <div
              key={c.id}
              onClick={() => setPerfilId(c.id)}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-3 hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center shrink-0">
                <span className="text-base font-bold text-fuchsia-700 dark:text-fuchsia-300">{c.nome.charAt(0).toUpperCase()}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{c.nome}</p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {c.telefone && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                      <Phone className="h-2.5 w-2.5" />{c.telefone}
                    </span>
                  )}
                  {d && d.totalVisitas > 0 && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />{d.totalVisitas} visita{d.totalVisitas !== 1 ? 's' : ''}
                    </span>
                  )}
                  {d && d.totalGasto > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600">
                      R$ {d.totalGasto.toFixed(0)} total
                    </span>
                  )}
                </div>
                {/* Próximo agendamento */}
                {proximo && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 px-2 py-0.5 rounded-full">
                    <Clock className="h-2.5 w-2.5" />
                    <span className="text-[10px] font-bold">
                      Próx: {new Date(proximo.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {proximo.hora.slice(0,5)}
                    </span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20" title="Editar">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => setShowDeleteConfirm(c.id)} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Excluir">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
            {busca ? 'Nenhuma cliente encontrada.' : 'Nenhuma cliente cadastrada.'}
          </p>
        )}
      </div>

      {/* Modal de Perfil da Cliente */}
      {perfilCliente && perfilDados && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-0 sm:px-4" onClick={() => setPerfilId(null)}>
          <div className="w-full sm:max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-fuchsia-700 dark:text-fuchsia-300">{perfilCliente.nome.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{perfilCliente.nome}</h3>
                {perfilCliente.telefone && <p className="text-xs text-slate-500">{perfilCliente.telefone}</p>}
              </div>
              <div className="flex gap-1">
                {perfilCliente.telefone && (
                  <button
                    onClick={() => {
                      const fakeAg: AgendamentoManicure = {
                        id: '', clienteId: perfilCliente.id, clienteNome: perfilCliente.nome,
                        telefoneCliente: perfilCliente.telefone, servicoId: '', servicoNome: '',
                        valor: 0, status: 'agendado', data: hoje, hora: '09:00', createdAt: '',
                      };
                      setWhatsAppTarget(fakeAg);
                      setPerfilId(null);
                    }}
                    className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-200 transition-colors"
                    title="Enviar mensagem"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => { setPerfilId(null); openEdit(perfilCliente); }} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => setPerfilId(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{perfilDados.totalVisitas}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Visitas</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">R$ {perfilDados.totalGasto.toFixed(0)}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Total gasto</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {perfilDados.ultimaVisita
                    ? Math.floor((Date.now() - new Date(perfilDados.ultimaVisita + 'T12:00:00').getTime()) / 86400000)
                    : '—'}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">
                  {perfilDados.ultimaVisita ? 'Dias atrás' : 'Sem visita'}
                </p>
              </div>
            </div>

            {/* Próximo agendamento */}
            {perfilDados.proximoAg && (
              <div className="mx-4 mt-3 p-3 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-xl border border-fuchsia-200 dark:border-fuchsia-800/50 flex items-center gap-2">
                <Clock className="h-4 w-4 text-fuchsia-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-fuchsia-800 dark:text-fuchsia-200">Próximo agendamento</p>
                  <p className="text-[11px] text-fuchsia-600">
                    {new Date(perfilDados.proximoAg.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {perfilDados.proximoAg.hora.slice(0,5)} · {perfilDados.proximoAg.servicoNome}
                  </p>
                </div>
              </div>
            )}

            {/* Histórico de visitas */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Histórico de visitas
              </p>
              {perfilHistorico.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Nenhuma visita concluída ainda.</p>
              ) : (
                <div className="space-y-2">
                  {perfilHistorico.map((ag) => (
                    <div key={ag.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="w-1 h-8 rounded-full bg-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{ag.servicoNome}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} às {ag.hora.slice(0,5)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 shrink-0">R$ {ag.valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal editar/criar */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editId ? 'Editar Cliente' : 'Nova Cliente'}</h3>
            <div className="space-y-3">
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome *" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Endereço" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              {/* Data de Nascimento */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Data de Nascimento</label>
                <input
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
              {/* Indicada por — com autocomplete via datalist */}
              <div>
                <input
                  list="lista-clientes-indicacao"
                  value={form.indicadoPor}
                  onChange={(e) => setForm({ ...form, indicadoPor: e.target.value })}
                  placeholder="Indicada por (opcional)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
                <datalist id="lista-clientes-indicacao">
                  {clientes.filter((c) => c.id !== editId).map((c) => (
                    <option key={c.id} value={c.nome} />
                  ))}
                </datalist>
                {form.indicadoPor && clientes.some((c) => c.nome.toLowerCase() === form.indicadoPor.toLowerCase()) && (
                  <p className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">✓ Cliente cadastrada</p>
                )}
              </div>
              <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações" rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold">{editId ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}

      <WhatsAppMessageModal
        isOpen={!!whatsAppTarget}
        onClose={() => setWhatsAppTarget(null)}
        agendamento={whatsAppTarget!}
        templates={templates}
        instances={instances}
        config={config ?? { nomeSalao: '', profissional: '' }}
        onAddMensagem={onAddMensagem ?? (() => {})}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-rose-600 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Tem certeza que deseja remover esta cliente?</p>
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
