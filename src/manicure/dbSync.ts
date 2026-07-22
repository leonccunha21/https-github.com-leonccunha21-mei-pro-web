import { ManicureDb } from './types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  });
}
function rowToWaInstance(r: any): ManicureDb['whatsappInstances'][number] {
  return {
    id: r.id, name: r.name, status: r.status,
    qrCode: r.qr_code ?? undefined, createdAt: r.created_at ?? new Date().toISOString(),
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
  };
}

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

    const hasError = [clientes, servicos, agendamentos, movimentos, produtos].some(r => r.error);
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

export async function saveManicureCloud(data: ManicureDb): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    async function syncDelete(table: string, localIds: string[]): Promise<void> {
      if (localIds.length === 0) {
        await supabase.from(table).delete().neq('id', '');
        return;
      }
      const { data: rows } = await supabase.from(table).select('id');
      if (!rows || rows.length === 0) return;
      const localSet = new Set(localIds);
      const toDelete = rows.map((r: any) => r.id as string).filter((id) => !localSet.has(id));
      if (toDelete.length > 0) {
        await supabase.from(table).delete().in('id', toDelete);
      }
    }

    await Promise.all([
      data.clientes.length > 0
        ? supabase.from('manicure_clientes').upsert(data.clientes.map(clienteToRow), { onConflict: 'id' })
        : supabase.from('manicure_clientes').delete().neq('id', ''),
      data.servicos.length > 0
        ? supabase.from('manicure_servicos').upsert(data.servicos.map(servicoToRow), { onConflict: 'id' })
        : supabase.from('manicure_servicos').delete().neq('id', ''),
      data.agendamentos.length > 0
        ? supabase.from('manicure_agendamentos').upsert(data.agendamentos.map(agendamentoToRow), { onConflict: 'id' })
        : supabase.from('manicure_agendamentos').delete().neq('id', ''),
      data.movimentos.length > 0
        ? supabase.from('manicure_movimentos').upsert(data.movimentos.map(movimentoToRow), { onConflict: 'id' })
        : supabase.from('manicure_movimentos').delete().neq('id', ''),
      data.produtos.length > 0
        ? supabase.from('manicure_produtos').upsert(data.produtos.map(produtoToRow), { onConflict: 'id' })
        : supabase.from('manicure_produtos').delete().neq('id', ''),
      data.whatsappInstances.length > 0
        ? supabase.from('manicure_whatsapp_instances').upsert(data.whatsappInstances.map(waInstanceToRow), { onConflict: 'id' })
        : supabase.from('manicure_whatsapp_instances').delete().neq('id', ''),
      data.mensagemTemplates.length > 0
        ? supabase.from('manicure_mensagem_templates').upsert(data.mensagemTemplates.map(templateToRow), { onConflict: 'id' })
        : supabase.from('manicure_mensagem_templates').delete().neq('id', ''),
      data.mensagensEnviadas.length > 0
        ? supabase.from('manicure_mensagens_enviadas').upsert(data.mensagensEnviadas.map(enviadaToRow), { onConflict: 'id' })
        : supabase.from('manicure_mensagens_enviadas').delete().neq('id', ''),
    ]);

    await Promise.all([
      data.clientes.length > 0 ? syncDelete('manicure_clientes', data.clientes.map((c) => c.id)) : Promise.resolve(),
      data.servicos.length > 0 ? syncDelete('manicure_servicos', data.servicos.map((s) => s.id)) : Promise.resolve(),
      data.agendamentos.length > 0 ? syncDelete('manicure_agendamentos', data.agendamentos.map((a) => a.id)) : Promise.resolve(),
      data.movimentos.length > 0 ? syncDelete('manicure_movimentos', data.movimentos.map((m) => m.id)) : Promise.resolve(),
      data.produtos.length > 0 ? syncDelete('manicure_produtos', data.produtos.map((p) => p.id)) : Promise.resolve(),
      data.whatsappInstances.length > 0 ? syncDelete('manicure_whatsapp_instances', data.whatsappInstances.map((w) => w.id)) : Promise.resolve(),
      data.mensagemTemplates.length > 0 ? syncDelete('manicure_mensagem_templates', data.mensagemTemplates.map((t) => t.id)) : Promise.resolve(),
      data.mensagensEnviadas.length > 0 ? syncDelete('manicure_mensagens_enviadas', data.mensagensEnviadas.map((e) => e.id)) : Promise.resolve(),
    ]);

    if (data.config) {
      await supabase.from('manicure_config').upsert({
        id: 'singleton',
        nome_salao: data.config.nomeSalao ?? 'Meu Salão',
        profissional: data.config.profissional ?? '',
        telefone_contato: data.config.telefoneContato ?? null,
        endereco: data.config.endereco ?? null,
        logo: data.config.logo ?? null,
        whatsapp_instance_id: data.config.whatsAppInstanceId ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    }
  } catch (e) {
    console.error('Manicure Supabase save error:', e);
  }
}

export async function clearManicureCloud(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await Promise.all([
      supabase.from('manicure_clientes').delete().neq('id', ''),
      supabase.from('manicure_servicos').delete().neq('id', ''),
      supabase.from('manicure_agendamentos').delete().neq('id', ''),
      supabase.from('manicure_movimentos').delete().neq('id', ''),
      supabase.from('manicure_produtos').delete().neq('id', ''),
      supabase.from('manicure_whatsapp_instances').delete().neq('id', ''),
      supabase.from('manicure_mensagem_templates').delete().neq('id', ''),
      supabase.from('manicure_mensagens_enviadas').delete().neq('id', ''),
      supabase.from('manicure_config').delete().neq('id', ''),
    ]);
  } catch (e) {
    console.error('Manicure Supabase clear error:', e);
  }
}
