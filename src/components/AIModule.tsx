import { useState } from 'react';
import { Bot, Plus, Trash2, Brain, X, Sparkles, BookOpen, FileText, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import type { AIAgent } from '../types';

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
                    <div className="border-t border-slate-100 px-4 py-4 bg-slate-50">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prompt de Comportamento</p>
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap bg-white border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto font-sans">{agent.prompt}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Base Section */}
        <div>
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Base de Conhecimento (RAG)</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 text-center space-y-3">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-7 w-7 text-indigo-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600">Envie documentos para treinar seus agentes</p>
                <p className="text-xs text-slate-400 mt-1">PDFs, TXTs e planilhas serão processados e usados como contexto nas respostas dos agentes.</p>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-slate-50">
                <BookOpen className="h-8 w-8 text-slate-300" />
                <p className="text-xs text-slate-400 font-bold">Arraste documentos aqui ou clique para selecionar</p>
                <p className="text-[10px] text-slate-300">Suporte a .pdf, .txt, .csv — máx. 10MB por arquivo</p>
                <div className="mt-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-xs text-indigo-600 font-bold text-center">⚡ Disponível quando o backend (VPS + pgvector) estiver ativo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
