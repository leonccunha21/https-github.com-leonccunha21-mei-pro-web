import { useState } from 'react';
import { ManicureDb, AgendamentoManicure, MensagemEnviada, StatusAgendamento } from '../types';
import { Calendar, Users, DollarSign, Scissors, Clock, Sparkles, MoreVertical, Edit3, Trash2, MessageCircle, Smartphone, Check, X, TrendingUp, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';

type Tab = 'dashboard' | 'clientes' | 'agendamentos' | 'servicos' | 'caixa' | 'estoque' | 'configuracoes';

interface Props {
  db: ManicureDb;
  onNavigate: (tab: Tab) => void;
  setAgendamentos: (a: AgendamentoManicure[]) => void;
  onAddMensagem: (m: MensagemEnviada) => void;
}

const STATUS_MAP: Record<StatusAgendamento, { label: string; color: string; dot: string }> = {
  agendado:     { label: 'Agendado',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',       dot: 'bg-blue-500'    },
  confirmado:   { label: 'Confirmado',  color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',   dot: 'bg-amber-500'   },
  em_andamento: { label: 'Em andamento',color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',dot: 'bg-purple-500'  },
  concluido:    { label: 'Concluído',   color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  cancelado:    { label: 'Cancelado',   color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',       dot: 'bg-rose-400'    },
};

export default function Dashboard({ db, onNavigate, setAgendamentos, onAddMensagem }: Props) {
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

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [whatsAppTarget, setWhatsAppTarget] = useState<AgendamentoManicure | null>(null);

  const editarAgendamento = (ag: AgendamentoManicure) => {
    setMenuOpen(null);
    onNavigate('agendamentos');
    setTimeout(() => {
      localStorage.setItem('manicure_edit_agendamento', ag.id);
      window.dispatchEvent(new CustomEvent('manicure-edit-agendamento', { detail: ag.id }));
    }, 100);
  };

  const excluirAgendamento = (id: string) => {
    setMenuOpen(null);
    if (!window.confirm('Excluir este agendamento?')) return;
    setAgendamentos(db.agendamentos.filter((a) => a.id !== id));
    toast.success('Agendamento excluído');
  };

  const mudarStatus = (id: string, novoStatus: StatusAgendamento) => {
    setMenuOpen(null);
    setAgendamentos(db.agendamentos.map((a) =>
      a.id === id ? { ...a, status: novoStatus, updatedAt: new Date().toISOString() } : a
    ));
    toast.success(`Status: ${STATUS_MAP[novoStatus].label}`);
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
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
                <div key={ag.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors relative">
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

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {/* Status rápido */}
                    {ag.status === 'agendado' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'confirmado')}
                        className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 hover:bg-amber-200 transition-colors"
                        title="Confirmar"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {ag.status === 'confirmado' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'concluido')}
                        className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        title="Concluir"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {ag.status !== 'cancelado' && ag.status !== 'concluido' && (
                      <button
                        onClick={() => mudarStatus(ag.id, 'cancelado')}
                        className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 hover:bg-rose-200 transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* WhatsApp — sempre visível, desabilitado se sem tel */}
                    <button
                      onClick={() => ag.telefoneCliente ? setWhatsAppTarget(ag) : toast.error('Cliente sem telefone cadastrado')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        ag.telefoneCliente
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                      title={ag.telefoneCliente ? 'Enviar mensagem WhatsApp' : 'Sem telefone cadastrado'}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </button>

                    {/* Menu de mais opções */}
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === ag.id ? null : ag.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Mais opções"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {menuOpen === ag.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[160px]">
                            <button
                              onClick={() => editarAgendamento(ag)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Editar
                            </button>
                            {ag.telefoneCliente && (
                              <button
                                onClick={() => { setMenuOpen(null); setWhatsAppTarget(ag); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              >
                                <Smartphone className="h-3.5 w-3.5" /> Enviar WhatsApp
                              </button>
                            )}
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
              ))}
          </div>
        )}
      </div>

      <WhatsAppMessageModal
        isOpen={!!whatsAppTarget}
        onClose={() => setWhatsAppTarget(null)}
        agendamento={whatsAppTarget!}
        templates={db.mensagemTemplates}
        instances={db.whatsappInstances}
        config={db.config}
        onAddMensagem={onAddMensagem}
      />
    </div>
  );
}
