import { ManicureDb } from '../types';
import { Calendar, Users, DollarSign, Scissors, Clock, Sparkles, MessageCircle, Send, MoreVertical, Smartphone } from 'lucide-react';

type Tab = 'dashboard' | 'clientes' | 'agendamentos' | 'servicos' | 'caixa' | 'estoque' | 'configuracoes';

interface Props {
  db: ManicureDb;
  onNavigate: (tab: Tab) => void;
}

export default function Dashboard({ db, onNavigate }: Props) {
  const hoje = new Date().toISOString().slice(0, 10);
  const agendadosHoje = db.agendamentos.filter((a) => a.data === hoje && a.status !== 'cancelado');
  const receitaHoje = db.movimentos
    .filter((m) => m.data === hoje && m.tipo === 'entrada')
    .reduce((s, m) => s + m.valor, 0);
  const clientesAtivos = db.clientes.length;
  const servicosAtivos = db.servicos.filter((s) => s.ativo).length;

  const cards = [
    { label: 'Agendamentos Hoje', value: agendadosHoje.length, icon: Calendar, color: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300', onClick: () => onNavigate('agendamentos') },
    { label: 'Receita Hoje', value: `R$ ${receitaHoje.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', onClick: () => onNavigate('caixa') },
    { label: 'Clientes Ativos', value: clientesAtivos, icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', onClick: () => onNavigate('clientes') },
    { label: 'Serviços', value: servicosAtivos, icon: Scissors, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', onClick: () => onNavigate('servicos') },
  ];

  // Helper to generate WhatsApp message for quick send
  const generateQuickMessage = (ag: any, tipo: 'confirmacao' | 'lembrete_1dia' | 'lembrete_1hora' | 'manual') => {
    const nomeCliente = ag.clienteNome.split(' ')[0];
    const vars = { 
      nome: nomeCliente, 
      salao: ag.servicoNome, 
      data: new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR'), 
      hora: ag.hora.slice(0, 5) 
    };
    
    if (tipo === 'confirmacao') {
      return `Olá ${nomeCliente}, seu agendamento (${ag.servicoNome}) está marcado para o dia ${vars.data} às ${vars.hora}. Confirme sua presença! 💅`;
    } else if (tipo === 'lembrete_1dia') {
      return `Olá ${nomeCliente}, passando para lembrar do seu agendamento (${ag.servicoNome}) amanhã às ${vars.hora}! Te esperamos. 💅`;
    } else if (tipo === 'lembrete_1hora') {
      return `Olá ${nomeCliente}, seu agendamento (${ag.servicoNome}) é daqui a 1 hora (${vars.hora})! Te esperamos. 💅`;
    }
    return `Olá ${nomeCliente}, seu agendamento (${ag.servicoNome}) é dia ${vars.data} às ${vars.hora}. 💅`;
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
                <div key={ag.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 w-14">{ag.hora}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{ag.clienteNome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ag.servicoNome}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">R$ {ag.valor.toFixed(2)}</span>
                  {ag.telefoneCliente ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const msg = generateQuickMessage(ag, 'confirmacao');
                          navigator.clipboard.writeText(msg);
                          window.open(`https://wa.me/55${ag.telefoneCliente.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Enviar Confirmação WhatsApp"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const msg = generateQuickMessage(ag, 'lembrete_1dia');
                          navigator.clipboard.writeText(msg);
                          window.open(`https://wa.me/55${ag.telefoneCliente.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Enviar Lembrete WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const msg = generateQuickMessage(ag, 'manual');
                          navigator.clipboard.writeText(msg);
                          window.open(`https://wa.me/55${ag.telefoneCliente.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        title="Mensagem Personalizada WhatsApp"
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Sem telefone</span>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
