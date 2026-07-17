import { useState, useCallback } from 'react';
import { Search, Plus, Trash2, Building2, Phone, Mail, Loader2, CheckCircle2, XCircle, Target, MapPin, X, ChevronRight, RefreshCw } from 'lucide-react';
import type { Lead, LeadExtractionJob } from '../types';

interface LeadsProps {
  leads: Lead[];
  leadJobs: LeadExtractionJob[];
  onSaveLeads: (leads: Lead[]) => void;
  onSaveLeadJobs: (jobs: LeadExtractionJob[]) => void;
}

const SOURCE_LABELS: Record<Lead['source'], string> = {
  GOOGLE_MAPS: 'Google Maps',
  SPREADSHEET: 'Planilha',
  INSTAGRAM: 'Instagram',
  MANUAL: 'Manual',
};

const SOURCE_COLORS: Record<Lead['source'], string> = {
  GOOGLE_MAPS: 'bg-blue-50 text-blue-700 border-blue-200',
  SPREADSHEET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INSTAGRAM: 'bg-pink-50 text-pink-700 border-pink-200',
  MANUAL: 'bg-slate-50 text-slate-700 border-slate-200',
};

const JOB_STATUS_COLORS: Record<LeadExtractionJob['status'], string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  RUNNING: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const JOB_STATUS_LABELS: Record<LeadExtractionJob['status'], string> = {
  PENDING: 'Na fila',
  RUNNING: 'Executando...',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
};

interface CnpjResult {
  nome?: string;
  fantasia?: string;
  telefone?: string;
  email?: string;
  cnpj?: string;
  situacao?: string;
}

export default function Leads({ leads, leadJobs, onSaveLeads, onSaveLeadJobs }: LeadsProps) {
  const [search, setSearch] = useState('');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showCnpjModal, setShowCnpjModal] = useState(false);

  // New Job form
  const [jobKeyword, setJobKeyword] = useState('');
  const [jobLocation, setJobLocation] = useState('');

  // Manual lead form
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCnpj, setManualCnpj] = useState('');

  // CNPJ lookup
  const [cnpjInput, setCnpjInput] = useState('');
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjResult, setCnpjResult] = useState<CnpjResult | null>(null);
  const [cnpjError, setCnpjError] = useState('');

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.cnpj || '').includes(search) ||
    (l.phone || '').includes(search)
  );

  const handleCreateJob = () => {
    if (!jobKeyword.trim() || !jobLocation.trim()) return;
    const newJob: LeadExtractionJob = {
      id: `job_${Date.now()}`,
      keyword: jobKeyword.trim(),
      location: jobLocation.trim(),
      status: 'PENDING',
      totalFound: 0,
      createdAt: new Date().toISOString(),
    };
    onSaveLeadJobs([newJob, ...leadJobs]);
    setJobKeyword('');
    setJobLocation('');
    setShowNewJobModal(false);
  };

  const handleAddManualLead = () => {
    if (!manualName.trim()) return;
    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      name: manualName.trim(),
      phone: manualPhone.trim() || undefined,
      email: manualEmail.trim() || undefined,
      cnpj: manualCnpj.replace(/\D/g, '').trim() || undefined,
      source: 'MANUAL',
      createdAt: new Date().toISOString(),
    };
    onSaveLeads([newLead, ...leads]);
    setManualName(''); setManualPhone(''); setManualEmail(''); setManualCnpj('');
    setShowManualModal(false);
  };

  const handleCnpjLookup = useCallback(async () => {
    const raw = cnpjInput.replace(/\D/g, '');
    if (raw.length !== 14) { setCnpjError('CNPJ deve ter 14 dígitos.'); return; }
    setCnpjLoading(true); setCnpjError(''); setCnpjResult(null);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
      if (!res.ok) throw new Error('CNPJ não encontrado.');
      const data = await res.json();
      setCnpjResult(data);
    } catch (e: any) {
      setCnpjError(e.message || 'Erro ao consultar CNPJ.');
    } finally {
      setCnpjLoading(false);
    }
  }, [cnpjInput]);

  const handleAddFromCnpj = () => {
    if (!cnpjResult) return;
    const name = (cnpjResult.fantasia && cnpjResult.fantasia.trim()) || cnpjResult.nome || '';
    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      name,
      phone: cnpjResult.telefone?.trim() || undefined,
      email: cnpjResult.email?.trim() || undefined,
      cnpj: cnpjResult.cnpj?.replace(/\D/g, '') || undefined,
      source: 'MANUAL',
      createdAt: new Date().toISOString(),
    };
    onSaveLeads([newLead, ...leads]);
    setCnpjInput(''); setCnpjResult(null); setCnpjError('');
    setShowCnpjModal(false);
  };

  const handleDeleteLead = (id: string) => {
    if (!window.confirm('Remover este lead?')) return;
    onSaveLeads(leads.filter(l => l.id !== id));
  };

  const handleDeleteJob = (id: string) => {
    onSaveLeadJobs(leadJobs.filter(j => j.id !== id));
  };

  const modalClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
  const cardClass = 'bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200';
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
              <Target className="h-5 w-5 text-indigo-600" />
              Leads
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{leads.length} lead{leads.length !== 1 ? 's' : ''} cadastrado{leads.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowCnpjModal(true)} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
              <Building2 className="h-3.5 w-3.5" />
              Buscar CNPJ
            </button>
            <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              Adicionar Manual
            </button>
            <button onClick={() => setShowNewJobModal(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm">
              <Search className="h-3.5 w-3.5" />
              Nova Varredura
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Jobs Section */}
        {leadJobs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">Varreduras Agendadas</h2>
              <span className="text-xs text-slate-400">{leadJobs.length} job{leadJobs.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {leadJobs.map(job => (
                <div key={job.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{job.keyword}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />{job.location}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${JOB_STATUS_COLORS[job.status]}`}>
                    {job.status === 'RUNNING' && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse mr-1" />}
                    {JOB_STATUS_LABELS[job.status]}
                  </span>
                  {job.status === 'COMPLETED' && (
                    <span className="text-xs text-slate-400">{job.totalFound} encontrados</span>
                  )}
                  <button onClick={() => handleDeleteJob(job.id)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
              <RefreshCw className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700"><b>Integração pendente:</b> O motor de varredura (Puppeteer) roda em VPS. Quando o backend estiver configurado, os jobs serão executados automaticamente aqui.</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar lead por nome, CNPJ ou telefone..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Leads Table */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-indigo-300" />
            </div>
            <p className="text-sm font-bold text-slate-600">Nenhum lead cadastrado ainda</p>
            <p className="text-xs text-slate-400 mt-1">Adicione manualmente, consulte um CNPJ ou crie uma varredura.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr,140px,160px,120px,40px] gap-4 px-4 py-2 border-b border-slate-100 bg-slate-50">
              {['Nome / Empresa', 'Telefone', 'Email', 'Origem', ''].map(h => (
                <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-slate-50">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="grid grid-cols-1 md:grid-cols-[1fr,140px,160px,120px,40px] gap-2 md:gap-4 items-center px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{lead.name}</p>
                    {lead.cnpj && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{lead.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    {lead.phone ? <><Phone className="h-3 w-3 text-slate-300" />{lead.phone}</> : <span className="text-slate-300">—</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                    {lead.email ? <><Mail className="h-3 w-3 text-slate-300 shrink-0" /><span className="truncate">{lead.email}</span></> : <span className="text-slate-300">—</span>}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border w-fit ${SOURCE_COLORS[lead.source]}`}>
                    {SOURCE_LABELS[lead.source]}
                  </span>
                  <button onClick={() => handleDeleteLead(lead.id)} className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer justify-self-end">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL: Nova Varredura --- */}
      {showNewJobModal && (
        <div className={modalClass} onClick={() => setShowNewJobModal(false)}>
          <div className={cardClass} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Nova Varredura de Leads</h2>
              </div>
              <button onClick={() => setShowNewJobModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                <RefreshCw className="h-4 w-4 shrink-0 mt-0.5" />
                <span>A varredura será enfileirada. O motor (Puppeteer na VPS) executará o job e trará os resultados automaticamente assim que o backend estiver online.</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Segmento / Palavra-chave *</label>
                <input value={jobKeyword} onChange={e => setJobKeyword(e.target.value)} placeholder="Ex: Barbearia, Restaurante, Salão..." className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cidade / Região *</label>
                <input value={jobLocation} onChange={e => setJobLocation(e.target.value)} placeholder="Ex: São Paulo - SP, Campinas, Centro RJ..." className={inputClass} />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3 justify-end">
              <button onClick={() => setShowNewJobModal(false)} className={btnSecondary}>Cancelar</button>
              <button onClick={handleCreateJob} disabled={!jobKeyword.trim() || !jobLocation.trim()} className={btnPrimary}>
                Agendar Varredura <ChevronRight className="h-4 w-4 inline" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Adicionar Manual --- */}
      {showManualModal && (
        <div className={modalClass} onClick={() => setShowManualModal(false)}>
          <div className={cardClass} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-4 w-4 text-slate-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Adicionar Lead Manual</h2>
              </div>
              <button onClick={() => setShowManualModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nome / Empresa *</label>
                <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Nome completo ou razão social" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Telefone</label>
                  <input value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder="(11) 99999-9999" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">CNPJ</label>
                  <input value={manualCnpj} onChange={e => setManualCnpj(e.target.value)} placeholder="00.000.000/0000-00" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">E-mail</label>
                <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)} placeholder="email@empresa.com.br" className={inputClass} />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3 justify-end">
              <button onClick={() => setShowManualModal(false)} className={btnSecondary}>Cancelar</button>
              <button onClick={handleAddManualLead} disabled={!manualName.trim()} className={btnPrimary}>Adicionar Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Consulta CNPJ --- */}
      {showCnpjModal && (
        <div className={modalClass} onClick={() => { setShowCnpjModal(false); setCnpjResult(null); setCnpjError(''); }}>
          <div className={cardClass} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Consultar CNPJ</h2>
              </div>
              <button onClick={() => { setShowCnpjModal(false); setCnpjResult(null); setCnpjError(''); }} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">Consulta em tempo real via <b>BrasilAPI</b> (gratuita, sem necessidade de backend).</p>
              <div className="flex gap-2">
                <input
                  value={cnpjInput}
                  onChange={e => setCnpjInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCnpjLookup()}
                  placeholder="Digite o CNPJ (somente números)"
                  className={`${inputClass} flex-1`}
                />
                <button onClick={handleCnpjLookup} disabled={cnpjLoading} className={btnPrimary}>
                  {cnpjLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </button>
              </div>

              {cnpjError && (
                <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {cnpjError}
                </div>
              )}

              {cnpjResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-3">
                    <CheckCircle2 className="h-4 w-4" />
                    Empresa encontrada
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div><span className="text-xs text-slate-400 uppercase font-bold">Razão Social</span><p className="font-bold text-slate-800">{cnpjResult.nome}</p></div>
                    {cnpjResult.fantasia && <div><span className="text-xs text-slate-400 uppercase font-bold">Nome Fantasia</span><p className="text-slate-700">{cnpjResult.fantasia}</p></div>}
                    {cnpjResult.telefone && <div><span className="text-xs text-slate-400 uppercase font-bold">Telefone</span><p className="text-slate-700">{cnpjResult.telefone}</p></div>}
                    {cnpjResult.email && <div><span className="text-xs text-slate-400 uppercase font-bold">E-mail</span><p className="text-slate-700">{cnpjResult.email}</p></div>}
                    <div><span className="text-xs text-slate-400 uppercase font-bold">Situação</span>
                      <p className={`font-bold ${cnpjResult.situacao === 'ATIVA' ? 'text-emerald-600' : 'text-rose-600'}`}>{cnpjResult.situacao}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 pb-5 flex gap-3 justify-end">
              <button onClick={() => { setShowCnpjModal(false); setCnpjResult(null); setCnpjError(''); }} className={btnSecondary}>Fechar</button>
              {cnpjResult && (
                <button onClick={handleAddFromCnpj} className={btnPrimary}>
                  <Plus className="h-4 w-4 inline mr-1" />
                  Adicionar como Lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
