import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Smartphone, Wifi, WifiOff, Loader2, MessageSquare, X, QrCode, Trash2, RefreshCw, CheckCircle2, Clock, Send, AlertTriangle } from 'lucide-react';
import type { WhatsAppInstance } from '../types';
import { whatsapp, vpsHealth, VpsWhatsAppInstance, VpsMessage, VPS_API_URL } from '../lib/vps';

interface WhatsAppProps {
  instances: WhatsAppInstance[];
  onSaveInstances: (instances: WhatsAppInstance[]) => void;
}

const STATUS_CONFIG: Record<WhatsAppInstance['status'], { label: string; color: string; icon: React.FC<any> }> = {
  CONNECTED: { label: 'conectado', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  DISCONNECTED: { label: 'Desconectado', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: WifiOff },
  CONNECTING: { label: 'Conectando...', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
};

const MOCK_MESSAGES = [
  { id: 1, name: 'João Silva', preview: 'Olá, preciso de um orçamento para...', time: '14:32', unread: 3 },
  { id: 2, name: 'Fernanda Lima', preview: 'Tudo certo! Pode confirmar o pedido?', time: '11:15', unread: 0 },
  { id: 3, name: 'Marcos Oliveira', preview: 'Quando fica pronto meu produto?', time: '10:02', unread: 1 },
];

export default function WhatsApp({ instances, onSaveInstances }: WhatsAppProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [instanceName, setInstanceName] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [vpsOnline, setVpsOnline] = useState<boolean | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [openChat, setOpenChat] = useState<VpsMessage[] | null>(null);
  const [chatName, setChatName] = useState('');
  const [message, setMessage] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const probeVps = useCallback(async () => {
    const health = await vpsHealth();
    setVpsOnline(health.ok);
  }, []);

  useEffect(() => { probeVps(); }, [probeVps]);

  const handleAddInstance = async () => {
    if (!instanceName.trim()) return;
    if (vpsOnline) {
      setBusy(true);
      try {
        const res = await whatsapp.connect(instanceName.trim());
        const inst: WhatsAppInstance = {
          id: res.instanceId,
          name: instanceName.trim(),
          status: 'CONNECTING',
          createdAt: new Date().toISOString(),
        };
        onSaveInstances([inst, ...instances]);
        setQrCode(res.qrCode);
        setSelectedInstance(inst);
        setShowQrModal(true);
      } catch (e: any) {
        showToast(`Falha ao conectar na VPS: ${e.message}`);
      } finally {
        setBusy(false);
      }
    } else {
      const newInstance: WhatsAppInstance = {
        id: `wa_${Date.now()}`,
        name: instanceName.trim(),
        status: 'DISCONNECTED',
        createdAt: new Date().toISOString(),
      };
      onSaveInstances([newInstance, ...instances]);
    }
    setInstanceName('');
    setShowAddModal(false);
  };

  const handleConnect = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setShowQrModal(true);
    if (vpsOnline) {
      setBusy(true);
      whatsapp.connect(instance.name)
        .then(res => { setQrCode(res.qrCode); onUpdate(instance.id, { status: 'CONNECTING', id: res.instanceId }); })
        .catch(e => showToast(`Falha ao gerar QR: ${e.message}`))
        .finally(() => setBusy(false));
    }
  };

  const onUpdate = (id: string, patch: Partial<WhatsAppInstance>) => {
    onSaveInstances(instances.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const handleDisconnect = async (id: string) => {
    if (!window.confirm('Desconectar esta instância?')) return;
    if (vpsOnline) {
      try { await whatsapp.disconnect(id); } catch (e: any) { showToast(`Falha ao desconectar: ${e.message}`); }
    }
    onUpdate(id, { status: 'DISCONNECTED', qrCode: undefined });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Remover esta instância do WhatsApp?')) return;
    onSaveInstances(instances.filter(i => i.id !== id));
  };

  const handleOpenChat = async (instance: WhatsAppInstance) => {
    setChatName(instance.name);
    if (vpsOnline) {
      try {
        const msgs = await whatsapp.messages(instance.id);
        if (msgs.length) {
          setOpenChat(msgs);
          return;
        }
      } catch { /* cai no mock */ }
    }
    setOpenChat(MOCK_MESSAGES as unknown as VpsMessage[]);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedInstance || !openChat) return;
    if (vpsOnline) {
      try {
        await whatsapp.send(selectedInstance.id, chatName, message.trim());
        showToast('Mensagem enviada pela VPS.');
      } catch (e: any) {
        showToast(`Falha ao enviar: ${e.message}`);
      }
    } else {
      showToast('modo local: envio simulado (sem VPS).');
    }
    setOpenChat([...openChat, {
      id: `m_${Date.now()}`, instanceId: selectedInstance.id, from: 'você', name: 'Você',
      preview: message.trim(), body: message.trim(), timestamp: Date.now(),
    }]);
    setMessage('');
  };

  const modalClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
  const cardClass = 'bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200';
  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const btnPrimary = 'px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer disabled:opacity-50';
  const btnSecondary = 'px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors cursor-pointer';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Atendimento WhatsApp
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Gerencie múltiplos números e atendimentos</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm">
            <Plus className="h-4 w-4" />
            Conectar WhatsApp
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Backend status */}
        <div className={`rounded-xl p-4 flex items-start gap-3 border ${
          vpsOnline === null ? 'bg-slate-50 border-slate-200'
          : vpsOnline ? 'bg-emerald-50 border-emerald-200'
          : 'bg-amber-50 border-amber-200'
        }`}>
          {vpsOnline === null ? <Loader2 className="h-5 w-5 text-slate-400 mt-0.5 shrink-0 animate-spin" />
            : vpsOnline ? <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
            : <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />}
          <div>
            <p className="text-sm font-bold text-slate-800">
              {vpsOnline === null ? 'Verificando backend (VPS)...'
                : vpsOnline ? 'Backend (VPS) conectado' : 'Backend (VPS) offline — Modo local'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {vpsOnline
                ? <>Integração ativa com a <b>Evolution API</b> em <code className="text-[11px]">{VPS_API_URL}</code>. QR Code e mensagens em tempo real.</>
                : <>A VPS não foi encontrada. As instâncias são gerenciadas localmente; ao subir a VPS em <code className="text-[11px]">{VPS_API_URL}</code>, o QR Code e o envio reais passam a funcionar.</>}
            </p>
          </div>
        </div>

        {/* Instances */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Instâncias Configuradas</h2>
          {instances.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-emerald-300" />
              </div>
              <p className="text-sm font-bold text-slate-600">Nenhum WhatsApp conectado</p>
              <p className="text-xs text-slate-400 mt-1">Clique em "Conectar WhatsApp" para adicionar um número.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instances.map(instance => {
                const cfg = STATUS_CONFIG[instance.status];
                const Icon = cfg.icon;
                return (
                  <div key={instance.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <Smartphone className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{instance.name}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {instance.status === 'DISCONNECTED' && (
                        <button onClick={() => handleConnect(instance)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                          <QrCode className="h-3.5 w-3.5" />
                          Conectar
                        </button>
                      )}
                      {instance.status === 'CONNECTED' && (
                        <>
                          <button onClick={() => handleOpenChat(instance)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Mensagens
                          </button>
                          <button onClick={() => handleDisconnect(instance.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                            <WifiOff className="h-3.5 w-3.5" />
                            Desconectar
                          </button>
                        </>
                      )}
                      {instance.status === 'CONNECTING' && (
                        <button disabled className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold opacity-70">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Aguardando
                        </button>
                      )}
                      <button onClick={() => handleDelete(instance.id)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inbox Preview */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Caixa de Entrada</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {MOCK_MESSAGES.map(msg => (
                <div key={msg.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-slate-400">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">{msg.name}</p>
                      <span className="text-[11px] text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{msg.preview}</p>
                  </div>
                  {msg.unread > 0 && (
                    <span className="w-5 h-5 bg-emerald-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {msg.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-slate-400" />
              <p className="text-xs text-slate-500">
                {vpsOnline ? <b>Mensagens em tempo real via VPS.</b> : <b>Prévia de demonstração.</b>} Clique em "Mensagens" em uma instância conectada para abrir o chat.
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* --- MODAL: Adicionar Instância --- */}
      {showAddModal && (
        <div className={modalClass} onClick={() => setShowAddModal(false)}>
          <div className={cardClass} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Nova Instância WhatsApp</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nome / Identificação *</label>
                <input
                  value={instanceName}
                  onChange={e => setInstanceName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddInstance()}
                  placeholder="Ex: Vendas Principal, Suporte, WhatsApp 2..."
                  className={inputClass}
                  autoFocus
                />
                <p className="text-xs text-slate-400">Um apelido para identificar este número no painel.</p>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className={btnSecondary}>Cancelar</button>
              <button onClick={handleAddInstance} disabled={!instanceName.trim() || busy} className={btnPrimary}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar Instância'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: QR Code --- */}
      {showQrModal && selectedInstance && (
        <div className={modalClass} onClick={() => setShowQrModal(false)}>
          <div className={cardClass} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Conectar: {selectedInstance.name}</h2>
              </div>
              <button onClick={() => setShowQrModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-8 flex flex-col items-center gap-5">
              {busy && !qrCode ? (
                <div className="w-48 h-48 bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-400">Gerando QR Code...</p>
                </div>
              ) : qrCode ? (
                <img src={qrCode} alt="QR Code WhatsApp" className="w-48 h-48 rounded-xl border border-slate-200 bg-white" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3">
                  <QrCode className="h-16 w-16 text-slate-300" />
                  <p className="text-xs text-slate-400 text-center px-4">QR Code gerado pela Evolution API (VPS)</p>
                </div>
              )}
              <div className={`px-4 py-3 text-xs text-center max-w-sm rounded-lg border ${
                vpsOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {vpsOnline
                  ? <><b>QR Code real da Evolution API.</b> Aponte a câmera do WhatsApp para conectar.</>
                  : <><b>Backend pendente:</b> O QR Code real será exibido aqui quando a VPS estiver online.</>}
              </div>
              <ol className="text-xs text-slate-500 space-y-1.5 self-start">
                <li className="flex items-start gap-2"><span className="font-bold text-slate-800 shrink-0">1.</span>Abra o WhatsApp no seu celular</li>
                <li className="flex items-start gap-2"><span className="font-bold text-slate-800 shrink-0">2.</span>Vá em Dispositivos conectados &rarr; Conectar dispositivo</li>
                <li className="flex items-start gap-2"><span className="font-bold text-slate-800 shrink-0">3.</span>Aponte a câmera para o QR Code acima</li>
              </ol>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button onClick={() => setShowQrModal(false)} className={btnSecondary}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Chat --- */}
      {openChat && (
        <div className={modalClass} onClick={() => setOpenChat(null)}>
          <div className={`${cardClass} max-w-md`} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">{chatName}</h2>
              </div>
              <button onClick={() => setOpenChat(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto bg-slate-50">
              {openChat.map(m => (
                <div key={m.id} className={`flex ${m.from === 'você' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                    m.from === 'você' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {m.body || m.preview}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Digite uma mensagem..."
                className={inputClass}
              />
              <button onClick={handleSend} disabled={!message.trim()} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
