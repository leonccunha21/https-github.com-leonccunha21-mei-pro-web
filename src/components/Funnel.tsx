import { useState, useMemo, useCallback } from 'react';
import { Plus, KanbanSquare, X, Trash2, Phone, Mail, Building2, DollarSign, ChevronRight, ArrowRight, User, Calendar, Filter, Search, Loader2 } from 'lucide-react';
import type { Opportunity, FunnelStage, FunnelStageDef, Lead } from '../types';

interface FunnelProps {
  opportunities: Opportunity[];
  leads: Lead[];
  onSaveOpportunities: (opps: Opportunity[]) => void;
}

const STAGES: FunnelStageDef[] = [
  { id: 'lead', name: 'Lead', color: 'border-t-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', order: 0 },
  { id: 'contacted', name: 'Contatado', color: 'border-t-sky-400', text: 'text-sky-600', bg: 'bg-sky-50', order: 1 },
  { id: 'qualification', name: 'Qualificação', color: 'border-t-violet-400', text: 'text-violet-600', bg: 'bg-violet-50', order: 2 },
  { id: 'proposal', name: 'Proposta', color: 'border-t-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', order: 3 },
  { id: 'negotiation', name: 'Negociação', color: 'border-t-orange-400', text: 'text-orange-600', bg: 'bg-orange-50', order: 4 },
  { id: 'won', name: 'Ganho', color: 'border-t-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', order: 5 },
  { id: 'lost', name: 'Perdido', color: 'border-t-rose-400', text: 'text-rose-600', bg: 'bg-rose-50', order: 6 },
];

const STAGE_MAP: Record<FunnelStage, FunnelStageDef> = STAGES.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {} as Record<FunnelStage, FunnelStageDef>);

const modalClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
const cardClass = 'bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200';
const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';
const btnPrimary = 'px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer disabled:opacity-50';
const btnSecondary = 'px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors cursor-pointer';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Funnel({ opportunities, leads, onSaveOpportunities }: FunnelProps) {
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFromLead, setSelectedFromLead] = useState<Lead | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'stage'>>({
    title: '',
    leadId: undefined,
    leadName: undefined,
    value: 0,
    owner: '',
    expectedCloseDate: '',
    notes: '',
  });

  const owners = useMemo(() => Array.from(new Set(opportunities.map(o => o.owner).filter(Boolean))) as string[], [opportunities]);

  const filtered = opportunities.filter(o => {
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !(o.leadName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (ownerFilter && o.owner !== ownerFilter) return false;
    return true;
  });

  const byStage = useMemo(() => {
    const map: Record<FunnelStage, Opportunity[]> = {
      lead: [], contacted: [], qualification: [], proposal: [], negotiation: [], won: [], lost: [],
    };
    for (const o of filtered) map[o.stage].push(o);
    return map;
  }, [filtered]);

  const totals = useMemo(() => {
    const open = opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost');
    const won = opportunities.filter(o => o.stage === 'won');
    const openValue = open.reduce((s, o) => s + o.value, 0);
    const wonValue = won.reduce((s, o) => s + o.value, 0);
    const conversion = opportunities.length ? Math.round((won.length / opportunities.length) * 100) : 0;
    return { openCount: open.length, openValue, wonCount: won.length, wonValue, conversion };
  }, [opportunities]);

  const openModalForNew = useCallback(() => {
    setSelectedFromLead(null);
    setForm({ title: '', leadId: undefined, leadName: undefined, value: 0, owner: '', expectedCloseDate: '', notes: '' });
    setShowModal(true);
  }, []);

  const openModalFromLead = useCallback((lead: Lead) => {
    setSelectedFromLead(lead);
    setForm({
      title: `Negócio: ${lead.name}`,
      leadId: lead.id,
      leadName: lead.name,
      value: 0,
      owner: '',
      expectedCloseDate: '',
      notes: '',
    });
    setShowModal(true);
  }, []);

  const handleSave = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const opp: Opportunity = {
      ...form,
      id: `opp_${Date.now()}`,
      stage: 'lead',
      createdAt: now,
      updatedAt: now,
    };
    onSaveOpportunities([opp, ...opportunities]);
    setShowModal(false);
  };

  const moveStage = useCallback((id: string, stage: FunnelStage) => {
    onSaveOpportunities(opportunities.map(o =>
      o.id === id ? { ...o, stage, updatedAt: new Date().toISOString() } : o
    ));
  }, [opportunities, onSaveOpportunities]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Remover esta oportunidade?')) return;
    onSaveOpportunities(opportunities.filter(o => o.id !== id));
  };

  const unconvertedLeads = leads.filter(l => !opportunities.some(o => o.leadId === l.id));

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <KanbanSquare className="h-5 w-5 text-indigo-600" />
              Funil de Vendas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} no pipeline</p>
          </div>
          <button onClick={openModalForNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm">
            <Plus className="h-4 w-4" />
            Nova Oportunidade
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Abertas', value: String(totals.openCount), sub: formatCurrency(totals.openValue), color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Ganhas', value: String(totals.wonCount), sub: formatCurrency(totals.wonValue), color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Conversão', value: `${totals.conversion}%`, sub: 'ganhas / total', color: 'text-violet-600 bg-violet-50' },
          { label: 'Total', value: String(opportunities.length), sub: 'oportunidades', color: 'text-slate-600 bg-slate-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-base font-bold text-slate-800">{stat.value}</p>
              <p className="text-[10px] text-slate-400 truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título ou lead..."
            className={inputClass + ' pl-9'}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className={inputClass + ' pl-9 pr-8'}>
            <option value="">Todos os donos</option>
            {owners.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
        <div className="flex gap-3 h-full min-h-[480px]">
          {STAGES.map(stage => {
            const def = STAGE_MAP[stage.id];
            const items = byStage[stage.id];
            const stageValue = items.reduce((s, o) => s + o.value, 0);
            return (
              <div
                key={stage.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (draggedId) { moveStage(draggedId, stage.id); setDraggedId(null); } }}
                className={`flex flex-col w-72 shrink-0 rounded-xl border border-slate-200 ${def.bg} border-t-4 ${def.color}`}
              >
                <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${def.text}`}>{stage.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-full px-1.5 py-0.5">{items.length}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{formatCurrency(stageValue)}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {items.length === 0 && (
                    <p className="text-[10px] text-slate-300 text-center py-6">Solte aqui</p>
                  )}
                  {items.map(o => (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={() => setDraggedId(o.id)}
                      onDragEnd={() => setDraggedId(null)}
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      className="bg-white rounded-lg border border-slate-200 shadow-sm p-2.5 cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 leading-snug">{o.title}</p>
                        <button onClick={e => { e.stopPropagation(); handleDelete(o.id); }} className="p-0.5 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {o.leadName && (
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />{o.leadName}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-emerald-600">{formatCurrency(o.value)}</span>
                        {o.owner && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <User className="h-3 w-3" />{o.owner}
                          </span>
                        )}
                      </div>
                      {expanded === o.id && (
                        <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500" onClick={e => e.stopPropagation()}>
                          {o.expectedCloseDate && (
                            <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />Previsão: {new Date(o.expectedCloseDate).toLocaleDateString('pt-BR')}</p>
                          )}
                          {o.notes && <p className="whitespace-pre-wrap bg-slate-50 rounded p-1.5">{o.notes}</p>}
                          <div className="flex gap-1 flex-wrap pt-1">
                            {STAGES.filter(s => s.id !== o.stage).map(s => (
                              <button
                                key={s.id}
                                onClick={() => moveStage(o.id, s.id)}
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${STAGE_MAP[s.id].text} ${STAGE_MAP[s.id].bg} border-current/20 hover:opacity-80`}
                              >
                                {s.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads não convertidos */}
      {unconvertedLeads.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl border border-dashed border-slate-300 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leads sem oportunidade ({unconvertedLeads.length})</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {unconvertedLeads.slice(0, 12).map(lead => (
                <button
                  key={lead.id}
                  onClick={() => openModalFromLead(lead)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  {lead.name}
                  {lead.phone && <Phone className="h-3 w-3 text-slate-400" />}
                  {lead.email && <Mail className="h-3 w-3 text-slate-400" />}
                  <ChevronRight className="h-3 w-3 text-indigo-400" />
                </button>
              ))}
              {unconvertedLeads.length > 12 && (
                <span className="text-xs text-slate-400 px-2 py-1.5">+{unconvertedLeads.length - 12} mais</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={modalClass} onClick={() => setShowModal(false)}>
          <div className={cardClass} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <KanbanSquare className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedFromLead ? `Nova Oportunidade · ${selectedFromLead.name}` : 'Nova Oportunidade'}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {!selectedFromLead && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lead de origem</label>
                  <select
                    value={form.leadId ?? ''}
                    onChange={e => {
                      const l = leads.find(x => x.id === e.target.value);
                      setForm(f => ({ ...f, leadId: l?.id, leadName: l?.name, title: l ? `Negócio: ${l.name}` : f.title }));
                    }}
                    className={inputClass}
                  >
                    <option value="">— Nenhum (oportunidade avulsa) —</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Título *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Contrato de manutenção anual" className={inputClass} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Valor (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) || 0 }))} className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Responsável</label>
                  <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="Ex: João" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Previsão de fechamento</label>
                <input type="date" value={form.expectedCloseDate ?? ''} onChange={e => setForm(f => ({ ...f, expectedCloseDate: e.target.value }))} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Observações</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={`${inputClass} resize-none`} placeholder="Próximos passos, contexto do negócio..." />
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-700 flex items-start gap-2">
                <Loader2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>A oportunidade inicia no estágio <b>Lead</b>. Arraste o card entre as colunas para atualizar o funil (backlog → ganho/perdido).</span>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className={btnSecondary}>Cancelar</button>
              <button onClick={handleSave} disabled={!form.title.trim()} className={btnPrimary}>Criar Oportunidade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
