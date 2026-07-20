import { useState, useEffect, useRef } from 'react';
import { Bot, Plus, Trash2, Brain, X, Sparkles, BookOpen, FileText, ChevronDown, ChevronUp, RefreshCw, Upload, Loader2, AlertTriangle, MessageSquare, Send, User } from 'lucide-react';
import type { AIAgent } from '../types';
import { rag, vpsHealth, VpsKnowledgeDoc, VPS_API_URL } from '../lib/vps';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIModuleProps {
  agents: AIAgent[];
  onSaveAgents: (agents: AIAgent[]) => void;
}

const MODEL_LABELS: Record<AIAgent['model'], string> = {
  'gpt-4o': 'GPT-4o (OpenAI)',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo (OpenAI)',
  'claude-3-opus': 'Claude 3 Opus (Anthropic)',
  'claude-3-sonnet': 'Claude 3 Sonnet (Anthropic)',
};

const MODEL_COLORS: Record<AIAgent['model'], string> = {
  'gpt-4o': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'gpt-3.5-turbo': 'bg-teal-50 text-teal-700 border-teal-200',
  'claude-3-opus': 'bg-violet-50 text-violet-700 border-violet-200',
  'claude-3-sonnet': 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function AIModule({ agents, onSaveAgents }: AIModuleProps) {
  const [showModal, setShowModal] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Omit<AIAgent, 'id' | 'createdAt'>>({
    name: '',
    objective: '',
    prompt: '',
    model: 'gpt-4o',
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.prompt.trim()) return;
    const newAgent: AIAgent = {
      ...form,
      id: `agent_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    onSaveAgents([newAgent, ...agents]);
    setForm({ name: '', objective: '', prompt: '', model: 'gpt-4o' });
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Remover este agente?')) return;
    onSaveAgents(agents.filter(a => a.id !== id));
  };

  const [vpsOnline, setVpsOnline] = useState<boolean | null>(null);
  const [docsByAgent, setDocsByAgent] = useState<Record<string, VpsKnowledgeDoc[]>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Chat RAG state
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, chatAgentId]);

  const handleSendMessage = async () => {
    if (!chatAgentId || !chatInput.trim() || chatLoading || !vpsOnline) return;
    const question = chatInput.trim();
    setChatInput('');
    const userMsg: ChatMessage = { id: `msg_${Date.now()}`, role: 'user', content: question, timestamp: Date.now() };
    setChats(prev => ({ ...prev, [chatAgentId]: [...(prev[chatAgentId] || []), userMsg] }));
    setChatLoading(true);
    try {
      const res = await rag.ask(chatAgentId, question);
      const asstMsg: ChatMessage = { id: `msg_${Date.now()}_r`, role: 'assistant', content: res.answer, timestamp: Date.now() };
      setChats(prev => ({ ...prev, [chatAgentId]: [...(prev[chatAgentId] || []), asstMsg] }));
    } catch (e: any) {
      const errMsg: ChatMessage = { id: `msg_${Date.now()}_e`, role: 'assistant', content: `Erro: ${e.message}. Verifique se o backend RAG está ativo.`, timestamp: Date.now() };
      setChats(prev => ({ ...prev, [chatAgentId]: [...(prev[chatAgentId] || []), errMsg] }));
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => { vpsHealth().then(h => setVpsOnline(h.ok)); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const loadDocs = async (agentId: string) => {
    if (!vpsOnline) return;
    try {
      const docs = await rag.listDocuments(agentId);
      setDocsByAgent(prev => ({ ...prev, [agentId]: docs }));
    } catch { /* ignora */ }
  };

  const handleUploadDoc = async (agentId: string, file: File) => {
    if (!vpsOnline) { showToast('Backend (VPS) offline: não é possível enviar documentos agora.'); return; }
    setUploadingId(agentId);
    try {
      const doc = await rag.uploadDocument(agentId, file);
      setDocsByAgent(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), doc] }));
      showToast(`Documento "${file.name}" enviado para a base de conhecimento.`);
    } catch (e: any) {
      showToast(`Falha ao enviar documento: ${e.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';
  const btnPrimary = 'px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer disabled:opacity-50';
  const btnSecondary = 'px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors cursor-pointer';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-600" />
              Inteligência Artificial
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Configure agentes e bases de conhecimento</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Novo Agente
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Backend Notice */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-violet-800">Maestro RAG — Integração com Backend</p>
            <p className="text-xs text-violet-600 mt-1">
              O pipeline de RAG (busca semântica em documentos) requer <b>PostgreSQL + pgvector</b> na VPS.
              Configure os agentes aqui agora; quando o backend estiver pronto, eles serão sincronizados e ficarão ativos.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Agentes Criados', value: agents.length, icon: Bot, color: 'text-violet-600 bg-violet-50' },
            { label: 'Base de Conhecimento', value: '0 docs', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Status do Backend', value: 'Pendente', icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Agents list */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Agentes Configurados</h2>
          {agents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-violet-300" />
              </div>
              <p className="text-sm font-bold text-slate-600">Nenhum agente criado</p>
              <p className="text-xs text-slate-400 mt-1">Clique em "Novo Agente" para definir comportamento, objetivo e modelo de IA.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map(agent => (
                <div key={agent.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{agent.objective || 'Sem objetivo definido'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${MODEL_COLORS[agent.model]}`}>
                      {MODEL_LABELS[agent.model]}
                    </span>
                    <button onClick={e => { e.stopPropagation(); handleDelete(agent.id); }} className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {expandedAgent === agent.id ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                  </div>
                  {expandedAgent === agent.id && (
                    <div className="border-t border-slate-100">
                      <div className="px-4 py-4 bg-slate-50">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prompt de Comportamento</p>
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap bg-white border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto font-sans">{agent.prompt}</pre>
                      </div>

                      {/* Chat RAG */}
                      <div className="border-t border-slate-100">
                        <button
                          onClick={() => setChatAgentId(chatAgentId === agent.id ? null : agent.id)}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="h-4 w-4 text-violet-500" />
                          {chatAgentId === agent.id ? 'Fechar Chat' : 'Abrir Chat RAG'}
                        </button>
                        {chatAgentId === agent.id && (
                          <div className="border-t border-slate-100">
                            <div className="h-64 overflow-y-auto p-3 space-y-2 bg-white">
                              {(!chats[agent.id] || chats[agent.id].length === 0) ? (
                                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                                  {vpsOnline ? 'Faça uma pergunta ao agente' : 'Backend offline — o chat requer VPS ativa'}
                                </div>
                              ) : (
                                chats[agent.id].map(msg => (
                                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                      <div className="flex items-center gap-1.5 mb-1">
                                        {msg.role === 'assistant' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                        <span className="font-bold opacity-70">{msg.role === 'user' ? 'Você' : agent.name}</span>
                                      </div>
                                      <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                  </div>
                                ))
                              )}
                              {chatLoading && (
                                <div className="flex gap-2 justify-start">
                                  <div className="max-w-[80%] rounded-xl px-3 py-2 bg-slate-100 text-xs">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Bot className="h-3 w-3 text-slate-500" />
                                      <span className="font-bold text-slate-500">{agent.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                                      <span className="text-slate-400">Pensando...</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div ref={chatEndRef} />
                            </div>
                            <div className="border-t border-slate-100 p-3 flex gap-2 bg-slate-50">
                              <input
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite sua pergunta..."
                                disabled={!vpsOnline || chatLoading}
                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white disabled:opacity-50"
                              />
                              <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim() || chatLoading || !vpsOnline}
                                className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Base Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Base de Conhecimento (RAG)</h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              vpsOnline ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200'
            }`}>
              {vpsOnline ? 'VPS online' : 'VPS offline'}
            </span>
          </div>
          {agents.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
              <p className="text-xs text-slate-400">Crie um agente primeiro para enviar documentos à sua base de conhecimento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map(agent => {
                const docs = docsByAgent[agent.id] || [];
                return (
                  <div key={agent.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-violet-500" />{agent.name}
                      </p>
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        vpsOnline ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}>
                        {uploadingId === agent.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        Enviar documento
                        <input
                          type="file"
                          accept=".pdf,.txt,.csv"
                          className="hidden"
                          disabled={!vpsOnline || uploadingId === agent.id}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadDoc(agent.id, f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                    {docs.length === 0 ? (
                      <p className="text-xs text-slate-400">Nenhum documento ainda.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {docs.map(d => (
                          <div key={d.id} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                            <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold truncate">{d.filename}</span>
                            <span className="text-slate-400 ml-auto shrink-0">{d.chunks} trechos</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className={`mt-3 rounded-xl p-3 flex items-start gap-2 border text-xs ${
            vpsOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            {vpsOnline ? <BookOpen className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
            <span>
              {vpsOnline
                ? <>Pipeline de RAG ativo em <code className="text-[11px]">{VPS_API_URL}</code>. Os documentos são processados (PostgreSQL + pgvector) e usados como contexto nas respostas.</>
                : <>Backend (VPS) offline. Ao subir a VPS em <code className="text-[11px]">{VPS_API_URL}</code>, o envio de documentos e o RAG real passam a funcionar.</>}
            </span>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* --- MODAL: Novo Agente --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-violet-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Novo Agente de IA</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nome do Agente *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Agente de Vendas, Suporte ao Cliente..." className={inputClass} autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Modelo de IA</label>
                <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value as AIAgent['model'] }))} className={inputClass}>
                  {Object.entries(MODEL_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Objetivo</label>
                <input value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} placeholder="Ex: Responder dúvidas sobre produtos e preços..." className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Prompt de Comportamento *</label>
                <textarea
                  value={form.prompt}
                  onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                  placeholder="Descreva como o agente deve se comportar, o tom de voz, as regras de resposta, o que pode e não pode dizer..."
                  rows={6}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3 justify-end shrink-0 border-t border-slate-100 pt-4">
              <button onClick={() => setShowModal(false)} className={btnSecondary}>Cancelar</button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.prompt.trim()} className={`${btnPrimary} bg-violet-600 hover:bg-violet-700`}>
                Salvar Agente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
