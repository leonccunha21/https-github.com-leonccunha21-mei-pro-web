import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { AgendamentoManicure, ClienteManicure, ServicoManicure, MovimentoCaixa, StatusAgendamento, MensagemTemplate, MensagemEnviada, ManicureWhatsAppInstance, ConfigManicure } from '../types';
import { newId } from '../localDb';
import { Calendar as CalendarIcon, Plus, Clock, Check, X, ChevronRight, ChevronLeft, MessageCircle, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';

interface Props {
  agendamentos: AgendamentoManicure[];
  clientes: ClienteManicure[];
  servicos: ServicoManicure[];
  setAgendamentos: (a: AgendamentoManicure[]) => void;
  setClientes: (c: ClienteManicure[]) => void;
  setMovimentos: (m: MovimentoCaixa[]) => void;
  movimentos: MovimentoCaixa[];
  instances: ManicureWhatsAppInstance[];
  templates: MensagemTemplate[];
  mensagensEnviadas: MensagemEnviada[];
  onAddMensagem: (m: MensagemEnviada) => void;
  config: { nomeSalao: string };
}

const STATUS_MAP: Record<StatusAgendamento, { label: string; color: string; dot: string }> = {
  agendado: { label: 'Agendado', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  confirmado: { label: 'Confirmado', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  em_andamento: { label: 'Em andamento', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  concluido: { label: 'Concluído', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  cancelado: { label: 'Cancelado', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300', dot: 'bg-rose-300' },
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function diasNoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate();
}

function primeiroDiaSemana(ano: number, mes: number) {
  return new Date(ano, mes, 1).getDay();
}

function formatDate(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export default function Agendamentos({ agendamentos, clientes, servicos, setAgendamentos, setClientes, setMovimentos, movimentos, instances, templates, mensagensEnviadas, onAddMensagem, config }: Props) {
  const hoje = new Date();
  const hojeStr = formatDate(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [selectedDate, setSelectedDate] = useState(hojeStr);
  const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | 'todos'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ clienteId: '', servicoId: '', data: '', hora: '', observacoes: '' });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [whatsAppTarget, setWhatsAppTarget] = useState<AgendamentoManicure | null>(null);
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [novoClienteForm, setNovoClienteForm] = useState({ nome: '', telefone: '' });

  useEffect(() => {
    const handler = () => {
      const storedId = localStorage.getItem('manicure_edit_agendamento');
      if (storedId) {
        localStorage.removeItem('manicure_edit_agendamento');
        const ag = agendamentos.find((a) => a.id === storedId);
        if (ag) openEdit(ag);
      }
    };
    window.addEventListener('manicure-edit-agendamento', handler);
    return () => window.removeEventListener('manicure-edit-agendamento', handler);
  }, [agendamentos]);

  const servicosAtivos = servicos.filter((s) => s.ativo);

  const agendamentosPorDia = useMemo(() => {
    const map = new Map<string, AgendamentoManicure[]>();
    for (const a of agendamentos) {
      if (a.status === 'cancelado') continue;
      const existentes = map.get(a.data) || [];
      existentes.push(a);
      map.set(a.data, existentes);
    }
    return map;
  }, [agendamentos]);

  const filtered = agendamentos.filter((a) => {
    if (a.data !== selectedDate) return false;
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false;
    return true;
  }).sort((a, b) => a.hora.localeCompare(b.hora));

  const totalDias = diasNoMes(ano, mes);
  const primeiroDia = primeiroDiaSemana(ano, mes);

  const navigarMes = (dir: number) => {
    let novoMes = mes + dir;
    let novoAno = ano;
    if (novoMes < 0) { novoMes = 11; novoAno--; }
    if (novoMes > 11) { novoMes = 0; novoAno++; }
    setMes(novoMes); setAno(novoAno);
  };

  const irHoje = () => {
    const d = new Date();
    setAno(d.getFullYear()); setMes(d.getMonth());
    setSelectedDate(formatDate(d.getFullYear(), d.getMonth(), d.getDate()));
  };

  const openNew = (data?: string) => {
    setEditId(null);
    setForm({ clienteId: '', servicoId: '', data: data || selectedDate, hora: '', observacoes: '' });
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
        telefoneCliente: cliente.telefone,
        servicoId: form.servicoId, servicoNome: servico.nome, valor: servico.preco,
        data: form.data, hora: form.hora, observacoes: form.observacoes,
        updatedAt: new Date().toISOString(),
      } : a));
      toast.success('Agendamento atualizado');
    } else {
      const novo: AgendamentoManicure = {
        id: newId('agd'), clienteId: form.clienteId, clienteNome: cliente.nome,
        telefoneCliente: cliente.telefone,
        servicoId: form.servicoId, servicoNome: servico.nome, valor: servico.preco,
        data: form.data, hora: form.hora, status: 'agendado',
        observacoes: form.observacoes, createdAt: new Date().toISOString(),
      };
      setAgendamentos([...agendamentos, novo]);
      toast.success('Agendamento criado');
    }
    setShowModal(false);
  };

  const excluirAgendamento = (id: string) => {
    setMenuOpen(null);
    if (!window.confirm('Excluir este agendamento?')) return;
    setAgendamentos(agendamentos.filter((a) => a.id !== id));
    const movVinculados = movimentos.filter((m) => m.agendamentoId === id);
    if (movVinculados.length > 0) {
      setMovimentos(movimentos.filter((m) => m.agendamentoId !== id));
    }
    toast.success('Agendamento excluído');
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

  const cells: ReactNode[] = [];
  for (let i = 0; i < primeiroDia; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }
  for (let dia = 1; dia <= totalDias; dia++) {
    const dataStr = formatDate(ano, mes, dia);
    const agsHoje = agendamentosPorDia.get(dataStr);
    const qtd = agsHoje?.length || 0;
    const isHoje = dataStr === hojeStr;
    const isSelected = dataStr === selectedDate;

    cells.push(
      <button
        key={dia}
        onClick={() => setSelectedDate(dataStr)}
        className={`relative flex flex-col items-center justify-center rounded-xl py-2 min-h-[56px] transition-all cursor-pointer
          ${isSelected
            ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30'
            : isHoje
              ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/50'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
      >
        <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>{dia}</span>
        {qtd > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {STATUS_AGRUPA(agsHoje!).slice(0, 3).map((cor, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${cor}`} />
            ))}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-fuchsia-600" />
          <h2 className="text-xl font-bold">Agenda</h2>
        </div>
        <button onClick={() => openNew()} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
          <Plus className="h-4 w-4" /> Novo Agendamento
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigarMes(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 min-w-[160px] text-center">
              {new Date(ano, mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => navigarMes(1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button onClick={irHoje} className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 px-3 py-1.5 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/20">
            Hoje
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{filtered.length} agendamento(s)</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['todos', 'agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
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
          <div
            key={ag.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all"
          >
            {/* Barra de status colorida no topo */}
            <div className={`h-1 w-full ${STATUS_MAP[ag.status].dot}`} />

            <div className="flex items-center gap-3 p-4">
              {/* Hora em destaque */}
              <div className="shrink-0 w-14 text-center">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{ag.hora.slice(0, 5)}</span>
                <p className="text-[9px] text-slate-400 uppercase mt-0.5">horário</p>
              </div>

              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />

              {/* Info do agendamento */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{ag.clienteNome}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_MAP[ag.status].color}`}>
                    {STATUS_MAP[ag.status].label}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ag.servicoNome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-emerald-600">R$ {ag.valor.toFixed(2)}</span>
                  {ag.telefoneCliente && (
                    <span className="text-[10px] text-slate-400">{ag.telefoneCliente}</span>
                  )}
                </div>
                {ag.observacoes && <p className="text-xs text-slate-400 mt-0.5 truncate italic">{ag.observacoes}</p>}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Status rápido */}
                {ag.status === 'agendado' && (
                  <button onClick={() => mudarStatus(ag.id, 'confirmado')} className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200" title="Confirmar">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {ag.status === 'confirmado' && (
                  <button onClick={() => mudarStatus(ag.id, 'concluido')} className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200" title="Concluir">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {ag.status !== 'concluido' && ag.status !== 'cancelado' && (
                  <button onClick={() => mudarStatus(ag.id, 'cancelado')} className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200" title="Cancelar">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* WhatsApp — sempre visível */}
                <button
                  onClick={() => ag.telefoneCliente ? setWhatsAppTarget(ag) : toast.error('Cliente sem telefone cadastrado')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    ag.telefoneCliente
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                  }`}
                  title={ag.telefoneCliente ? 'Enviar mensagem WhatsApp' : 'Sem telefone cadastrado'}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>

                {/* Mais opções */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === ag.id ? null : ag.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Mais opções"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {menuOpen === ag.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[160px]">
                        <button
                          onClick={() => { setMenuOpen(null); openEdit(ag); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => { setMenuOpen(null); setWhatsAppTarget(ag); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                            ag.telefoneCliente ? 'text-emerald-600' : 'text-slate-400 cursor-not-allowed opacity-50'
                          }`}
                          disabled={!ag.telefoneCliente}
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Enviar WhatsApp
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                        <button
                          onClick={() => excluirAgendamento(ag.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <CalendarIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum agendamento para esta data.</p>
            <button onClick={() => openNew()} className="mt-3 text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700">
              + Criar agendamento
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                  <option value="">Selecione o cliente</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.telefone ? ` - ${c.telefone}` : ''}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCliente(!showNewCliente)}
                  className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> {showNewCliente ? 'Cancelar' : '+ Novo Cliente'}
                </button>
                {showNewCliente && (
                  <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <input
                      value={novoClienteForm.nome}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, nome: e.target.value })}
                      placeholder="Nome do cliente *"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <input
                      value={novoClienteForm.telefone}
                      onChange={(e) => setNovoClienteForm({ ...novoClienteForm, telefone: e.target.value })}
                      placeholder="Telefone (com DDD)"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <button
                      onClick={() => {
                        if (!novoClienteForm.nome.trim()) { toast.error('Nome é obrigatório'); return; }
                        const novo: ClienteManicure = {
                          id: newId('cli'),
                          nome: novoClienteForm.nome.trim(),
                          telefone: novoClienteForm.telefone.trim() || undefined,
                          createdAt: new Date().toISOString(),
                        };
                        setClientes([...clientes, novo]);
                        setForm({ ...form, clienteId: novo.id });
                        setNovoClienteForm({ nome: '', telefone: '' });
                        setShowNewCliente(false);
                        toast.success('Cliente cadastrado!');
                      }}
                      className="w-full py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold"
                    >
                      Salvar Cliente
                    </button>
                  </div>
                )}
              </div>
              <select value={form.servicoId} onChange={(e) => setForm({ ...form, servicoId: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500">
                <option value="">Selecione o serviço</option>
                {servicosAtivos.map((s) => <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco.toFixed(2)}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
                <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
              </div>
              <textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Observações" rows={2} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold">{editId ? 'Atualizar' : 'Criar'}</button>
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
        config={config}
        onAddMensagem={onAddMensagem}
      />
    </div>
  );
}

function STATUS_AGRUPA(ags: AgendamentoManicure[]): string[] {
  const cores: string[] = [];
  for (const a of ags) {
    if (cores.length >= 3) break;
    cores.push(STATUS_MAP[a.status].dot);
  }
  return cores;
}
