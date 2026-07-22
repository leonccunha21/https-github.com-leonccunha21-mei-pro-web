import { MounjaroDb } from './types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Sincronização do subsite Mounjaro PRO com Supabase.
// Todas as 6 coleções + config são sincronizadas automaticamente.

// ============================================================
// Helpers
// ============================================================

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  return value as T;
}

function prepareRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    if (val === undefined) continue;
    out[key] = val;
  }
  return out;
}

// ============================================================
// Mapeamento de nomes (camelCase TypeScript -> snake_case Supabase)
// ============================================================

function clienteToRow(c: MounjaroDb['clientes'][number]): Record<string, unknown> {
  return prepareRow({
    id: c.id,
    nome: c.nome,
    telefone: c.telefone ?? null,
    email: c.email ?? null,
    data_nascimento: c.dataNascimento ?? null,
    sexo: c.sexo ?? null,
    endereco: c.endereco ?? null,
    cidade: c.cidade ?? null,
    estado: c.estado ?? null,
    cpf: c.cpf ?? null,
    altura_cm: c.alturaCm ?? null,
    peso_inicial: c.pesoInicial ?? null,
    imc_inicial: c.imcInicial ?? null,
    comorbidades: c.comorbidades ?? null,
    objetivo_peso: c.objetivoPeso ?? null,
    medico_responsavel: c.medicoResponsavel ?? null,
    observacoes: c.observacoes ?? null,
    data_inicio_tratamento: c.dataInicioTratamento ?? null,
    ativo: c.ativo ?? true,
    created_at: c.createdAt ?? null,
    updated_at: c.updatedAt ?? null,
  });
}

function rowToCliente(r: any): MounjaroDb['clientes'][number] {
  return {
    id: r.id,
    nome: r.nome,
    telefone: r.telefone ?? undefined,
    email: r.email ?? undefined,
    dataNascimento: r.data_nascimento ?? undefined,
    sexo: r.sexo ?? undefined,
    endereco: r.endereco ?? undefined,
    cidade: r.cidade ?? undefined,
    estado: r.estado ?? undefined,
    cpf: r.cpf ?? undefined,
    alturaCm: r.altura_cm ?? undefined,
    pesoInicial: r.peso_inicial ?? undefined,
    imcInicial: r.imc_inicial ?? undefined,
    comorbidades: r.comorbidades ?? undefined,
    objetivoPeso: r.objetivo_peso ?? undefined,
    medicoResponsavel: r.medico_responsavel ?? undefined,
    observacoes: r.observacoes ?? undefined,
    dataInicioTratamento: r.data_inicio_tratamento ?? undefined,
    ativo: r.ativo ?? true,
    createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? undefined,
  };
}

function pesagemToRow(p: MounjaroDb['pesagens'][number]): Record<string, unknown> {
  return prepareRow({
    id: p.id, cliente_id: p.clienteId, data: p.data,
    peso: p.peso, observacoes: p.observacoes ?? null,
    created_at: p.createdAt ?? null, updated_at: p.updatedAt ?? null,
  });
}

function rowToPesagem(r: any): MounjaroDb['pesagens'][number] {
  return {
    id: r.id, clienteId: r.cliente_id, data: r.data,
    peso: r.peso, observacoes: r.observacoes ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

function doseToRow(d: MounjaroDb['doses'][number]): Record<string, unknown> {
  return prepareRow({
    id: d.id, cliente_id: d.clienteId, data_aplicacao: d.dataAplicacao,
    dose: d.dose, intervalo_dias: d.intervaloDias,
    local_aplicacao: d.localAplicacao ?? null, lote: d.lote ?? null,
    observacoes: d.observacoes ?? null, efeitos_colaterais: d.efeitosColaterais ?? null,
    peso_aplicacao: d.pesoAplicacao ?? null, pago: d.pago ?? false,
    valor_dose: d.valorDose ?? null,
    created_at: d.createdAt ?? null, updated_at: d.updatedAt ?? null,
  });
}

function rowToDose(r: any): MounjaroDb['doses'][number] {
  return {
    id: r.id, clienteId: r.cliente_id, dataAplicacao: r.data_aplicacao,
    dose: r.dose, intervaloDias: r.intervalo_dias,
    localAplicacao: r.local_aplicacao ?? undefined, lote: r.lote ?? undefined,
    observacoes: r.observacoes ?? undefined, efeitosColaterais: r.efeitos_colaterais ?? undefined,
    pesoAplicacao: r.peso_aplicacao ?? undefined, pago: r.pago ?? false,
    valorDose: r.valor_dose ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

function pagamentoToRow(p: MounjaroDb['pagamentos'][number]): Record<string, unknown> {
  return prepareRow({
    id: p.id, cliente_id: p.clienteId, data_vencimento: p.dataVencimento,
    data_pagamento: p.dataPagamento ?? null, descricao: p.descricao,
    valor: p.valor, status: p.status, metodo: p.metodo ?? null,
    referencia_dose_id: p.referenciaDoseId ?? null, observacoes: p.observacoes ?? null,
    created_at: p.createdAt ?? null, updated_at: p.updatedAt ?? null,
  });
}

function rowToPagamento(r: any): MounjaroDb['pagamentos'][number] {
  return {
    id: r.id, clienteId: r.cliente_id, dataVencimento: r.data_vencimento,
    dataPagamento: r.data_pagamento ?? undefined, descricao: r.descricao,
    valor: r.valor, status: r.status, metodo: r.metodo ?? undefined,
    referenciaDoseId: r.referencia_dose_id ?? undefined, observacoes: r.observacoes ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

function fotoToRow(f: MounjaroDb['fotos'][number]): Record<string, unknown> {
  return prepareRow({
    id: f.id, cliente_id: f.clienteId, data: f.data,
    legenda: f.legenda ?? null, imagem: f.imagem ?? null,
    created_at: f.createdAt ?? null, updated_at: f.updatedAt ?? null,
  });
}

function rowToFoto(r: any): MounjaroDb['fotos'][number] {
  return {
    id: r.id, clienteId: r.cliente_id, data: r.data,
    legenda: r.legenda ?? undefined, imagem: r.imagem ?? '',
    createdAt: r.created_at ?? new Date().toISOString(), updatedAt: r.updated_at ?? undefined,
  };
}

function auditoriaToRow(a: MounjaroDb['auditoria'][number]): Record<string, unknown> {
  return prepareRow({
    id: a.id, data: a.data, usuario: a.usuario ?? null,
    entidade: a.entidade, acao: a.acao, resumo: a.resumo ?? null,
    cliente_id: a.clienteId ?? null, ref_id: a.refId ?? null,
    // created_at é o momento do registo na BD, não a data do evento (a.data)
    created_at: a.createdAt ?? new Date().toISOString(),
  });
}

// ============================================================
// API pública
// ============================================================

/** Carrega o banco completo do Mounjaro do Supabase. */
export async function loadMounjaroCloud(scope?: MounjaroScope): Promise<Partial<MounjaroDb>> {
  if (!isSupabaseConfigured()) return {};

  const uidFilter = scope?.tipo === 'user' ? { column: 'user_id', value: scope.uid } : null;

  function scopedQuery(table: string) {
    let query = supabase.from(table).select('*').limit(10000);
    if (uidFilter) query = query.eq(uidFilter.column, uidFilter.value);
    return query;
  }

  try {
    const [clientes, pesagens, doses, pagamentos, fotos, auditoria, config] = await Promise.all([
      scopedQuery('mounjaro_clientes'),
      scopedQuery('mounjaro_pesagens'),
      scopedQuery('mounjaro_doses'),
      scopedQuery('mounjaro_pagamentos'),
      scopedQuery('mounjaro_fotos'),
      scopedQuery('mounjaro_auditoria'),
      supabase.from('mounjaro_config').select('*').eq('id', 'singleton').maybeSingle(),
    ]);

    const hasError = [clientes, pesagens, doses, pagamentos, fotos, auditoria, config].some(r => r.error);
    if (hasError) return {};

    return {
      initialized: true,
      clientes: (clientes.data || []).map(rowToCliente),
      pesagens: (pesagens.data || []).map(rowToPesagem),
      doses: (doses.data || []).map(rowToDose),
      pagamentos: (pagamentos.data || []).map(rowToPagamento),
      fotos: (fotos.data || []).map(rowToFoto),
      auditoria: (auditoria.data || []).map((r: any) => ({
        id: r.id, data: r.data, createdAt: r.created_at ?? r.data,
        usuario: r.usuario ?? '',
        entidade: r.entidade, acao: r.acao, resumo: r.resumo ?? '',
        clienteId: r.cliente_id ?? undefined, refId: r.ref_id ?? undefined,
      })),
      config: config.data ? {
        nomeClinica: config.data.nome_clinica ?? 'Saúde PRO',
        profissional: config.data.profissional ?? '',
        telefoneContato: config.data.telefone_contato ?? '',
        valorDosePadrao: config.data.valor_dose_padrao ?? 0,
        intervaloPadraoDias: config.data.intervalo_padrao_dias ?? 7,
        logo: config.data.logo ?? undefined,
      } : undefined,
    };
  } catch (e) {
    console.error('Mounjaro Supabase load error:', e);
    return {};
  }
}

/** Salva o banco completo do Mounjaro no Supabase.
 *  Estratégia: upsert dos registros locais + delete dos ids que existem na nuvem
 *  mas não estão mais no estado local (registros excluídos pelo usuário).
 */
export async function saveMounjaroCloud(scopeOrData: MounjaroScope | MounjaroDb, maybeData?: MounjaroDb): Promise<void> {
  const data = maybeData || (scopeOrData as MounjaroDb);
  const scope: MounjaroScope | undefined = maybeData ? (scopeOrData as MounjaroScope) : undefined;
  if (!isSupabaseConfigured()) return;

  const uidFilter = scope?.tipo === 'user' ? { column: 'user_id', value: scope.uid } : null;

  function scopedDelete(table: string, localIds: string[]) {
    let query = supabase.from(table).delete();
    if (localIds.length > 0) {
      query = query.in('id', localIds);
    } else {
      query = query.neq('id', '');
    }
    if (uidFilter) query = query.eq(uidFilter.column, uidFilter.value);
    return query;
  }

  try {
    // Helper: apaga da nuvem os ids que não estão no conjunto local.
    // Se localIds for vazio, apaga TUDO da tabela (todos os itens foram removidos).
    async function syncDelete(table: string, localIds: string[]): Promise<void> {
      if (localIds.length === 0) {
        await scopedDelete(table, []);
        return;
      }
      let query = supabase.from(table).select('id');
      if (uidFilter) query = query.eq(uidFilter.column, uidFilter.value);
      const { data: rows } = await query;
      if (!rows || rows.length === 0) return;
      const localSet = new Set(localIds);
      const toDelete = rows.map((r: any) => r.id as string).filter((id) => !localSet.has(id));
      if (toDelete.length > 0) {
        await scopedDelete(table, toDelete);
      }
    }

    function addUid(row: Record<string, unknown>) {
      if (uidFilter) row[uidFilter.column] = uidFilter.value;
      return row;
    }

    // Upsert de todos os registros locais (se houver)
    const upserts = [];
    if (data.clientes.length > 0) upserts.push(supabase.from('mounjaro_clientes').upsert(data.clientes.map(c => addUid(clienteToRow(c))), { onConflict: 'id' }));
    if (data.pesagens.length > 0) upserts.push(supabase.from('mounjaro_pesagens').upsert(data.pesagens.map(p => addUid(pesagemToRow(p))), { onConflict: 'id' }));
    if (data.doses.length > 0) upserts.push(supabase.from('mounjaro_doses').upsert(data.doses.map(d => addUid(doseToRow(d))), { onConflict: 'id' }));
    if (data.pagamentos.length > 0) upserts.push(supabase.from('mounjaro_pagamentos').upsert(data.pagamentos.map(p => addUid(pagamentoToRow(p))), { onConflict: 'id' }));
    if (data.fotos.length > 0) upserts.push(supabase.from('mounjaro_fotos').upsert(data.fotos.map(f => addUid(fotoToRow(f))), { onConflict: 'id' }));
    if (data.auditoria.length > 0) upserts.push(supabase.from('mounjaro_auditoria').upsert(data.auditoria.map(a => addUid(auditoriaToRow(a))), { onConflict: 'id' }));
    await Promise.all(upserts);

    // Deleta da nuvem registros que foram removidos localmente
    // (roda para TODAS as tabelas, mesmo as vazias — para propagar deleção)
    const deletes = [];
    deletes.push(syncDelete('mounjaro_clientes', (data.clientes || []).map((c) => c.id)));
    deletes.push(syncDelete('mounjaro_pesagens', (data.pesagens || []).map((p) => p.id)));
    deletes.push(syncDelete('mounjaro_doses', (data.doses || []).map((d) => d.id)));
    deletes.push(syncDelete('mounjaro_pagamentos', (data.pagamentos || []).map((p) => p.id)));
    deletes.push(syncDelete('mounjaro_fotos', (data.fotos || []).map((f) => f.id)));
    await Promise.all(deletes);

    if (data.config) {
      let cfgUpsert: Record<string, unknown> = {
        id: 'singleton',
        nome_clinica: data.config.nomeClinica ?? 'Saúde PRO',
        profissional: data.config.profissional ?? '',
        telefone_contato: data.config.telefoneContato ?? '',
        valor_dose_padrao: data.config.valorDosePadrao ?? 0,
        intervalo_padrao_dias: data.config.intervaloPadraoDias ?? 7,
        logo: data.config.logo ?? null,
        updated_at: new Date().toISOString(),
      };
      if (uidFilter) cfgUpsert[uidFilter.column] = uidFilter.value;
      await supabase.from('mounjaro_config').upsert(cfgUpsert, { onConflict: 'id' });
    }
  } catch (e) {
    console.error('Mounjaro Supabase save error:', e);
  }
}

/** Apaga todos os dados do Mounjaro do Supabase (ou do scope, se fornecido). */
export async function clearMounjaroCloud(scope?: MounjaroScope): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const uidFilter = scope?.tipo === 'user' ? { column: 'user_id', value: scope.uid } : null;

  function scopedDeleteAll(table: string) {
    let query = supabase.from(table).delete().neq('id', '');
    if (uidFilter) query = query.eq(uidFilter.column, uidFilter.value);
    return query;
  }

  try {
    await Promise.all([
      scopedDeleteAll('mounjaro_clientes'),
      scopedDeleteAll('mounjaro_pesagens'),
      scopedDeleteAll('mounjaro_doses'),
      scopedDeleteAll('mounjaro_pagamentos'),
      scopedDeleteAll('mounjaro_fotos'),
      scopedDeleteAll('mounjaro_auditoria'),
      scopedDeleteAll('mounjaro_config'),
    ]);
  } catch (e) {
    console.error('Mounjaro Supabase clear error:', e);
  }
}

// Legacy exports for compatibility (no longer using Firestore)
export type MounjaroScope = { tipo: 'user'; uid: string } | { tipo: 'clinica'; clinicaId: string };

export interface ClinicaDoc {
  id: string;
  nome: string;
  codigo: string;
  donoUid: string;
  criadoEm: string;
}

/** Busca uma clinica pelo codigo (stub - clinicas nao sao migradas pro Supabase ainda). */
export async function buscarClinica(codigo: string): Promise<ClinicaDoc | null> {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.from('mounjaro_config').select('*').eq('id', `clinic_${codigo}`).maybeSingle();
  if (!data) return null;
  return { id: data.id, nome: data.nome_clinica || '', codigo, donoUid: '', criadoEm: data.updated_at || '' };
}

/** Cria uma nova clinica (stub). */
export async function criarClinica(nome: string, _donoUid: string): Promise<ClinicaDoc> {
  const codigo = Math.random().toString(36).slice(2, 8).toUpperCase();
  if (isSupabaseConfigured()) {
    await supabase.from('mounjaro_config').upsert({
      id: `clinic_${codigo}`,
      nome_clinica: nome || 'Minha clinica',
      profissional: '',
      telefone_contato: '',
      valor_dose_padrao: 0,
      intervalo_padrao_dias: 7,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  }
  return { id: `clinic_${codigo}`, nome: nome || 'Minha clinica', codigo, donoUid: _donoUid, criadoEm: new Date().toISOString() };
}

export async function loadMounjaroCloudScoped(scope: MounjaroScope): Promise<Partial<MounjaroDb>> {
  return loadMounjaroCloud(scope);
}

export async function saveMounjaroCloudScoped(scope: MounjaroScope, data: MounjaroDb): Promise<void> {
  return saveMounjaroCloud(scope, data);
}

export async function clearMounjaroCloudScoped(scope: MounjaroScope): Promise<void> {
  return clearMounjaroCloud(scope);
}

export async function syncMounjaroThrottled(
  _scope: MounjaroScope,
  data: MounjaroDb,
): Promise<{ uploaded: number; finished: boolean; stoppedByBudget: boolean }> {
  await saveMounjaroCloud(data);
  const count = data.clientes.length + data.pesagens.length + data.doses.length
    + data.pagamentos.length + data.fotos.length + data.auditoria.length;
  return { uploaded: count, finished: true, stoppedByBudget: false };
}

export function clearMounjaroSyncProgress(_scope: MounjaroScope): void { /* no-op */ }
