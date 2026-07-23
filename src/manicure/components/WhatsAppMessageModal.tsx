import { useState } from 'react';
import { AgendamentoManicure, MensagemTemplate, ManicureWhatsAppInstance, ConfigManicure, MensagemEnviada } from '../types';
import { newId } from '../localDb';
import { MessageCircle, Send, X, Loader2, Smartphone, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  agendamento: AgendamentoManicure;
  templates: MensagemTemplate[];
  instances: ManicureWhatsAppInstance[];
  config: ConfigManicure;
  onAddMensagem: (m: MensagemEnviada) => void;
}

function preencherTemplate(template: string, vars: Record<string, string>): string {
  let msg = template;
  for (const [key, value] of Object.entries(vars)) {
    msg = msg.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return msg;
}

export default function WhatsAppMessageModal({ isOpen, onClose, agendamento, templates, instances, config, onAddMensagem }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<MensagemTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<'template' | 'custom'>('template');

  if (!isOpen || !agendamento) return null;

  const instanceConectada = instances.find((i) => i.status === 'CONNECTED');
  const nomeCliente = agendamento.clienteNome.split(' ')[0];

  const vars = {
    nome: nomeCliente,
    salao: config.nomeSalao || 'Meu Salão',
    data: new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR'),
    hora: agendamento.hora.slice(0, 5),
  };

  const previewMessage = selectedTemplate
    ? preencherTemplate(selectedTemplate.mensagem, vars)
    : customMessage;

  const templatesAtivos = templates.filter((t) => t.ativo);

  const handleSend = async () => {
    const msg = previewMessage;
    if (!msg.trim()) { toast.error('Selecione um template ou escreva uma mensagem.'); return; }
    if (!agendamento.telefoneCliente) { toast.error('Cliente não possui telefone.'); return; }

    setSending(true);
    const numero = agendamento.telefoneCliente.replace(/\D/g, '');

    try {
      if (instanceConectada) {
        const mod = await import('../../lib/vps');
        await mod.whatsapp.send(instanceConectada.id, `55${numero}`, msg);
      } else {
        window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`, '_blank');
      }
      onAddMensagem({
        id: newId('msg'),
        agendamentoId: agendamento.id,
        clienteId: agendamento.clienteId,
        clienteNome: agendamento.clienteNome,
        tipo: selectedTemplate?.tipo === 'confirmacao' ? 'confirmacao' : selectedTemplate?.tipo === 'lembrete_1dia' ? 'lembrete_1dia' : 'manual',
        mensagem: msg,
        status: instanceConectada ? 'enviado' : 'enviado',
        dataEnvio: new Date().toISOString(),
      });
      toast.success(instanceConectada ? 'Mensagem enviada via WhatsApp!' : 'WhatsApp aberto para envio.');
      onClose();
    } catch {
      toast.error('Falha ao enviar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-fuchsia-600" />
            <h3 className="text-lg font-bold">Enviar Mensagem</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
          <p className="font-bold text-slate-900 dark:text-slate-100">{agendamento.clienteNome}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{agendamento.servicoNome} · {vars.data} às {vars.hora}</p>
          {agendamento.telefoneCliente ? (
            <p className="text-xs text-slate-400 mt-1">{agendamento.telefoneCliente}</p>
          ) : (
            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Sem telefone cadastrado</p>
          )}
        </div>

        {agendamento.telefoneCliente ? (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('template')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${mode === 'template' ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                Templates
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${mode === 'custom' ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
              >
                Personalizada
              </button>
            </div>

            {mode === 'template' && (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {templatesAtivos.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhum template ativo. Crie um nas configurações.</p>
                ) : (
                  templatesAtivos.map((t) => {
                    const isSelected = selectedTemplate?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.nome}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.mensagem}</p>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {mode === 'custom' && (
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none mb-4"
              />
            )}

            {previewMessage && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Preview</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{previewMessage}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !previewMessage.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? 'Enviando...' : instanceConectada ? 'Enviar via WhatsApp' : 'Abrir WhatsApp'}
              </button>
            </div>
            {!instanceConectada && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Sem instância conectada — será aberto o link do WhatsApp Web
              </p>
            )}
          </>
        ) : (
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
