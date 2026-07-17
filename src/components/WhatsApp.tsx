import React, { useState } from 'react';
import { Plus, Smartphone, Wifi, WifiOff, Loader2, MessageSquare, X, QrCode, Trash2, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import type { WhatsAppInstance } from '../types';

interface WhatsAppProps {
  instances: WhatsAppInstance[];
  onSaveInstances: (instances: WhatsAppInstance[]) => void;
}

const STATUS_CONFIG: Record<WhatsAppInstance['status'], { label: string; color: string; icon: React.FC<any> }> = {
  CONNECTED: { label: 'Conectado', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
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

  const handleAddInstance = () => {
    if (!instanceName.trim()) return;
    const newInstance: WhatsAppInstance = {
      id: `wa_${Date.now()}`,
      name: instanceName.trim(),
      status: 'DISCONNECTED',
      createdAt: new Date().toISOString(),
    };
    onSaveInstances([newInstance, ...instances]);
    setInstanceName('');
    setShowAddModal(false);
  };

  const handleConnect = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setShowQrModal(true);
    // Simulate CONNECTING state
    const updated = instances.map(i => i.id === instance.id ? { ...i, status: 'CONNECTING' as const } : i);
    onSaveInstances(updated);
  };

  const handleDisconnect = (id: string) => {
    if (!window.confirm('Desconectar esta instância?')) return;
    onSaveInstances(instances.map(i => i.id === id ? { ...i, status: 'DISCONNECTED' as const, qrCode: undefined } : i));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Remover esta instância do WhatsApp?')) return;
    onSaveInstances(instances.filter(i => i.id !== id));
  };

  const modalClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
  const cardClass = 'bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200';
  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const btnPrimary = 'px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer disabled:opacity-50';
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
        {/* Backend Notice */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-indigo-800">Integração com Evolution API</p>
            <p className="text-xs text-indigo-600 mt-1">Este módulo se conecta à <b>Evolution API</b> rodando na VPS. O QR Code e o status em tempo real serão fornecidos pelo backend quando estiver configurado. Por enquanto, gerencie as instâncias aqui.</p>
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
                        <button onClick={() => handleDisconnect(instance.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                          <WifiOff className="h-3.5 w-3.5" />
                          Desconectar
                        </button>
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
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Caixa de Entrada (Preview)</h2>
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
              <p className="text-xs text-slate-500"><b>Prévia de demonstração.</b> As mensagens reais serão carregadas via WebSocket quando o backend estiver ativo.</p>
            </div>
          </div>
        </div>
      </div>

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
              <button onClick={handleAddInstance} disabled={!instanceName.trim()} className={`${btnPrimary} bg-emerald-600 hover:bg-emerald-700`}>
                Adicionar Instância
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
              {/* QR Code Placeholder */}
              <div className="w-48 h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3">
                <QrCode className="h-16 w-16 text-slate-300" />
                <p className="text-xs text-slate-400 text-center px-4">QR Code gerado pela Evolution API (VPS)</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 text-center max-w-sm">
                <b>Backend pendente:</b> O QR Code real será exibido aqui quando a Evolution API estiver rodando na VPS e conectada a este painel.
              </div>
              <ol className="text-xs text-slate-500 space-y-1.5 self-start">
                <li className="flex items-start gap-2"><span className="font-bold text-slate-800 shrink-0">1.</span>Abra o WhatsApp no seu celular</li>
                <li className="flex items-start gap-2"><span className="font-bold text-slate-800 shrink-0">2.</span>Vá em Dispositivos Conectados &rarr; Conectar dispositivo</li>
                <li className="flex items-start gap-2"><span className="font-bold text-slate-800 shrink-0">3.</span>Aponte a câmera para o QR Code acima</li>
              </ol>
            </div>
            <div className="px-5 pb-5 flex justify-end">
              <button onClick={() => setShowQrModal(false)} className={btnSecondary}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
