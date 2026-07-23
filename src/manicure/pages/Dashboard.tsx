import { useState } from 'react';
import { ManicureDb, AgendamentoManicure, MensagemEnviada } from '../types';
import { Calendar, Users, DollarSign, Scissors, Clock, Sparkles, MoreVertical, Edit3, Trash2, Send, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';

type Tab = 'dashboard' | 'clientes' | 'agendamentos' | 'servicos' | 'caixa' | 'estoque' | 'configuracoes';

interface Props {
  db: ManicureDb;
  onNavigate: (tab: Tab) => void;
  setAgendamentos: (a: AgendamentoManicure[]) => void;
  onAddMensagem: (m: MensagemEnviada) => void;
}

export default function Dashboard({ db, onNavigate, setAgendamentos, onAddMensagem }: Props) {
  const hoje = new Date().toISOString().slice(0, 10);
  const agendadosHoje = db.agendamentos.filter((a) => a.data === hoje && a.status !== 'cancelado');
  const receitaHoje = db.movimentos
    .filter((m) => m.data === hoje && m.tipo === 'entrada')
    .reduce((s, m) => s + m.valor, 0);
  const clientesAtivos = db.clientes.length;
  const servicosAtivos = db.servicos.filter((s) => s.ativo).length;

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [whatsAppTarget, setWhatsAppTarget] = useState<AgendamentoManicure | null>(null);

  const cards = [
    { label: 'Agendamentos Hoje', value: agendadosHoje.length, icon: Calendar, color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300', onClick: () => onNavigate('agendamentos') },
    { label: 'Receita Hoje', value: `R$ ${receitaHoje.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', onClick: () => onNavigate('caixa') },
    { label: 'Clientes Ativos', value: clientesAtivos, icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', onClick: () => onNavigate('clientes') },
    { label: 'Serviços', value: servicosAtivos, icon: Scissors, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', onClick: () => onNavigate('servicos') },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-fuchsia-600" />
        <h2 className="text-xl font-bold">Painel do Salão</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-fuchsia-600" />
            Agenda de Hoje
          </h3>
          <span className="text-xs text-slate-400 bg-fuchsia-50 dark:bg-fuchsia-900/30 px-2 py-0.5 rounded-full">
            {agendadosHoje.length} agendamento(s)
          </span>
        </div>
        {agendadosHoje.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-6 text-center">Nenhum agendamento para hoje.</p>
        ) : (
          <div className="space-y-2">
            {agendadosHoje
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map((ag) => (
                <div key={ag.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 w-14">{ag.hora}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{ag.clienteNome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ag.servicoNome}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">R$ {ag.valor.toFixed(2)}</span>

                  <div className="flex items-center gap-1">
                    {ag.telefoneCliente ? (
                      <button
                        onClick={() => setWhatsAppTarget(ag)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Enviar mensagem WhatsApp"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 w-16 text-center">Sem tel.</span>
                    )}

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
                          <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 min-w-[140px]">
                            <button
                              onClick={() => editarAgendamento(ag)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => excluirAgendamento(ag.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Excluir
                            </button>
                            {ag.telefoneCliente && (
                              <button
                                onClick={() => { setMenuOpen(null); setWhatsAppTarget(ag); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              >
                                <Smartphone className="h-3.5 w-3.5" /> WhatsApp
                              </button>
                            )}
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
