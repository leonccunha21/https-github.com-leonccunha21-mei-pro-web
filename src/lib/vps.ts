// Camada de acesso à VPS (backend contínuo).
//
// Tudo que depende de infraestrutura externa (Evolution API / WhatsApp real,
// scrapers de leads, pipeline de RAG dos agentes) é concentrado aqui. O
// frontend já está 100% preparado para consumir estes endpoints: basta subir
// a VPS, expor a API em /api (ver proxy em vite.config.ts) e definir
// VITE_VPS_API_URL quando for para produção.
//
// Enquanto a VPS não estiver online, as funções abaixo retornam `null` (ou
// lançam VpsNotConfiguredError quando obrigatório), e a UI continua funcionando
// no modo local/exemplo.

export const VPS_API_URL: string =
  (import.meta.env.VITE_VPS_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export class VpsNotConfiguredError extends Error {
  constructor(message = 'Backend (VPS) não está configurado.') {
    super(message);
    this.name = 'VpsNotConfiguredError';
  }
}

async function vpsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${VPS_API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`VPS ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Evolution API — WhatsApp
// ---------------------------------------------------------------------------

export interface VpsWhatsAppInstance {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  qrCode?: string;
}

export interface VpsMessage {
  id: string;
  instanceId: string;
  from: string;
  name?: string;
  preview: string;
  body?: string;
  timestamp: number;
  unread?: number;
}

export const whatsapp = {
  // Cria a instância na VPS e retorna o QR Code em Base64 para parear.
  async connect(name: string): Promise<{ instanceId: string; qrCode: string }> {
    return vpsFetch('/whatsapp/connect', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
  async disconnect(instanceId: string): Promise<void> {
    return vpsFetch(`/whatsapp/${instanceId}/disconnect`, { method: 'POST' });
  },
  async list(): Promise<VpsWhatsAppInstance[]> {
    return vpsFetch('/whatsapp/instances');
  },
  async messages(instanceId: string): Promise<VpsMessage[]> {
    return vpsFetch(`/whatsapp/${instanceId}/messages`);
  },
  async send(instanceId: string, to: string, text: string): Promise<void> {
    return vpsFetch(`/whatsapp/${instanceId}/send`, {
      method: 'POST',
      body: JSON.stringify({ to, text }),
    });
  },
};

// ---------------------------------------------------------------------------
// Scrapers — geração de leads (Google Maps / Instagram / Bing / planilha)
// ---------------------------------------------------------------------------

export interface VpsScrapeRequest {
  keyword: string;
  location: string;
  source?: 'GOOGLE_MAPS' | 'INSTAGRAM' | 'BING_MAPS' | 'SPREADSHEET';
}

export interface VpsScrapeResult {
  jobId: string;
  totalFound: number;
}

export const scrapers = {
  // Enfileira um job de varredura. O frontend cria o LeadExtractionJob com
  // status PENDING; a VPS popula os leads e atualiza o status via webhook/poll.
  async enqueue(req: VpsScrapeRequest): Promise<VpsScrapeResult> {
    return vpsFetch('/scrape', { method: 'POST', body: JSON.stringify(req) });
  },
  async status(jobId: string): Promise<{ status: string; totalFound: number }> {
    return vpsFetch(`/scrape/${jobId}`);
  },
};

// ---------------------------------------------------------------------------
// RAG — base de conhecimento dos agentes (PostgreSQL + pgvector)
// ---------------------------------------------------------------------------

export interface VpsKnowledgeDoc {
  id: string;
  agentId: string;
  filename: string;
  chunks: number;
  createdAt: string;
}

export const rag = {
  async uploadDocument(agentId: string, file: File): Promise<VpsKnowledgeDoc> {
    const base64 = await fileToBase64(file);
    return vpsFetch('/rag/documents', {
      method: 'POST',
      body: JSON.stringify({ agentId, filename: file.name, contentType: file.type || 'application/octet-stream', data: base64 }),
    });
  },
  async listDocuments(agentId: string): Promise<VpsKnowledgeDoc[]> {
    return vpsFetch(`/rag/documents?agentId=${encodeURIComponent(agentId)}`);
  },
  async ask(agentId: string, question: string): Promise<{ answer: string }> {
    return vpsFetch('/rag/ask', {
      method: 'POST',
      body: JSON.stringify({ agentId, question }),
    });
  },
};

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export async function vpsHealth(): Promise<{ ok: boolean; version?: string }> {
  try {
    return await vpsFetch('/health');
  } catch {
    return { ok: false };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}
