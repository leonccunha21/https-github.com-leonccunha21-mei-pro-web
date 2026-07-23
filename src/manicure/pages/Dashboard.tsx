import { useState, useMemo } from 'react';
import { ManicureDb, AgendamentoManicure, MensagemEnviada, StatusAgendamento, MovimentoCaixa } from '../types';
import { newId } from '../localDb';
import { Calendar, Users, DollarSign, Scissors, Clock, Sparkles, Edit3, Trash2, MessageCircle, Check, X, TrendingUp, ShoppingBag, AlertTriangle, Gift, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';

type Tab = 'dashboard' | 'clientes' | 'agendamentos' | 'servicos' | 'caixa' | 'estoque' | 'configuracoes';

interface Props {
  db: ManicureDb;
  onNavigate: (tab: Tab) => void;
  setAgendamentos: (a: AgendamentoManicure[]) => void;
  setMovimentos: (m: MovimentoCaixa[]) => void;
  onAddMensagem: (m: MensagemEnviada) => void;
}

const STATUS_MAP: Record<StatusAgendamento, { label: string; color: string; dot: string }> = {
  agendado:     { label: 'Agendado',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',       dot: 'bg-blue-500'    },
  confirmado:   { label: 'Confirmado',  color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',   dot: 'bg-amber-500'   },
  em_andamento: { label: 'Em andamento',color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',dot: 'bg-purple-500'  },
  concluido:    { label: 'Concluído',   color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  cancelado:    { label: 'Cancelado',   color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',       dot: 'bg-rose-400'    },
};

export default function Dashboard({ db, onNavigate, setAgendamentos, setMovimentos, onAddMensagem }: Props) {
  const hoje = new Date().toISOString().slice(0, 10);
  const agendadosHoje = db.agendamentos.filter((a) => a.data === hoje && a.status !== 'cancelado');
  const concluidosHoje = db.agendamentos.filter((a) => a.data === hoje && a.status === 'concluido').length;
  const pendentesHoje = agendadosHoje.filter((a) => a.status !== 'concluido').length;

  const receitaHoje = db.movimentos
    .filter((m) => m.data === hoje && m.tipo === 'entrada')
    .reduce((s, m) => s + m.valor, 0);
  const clientesAtivos = db.clientes.length;
  const servicosAtivos = db.servicos.filter((s) => s.ativo).length;

  // Receita do mês
  const mesAtual = hoje.slice(0, 7);
  const receitaMes = db.movimentos
    .filter((m) => m.data.startsWith(mesAtual) && m.tipo === 'entrada')
    .reduce((s, m) => s + m.valor, 0);

  const [whatsAppTarget, setWhatsAppTarget] = useState<AgendamentoManicure | null>(null);
  const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null);
  const [pagamentoTarget, setPagamentoTarget] = useState<AgendamentoManicure | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<MovimentoCaixa['formaPagamento']>('dinheiro');
  const [valorPagamento, setValorPagamento] = useState('');

  // Aniversariantes dos próximos 7 dias
  const aniversariantes = useMemo(() => {
    const hoje7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    return db.clientes.filter((c) => {
      if (!(c as any).dataNascimento) return false;
      const mmdd = (c as any).dataNascimento.slice(5); // yyyy-mm-dd → mm-dd
      return hoje7.includes(mmdd);
    });
  }, [db.clientes]);

  // Produtos com estoque crítico
  const produtosCriticos = useMemo(() => {
    return db.produtos.filter((p) => p.quantidade <= p.estoqueMinimo);
  }, [db.produtos]);

  // Clientes sumidas há mais de 30 dias
  const clientesSumidas = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    const limiteStr = limite.toISOString().slice(0, 10);
    return db.clientes.filter((c) => {
      const ultimoAg = db.agendamentos
        .filter((a) => a.clienteId === c.id && a.status === 'concluido')
        .sort((a, b) => b.data.localeCompare(a.data))[0];
      return !ultimoAg || ultimoAg.data < limiteStr;
    }).slice(0, 5);
  }, [db.clientes, db.agendamentos]);

  const editarAgendamento = (ag: AgendamentoManicure) => {
    onNavigate('agendamentos');
    setTimeout(() => {
      localStorage.setItem('manicure_edit_agendamento', ag.id);
      window.dispatchEvent(new CustomEvent('manicure-edit-agendamento', { detail: ag.id }));
    }, 100);
  };

  const excluirAgendamento = (id: string) => {
    setConfirmExcluir(id);
  };

  const confirmarExclusao = () => {
    if (!confirmExcluir) return;
    setAgendamentos(db.agendamentos.filter((a) => a.id !== confirmExcluir));
    const movVinculados = db.movimentos.filter((m) => m.agendamentoId === confirmExcluir);
    if (movVinculados.length > 0) {
      setMovimentos(db.movimentos.filter((m) => m.agendamentoId !== confirmExcluir));
    }
    toast.success('Agendamento excluído');
    setConfirmExcluir(null);
  };

  const mudarStatus = (id: string, novoStatus: StatusAgendamento) => {
    if (novoStatus === 'concluido') {
      const ag = db.agendamentos.find((a) => a.id === id);
      if (ag) { setPagamentoTarget(ag); setFormaPagamento('dinheiro'); setValorPagamento(ag.valor.toFixed(2)); }
      return;
    }
    setAgendamentos(db.agendamentos.map((a) =>
      a.id === id ? { ...a, status: novoStatus, updatedAt: new Date().toISOString() } : a
    ));
    toast.success(`Status: ${STATUS_MAP[novoStatus].label}`);
  };

  const confirmarPagamento = () => {
    if (!pagamentoTarget) return;
    const ag = pagamentoTarget;
    const valor = parseFloat(valorPagamento);
    if (isNaN(valor) || valor <= 0) { toast.error('Valor inválido'); return; }
    setAgendamentos(db.agendamentos.map((a) => a.id === ag.id ? { ...a, status: 'concluido', updatedAt: new Date().toISOString() } : a));
    const jaTem = db.movimentos.some((m) => m.agendamentoId === ag.id);
    if (!jaTem) {
      setMovimentos([...db.movimentos, {
        id: newId('mov'), data: new Date().toISOString().slice(0, 10),
        tipo: 'entrada', descricao: `${ag.servicoNome} - ${ag.clienteNome}`,
        valor, categoria: 'servico', formaPagamento,
        clienteId: ag.clienteId, agendamentoId: ag.id, createdAt: new Date().toISOString(),
      }]);
    }
    toast.success('Serviço concluído e lançado no caixa!');
    setPagamentoTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-fuchsia-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Painel do Salão</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('agendamentos')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center mb-3 group-hover:bg-fuchsia-200 dark:group-hover:bg-fuchsia-900/50 transition-colors">
            <Calendar className="h-4 w-4 text-fuchsia-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{agendadosHoje.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Agendamentos<br/>Hoje</p>
          {pendentesHoje > 0 && (
            <span className="mt-2 inline-block text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">
              {pendentesHoje} pendente(s)
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('caixa')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">R$ {receitaHoje.toFixed(2)}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Receita<br/>Hoje</p>
          {concluidosHoje > 0 && (
            <span className="mt-2 inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
              {concluidosHoje} concluído(s)
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('clientes')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{clientesAtivos}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Clientes<br/>Cadastrados</p>
        </button>

        <button
          onClick={() => onNavigate('servicos')}
          className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
            <Scissors className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{servicosAtivos}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">Serviços<br/>Ativos</p>
        </button>
      </div>

      {/* Receita do mês */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-900/20 dark:to-purple-900/20 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-800/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-fuchsia-600" />
            <span className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">Receita do Mês</span>
          </div>
          <p className="text-xl font-bold text-fuchsia-900 dark:text-fuchsia-100">R$ {receitaMes.toFixed(2)}</p>
          <p className="text-[11px] text-fuchsia-600 dark:text-fuchsia-400 mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Estoque</span>
          </div>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{db.produtos.length}</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
            {db.produtos.filter((p) => p.quantidade <= p.estoqueMinimo).length > 0
              ? `${db.produtos.filter((p) => p.quantidade <= p.estoqueMinimo).length} item(ns) em falta`
              : 'Estoque OK'}
          </p>
        </div>
      </div>

      {/* Agenda de Hoje */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-fuchsia-600" />
            Agenda de Hoje
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 font-bold px-2.5 py-1 rounded-full">
              {agendadosHoje.length} agendamento(s)
            </span>
            <button
              onClick={() => onNavigate('agendamentos')}
              className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 hover:underline"
            >
              Ver todos →
            </button>
          </div>
        </div>

        {agendadosHoje.length === 0 ? (
          <div className="py-10 text-center">
            <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum agendamento para hoje.</p>
            <button
              onClick={() => onNavigate('agendamentos')}
              className="mt-3 text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700"
            >
              + Criar agendamento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {agendadosHoje
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map((ag) => (
                <div key={ag.id} className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  {/* Linha principal */}
                  <div className="flex items-center gap-3">
                    {/* Hora */}
                    <div className="shrink-0 w-12 text-center">
                      <Clock className="h-3.5 w-3.5 text-slate-400 mx-auto mb-0.5" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{ag.hora.slice(0,5)}</span>
                    </div>

                    {/* Linha divisória colorida por status */}
                    <div className={`w-1 h-10 rounded-full shrink-0 ${STATUS_MAP[ag.status].dot}`} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{ag.clienteNome}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ag.servicoNome}</p>
                    </div>

                    {/* Valor + Status */}
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-emerald-600">R$ {ag.valor.toFixed(2)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_MAP[ag.status].color}`}>
                        {STATUS_MAP[ag.status].label}
                      </span>
                    </div>
                  </div>

                  {/* Rodapé de ações — sempre visível */}
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex-wrap">
                    {/* WhatsApp */}
                    <button
                      onClick={() => ag.telefoneCliente ? setWhatsAppTarget(ag) : toast.error('Cliente sem telefone cadastrado')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        ag.telefoneCliente
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                      }`}
                      title={ag.telefoneCliente ? 'Enviar mensagem WhatsApp' : 'Sem telefone'}
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => editarAgendamento(ag)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30 hover:text-fuchsia-700 transition-colors"
                      title="Editar agendamento"
                    >
                      <Edit3 className="h-3 w-3" /> Editar
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => excluirAgendamento(ag.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>

                    {/* Status rápido — à direita */}
                    <div className="flex-1" />
                    {ag.status === 'agendado' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'confirmado')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-colors"
                      >
                        <Check className="h-3 w-3" /> Confirmar
                      </button>
                    )}
                    {ag.status === 'confirmado' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'em_andamento')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors"
                      >
                        <Check className="h-3 w-3" /> Iniciar
                      </button>
                    )}
                    {ag.status === 'em_andamento' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'concluido')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                      >
                        <Check className="h-3 w-3" /> Concluir
                      </button>
                    )}
                    {ag.status !== 'concluido' && ag.status !== 'cancelado' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'cancelado')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors"
                      >
                        <X className="h-3 w-3" /> Cancelar
                      </button>
                    )}
                    {ag.status === 'concluido' && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                        <Check className="h-3 w-3" /> Concluído
                      </span>
                    )}
                    {ag.status === 'cancelado' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'agendado')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Check className="h-3 w-3" /> Reagendar
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Produtos com Estoque Crítico */}
      {produtosCriticos.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-800/50 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-800/50">
            <Package className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Estoque Crítico</span>
            <span className="ml-auto text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">{produtosCriticos.length}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {produtosCriticos.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{p.nome}</p>
                  <p className="text-[11px] text-slate-400">{p.fornecedor || 'Sem fornecedor'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold ${p.quantidade === 0 ? 'text-rose-600' : 'text-amber-600'}`}>{p.quantidade} {p.unidade}</span>
                  <p className="text-[10px] text-slate-400">mín: {p.estoqueMinimo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aniversariantes da semana */}
      {aniversariantes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-800/50 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-fuchsia-50 dark:bg-fuchsia-900/20 border-b border-fuchsia-100 dark:border-fuchsia-800/50">
            <Gift className="h-4 w-4 text-fuchsia-600 shrink-0" />
            <span className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">Aniversariantes esta semana 🎂</span>
            <span className="ml-auto text-[10px] font-bold text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/30 px-2 py-0.5 rounded-full">{aniversariantes.length}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {aniversariantes.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">{c.nome.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{c.nome}</p>
                  <p className="text-[11px] text-slate-400">
                    🎂 {new Date((c as any).dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                  </p>
                </div>
                {c.telefone && (
                  <button
                    onClick={() => {
                      const fakeAg: AgendamentoManicure = {
                        id: '', clienteId: c.id, clienteNome: c.nome, telefoneCliente: c.telefone,
                        servicoId: '', servicoNome: '', valor: 0, status: 'agendado',
                        data: hoje, hora: '09:00', createdAt: '',
                      };
                      setWhatsAppTarget(fakeAg);
                    }}
                    className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-200 transition-colors shrink-0"
                    title="Enviar parabéns"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clientes para Reconquistar */}
      {clientesSumidas.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-800/50 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Clientes sem visita há 30+ dias</span>
            <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">{clientesSumidas.length}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {clientesSumidas.map((c) => {
              const ultimoAg = db.agendamentos
                .filter((a) => a.clienteId === c.id && a.status === 'concluido')
                .sort((a, b) => b.data.localeCompare(a.data))[0];
              const diasSemVisita = ultimoAg
                ? Math.floor((Date.now() - new Date(ultimoAg.data + 'T12:00:00').getTime()) / 86400000)
                : null;
              return (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">{c.nome.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{c.nome}</p>
                    <p className="text-[11px] text-slate-400">
                      {diasSemVisita !== null ? `Última visita: ${diasSemVisita} dias atrás` : 'Nunca veio'}
                    </p>
                  </div>
                  {c.telefone && (
                    <button
                      onClick={() => {
                        const fakeAg: AgendamentoManicure = {
                          id: '', clienteId: c.id, clienteNome: c.nome, telefoneCliente: c.telefone,
                          servicoId: '', servicoNome: '', valor: 0, status: 'agendado',
                          data: new Date().toISOString().slice(0, 10), hora: '09:00', createdAt: '',
                        };
                        setWhatsAppTarget(fakeAg);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-200 transition-colors shrink-0"
                      title="Enviar mensagem de retorno"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <WhatsAppMessageModal
        isOpen={!!whatsAppTarget}
        onClose={() => setWhatsAppTarget(null)}
        agendamento={whatsAppTarget!}
        templates={db.mensagemTemplates}
        instances={db.whatsappInstances}
        config={db.config}
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
                    <button key={v} onClick={() => setFormaPagamento(v)}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors ${formaPagamento === v ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Valor Cobrado (R$)</label>
                <input type="number" value={valorPagamento} onChange={(e) => setValorPagamento(e.target.value)}
                  min="0" step="0.01"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500" />
                {parseFloat(valorPagamento) !== pagamentoTarget.valor && (
                  <p className="text-[10px] text-amber-600 mt-1">Preço do serviço: R$ {pagamentoTarget.valor.toFixed(2)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setPagamentoTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
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
