import { useState, useRef, useEffect } from 'react';
import { ManicureWhatsAppInstance, MensagemTemplate, MensagemEnviada } from '../types';
import { newId } from '../localDb';
import { MessageCircle, Plus, QrCode, Trash2, Edit3, Power, PowerOff, Send, Check, X, Loader2, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  instances: ManicureWhatsAppInstance[];
  templates: MensagemTemplate[];
  mensagensEnviadas: MensagemEnviada[];
  onSaveInstances: (i: ManicureWhatsAppInstance[]) => void;
  onSaveTemplates: (t: MensagemTemplate[]) => void;
}

export default function WhatsAppConfig({ instances, templates, mensagensEnviadas, onSaveInstances, onSaveTemplates }: Props) {
  const instancesRef = useRef(instances);
  useEffect(() => { instancesRef.current = instances; }, [instances]);
  const templatesRef = useRef(templates);
  useEffect(() => { templatesRef.current = templates; }, [templates]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [connectingName, setConnectingName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', mensagem: '', ativo: true });

  const connectInstance = async () => {
    if (!connectingName.trim()) { toast.error('Nome da instância é obrigatório'); return; }
    setConnecting(true);
    try {
      const mod = await import('../../lib/vps');
      const result = await mod.whatsapp.connect(connectingName.trim());
      setQrCode(result.qrCode);
      onSaveInstances([...instancesRef.current, {
        id: result.instanceId, name: connectingName.trim(),
        status: 'CONNECTING', qrCode: result.qrCode, createdAt: new Date().toISOString(),
      }]);
      setConnectingName('');
      // Poll for connection status — BUG-FIX: poll vazava se o componente fosse desmontado.
      // Usar uma flag local para parar o interval mesmo sem cleanup via useEffect.
      let stopped = false;
      const poll = setInterval(async () => {
        if (stopped) { clearInterval(poll); return; }
        try {
          const list = await mod.whatsapp.list();
          const updated = list.find((i: any) => i.id === result.instanceId);
          if (updated && updated.status === 'CONNECTED') {
            clearInterval(poll);
            stopped = true;
            onSaveInstances(instancesRef.current.map((i) => i.id === result.instanceId ? { ...i, status: 'CONNECTED', qrCode: undefined } : i));
            toast.success('WhatsApp conectado!');
            setShowQrModal(false);
          }
        } catch { /* ignore */ }
      }, 2000);
      // Para o poll após 5 minutos (QR expira)
      setTimeout(() => { stopped = true; clearInterval(poll); }, 5 * 60 * 1000);
    } catch {
      toast.error('Não foi possível conectar. Verifique se o servidor VPS está rodando.');
      // Cria instância local mesmo sem VPS (modo demonstração)
      const idLocal = newId('wa_');
      onSaveInstances([...instancesRef.current, {
        id: idLocal, name: connectingName.trim(),
        status: 'CONNECTED', createdAt: new Date().toISOString(),
      }]);
      toast.success('Instância criada em modo local (sem VPS)');
      setShowQrModal(false);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectInstance = async (id: string) => {
    try {
      const mod = await import('../../lib/vps');
      await mod.whatsapp.disconnect(id);
    } catch { /* ignore */ }
    onSaveInstances(instances.map((i) => i.id === id ? { ...i, status: 'DISCONNECTED', qrCode: undefined } : i));
    toast.success('Instância desconectada');
  };

  const removeInstance = (id: string) => {
    onSaveInstances(instances.filter((i) => i.id !== id));
    toast.success('Instância removida');
  };

  const startEditingTemplate = (t: MensagemTemplate) => {
    setEditingTemplate(t.id);
    setEditForm({ nome: t.nome, mensagem: t.mensagem, ativo: t.ativo });
  };

  const saveTemplate = () => {
    if (!editForm.mensagem.trim()) { toast.error('Mensagem não pode ficar vazia'); return; }
    onSaveTemplates(templatesRef.current.map((t) => t.id === editingTemplate ? { ...t, nome: editForm.nome, mensagem: editForm.mensagem, ativo: editForm.ativo } : t));
    toast.success('Template salvo');
    setEditingTemplate(null);
  };

  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    CONNECTED: { label: 'Conectado', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    DISCONNECTED: { label: 'Desconectado', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
    CONNECTING: { label: 'Conectando...', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  };

  const instanceConectada = instances.find((i) => i.status === 'CONNECTED');

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-6 w-6 text-fuchsia-600" />
        <h2 className="text-xl font-bold">WhatsApp</h2>
      </div>

      {!instanceConectada && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-300">
          Nenhuma instância conectada. Conecte-se ao WhatsApp para enviar lembretes automáticos aos clientes.
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2"><Smartphone className="h-4 w-4 text-fuchsia-600" /> Instâncias</h3>
          <button onClick={() => setShowQrModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl text-xs font-bold">
            <Plus className="h-3.5 w-3.5" /> Nova Conexão
          </button>
        </div>
        {instances.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Nenhuma instância cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {instances.map((inst) => {
              const st = STATUS_LABEL[inst.status] || STATUS_LABEL.DISCONNECTED;
              return (
                <div key={inst.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${inst.status === 'CONNECTED' ? 'bg-emerald-500' : inst.status === 'CONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{inst.name}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {inst.status === 'CONNECTED' && (
                      <button onClick={() => disconnectInstance(inst.id)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20" title="Desconectar"><PowerOff className="h-4 w-4" /></button>
                    )}
                    {inst.status === 'DISCONNECTED' && (
                      <button onClick={async () => {
                        try {
                          const mod = await import('../../lib/vps');
                          const result = await mod.whatsapp.connect(inst.name);
                          onSaveInstances(instancesRef.current.map((i) => i.id === inst.id ? { ...i, status: 'CONNECTING', qrCode: result.qrCode } : i));
                          setQrCode(result.qrCode);
                          setShowQrModal(true);
                        } catch { toast.error('Erro ao reconectar'); }
                      }} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Reconectar"><Power className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => removeInstance(inst.id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2"><Edit3 className="h-4 w-4 text-fuchsia-600" /> Templates de Mensagens</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Use {'{{nome}}'}, {'{{salao}}'}, {'{{data}}'}, {'{{hora}}'} como variáveis que serão preenchidas automaticamente.
        </p>
        <div className="space-y-3">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              {editingTemplate === t.id ? (
                <div className="space-y-3">
                  <input value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
                  <textarea value={editForm.mensagem} onChange={(e) => setEditForm({ ...editForm, mensagem: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none" />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <input type="checkbox" checked={editForm.ativo} onChange={(e) => setEditForm({ ...editForm, ativo: e.target.checked })} className="rounded" />
                      Ativo
                    </label>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setEditingTemplate(null)} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs"><X className="h-3.5 w-3.5 inline" /> Cancelar</button>
                      <button onClick={saveTemplate} className="px-3 py-1.5 rounded-lg bg-fuchsia-600 text-white text-xs font-bold"><Check className="h-3.5 w-3.5 inline" /> Salvar</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${t.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.nome}</span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {t.tipo === 'lembrete_1dia' ? '1 dia antes' : t.tipo === 'lembrete_1hora' ? '1 hora antes' : t.tipo === 'confirmacao' ? 'confirmação' : 'personalizado'}
                      </span>
                    </div>
                    <button onClick={() => startEditingTemplate(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-fuchsia-600"><Edit3 className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">{t.mensagem}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de mensagens */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Send className="h-4 w-4 text-fuchsia-600" /> Últimas Mensagens Enviadas
          <span className="text-xs text-slate-400 font-normal ml-1">({mensagensEnviadas.length})</span>
        </h3>
        {mensagensEnviadas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Nenhuma mensagem enviada ainda.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {mensagensEnviadas.slice().reverse().slice(0, 20).map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <div className={`mt-0.5 ${m.status === 'enviado' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {m.status === 'enviado' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{m.clienteNome}</p>
                  <p className="text-[10px] text-slate-500">{m.tipo === 'lembrete_1dia' ? 'Lembrete 1 dia' : m.tipo === 'lembrete_1hora' ? 'Lembrete 1h' : m.tipo === 'manual' ? 'Manual' : 'Confirmação'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{m.mensagem}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{new Date(m.dataEnvio).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowQrModal(false)}>
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <QrCode className="h-10 w-10 text-fuchsia-600 mx-auto mb-4" />
            {qrCode ? (
              <>
                <h3 className="text-lg font-bold mb-2">Escaneie o QR Code</h3>
                <p className="text-xs text-slate-500 mb-4">Abra o WhatsApp no seu celular e escaneie este código</p>
                <img src={qrCode} alt="QR Code" className="mx-auto w-56 h-56 rounded-xl border border-slate-200 dark:border-slate-700" />
                <button onClick={() => setShowQrModal(false)} className="mt-4 w-full py-2.5 rounded-xl bg-fuchsia-600 text-white text-sm font-bold hover:bg-fuchsia-700">Concluído</button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-4">Nova Conexão WhatsApp</h3>
                <input value={connectingName} onChange={(e) => setConnectingName(e.target.value)} placeholder="Nome da instância (ex: Salão)" className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500 mb-4" />
                <button onClick={connectInstance} disabled={connecting} className="w-full py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  {connecting ? 'Conectando...' : 'Gerar QR Code'}
                </button>
                <button onClick={() => setShowQrModal(false)} className="mt-2 w-full py-2 rounded-xl text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
