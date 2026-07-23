import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { AgendamentoManicure, ClienteManicure, ServicoManicure, MovimentoCaixa, StatusAgendamento, MensagemTemplate, MensagemEnviada, ManicureWhatsAppInstance, ConfigManicure } from '../types';
import { newId } from '../localDb';
import { Calendar as CalendarIcon, Plus, Check, X, ChevronRight, ChevronLeft, MessageCircle, Edit3, Trash2 } from 'lucide-react';
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
  config: ConfigManicure;
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
  const [whatsAppTarget, setWhatsAppTarget] = useState<AgendamentoManicure | null>(null);
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [novoClienteForm, setNovoClienteForm] = useState({ nome: '', telefone: '' });
  const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null);
  // Modal de pagamento ao concluir
  const [pagamentoTarget, setPagamentoTarget] = useState<AgendamentoManicure | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<MovimentoCaixa['formaPagamento']>('dinheiro');
  const [valorPagamento, setValorPagamento] = useState('');

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

    // Aviso de conflito de horário
    const conflito = agendamentos.find((a) =>
      a.data === form.data &&
      a.hora === form.hora &&
      a.status !== 'cancelado' &&
      a.id !== editId
    );
    if (conflito) {
      toast(`⚠️ Já existe um agendamento às ${form.hora} para ${conflito.clienteNome}`, { icon: '⚠️', duration: 4000 });
    }

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
    setConfirmExcluir(id);
  };

  const confirmarExclusao = () => {
    if (!confirmExcluir) return;
    setAgendamentos(agendamentos.filter((a) => a.id !== confirmExcluir));
    const movVinculados = movimentos.filter((m) => m.agendamentoId === confirmExcluir);
    if (movVinculados.length > 0) {
      setMovimentos(movimentos.filter((m) => m.agendamentoId !== confirmExcluir));
    }
    toast.success('Agendamento excluído');
    setConfirmExcluir(null);
  };

  const mudarStatus = (id: string, novoStatus: StatusAgendamento) => {
    const ag = agendamentos.find((a) => a.id === id);
    if (!ag) return;

    if (novoStatus === 'concluido') {
      // Abre modal de pagamento antes de concluir
      setPagamentoTarget(ag);
      setFormaPagamento('dinheiro');
      setValorPagamento(ag.valor.toFixed(2));
      return;
    }

    setAgendamentos(agendamentos.map((a) => a.id === id ? { ...a, status: novoStatus, updatedAt: new Date().toISOString() } : a));
    toast.success(`Status alterado para "${STATUS_MAP[novoStatus].label}"`);
  };

  const confirmarPagamento = () => {
    if (!pagamentoTarget) return;
    const ag = pagamentoTarget;
    const valor = parseFloat(valorPagamento);
    if (isNaN(valor) || valor <= 0) { toast.error('Valor inválido'); return; }

    setAgendamentos(agendamentos.map((a) => a.id === ag.id ? { ...a, status: 'concluido', updatedAt: new Date().toISOString() } : a));

    const jaTem = movimentos.some((m) => m.agendamentoId === ag.id);
    if (!jaTem) {
      const mov: MovimentoCaixa = {
        id: newId('mov'), data: new Date().toISOString().slice(0, 10),
        tipo: 'entrada', descricao: `${ag.servicoNome} - ${ag.clienteNome}`,
        valor, categoria: 'servico', formaPagamento,
        clienteId: ag.clienteId, agendamentoId: ag.id, createdAt: new Date().toISOString(),
      };
      setMovimentos([...movimentos, mov]);
    }
    toast.success('Serviço concluído e lançado no caixa!');
    setPagamentoTarget(null);
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
        <button onClick={() => openNew(selectedDate)} className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-sm font-bold transition-colors">
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
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all overflow-hidden"
          >
            {/* Barra de status colorida no topo */}
            <div className={`h-1.5 w-full ${STATUS_MAP[ag.status].dot}`} />

            <div className="p-4">
              {/* Linha principal: hora + info + valor */}
              <div className="flex items-start gap-3">
                {/* Hora em destaque */}
                <div className="shrink-0 w-14 text-center pt-0.5">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight font-mono">{ag.hora.slice(0, 5)}</span>
                  <p className="text-[9px] text-slate-400 uppercase mt-0.5">horário</p>
                </div>

                <div className="w-px self-stretch bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />

                {/* Info do agendamento */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{ag.clienteNome}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_MAP[ag.status].color}`}>
                      {STATUS_MAP[ag.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ag.servicoNome}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-sm font-bold text-emerald-600">R$ {ag.valor.toFixed(2)}</span>
                    {ag.telefoneCliente && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />{ag.telefoneCliente}
                      </span>
                    )}
                  </div>
                  {ag.observacoes && (
                    <p className="text-xs text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                      📝 {ag.observacoes}
                    </p>
                  )}
                </div>
              </div>

              {/* Rodapé de ações — sempre visível */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex-wrap">
                {/* Botão WhatsApp em destaque */}
                <button
                  onClick={() => ag.telefoneCliente ? setWhatsAppTarget(ag) : toast.error('Cliente sem telefone cadastrado')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    ag.telefoneCliente
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                  }`}
                  title={ag.telefoneCliente ? 'Enviar mensagem WhatsApp' : 'Sem telefone cadastrado'}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </button>

                {/* Botão Editar */}
                <button
                  onClick={() => openEdit(ag)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 transition-colors"
                  title="Editar agendamento"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar
                </button>

                {/* Botão Excluir */}
                <button
                  onClick={() => excluirAgendamento(ag.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                  title="Excluir agendamento"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>

                {/* Separador + botões de status rápido — à direita */}
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  {ag.status === 'agendado' && (
                    <button
                      onClick={() => mudarStatus(ag.id, 'confirmado')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-colors"
                      title="Confirmar presença"
                    >
                      <Check className="h-3 w-3" /> Confirmar
                    </button>
                  )}
                  {ag.status === 'confirmado' && (
                    <button
                      onClick={() => mudarStatus(ag.id, 'em_andamento')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors"
                      title="Iniciar atendimento"
                    >
                      <Check className="h-3 w-3" /> Iniciar
                    </button>
                  )}
                  {ag.status === 'em_andamento' && (
                    <button
                      onClick={() => mudarStatus(ag.id, 'concluido')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                      title="Concluir atendimento"
                    >
                      <Check className="h-3 w-3" /> Concluir
                    </button>
                  )}
                  {ag.status !== 'concluido' && ag.status !== 'cancelado' && (
                    <button
                      onClick={() => mudarStatus(ag.id, 'cancelado')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors"
                      title="Cancelar agendamento"
                    >
                      <X className="h-3 w-3" /> Cancelar
                    </button>
                  )}
                  {ag.status === 'concluido' && (
                    <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                      <Check className="h-3 w-3" /> Concluído
                    </span>
                  )}
                  {ag.status === 'cancelado' && (
                    <button
                      onClick={() => mudarStatus(ag.id, 'agendado')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Reagendar"
                    >
                      <Check className="h-3 w-3" /> Reagendar
                    </button>
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

      {/* Modal de Confirmação de Exclusão */}
      {confirmExcluir && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setConfirmExcluir(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-3">
              <Trash2 className="h-5 w-5 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Excluir agendamento?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Esta ação não pode ser desfeita. O lançamento no caixa vinculado também será removido.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmExcluir(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={confirmarExclusao} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento ao Concluir */}
      {pagamentoTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setPagamentoTarget(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Concluir Serviço</h3>
                <p className="text-xs text-slate-500">{pagamentoTarget.clienteNome} · {pagamentoTarget.servicoNome}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { v: 'dinheiro', l: 'Dinheiro' },
                    { v: 'pix', l: 'Pix' },
                    { v: 'cartao_debito', l: 'Débito' },
                    { v: 'cartao_credito', l: 'Crédito' },
                    { v: 'transferencia', l: 'Transfer.' },
                  ] as { v: MovimentoCaixa['formaPagamento']; l: string }[]).map(({ v, l }) => (
                    <button
                      key={v}
                      onClick={() => setFormaPagamento(v)}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                        formaPagamento === v
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Valor Cobrado (R$)</label>
                <input
                  type="number"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {parseFloat(valorPagamento) !== pagamentoTarget.valor && (
                  <p className="text-[10px] text-amber-600 mt-1">Preço do serviço: R$ {pagamentoTarget.valor.toFixed(2)}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setPagamentoTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                Cancelar
              </button>
              <button onClick={confirmarPagamento} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2">
                <Check className="h-4 w-4" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
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
