const CORREIOS_URL = 'https://rastreamento.correios.com.br/app/index.php';

export const STATUS_LABELS: Record<string, string> = {
  em_transito: 'Em trânsito',
  entregue: 'Entregue',
  saiu_entrega: 'Saiu para entrega',
  aguardando_retirada: 'Aguardando retirada',
  encaminhado: 'Encaminhado',
  postado: 'Postado',
  erro: 'Erro no rastreio',
};

export const STATUS_COLORS: Record<string, string> = {
  em_transito: 'text-blue-600 bg-blue-50 border-blue-200',
  entregue: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  saiu_entrega: 'text-amber-600 bg-amber-50 border-amber-200',
  aguardando_retirada: 'text-purple-600 bg-purple-50 border-purple-200',
  encaminhado: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  postado: 'text-slate-600 bg-slate-50 border-slate-200',
  erro: 'text-rose-600 bg-rose-50 border-rose-200',
};

export function trackingUrl(code: string): string {
  return `${CORREIOS_URL}?objeto=${encodeURIComponent(code)}`;
}

export function statusLabel(status?: string): string {
  if (!status) return 'Não rastreado';
  return STATUS_LABELS[status] || status;
}

export async function fetchTrackingStatus(code: string): Promise<{ status: string | null; events: { date: string; location: string; status: string }[] }> {
  try {
    const base = (import.meta as any).env?.VITE_VPS_API_URL?.replace(/\/$/, '') || '/api';
    const res = await fetch(`${base}/tracking/${encodeURIComponent(code)}`);
    if (!res.ok) return { status: null, events: [] };
    return await res.json();
  } catch {
    return { status: null, events: [] };
  }
}
