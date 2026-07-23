import { ManicureDb } from './types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getPendingDeletions, clearPendingDeletions, setLastSyncAt, getSyncMeta } from './localDb';

function prepareRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    if (val === undefined) continue;
    out[key] = val;
  }
  return out;
}

// -- clientes --
function clienteToRow(c: ManicureDb['clientes'][number]) {
  return prepareRow({
    id: c.id, nome: c.nome, telefone: c.telefone ?? null,
    email: c.email ?? null, endereco: c.endereco ?? null,
    observacoes: c.observacoes ?? null, indicado_por: c.indicadoPor ?? null,
    created_at: c.createdAt, updated_at: c.updatedAt ?? null,
  });
}
function rowToCliente(r: any): ManicureDb['clientes'][number] {
  return {
    id: r.id, nome: r.nome, telefone: r.telefone ?? undefined,
    email: r.email ?? undefined, endereco: r.endereco ?? undefined,
    observacoes: r.observacoes ?? undefined, indicadoPor: r.indicado_por ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

// -- servicos --
function servicoToRow(s: ManicureDb['servicos'][number]) {
  return prepareRow({
    id: s.id, nome: s.nome, descricao: s.descricao ?? null,
    preco: s.preco, duracao_minutos: s.duracaoMinutos,
    categoria: s.categoria ?? null, ativo: s.ativo,
    created_at: s.createdAt, updated_at: s.updatedAt ?? null,
  });
}
function rowToServico(r: any): ManicureDb['servicos'][number] {
  return {
    id: r.id, nome: r.nome, descricao: r.descricao ?? undefined,
    preco: r.preco, duracaoMinutos: r.duracao_minutos,
    categoria: r.categoria ?? undefined, ativo: r.ativo ?? true,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

// -- agendamentos --
function agendamentoToRow(a: ManicureDb['agendamentos'][number]) {
  return prepareRow({
    id: a.id, cliente_id: a.clienteId, cliente_nome: a.clienteNome,
    data: a.data, hora: a.hora, servico_id: a.servicoId,
    servico_nome: a.servicoNome, valor: a.valor, status: a.status,
    observacoes: a.observacoes ?? null, telefone_cliente: a.telefoneCliente ?? null,
    created_at: a.createdAt, updated_at: a.updatedAt ?? null,
  });
}
function rowToAgendamento(r: any): ManicureDb['agendamentos'][number] {
  return {
    id: r.id, clienteId: r.cliente_id, clienteNome: r.cliente_nome,
    data: r.data, hora: r.hora, servicoId: r.servico_id,
    servicoNome: r.servico_nome, valor: r.valor, status: r.status,
    observacoes: r.observacoes ?? undefined, telefoneCliente: r.telefone_cliente ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

// -- movimentos caixa --
function movimentoToRow(m: ManicureDb['movimentos'][number]) {
  return prepareRow({
    id: m.id, data: m.data, tipo: m.tipo, descricao: m.descricao,
    valor: m.valor, categoria: m.categoria,
    forma_pagamento: m.formaPagamento ?? null,
    cliente_id: m.clienteId ?? null, agendamento_id: m.agendamentoId ?? null,
    created_at: m.createdAt, updated_at: m.updatedAt ?? null,
  });
}
function rowToMovimento(r: any): ManicureDb['movimentos'][number] {
  return {
    id: r.id, data: r.data, tipo: r.tipo, descricao: r.descricao,
    valor: r.valor, categoria: r.categoria,
    formaPagamento: r.forma_pagamento ?? undefined,
    clienteId: r.cliente_id ?? undefined, agendamentoId: r.agendamento_id ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

// -- produtos estoque --
function produtoToRow(p: ManicureDb['produtos'][number]) {
  return prepareRow({
    id: p.id, nome: p.nome, descricao: p.descricao ?? null,
    quantidade: p.quantidade, unidade: p.unidade,
    preco_custo: p.precoCusto, preco_venda: p.precoVenda,
    fornecedor: p.fornecedor ?? null, estoque_minimo: p.estoqueMinimo,
    created_at: p.createdAt, updated_at: p.updatedAt ?? null,
  });
}
function rowToProduto(r: any): ManicureDb['produtos'][number] {
  return {
    id: r.id, nome: r.nome, descricao: r.descricao ?? undefined,
    quantidade: r.quantidade, unidade: r.unidade,
    precoCusto: r.preco_custo, precoVenda: r.preco_venda,
    fornecedor: r.fornecedor ?? undefined, estoqueMinimo: r.estoque_minimo,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

// -- whatsapp instances --
function waInstanceToRow(w: ManicureDb['whatsappInstances'][number]) {
  return prepareRow({
    id: w.id, name: w.name, status: w.status,
    qr_code: w.qrCode ?? null, created_at: w.createdAt,
    updated_at: w.updatedAt ?? null,
  });
}
function rowToWaInstance(r: any): ManicureDb['whatsappInstances'][number] {
  return {
    id: r.id, name: r.name, status: r.status,
    qrCode: r.qr_code ?? undefined, createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? undefined,
  };
}

// -- mensagem templates --
function templateToRow(t: ManicureDb['mensagemTemplates'][number]) {
  return prepareRow({
    id: t.id, nome: t.nome, tipo: t.tipo,
    mensagem: t.mensagem, ativo: t.ativo,
  });
}
function rowToTemplate(r: any): ManicureDb['mensagemTemplates'][number] {
  return {
    id: r.id, nome: r.nome, tipo: r.tipo,
    mensagem: r.mensagem, ativo: r.ativo ?? true,
    updatedAt: r.updated_at ?? undefined,
  };
}

// -- mensagens enviadas --
function enviadaToRow(e: ManicureDb['mensagensEnviadas'][number]) {
  return prepareRow({
    id: e.id, agendamento_id: e.agendamentoId, cliente_id: e.clienteId,
    cliente_nome: e.clienteNome, tipo: e.tipo, mensagem: e.mensagem,
    status: e.status, data_envio: e.dataEnvio, erro: e.erro ?? null,
  });
}
function rowToEnviada(r: any): ManicureDb['mensagensEnviadas'][number] {
  return {
    id: r.id, agendamentoId: r.agendamento_id, clienteId: r.cliente_id,
    clienteNome: r.cliente_nome, tipo: r.tipo, mensagem: r.mensagem,
    status: r.status, dataEnvio: r.data_envio, erro: r.erro ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

// ============================================================
// Helpers
// ============================================================

const TABLES = [
  { table: 'manicure_clientes', key: 'clientes' as const, toRow: clienteToRow },
  { table: 'manicure_servicos', key: 'servicos' as const, toRow: servicoToRow },
  { table: 'manicure_agendamentos', key: 'agendamentos' as const, toRow: agendamentoToRow },
  { table: 'manicure_movimentos', key: 'movimentos' as const, toRow: movimentoToRow },
  { table: 'manicure_produtos', key: 'produtos' as const, toRow: produtoToRow },
  { table: 'manicure_whatsapp_instances', key: 'whatsappInstances' as const, toRow: waInstanceToRow },
  { table: 'manicure_mensagem_templates', key: 'mensagemTemplates' as const, toRow: templateToRow },
  { table: 'manicure_mensagens_enviadas', key: 'mensagensEnviadas' as const, toRow: enviadaToRow },
] as const;

// ============================================================
// API pública
// ============================================================

export async function loadManicureCloud(): Promise<Partial<ManicureDb>> {
  if (!isSupabaseConfigured()) return {};

  try {
    const [clientes, servicos, agendamentos, movimentos, produtos, wa, templates, enviadas, config] = await Promise.all([
      supabase.from('manicure_clientes').select('*').limit(10000),
      supabase.from('manicure_servicos').select('*').limit(10000),
      supabase.from('manicure_agendamentos').select('*').limit(10000),
      supabase.from('manicure_movimentos').select('*').limit(10000),
      supabase.from('manicure_produtos').select('*').limit(10000),
      supabase.from('manicure_whatsapp_instances').select('*').limit(10000),
      supabase.from('manicure_mensagem_templates').select('*').limit(10000),
      supabase.from('manicure_mensagens_enviadas').select('*').limit(10000),
      supabase.from('manicure_config').select('*').eq('id', 'singleton').maybeSingle(),
    ]);

    const hasError = [clientes, servicos, agendamentos, movimentos, produtos, wa, templates, enviadas].some(r => r.error);
    if (hasError) return {};

    return {
      initialized: true,
      clientes: (clientes.data || []).map(rowToCliente),
      servicos: (servicos.data || []).map(rowToServico),
      agendamentos: (agendamentos.data || []).map(rowToAgendamento),
      movimentos: (movimentos.data || []).map(rowToMovimento),
      produtos: (produtos.data || []).map(rowToProduto),
      whatsappInstances: (wa.data || []).map(rowToWaInstance),
      mensagemTemplates: (templates.data || []).map(rowToTemplate),
      mensagensEnviadas: (enviadas.data || []).map(rowToEnviada),
      config: config.data ? { nomeSalao: config.data.nome_salao ?? 'Meu Salão', profissional: config.data.profissional ?? '', telefoneContato: config.data.telefone_contato ?? undefined, endereco: config.data.endereco ?? undefined, logo: config.data.logo ?? undefined, whatsAppInstanceId: config.data.whatsapp_instance_id ?? undefined } : undefined,
    };
  } catch (e) {
    console.error('Manicure Supabase load error:', e);
    return {};
  }
}

export async function saveManicureCloudIncremental(data: ManicureDb): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const meta = await getPendingDeletions();
    const now = new Date().toISOString();

    // 1. Upsert only changed records (updatedAt > lastSyncAt)
    // For first sync (no lastSyncAt), send everything
    const syncMeta = await getSyncMeta();
    const lastSyncRaw = syncMeta.lastSyncAt;
    const upsertOps = TABLES.map(async ({ table, key, toRow }) => {
      const items = data[key];
      if (items.length === 0) return;
      const changed = lastSyncRaw
        ? items.filter(item => item.updatedAt && item.updatedAt >= lastSyncRaw)
        : items;
      if (changed.length === 0) return;
      const { error } = await supabase.from(table).upsert(changed.map(toRow), { onConflict: 'id' });
      if (error) throw new Error(`Upsert ${table}: ${error.message}`);
    });

    // 2. Process pending deletions
    const deleteOps = Object.entries(meta).map(async ([table, ids]) => {
      if (ids.length === 0) return;
      const { error } = await supabase.from(table).delete().in('id', ids);
      if (error) throw new Error(`Delete from ${table}: ${error.message}`);
    });

    await Promise.all([...upsertOps, ...deleteOps]);

    // 3. Clear processed deletions and update last sync time
    await clearPendingDeletions();
    await setLastSyncAt(now);
  } catch (e) {
    console.error('Manicure Supabase save error:', e);
  }
}

export async function clearManicureCloud(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  console.warn('[clearManicureCloud] Skipped: manicure tables have no user scoping. Use with caution or implement proper scoping.');
  // await Promise.all([...]) // Descomente apenas se tiver certeza que quer apagar TUDO
}
